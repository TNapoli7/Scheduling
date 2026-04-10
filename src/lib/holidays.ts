function computeEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function fmt(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(d.getDate() + days);
  return next;
}

export function getPortugueseHolidays(year: number): Record<string, string> {
  const easter = computeEasterSunday(year);
  const goodFriday = addDays(easter, -2);
  const corpusChristi = addDays(easter, 60);

  return {
    [`${year}-01-01`]: "Ano Novo",
    [fmt(goodFriday)]: "Sexta-feira Santa",
    [fmt(easter)]: "Páscoa",
    [`${year}-04-25`]: "Dia da Liberdade",
    [`${year}-05-01`]: "Dia do Trabalhador",
    [fmt(corpusChristi)]: "Corpo de Deus",
    [`${year}-06-10`]: "Dia de Portugal",
    [`${year}-08-15`]: "Assunção de Nossa Senhora",
    [`${year}-10-05`]: "Implantação da República",
    [`${year}-11-01`]: "Todos os Santos",
    [`${year}-12-01`]: "Restauração da Independência",
    [`${year}-12-08`]: "Imaculada Conceição",
    [`${year}-12-25`]: "Natal",
  };
}

export function getPortugueseHolidaysRange(
  fromYear: number,
  toYear: number
): Record<string, string> {
  const out: Record<string, string> = {};
  for (let y = fromYear; y <= toYear; y++) {
    Object.assign(out, getPortugueseHolidays(y));
  }
  return out;
}
