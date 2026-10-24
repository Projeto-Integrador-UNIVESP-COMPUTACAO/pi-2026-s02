import type { LevelDefinition, LevelInfo } from './models';

export const PASS_THRESHOLD = 60;

export const LEVELS: readonly LevelDefinition[] = [
  { level: 1, name: 'Primeiros trocados', minXp: 0 },
  { level: 2, name: 'Olho na oferta', minXp: 80 },
  { level: 3, name: 'Poupador', minXp: 180 },
  { level: 4, name: 'Planejador', minXp: 300 },
  { level: 5, name: 'Mestre das finanças', minXp: 430 },
];

export function levelForXp(xp: number): number {
  const safeXp = Number.isFinite(xp) ? Math.max(0, xp) : 0;
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (safeXp >= level.minXp) {
      current = level;
    } else {
      break;
    }
  }
  return current.level;
}

export function levelInfo(xp: number): LevelInfo {
  const safeXp = Number.isFinite(xp) ? Math.max(0, xp) : 0;
  let index = 0;
  for (let i = 0; i < LEVELS.length; i += 1) {
    if (safeXp >= LEVELS[i].minXp) {
      index = i;
    }
  }
  const current = LEVELS[index];
  const next = LEVELS[index + 1] ?? null;
  const span = next ? next.minXp - current.minXp : 0;
  const progressPct = next
    ? Math.min(100, Math.max(0, Math.round(((safeXp - current.minXp) / span) * 100)))
    : 100;

  return {
    level: current.level,
    name: current.name,
    minXp: current.minXp,
    nextXp: next ? next.minXp : null,
    progressPct,
    xpToNext: next ? Math.max(0, next.minXp - safeXp) : null,
  };
}

export function starsForScore(score: number): 0 | 1 | 2 | 3 {
  if (score >= 90) return 3;
  if (score >= 70) return 2;
  if (score >= PASS_THRESHOLD) return 1;
  return 0;
}

export function scoreTone(score: number): 'good' | 'warn' | 'bad' {
  if (score >= 80) return 'good';
  if (score >= PASS_THRESHOLD) return 'warn';
  return 'bad';
}

export function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.min(100, Math.max(0, Math.round(score)));
}
