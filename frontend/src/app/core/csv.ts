export type CsvValue = string | number | null | undefined;

function escapeCell(value: CsvValue): string {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

/** Gera CSV com BOM e ponto e vírgula, formato amigável ao Excel pt-BR. */
export function buildCsv(rows: CsvValue[][]): string {
  return `\uFEFF${rows.map((row) => row.map(escapeCell).join(';')).join('\r\n')}`;
}

export function downloadCsv(filename: string, rows: CsvValue[][]): void {
  if (typeof document === 'undefined') return;

  const blob = new Blob([buildCsv(rows)], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/º/g, 'o')
    .replace(/ª/g, 'a')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
