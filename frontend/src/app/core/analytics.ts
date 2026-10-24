import { levelForXp, PASS_THRESHOLD } from './gamification';
import { SKILLS } from './seed';
import type {
  Activity,
  ProgressRecord,
  Skill,
  SkillCode,
  Student,
} from './models';

export interface ClassMetrics {
  studentCount: number;
  averageLevel: number;
  averageScore: number;
  completionPct: number;
  activeLast7Days: number;
  totalXp: number;
}

export interface ActivityStat {
  activity: Activity;
  averageScore: number;
  completedStudents: number;
  attempts: number;
  averageErrors: number;
  completionPct: number;
}

export interface SkillStat {
  skill: Skill;
  averageScore: number;
  completedStudents: number;
  activityCount: number;
}

export interface SupportStudent {
  student: Student;
  level: number;
  averageScore: number;
  completed: number;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

function averageOneDecimal(values: number[]): number {
  if (values.length === 0) return 0;
  const total = values.reduce((sum, value) => sum + value, 0);
  return Math.round((total / values.length) * 10) / 10;
}

export function xpFor(studentId: string, progress: ProgressRecord[]): number {
  return progress
    .filter((record) => record.studentId === studentId && record.passed)
    .reduce((total, record) => total + record.bestScore, 0);
}

export function completedFor(studentId: string, progress: ProgressRecord[]): number {
  return progress.filter(
    (record) => record.studentId === studentId && record.passed,
  ).length;
}

export function averageFor(studentId: string, progress: ProgressRecord[]): number {
  const records = progress.filter((record) => record.studentId === studentId);
  if (records.length === 0) return 0;
  return average(records.map((record) => record.bestScore));
}

export function lastActivityAt(
  studentId: string,
  progress: ProgressRecord[],
): string | null {
  const records = progress.filter((record) => record.studentId === studentId);
  if (records.length === 0) return null;
  return records
    .map((record) => record.lastAt)
    .sort((a, b) => b.localeCompare(a))[0];
}

export function classMetrics(
  students: Student[],
  progress: ProgressRecord[],
  activities: Activity[],
  now = Date.now(),
): ClassMetrics {
  const ids = new Set(students.map((student) => student.id));
  const records = progress.filter((record) => ids.has(record.studentId));
  const passed = records.filter((record) => record.passed);
  const totalSlots = students.length * activities.length;
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

  const activeStudents = new Set<string>();
  records.forEach((record) => {
    const time = new Date(record.lastAt).getTime();
    if (Number.isFinite(time) && time >= sevenDaysAgo) {
      activeStudents.add(record.studentId);
    }
  });

  return {
    studentCount: students.length,
    averageLevel: averageOneDecimal(
      students.map((student) => levelForXp(xpFor(student.id, progress))),
    ),
    averageScore: average(records.map((record) => record.bestScore)),
    completionPct:
      totalSlots === 0 ? 0 : Math.round((passed.length / totalSlots) * 100),
    activeLast7Days: activeStudents.size,
    totalXp: students.reduce(
      (total, student) => total + xpFor(student.id, progress),
      0,
    ),
  };
}

export function activityStats(
  students: Student[],
  progress: ProgressRecord[],
  activities: Activity[],
): ActivityStat[] {
  const ids = new Set(students.map((student) => student.id));

  return activities.map((activity) => {
    const records = progress.filter(
      (record) => record.activityId === activity.id && ids.has(record.studentId),
    );
    const completed = records.filter((record) => record.passed);
    const attempts = records.reduce((total, record) => total + record.attempts, 0);
    const errors = records.reduce((total, record) => total + record.errors, 0);

    return {
      activity,
      averageScore: average(records.map((record) => record.bestScore)),
      completedStudents: completed.length,
      attempts,
      averageErrors: attempts === 0 ? 0 : Math.round((errors / attempts) * 10) / 10,
      completionPct:
        students.length === 0
          ? 0
          : Math.round((completed.length / students.length) * 100),
    };
  });
}

export function skillStats(
  students: Student[],
  progress: ProgressRecord[],
  activities: Activity[],
): SkillStat[] {
  const ids = new Set(students.map((student) => student.id));
  const skills = Object.values(SKILLS) as Skill[];

  return skills.map((skill) => {
    const related = activities.filter((activity) =>
      activity.skills.includes(skill.code as SkillCode),
    );
    const relatedIds = new Set(related.map((activity) => activity.id));
    const records = progress.filter(
      (record) => ids.has(record.studentId) && relatedIds.has(record.activityId),
    );
    const completed = new Set(
      records.filter((record) => record.passed).map((record) => record.studentId),
    );

    return {
      skill,
      averageScore: average(records.map((record) => record.bestScore)),
      completedStudents: completed.size,
      activityCount: related.length,
    };
  });
}

export function supportStudents(
  students: Student[],
  progress: ProgressRecord[],
): SupportStudent[] {
  return students
    .map((student) => {
      const score = averageFor(student.id, progress);
      const completed = completedFor(student.id, progress);
      return {
        student,
        level: levelForXp(xpFor(student.id, progress)),
        averageScore: score,
        completed,
      };
    })
    .filter(
      (entry) =>
        entry.completed === 0 ||
        (entry.averageScore > 0 && entry.averageScore < PASS_THRESHOLD),
    )
    .sort(
      (a, b) =>
        a.averageScore - b.averageScore || a.completed - b.completed,
    );
}

export function toPercent(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}
