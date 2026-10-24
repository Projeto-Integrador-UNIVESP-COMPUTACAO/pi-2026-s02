import { describe, expect, it } from 'vitest';
import { levelForXp, levelInfo, starsForScore } from './gamification';

describe('gamification', () => {
  it('maps XP to levels', () => {
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(79)).toBe(1);
    expect(levelForXp(80)).toBe(2);
    expect(levelForXp(180)).toBe(3);
    expect(levelForXp(430)).toBe(5);
    expect(levelForXp(9999)).toBe(5);
  });

  it('computes progress to the next level', () => {
    const info = levelInfo(250);
    expect(info.level).toBe(3);
    expect(info.nextXp).toBe(300);
    expect(info.xpToNext).toBe(50);
    expect(info.progressPct).toBe(58);
  });

  it('never returns a negative progress', () => {
    const info = levelInfo(-10);
    expect(info.level).toBe(1);
    expect(info.progressPct).toBe(0);
  });

  it('converts scores to stars', () => {
    expect(starsForScore(100)).toBe(3);
    expect(starsForScore(90)).toBe(3);
    expect(starsForScore(70)).toBe(2);
    expect(starsForScore(60)).toBe(1);
    expect(starsForScore(59)).toBe(0);
  });
});
