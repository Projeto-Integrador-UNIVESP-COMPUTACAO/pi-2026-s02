import { HttpClient } from '@angular/common/http';
import {
  Injectable,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  Observable,
  catchError,
  forkJoin,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import {
  ACTIVITIES,
  BADGES,
  CLASSES,
  STUDENTS,
  TEACHERS,
} from './seed';
import { API_BASE } from './api';
import { levelForXp, starsForScore } from './gamification';
import type {
  Activity,
  ActivityKind,
  AttemptLog,
  Badge,
  ClassGroup,
  CompletionOutcome,
  IconName,
  MissionView,
  ProgressRecord,
  RankingEntry,
  SkillCode,
  Student,
  Teacher,
} from './models';

interface ApiClassroom {
  id: number;
  name: string;
  grade: string;
  school: string;
  teacher_id: number;
}

interface ApiStudent {
  id: string | number;
  name: string;
  classId?: string | number | null;
  classroom_id?: number | null;
  coins: number;
  joinedAt?: string;
  joined_at?: string;
}

interface ApiProgress {
  studentId: string;
  activityId: string;
  bestScore: number;
  attempts: number;
  errors: number;
  passed: boolean;
  coinsAwarded: boolean;
  lastAt: string;
  history: AttemptLog[];
}

interface ApiUser {
  id: number;
  name: string;
  email: string;
  role: 'TEACHER' | 'STUDENT';
  classroom_id: number | null;
  coins: number;
  joined_at: string;
  classroom: ApiClassroom | null;
}

interface ApiClassroomProgress {
  classroom: ApiClassroom;
  students: ApiStudent[];
  progress: ApiProgress[];
}

interface ApiQuestion {
  id: string;
  kind: 'numeric' | 'choice';
  prompt: string;
  scenario?: string;
  table?: { label: string; value: string; emphasis?: boolean }[];
  options?: { id: string; label: string; detail?: string }[];
  answer: number | string;
  tolerance?: number;
  unit?: 'brl' | 'weeks' | 'percent' | 'none';
  explanation: string;
  hint?: string;
}

interface ApiActivity {
  id: string;
  title: string;
  tagline: string;
  description: string;
  kind: ActivityKind;
  icon: string;
  skills: SkillCode[];
  gradeLabel: string;
  difficulty: number;
  estimatedMinutes: number;
  rewardCoins: number;
  badgeId: string;
  questions: ApiQuestion[];
}

function toStudent(dto: ApiStudent, fallbackClassId = ''): Student {
  const rawClass = dto.classId ?? dto.classroom_id;
  return {
    id: String(dto.id),
    name: dto.name,
    classId: rawClass === null || rawClass === undefined ? fallbackClassId : String(rawClass),
    coins: dto.coins ?? 0,
    joinedAt: dto.joinedAt ?? dto.joined_at ?? new Date().toISOString(),
  };
}

function toProgress(dto: ApiProgress): ProgressRecord {
  return {
    studentId: String(dto.studentId),
    activityId: dto.activityId,
    bestScore: dto.bestScore,
    attempts: dto.attempts,
    errors: dto.errors,
    passed: dto.passed,
    coinsAwarded: dto.coinsAwarded,
    lastAt: dto.lastAt,
    history: Array.isArray(dto.history) ? dto.history : [],
  };
}

function toClassroom(dto: ApiClassroom): ClassGroup {
  return {
    id: String(dto.id),
    name: dto.name,
    grade: dto.grade,
    school: dto.school,
    teacherId: String(dto.teacher_id),
  };
}

function toActivity(dto: ApiActivity): Activity {
  return {
    id: dto.id,
    title: dto.title,
    tagline: dto.tagline ?? '',
    description: dto.description ?? '',
    kind: dto.kind,
    icon: (dto.icon || 'flag') as IconName,
    skills: dto.skills ?? [],
    gradeLabel: dto.gradeLabel ?? '',
    difficulty: (dto.difficulty >= 1 && dto.difficulty <= 3
      ? dto.difficulty
      : 1) as 1 | 2 | 3,
    estimatedMinutes: dto.estimatedMinutes ?? 5,
    rewardCoins: dto.rewardCoins ?? 0,
    badgeId: dto.badgeId ?? '',
    questions: (dto.questions ?? []).map((question) => ({
      id: question.id,
      kind: question.kind,
      prompt: question.prompt,
      scenario: question.scenario,
      table: question.table,
      options: question.options,
      answer: question.answer,
      tolerance: question.tolerance,
      unit: question.unit,
      explanation: question.explanation,
      hint: question.hint,
    })),
  };
}

/**
 * Camada de dados da plataforma.
 *
 * Os dados de atividades, alunos, turmas e progresso vêm da API
 * Django/PostgreSQL. As constantes de `seed.ts` permanecem apenas como
 * fallback visual caso a API esteja indisponível durante o desenvolvimento.
 */
@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly _activities = signal<readonly Activity[]>(ACTIVITIES);
  private readonly _classes = signal<readonly ClassGroup[]>(CLASSES);
  private readonly _teachers = signal<readonly Teacher[]>(TEACHERS);
  private readonly _students = signal<Student[]>(
    STUDENTS.map((student) => ({ ...student })),
  );
  private readonly _progress = signal<ProgressRecord[]>(
    [] as ProgressRecord[],
  );

  get activities(): readonly Activity[] {
    return this._activities();
  }
  readonly badges: readonly Badge[] = BADGES;
  readonly classes = this._classes.asReadonly();
  readonly teachers = this._teachers.asReadonly();
  readonly students = this._students.asReadonly();
  readonly progress = this._progress.asReadonly();

  private loadedFor: string | null = null;
  private loadingFor: string | null = null;

  // ---------------------------------------------------------------- carregamento

  /** Carrega os dados do usuário autenticado a partir da API. */
  loadForSession(session: {
    userId: string;
    role: 'student' | 'teacher';
    displayName: string;
  }): Observable<void> {
    if (!this.isBrowser) return of(undefined);
    if (this.loadedFor === session.userId) return of(undefined);
    if (this.loadingFor === session.userId) return of(undefined);

    this.loadingFor = session.userId;

    return this.http.get<ApiActivity[]>(`${API_BASE}/content/activities/`).pipe(
      catchError(() => of([] as ApiActivity[])),
      tap((activities) => {
        if (activities.length > 0) {
          this._activities.set(activities.map(toActivity));
        }
      }),
      switchMap(() =>
        session.role === 'student'
          ? this.loadStudent()
          : this.loadTeacher(session.userId, session.displayName),
      ),
      tap(() => {
        this.loadedFor = session.userId;
        this.loadingFor = null;
      }),
      map(() => undefined),
      catchError(() => {
        // Sem API, a interface segue com os dados de demonstração.
        this.loadingFor = null;
        return of(undefined);
      }),
    );
  }

  private loadStudent(): Observable<void> {
    return this.http.get<ApiUser>(`${API_BASE}/users/me/`).pipe(
      switchMap((user) => {
        if (!user.classroom_id) {
          return of({ user, data: null as ApiClassroomProgress | null });
        }
        return this.http
          .get<ApiClassroomProgress>(
            `${API_BASE}/progress/classroom/${user.classroom_id}/`,
          )
          .pipe(map((data) => ({ user, data })));
      }),
      map(({ user, data }) => {
        if (user.classroom) {
          this._classes.set([toClassroom(user.classroom)]);
        }
        if (data) {
          this._students.set(
            data.students.map((student) => toStudent(student)),
          );
          this._progress.set(data.progress.map(toProgress));
        } else {
          this._students.set([
            toStudent({
              id: user.id,
              name: user.name,
              classroom_id: user.classroom_id,
              coins: user.coins,
              joined_at: user.joined_at,
            }),
          ]);
          this._progress.set([]);
        }
      }),
    );
  }

  private loadTeacher(teacherId: string, displayName: string): Observable<void> {
    return this.http
      .get<ApiClassroom[]>(`${API_BASE}/classrooms/mine/`)
      .pipe(
        switchMap((classrooms) => {
          const groups = classrooms.map(toClassroom);
          this._classes.set(groups);
          this._teachers.set([
            {
              id: teacherId,
              name: displayName,
              title: 'Professor(a)',
              classIds: groups.map((group) => group.id),
            },
          ]);

          if (classrooms.length === 0) {
            this._students.set([]);
            this._progress.set([]);
            return of(undefined);
          }

          return forkJoin(
            classrooms.map((classroom) =>
              this.http.get<ApiClassroomProgress>(
                `${API_BASE}/progress/classroom/${classroom.id}/`,
              ),
            ),
          ).pipe(
            map((results) => {
              const students = new Map<string, Student>();
              const progress: ProgressRecord[] = [];
              results.forEach((result) => {
                result.students.forEach((student) =>
                  students.set(String(student.id), toStudent(student)),
                );
                progress.push(...result.progress.map(toProgress));
              });
              this._students.set([...students.values()]);
              this._progress.set(progress);
            }),
            map(() => undefined),
          );
        }),
      );
  }

  // ---------------------------------------------------------------- leituras

  studentById(studentId: string | undefined | null): Student | undefined {
    if (!studentId) return undefined;
    return this._students().find((student) => student.id === studentId);
  }

  activityById(activityId: string | undefined | null): Activity | undefined {
    if (!activityId) return undefined;
    return this._activities().find((activity) => activity.id === activityId);
  }

  classById(classId: string | undefined | null): ClassGroup | undefined {
    if (!classId) return undefined;
    return this._classes().find((group) => group.id === classId);
  }

  teacherById(teacherId: string | undefined | null): Teacher | undefined {
    if (!teacherId) return undefined;
    return this._teachers().find((teacher) => teacher.id === teacherId);
  }

  classesForTeacher(teacherId: string | undefined | null): ClassGroup[] {
    const teacher = this.teacherById(teacherId);
    if (!teacher) return [];
    return this._classes().filter((group) =>
      teacher.classIds.includes(group.id),
    );
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
    return this._activities().map((activity) => {
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
          return passedIds.size === this._activities().length;
        case 'level':
          return level >= badge.criterion.level;
        default:
          return false;
      }
    });
  }

  // --------------------------------------------------------------- escritas

  /**
   * Registra uma tentativa localmente e persiste na API.
   * Moedas são concedidas apenas na primeira conclusão de cada missão.
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

    this.persistAttempt(studentId, activityId, score, errors, passed);

    const xpAfter = this.xpFor(studentId);
    const levelAfter = levelForXp(xpAfter);
    const earnedAfter = this.badgesFor(studentId);
    const newBadges = earnedAfter.filter((badge) => !earnedBefore.has(badge.id));

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

  private persistAttempt(
    studentId: string,
    activityId: string,
    score: number,
    errors: number,
    passed: boolean,
  ): void {
    if (!this.isBrowser) return;

    this.http
      .post<ApiProgress & { coins: number; coinsGain: number }>(
        `${API_BASE}/progress/attempt/`,
        { activityId, score, errors, passed },
      )
      .subscribe({
        next: (response) => {
          if (typeof response.coins === 'number') {
            this._students.update((students) =>
              students.map((item) =>
                item.id === studentId ? { ...item, coins: response.coins } : item,
              ),
            );
          }
        },
        error: () => {
          // A tentativa permanece aplicada localmente até a próxima sincronização.
        },
      });
  }

  /** Recarrega os dados da API para o usuário atual. */
  restoreDemoData(): void {
    this.loadedFor = null;
  }
}
