/**
 * Centralised date formatting helpers for Portuguese UI.
 *
 * Rules:
 *  - Lists / inline references:         DD/MM/YYYY  (e.g. 17/04/2026)
 *  - Cards / row headers:               DD MMM YYYY (e.g. 17 Abr 2026)
 *  - Page / month titles:               MMMM YYYY   (e.g. Abril 2026)
 *  - Short (same-year contexts):        DD MMM      (e.g. 17 Abr)
 *
 * All inputs are ISO date strings ("YYYY-MM-DD") or Date objects.
 */

const MONTHS_LONG = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

const MONTHS_SHORT = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
] as const;

function toDate(input: string | Date): Date {
  if (input instanceof Date) return input;
  // Parse YYYY-MM-DD as local (avoid UTC shift)
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return new Date(input + "T00:00:00");
  }
  return new Date(input);
}

/** 17/04/2026 — used in lists, table rows, inline references. */
export function formatDate(input: string | Date): string {
  const d = toDate(input);
  if (isNaN(d.getTime())) return String(input);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}

/** 17 Abr 2026 — card headers, notifications. */
export function formatDateWithMonth(input: string | Date): string {
  const d = toDate(input);
  if (isNaN(d.getTime())) return String(input);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

/** 17 Abr — short form when year context is obvious. */
export function formatDateShort(input: string | Date): string {
  const d = toDate(input);
  if (isNaN(d.getTime())) return String(input);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

/** Abril 2026 — page/month headers. */
export function formatMonthYear(year: number, month: number): string {
  return `${MONTHS_LONG[month - 1]} ${year}`;
}

/** 17/04/2026 – 22/04/2026 — date ranges. */
export function formatDateRange(start: string | Date, end: string | Date): string {
  return `${formatDate(start)} – ${formatDate(end)}`;
}

/** Relative today / ontem / amanhã / <formatted>. */
export function formatDateRelative(input: string | Date): string {
  const d = toDate(input);
  if (isNaN(d.getTime())) return String(input);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diffDays === 0) return "Hoje";
  if (diffDays === -1) return "Ontem";
  if (diffDays === 1) return "Amanhã";
  return formatDateWithMonth(d);
}
