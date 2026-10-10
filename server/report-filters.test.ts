import { describe, expect, it } from "vitest";
import { filterActivitiesForReport } from "../client/src/lib/report-filters";

const activities = [
  { id: 1, date: "2023-08-01", studentId: 11, teamId: null, points: 2 },
  { id: 2, date: "2024-02-12", studentId: null, teamId: 101, points: 6 },
  { id: 3, date: "2025-11-20", studentId: 12, teamId: null, points: -1 },
  { id: 4, date: "2026-10-10", studentId: 21, teamId: null, points: 3 },
  { id: 5, date: "2024-04-03", studentId: 11, teamId: null, points: 1 },
];

const students = [
  { id: 11, teamId: 102 },
  { id: 12, teamId: 102 },
  { id: 21, teamId: 201 },
];

const teamTransfers = [
  { studentId: 11, fromTeamId: 101, toTeamId: 102, date: "2024-03-01" },
];

const filterOptions = {
  classStudentIds: new Set([11, 12]),
  classTeamIds: new Set([101, 102]),
  reportTeamId: null as number | null,
  reportStudentId: null as number | null,
  students,
  teamTransfers,
};

describe("filterActivitiesForReport", () => {
  it("returns all dates for a class while excluding other classes", () => {
    const rows = filterActivitiesForReport(activities, {
      ...filterOptions,
      scope: "class",
    });

    expect(rows.map(row => row.id)).toEqual([1, 2, 3, 5]);
  });

  it("returns a team's full history using each member's team at activity time", () => {
    const rows = filterActivitiesForReport(activities, {
      ...filterOptions,
      scope: "team",
      reportTeamId: 102,
    });

    expect(rows.map(row => row.id)).toEqual([3, 5]);
  });

  it("returns a student's direct and contemporaneous team activities across all dates", () => {
    const rows = filterActivitiesForReport(activities, {
      ...filterOptions,
      scope: "student",
      reportTeamId: 102,
      reportStudentId: 11,
    });

    expect(rows.map(row => row.id)).toEqual([1, 2, 5]);
  });

  it("returns no rows until the requested team or student is selected", () => {
    expect(
      filterActivitiesForReport(activities, {
        ...filterOptions,
        scope: "team",
      })
    ).toEqual([]);

    expect(
      filterActivitiesForReport(activities, {
        ...filterOptions,
        scope: "student",
      })
    ).toEqual([]);
  });
});
