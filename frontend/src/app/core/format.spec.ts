import { describe, expect, it } from 'vitest';
import {
  formatDate,
  formatBrl,
  initials,
  parseNumericAnswer,
} from './format';

describe('parseNumericAnswer', () => {
  it('accepts Brazilian decimal commas', () => {
    expect(parseNumericAnswer('9,50')).toBe(9.5);
  });

  it('accepts currency formatting and dots', () => {
    expect(parseNumericAnswer('R$ 9.50')).toBe(9.5);
    expect(parseNumericAnswer('R$ 1.200,50')).toBe(1200.5);
  });

  it('rejects empty or non-numeric input', () => {
    expect(parseNumericAnswer('')).toBeNull();
    expect(parseNumericAnswer('abc')).toBeNull();
  });
});

describe('formatting', () => {
  it('formats BRL values', () => {
    expect(formatBrl(9.5)).toMatch(/9,50/);
  });

  it('formats date-only values without shifting the day', () => {
    expect(formatDate('2026-08-04')).toBe('04/08/2026');
  });

  it('builds initials from names', () => {
    expect(initials('Lucas S.')).toBe('LS');
    expect(initials('Ana')).toBe('AN');
  });
});
