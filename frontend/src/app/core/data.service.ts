import {
  Injectable,
  PLATFORM_ID,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  ACTIVITIES,
  BADGES,
  CLASSES,
  SEED_PROGRESS,
  STUDENTS,
  TEACHERS,
} from './seed';
import { levelForXp, starsForScore } from './gamification';
import type {
  Activity,
  AttemptLog,
  Badge,
  ClassGroup,
  CompletionOutcome,
  MissionView,
  ProgressRecord,
  RankingEntry,
  Student,
  Teacher,
} from './models';

interface PersistedData {
  version: number;
  savedAt: string;
  students: Student[];
  progress: ProgressRecord[];
}

const STORAGE_KEY = 'educa.data.v1';
const DATA_VERSION = 1;

function cloneProgress(records: ProgressRecord[]): ProgressRecord[] {
  return records.map((record) => ({
    ...record,
    history: record.history.map((entry) => ({ ...entry })),
  }));
}

function cloneStudents(students: Student[]): Student[] {
  return students.map((student) => ({ ...student }));
}

/**
 * Camada de dados simulada.
 *
 * Ela imita o contrato que será exposto pelo backend Django/PostgreSQL:
 * alunos, atividades, tentativas e progresso. Para integrar a API real,
 * troque os métodos de leitura/escrita por chamadas HttpClient mantendo
 * os mesmos modelos e os componentes não precisam mudar.
 */
