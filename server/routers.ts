import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDashboardData, createSchool, updateSchool, deleteSchool, createClass, createTeam, createStudent, saveAttendance, saveGrade, saveActivity, saveTeamActivity, updateClass, updateTeam, updateStudent, deleteClass, deleteTeam, deleteStudent, createSubject, updateSubject, deleteSubject, consumeStudentPoints, consumeTeamPoints, updateGrade, deleteGrade } from "./db";
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const appRouter = router({
  system: systemRouter,
  auth: router({ me: publicProcedure.query(opts => opts.ctx.user), logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }) }),
  school: router({
    dashboard: protectedProcedure.query(() => getDashboardData()),
    addSchool: protectedProcedure.input(z.object({ name: z.string().min(1), address: z.string().optional() })).mutation(({ input }) => createSchool(input)),
    updateSchool: protectedProcedure.input(z.object({ id: z.number(), name: z.string().min(1), address: z.string().optional() })).mutation(({ input }) => updateSchool(input)),
    deleteSchool: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteSchool(input.id)),
    addClass: protectedProcedure.input(z.object({ schoolId: z.number().nullable().optional(), name: z.string().min(1), grade: z.string().optional(), schoolYear: z.string().optional() })).mutation(({ input }) => createClass(input)),
    addTeam: protectedProcedure.input(z.object({ classId: z.number(), name: z.string().min(1), color: z.string().optional() })).mutation(({ input }) => createTeam(input)),
    addStudent: protectedProcedure.input(z.object({ classId: z.number(), teamId: z.number().nullable().optional(), firstName: z.string().min(1), lastName: z.string().min(1), studentCode: z.string().optional() })).mutation(({ input }) => createStudent(input)),
    attendance: protectedProcedure.input(z.object({ studentId: z.number(), date, status: z.enum(["present", "absent", "late", "excused"]), note: z.string().optional() })).mutation(({ input }) => saveAttendance(input)),
    addSubject: protectedProcedure.input(z.object({ classId: z.number(), name: z.string().min(1) })).mutation(({ input }) => createSubject(input)),
    updateSubject: protectedProcedure.input(z.object({ id: z.number(), classId: z.number(), name: z.string().min(1) })).mutation(({ input }) => updateSubject(input)),
    deleteSubject: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteSubject(input.id)),
    grade: protectedProcedure.input(z.object({ studentId: z.number(), subjectId: z.number().nullable().optional(), gradeType: z.enum(["class", "midterm", "final"]).default("class"), title: z.string().min(1), score: z.number().min(0), maxScore: z.number().positive(), date, note: z.string().optional() })).mutation(({ input }) => saveGrade(input)),
    updateGrade: protectedProcedure.input(z.object({ id: z.number(), studentId: z.number(), subjectId: z.number().nullable().optional(), gradeType: z.enum(["class", "midterm", "final"]), title: z.string().min(1), score: z.number().min(0), maxScore: z.number().positive(), date, note: z.string().optional() })).mutation(({ input }) => updateGrade(input)),
    deleteGrade: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteGrade(input.id)),
    activity: protectedProcedure.input(z.object({ studentId: z.number(), date, title: z.string().min(1), description: z.string().optional(), kind: z.enum(["positive", "negative", "neutral"]), points: z.number().finite() })).mutation(({ input }) => saveActivity(input)),
    spendStudent: protectedProcedure.input(z.object({ studentId: z.number(), date, description: z.string().min(1), points: z.number().positive() })).mutation(({ input }) => consumeStudentPoints(input)),
    spendTeam: protectedProcedure.input(z.object({ teamId: z.number(), date, description: z.string().min(1), points: z.number().positive() })).mutation(({ input }) => consumeTeamPoints(input)),
    teamActivity: protectedProcedure.input(z.object({ teamId: z.number(), date, title: z.string().min(1), description: z.string().optional(), kind: z.enum(["positive", "negative", "neutral"]), points: z.number().finite() })).mutation(({ input }) => saveTeamActivity(input)),
    updateClass: protectedProcedure.input(z.object({ id: z.number(), schoolId: z.number().nullable().optional(), name: z.string().min(1), grade: z.string().optional(), schoolYear: z.string().optional() })).mutation(({ input }) => updateClass(input)),
    updateTeam: protectedProcedure.input(z.object({ id: z.number(), name: z.string().min(1), color: z.string().optional() })).mutation(({ input }) => updateTeam(input)),
    updateStudent: protectedProcedure.input(z.object({ id: z.number(), classId: z.number(), teamId: z.number().nullable().optional(), firstName: z.string().min(1), lastName: z.string().min(1), studentCode: z.string().optional() })).mutation(({ input }) => updateStudent(input)),
    deleteClass: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteClass(input.id)),
    deleteTeam: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteTeam(input.id)),
    deleteStudent: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteStudent(input.id)),
  }),
});
export type AppRouter = typeof appRouter;
