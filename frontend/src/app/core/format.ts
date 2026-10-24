const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const numberFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const shortDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
});

export function formatBrl(value: number): string {
  return brlFormatter.format(Number.isFinite(value) ? value : 0);
}

export function formatNumber(value: number, digits = 0): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatCompactNumber(value: number): string {
  return numberFormatter.format(Number.isFinite(value) ? value : 0);
}

export function formatDate(iso: string): string {
  const date = parseDate(iso);
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date);
}

export function formatShortDate(iso: string): string {
  const date = parseDate(iso);
  return Number.isNaN(date.getTime())
    ? '—'
    : shortDateFormatter.format(date).replace('.', '');
}

/** Datas sem hora (AAAA-MM-DD) são interpretadas ao meio-dia local. */
function parseDate(iso: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    return new Date(`${iso}T12:00:00`);
  }
  return new Date(iso);
}

export function initials(name: string): string {
  const parts = name
    .replace(/[^\p{L}\s]/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

/**
 * Aceita respostas digitadas como "9,50", "R$ 9,50" ou "9.50".
 * Retorna null quando não há um número válido.
 */
export function parseNumericAnswer(raw: string): number | null {
  let value = raw
    .trim()
    .replace(/[R$\s\u00a0]/gi, '')
    .replace(/[^\d,.-]/g, '');

  if (!value) return null;

  const negative = value.startsWith('-');
  value = value.replace(/-/g, '');

  const hasComma = value.includes(',');
  const hasDot = value.includes('.');

  if (hasComma && hasDot) {
    value = value.replace(/\./g, '').replace(',', '.');
  } else if (hasComma) {
    value = value.replace(',', '.');
  } else if ((value.match(/\./g) ?? []).length > 1) {
    const lastDot = value.lastIndexOf('.');
    value = `${value.slice(0, lastDot).replace(/\./g, '')}.${value.slice(lastDot + 1)}`;
  }

  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return null;
  return negative ? -parsed : parsed;
}
