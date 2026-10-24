import { describe, expect, it } from 'vitest';
import { classMetrics, skillStats, supportStudents } from './analytics';
import { ACTIVITIES, CLASSES, SEED_PROGRESS, STUDENTS } from './seed';

describe('analytics', () => {
  const students = STUDENTS.filter((student) => student.classId === CLASSES[0].id);
  const progress = SEED_PROGRESS.filter((record) =>
    students.some((student) => student.id === record.studentId),
  );

  it('calculates class metrics', () => {
    const metrics = classMetrics(students, progress, ACTIVITIES, Date.now());
    expect(metrics.studentCount).toBe(students.length);
    expect(metrics.completionPct).toBeGreaterThan(0);
    expect(metrics.averageLevel).toBeGreaterThan(1);
    expect(metrics.averageScore).toBeGreaterThan(0);
  });

  it('aggregates skill coverage', () => {
    const stats = skillStats(students, progress, ACTIVITIES);
    expect(stats).toHaveLength(3);
    expect(stats.find((stat) => stat.skill.code === 'EF05MA06')?.activityCount).toBeGreaterThan(0);
  });

  it('finds students who need support', () => {
    const support = supportStudents(students, progress);
    expect(support.some((entry) => entry.student.name === 'Helena C.')).toBe(true);
    expect(support.every((entry) => entry.averageScore < 60 || entry.completed === 0)).toBe(true);
  });
});
