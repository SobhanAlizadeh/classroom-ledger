import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, classes, teams, students, attendance, grades, activities } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
export async function getDb() { if (!_db && process.env.DATABASE_URL) { try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; } } return _db; }

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb(); if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  for (const field of ["name", "email", "loginMethod"] as const) { if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; } }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; } else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
  values.lastSignedIn ??= new Date(); if (!Object.keys(updateSet).length) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}
export async function getUserByOpenId(openId: string) { const db = await getDb(); if (!db) return undefined; const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1); return result[0]; }

export async function getDashboardData() {
  const db = await getDb(); if (!db) return { classes: [], teams: [], students: [], attendance: [], grades: [], activities: [] };
  const [classRows, teamRows, studentRows, attendanceRows, gradeRows, activityRows] = await Promise.all([
    db.select().from(classes), db.select().from(teams), db.select().from(students),
    db.select().from(attendance).orderBy(desc(attendance.date)).limit(200),
    db.select().from(grades).orderBy(desc(grades.date)).limit(200),
    db.select().from(activities).orderBy(desc(activities.date), desc(activities.id)).limit(200),
  ]);
  return { classes: classRows, teams: teamRows, students: studentRows, attendance: attendanceRows, grades: gradeRows, activities: activityRows };
}

export async function createStudent(input: { classId: number; teamId?: number | null; firstName: string; lastName: string; studentCode?: string }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.insert(students).values(input); }
export async function createTeam(input: { classId: number; name: string; color?: string }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.insert(teams).values(input); }
export async function createClass(input: { name: string; grade?: string; schoolYear?: string }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.insert(classes).values(input); }
export async function saveAttendance(input: { studentId: number; date: string; status: "present" | "absent" | "late" | "excused"; note?: string }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.insert(attendance).values(input); }
export async function saveGrade(input: { studentId: number; title: string; score: number; maxScore: number; date: string; note?: string }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.insert(grades).values(input); }
export async function saveActivity(input: { studentId: number; date: string; title: string; description?: string; kind: "positive" | "negative" | "neutral"; points: number }) {
  const db = await getDb(); if (!db) throw new Error("Database unavailable");
  await db.transaction(async tx => { await tx.insert(activities).values(input); await tx.update(students).set({ totalPoints: sql`${students.totalPoints} + ${input.points}` }).where(eq(students.id, input.studentId)); const s = await tx.select({ teamId: students.teamId }).from(students).where(eq(students.id, input.studentId)).limit(1); if (s[0]?.teamId) await tx.update(teams).set({ totalPoints: sql`${teams.totalPoints} + ${input.points}` }).where(eq(teams.id, s[0].teamId)); });
}
