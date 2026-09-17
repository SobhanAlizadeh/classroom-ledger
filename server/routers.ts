import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDashboardData, createClass, createTeam, createStudent, saveAttendance, saveGrade, saveActivity } from "./db";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const appRouter = router({
  system: systemRouter,
  auth: router({ me: publicProcedure.query(opts => opts.ctx.user), logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }) }),
  school: router({
    dashboard: protectedProcedure.query(() => getDashboardData()),
    addClass: protectedProcedure.input(z.object({ name: z.string().min(1), grade: z.string().optional(), schoolYear: z.string().optional() })).mutation(({ input }) => createClass(input)),
    addTeam: protectedProcedure.input(z.object({ classId: z.number(), name: z.string().min(1), color: z.string().optional() })).mutation(({ input }) => createTeam(input)),
    addStudent: protectedProcedure.input(z.object({ classId: z.number(), teamId: z.number().nullable().optional(), firstName: z.string().min(1), lastName: z.string().min(1), studentCode: z.string().optional() })).mutation(({ input }) => createStudent(input)),
    attendance: protectedProcedure.input(z.object({ studentId: z.number(), date, status: z.enum(["present", "absent", "late", "excused"]), note: z.string().optional() })).mutation(({ input }) => saveAttendance(input)),
    grade: protectedProcedure.input(z.object({ studentId: z.number(), title: z.string().min(1), score: z.number().min(0), maxScore: z.number().positive(), date, note: z.string().optional() })).mutation(({ input }) => saveGrade(input)),
    activity: protectedProcedure.input(z.object({ studentId: z.number(), date, title: z.string().min(1), description: z.string().optional(), kind: z.enum(["positive", "negative", "neutral"]), points: z.number().int() })).mutation(({ input }) => saveActivity(input)),
  }),
});
export type AppRouter = typeof appRouter;
