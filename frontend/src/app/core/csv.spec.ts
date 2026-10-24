import { describe, expect, it } from 'vitest';
import { buildCsv, slugify } from './csv';

describe('csv', () => {
  it('uses semicolon, BOM and quotes', () => {
    const csv = buildCsv([
      ['Aluno', 'Média'],
      ['Lucas S.', 83],
    ]);

    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('"Aluno";"Média"');
    expect(csv).toContain('"Lucas S.";"83"');
  });

  it('escapes double quotes', () => {
    expect(buildCsv([['Nome "apelido"']])).toContain('"Nome ""apelido"""');
  });

  it('creates safe file slugs', () => {
    expect(slugify('5º ano A')).toBe('5o-ano-a');
    expect(slugify('Relatório de Ação')).toBe('relatorio-de-acao');
  });
});
