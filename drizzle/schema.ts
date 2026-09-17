import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const classes = mysqlTable("classes", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  grade: varchar("grade", { length: 80 }),
  schoolYear: varchar("schoolYear", { length: 30 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const teams = mysqlTable("teams", {
  id: int("id").autoincrement().primaryKey(),
  classId: int("classId").notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  color: varchar("color", { length: 30 }).default("teal").notNull(),
  totalPoints: int("totalPoints").default(0).notNull(),
});

export const students = mysqlTable("students", {
  id: int("id").autoincrement().primaryKey(),
  classId: int("classId").notNull(),
  teamId: int("teamId"),
  firstName: varchar("firstName", { length: 80 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  studentCode: varchar("studentCode", { length: 40 }),
  phone: varchar("phone", { length: 30 }),
  totalPoints: int("totalPoints").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const attendance = mysqlTable("attendance", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  status: mysqlEnum("status", ["present", "absent", "late", "excused"]).notNull(),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const grades = mysqlTable("grades", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  score: int("score").notNull(),
  maxScore: int("maxScore").default(20).notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  note: text("note"),
});

export const activities = mysqlTable("activities", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  description: text("description"),
  kind: mysqlEnum("kind", ["positive", "negative", "neutral"]).default("neutral").notNull(),
  points: int("points").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Class = typeof classes.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type Student = typeof students.$inferSelect;
export type Attendance = typeof attendance.$inferSelect;
export type Grade = typeof grades.$inferSelect;
export type Activity = typeof activities.$inferSelect;
