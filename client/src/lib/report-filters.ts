export type ReportScope = "class" | "team" | "student";

export interface ReportActivityIdentity {
  studentId: number | null;
  teamId: number | null;
  date: string;
}

export interface ReportStudentIdentity {
  id: number;
  teamId: number | null;
}

export interface ReportTeamTransferIdentity {
  id?: number;
  studentId: number;
  fromTeamId: number | null;
  toTeamId: number | null;
  date: string;
}

export interface ReportFilterOptions {
  scope: ReportScope;
  classStudentIds: ReadonlySet<number>;
  classTeamIds: ReadonlySet<number>;
  reportTeamId: number | null;
  reportStudentId: number | null;
  students: readonly ReportStudentIdentity[];
  teamTransfers: readonly ReportTeamTransferIdentity[];
}

function teamAtActivityDate(
  studentId: number,
  activityDate: string,
  studentsById: ReadonlyMap<number, ReportStudentIdentity>,
  transfersByStudent: ReadonlyMap<number, readonly ReportTeamTransferIdentity[]>
): number | null {
  const history = transfersByStudent.get(studentId);
  if (!history?.length) return studentsById.get(studentId)?.teamId ?? null;

  let low = 0;
  let high = history.length - 1;
  let matchedIndex = -1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    if (history[middle].date <= activityDate) {
      matchedIndex = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }

  return matchedIndex < 0
    ? history[0].fromTeamId
    : history[matchedIndex].toTeamId;
}

/** Filters the full activity history by class, team, or student. No date filter is applied. */
export function filterActivitiesForReport<T extends ReportActivityIdentity>(
  activities: readonly T[],
  options: ReportFilterOptions
): T[] {
  const studentsById = new Map(
    options.students.map(student => [student.id, student])
  );
  const transfersByStudent = new Map<number, ReportTeamTransferIdentity[]>();
  for (const transfer of options.teamTransfers) {
    const history = transfersByStudent.get(transfer.studentId) ?? [];
    history.push(transfer);
    transfersByStudent.set(transfer.studentId, history);
  }
  transfersByStudent.forEach((history: ReportTeamTransferIdentity[]) => {
    history.sort(
      (left: ReportTeamTransferIdentity, right: ReportTeamTransferIdentity) =>
        left.date.localeCompare(right.date) || (left.id ?? 0) - (right.id ?? 0)
    );
  });

  return activities.filter(activity => {
    if (options.scope === "class") {
      return activity.studentId !== null
        ? options.classStudentIds.has(activity.studentId)
        : activity.teamId !== null && options.classTeamIds.has(activity.teamId);
    }

    if (options.scope === "team") {
      if (options.reportTeamId === null) return false;
      return (
        activity.teamId === options.reportTeamId ||
        (activity.studentId !== null &&
          teamAtActivityDate(
            activity.studentId,
            activity.date,
            studentsById,
            transfersByStudent
          ) === options.reportTeamId)
      );
    }

    if (options.reportStudentId === null) return false;
    return (
      activity.studentId === options.reportStudentId ||
      (activity.studentId === null &&
        activity.teamId !== null &&
        teamAtActivityDate(
          options.reportStudentId,
          activity.date,
          studentsById,
          transfersByStudent
        ) === activity.teamId)
    );
  });
}
