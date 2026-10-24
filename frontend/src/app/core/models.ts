export type Role = 'student' | 'teacher';

export type IconName =
  | 'coin'
  | 'flag'
  | 'star'
  | 'wallet'
  | 'cart'
  | 'check'
  | 'arrow-left'
  | 'arrow-right'
  | 'arrow-up-right'
  | 'trophy'
  | 'book'
  | 'chart'
  | 'users'
  | 'logout'
  | 'download'
  | 'search'
  | 'eye'
  | 'eye-off'
  | 'lock'
  | 'user'
  | 'sparkles'
  | 'clock'
  | 'target'
  | 'piggy'
  | 'receipt'
  | 'tag'
  | 'percent'
  | 'accessible'
  | 'close'
  | 'chevron-down'
  | 'menu'
  | 'home'
  | 'list-checks'
  | 'award'
  | 'info'
  | 'alert'
  | 'lightbulb'
  | 'play'
  | 'refresh'
  | 'print'
  | 'plus'
  | 'minus'
  | 'filter'
  | 'medal';

export type SkillCode = 'EF05MA06' | 'EF06MA13' | 'EF07MA02';

export interface Skill {
  code: SkillCode;
  title: string;
  description: string;
  grade: string;
}

export interface UserAccount {
  id: string;
  password: string;
  role: Role;
  displayName: string;
  studentId?: string;
  teacherId?: string;
}

export interface Session {
  userId: string;
  role: Role;
  displayName: string;
  studentId?: string;
  teacherId?: string;
}

export interface Student {
  id: string;
  name: string;
  classId: string;
  coins: number;
  joinedAt: string;
}

export interface Teacher {
  id: string;
  name: string;
  title: string;
  classIds: string[];
}

export interface ClassGroup {
  id: string;
  name: string;
  grade: string;
  school: string;
  teacherId: string;
}

export interface QuestionOption {
  id: string;
  label: string;
  detail?: string;
}

export interface ScenarioRow {
  label: string;
  value: string;
  emphasis?: boolean;
}

export interface Question {
  id: string;
  kind: 'numeric' | 'choice';
  prompt: string;
  scenario?: string;
  table?: ScenarioRow[];
  options?: QuestionOption[];
  answer: number | string;
  tolerance?: number;
  unit?: 'brl' | 'weeks' | 'percent' | 'none';
  explanation: string;
  hint?: string;
}

export type ActivityKind = 'change' | 'offer' | 'installment' | 'savings' | 'budget';

export interface Activity {
  id: string;
  title: string;
  tagline: string;
  description: string;
  kind: ActivityKind;
  icon: IconName;
  skills: SkillCode[];
  gradeLabel: string;
  difficulty: 1 | 2 | 3;
  estimatedMinutes: number;
  rewardCoins: number;
  badgeId: string;
  questions: Question[];
}

export interface AttemptLog {
  at: string;
  score: number;
  errors: number;
  passed: boolean;
}

export interface ProgressRecord {
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

export interface RankingEntry {
  position: number;
  student: Student;
  xp: number;
  level: number;
}

export type BadgeCriterion =
  | { type: 'activity'; activityId: string }
  | { type: 'level'; level: number }
  | { type: 'any' }
  | { type: 'all' };

export type Tone = 'yellow' | 'green' | 'blue' | 'violet' | 'coral';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: IconName;
  tone: Tone;
  criterion: BadgeCriterion;
}

export interface LevelDefinition {
  level: number;
  name: string;
  minXp: number;
}

export interface LevelInfo {
  level: number;
  name: string;
  minXp: number;
  nextXp: number | null;
  progressPct: number;
  xpToNext: number | null;
}

export interface MissionView {
  activity: Activity;
  record?: ProgressRecord;
  status: 'new' | 'progress' | 'done';
  stars: number;
}

export interface CompletionOutcome {
  score: number;
  passed: boolean;
  bestScore: number;
  xpGain: number;
  coinsGain: number;
  levelBefore: number;
  levelAfter: number;
  newBadges: Badge[];
  record: ProgressRecord;
}

export interface Toast {
  id: number;
  message: string;
  tone: 'info' | 'success' | 'error';
}
