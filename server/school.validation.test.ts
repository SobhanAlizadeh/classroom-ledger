import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function caller() {
  const ctx: TrpcContext = {
    user: { id: 1, openId: "teacher", email: "teacher@example.com", name: "Teacher", loginMethod: "manus", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
  return appRouter.createCaller(ctx);
}

describe("school input contracts", () => {
  it("rejects invalid dates for daily activity records", async () => {
    await expect(caller().school.activity({ studentId: 1, date: "17/09/2026", title: "همکاری", kind: "positive", points: 2 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects grades without a title or with a score above the maximum", async () => {
    await expect(caller().school.grade({ studentId: 1, title: "", score: 21, maxScore: 20, date: "2026-09-17" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("accepts the supported attendance statuses at the schema boundary", async () => {
    await expect(caller().school.attendance({ studentId: 1, date: "2026-09-17", status: "unknown" as "present" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