@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly activities: readonly Activity[] = ACTIVITIES;
  readonly badges: readonly Badge[] = BADGES;
  readonly classes: readonly ClassGroup[] = CLASSES;
  readonly teachers: readonly Teacher[] = TEACHERS;

  private readonly _students = signal<Student[]>(cloneStudents(STUDENTS));
  private readonly _progress = signal<ProgressRecord[]>(cloneProgress(SEED_PROGRESS));

  readonly students = this._students.asReadonly();
  readonly progress = this._progress.asReadonly();

  constructor() {
    if (this.isBrowser) {
      afterNextRender(() => this.loadPersistedData());
    }
  }

  // ---------------------------------------------------------------- leituras

  studentById(studentId: string | undefined | null): Student | undefined {
    if (!studentId) return undefined;
    return this._students().find((student) => student.id === studentId);
  }

  activityById(activityId: string | undefined | null): Activity | undefined {
    if (!activityId) return undefined;
    return this.activities.find((activity) => activity.id === activityId);
  }

  classById(classId: string | undefined | null): ClassGroup | undefined {
    if (!classId) return undefined;
    return this.classes.find((group) => group.id === classId);
  }

  teacherById(teacherId: string | undefined | null): Teacher | undefined {
    if (!teacherId) return undefined;
    return this.teachers.find((teacher) => teacher.id === teacherId);
  }

  classesForTeacher(teacherId: string | undefined | null): ClassGroup[] {
    const teacher = this.teacherById(teacherId);
    if (!teacher) return [];
    return this.classes.filter((group) => teacher.classIds.includes(group.id));
  }

  studentsInClass(classId: string | undefined | null): Student[] {
    if (!classId) return [];
    return this._students()
      .filter((student) => student.classId === classId)
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }

  progressFor(studentId: string | undefined | null): ProgressRecord[] {
    if (!studentId) return [];
    return this._progress().filter((record) => record.studentId === studentId);
  }

  recordFor(
    studentId: string | undefined | null,
    activityId: string | undefined | null,
  ): ProgressRecord | undefined {
    if (!studentId || !activityId) return undefined;
    return this._progress().find(
      (record) =>
        record.studentId === studentId && record.activityId === activityId,
    );
  }

  /** XP é a soma do melhor resultado de cada missão concluída. */
  xpFor(studentId: string | undefined | null): number {
    return this.progressFor(studentId)
      .filter((record) => record.passed)
      .reduce((total, record) => total + record.bestScore, 0);
  }

  levelFor(studentId: string | undefined | null): number {
    return levelForXp(this.xpFor(studentId));
  }

  completedCount(studentId: string | undefined | null): number {
    return this.progressFor(studentId).filter((record) => record.passed).length;
  }

  averageScore(studentId: string | undefined | null): number {
    const records = this.progressFor(studentId);
    if (records.length === 0) return 0;
    const total = records.reduce((sum, record) => sum + record.bestScore, 0);
    return Math.round(total / records.length);
  }

  lastActivityAt(studentId: string | undefined | null): string | null {
    const records = this.progressFor(studentId);
    if (records.length === 0) return null;
    return records
      .map((record) => record.lastAt)
      .sort((a, b) => b.localeCompare(a))[0];
  }

  missionsFor(studentId: string): MissionView[] {
    return this.activities.map((activity) => {
      const record = this.recordFor(studentId, activity.id);
      return {
        activity,
        record,
        status: record?.passed ? 'done' : record?.attempts ? 'progress' : 'new',
        stars: record ? starsForScore(record.bestScore) : 0,
      };
    });
  }

  rankingForClass(classId: string): RankingEntry[] {
    return this.studentsInClass(classId)
      .map((student) => {
        const xp = this.xpFor(student.id);
        return {
          student,
          xp,
          level: levelForXp(xp),
        };
      })
      .sort(
        (a, b) =>
          b.xp - a.xp ||
          b.student.coins - a.student.coins ||
          a.student.name.localeCompare(b.student.name, 'pt-BR'),
      )
      .map((entry, index) => ({ ...entry, position: index + 1 }));
  }

  badgeById(badgeId: string | undefined | null): Badge | undefined {
    if (!badgeId) return undefined;
    return this.badges.find((badge) => badge.id === badgeId);
  }

  badgesFor(studentId: string | undefined | null): Badge[] {
    const records = this.progressFor(studentId);
    const passedIds = new Set(
      records.filter((record) => record.passed).map((record) => record.activityId),
    );
    const level = levelForXp(this.xpFor(studentId));

    return this.badges.filter((badge) => {
      switch (badge.criterion.type) {
        case 'activity':
          return passedIds.has(badge.criterion.activityId);
        case 'any':
          return passedIds.size > 0;
        case 'all':
          return passedIds.size === this.activities.length;
        case 'level':
          return level >= badge.criterion.level;
        default:
          return false;
      }
    });
  }

  // --------------------------------------------------------------- escritas

  /**
   * Registra uma tentativa. Moedas são concedidas apenas na primeira
   * conclusão de cada missão; o XP usa o melhor resultado por missão.
   */
  recordAttempt(
    studentId: string,
    activityId: string,
    score: number,
    errors: number,
    passed: boolean,
  ): CompletionOutcome {
    const activity = this.activityById(activityId);
    if (!activity) {
      throw new Error(`Atividade desconhecida: ${activityId}`);
    }

    const student = this.studentById(studentId);
    if (!student) {
      throw new Error(`Aluno desconhecido: ${studentId}`);
    }

    const xpBefore = this.xpFor(studentId);
    const levelBefore = levelForXp(xpBefore);
    const earnedBefore = new Set(this.badgesFor(studentId).map((badge) => badge.id));

    const now = new Date().toISOString();
    const log: AttemptLog = { at: now, score, errors, passed };
    const previous = this.recordFor(studentId, activityId);
    const coinsAwarded = previous?.coinsAwarded ?? false;
    const shouldAwardCoins = passed && !coinsAwarded;

    const record: ProgressRecord = previous
      ? {
          ...previous,
          bestScore: Math.max(previous.bestScore, score),
          attempts: previous.attempts + 1,
          errors: previous.errors + Math.max(0, errors),
          passed: previous.passed || passed,
          coinsAwarded: coinsAwarded || shouldAwardCoins,
          lastAt: now,
          history: [...previous.history, log].slice(-20),
        }
      : {
          studentId,
          activityId,
          bestScore: score,
          attempts: 1,
          errors: Math.max(0, errors),
          passed,
          coinsAwarded: shouldAwardCoins,
          lastAt: now,
          history: [log],
        };

    this._progress.update((records) => {
      const withoutCurrent = records.filter(
        (item) =>
          !(item.studentId === studentId && item.activityId === activityId),
      );
      return [...withoutCurrent, record];
    });

    const coinsGain = shouldAwardCoins ? activity.rewardCoins : 0;
    if (coinsGain > 0) {
      this._students.update((students) =>
        students.map((item) =>
          item.id === studentId ? { ...item, coins: item.coins + coinsGain } : item,
        ),
      );
    }

    const xpAfter = this.xpFor(studentId);
    const levelAfter = levelForXp(xpAfter);
    const earnedAfter = this.badgesFor(studentId);
    const newBadges = earnedAfter.filter((badge) => !earnedBefore.has(badge.id));

    this.persist();

    return {
      score,
      passed,
      bestScore: record.bestScore,
      xpGain: Math.max(0, xpAfter - xpBefore),
      coinsGain,
      levelBefore,
      levelAfter,
      newBadges,
      record,
    };
  }

  /** Restaura os dados de demonstração e limpa o armazenamento local. */
  restoreDemoData(): void {
    this._students.set(cloneStudents(STUDENTS));
    this._progress.set(cloneProgress(SEED_PROGRESS));
    if (this.isBrowser) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  // ------------------------------------------------------------- persistência

  private loadPersistedData(): void {
    if (!this.isBrowser) return;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as PersistedData;
      if (
        parsed.version !== DATA_VERSION ||
        !Array.isArray(parsed.students) ||
        !Array.isArray(parsed.progress)
      ) {
        return;
      }

      const validStudents = parsed.students.filter((student) =>
        Boolean(student?.id && student?.name && student?.classId),
      );
      const validProgress = parsed.progress.filter((record) =>
        Boolean(
          record?.studentId &&
            record?.activityId &&
            Array.isArray(record?.history),
        ),
      );

      if (validStudents.length > 0) {
        this._students.set(validStudents);
        this._progress.set(validProgress);
      }
    } catch {
      // Dados corrompidos não devem impedir o uso da demonstração.
    }
  }

  private persist(): void {
    if (!this.isBrowser) return;

    try {
      const payload: PersistedData = {
        version: DATA_VERSION,
        savedAt: new Date().toISOString(),
        students: this._students(),
        progress: this._progress(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Em modo privado ou com quota esgotada, seguimos apenas em memória.
    }
  }
}
