/**
 * Compliance Engine — Código do Trabalho Português
 * Validates schedule entries against Portuguese labor law rules
 */

import type { ScheduleEntry, ShiftTemplate, Profile } from "@/types/database";

export type ComplianceViolation = {
  rule: string;
  code: string;
  severity: "warning" | "block";
  message: string;
  date: string;
  userId: string;
};

type EntryWithShift = ScheduleEntry & { shift_template: ShiftTemplate };

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

function shiftDurationMinutes(shift: ShiftTemplate): number {
  const start = timeToMinutes(shift.start_time);
  const end = timeToMinutes(shift.end_time);
  let diff = end - start;
  if (diff <= 0) diff += 24 * 60; // overnight
  return diff;
}

function shiftEndAbsolute(date: string, shift: ShiftTemplate): number {
  const dayMs = new Date(date).getTime();
  const startMins = timeToMinutes(shift.start_time);
  const endMins = timeToMinutes(shift.end_time);
  const durationMins = shiftDurationMinutes(shift);
  return dayMs + startMins * 60000 + durationMins * 60000;
}

function shiftStartAbsolute(date: string, shift: ShiftTemplate): number {
  const dayMs = new Date(date).getTime();
  const startMins = timeToMinutes(shift.start_time);
  return dayMs + startMins * 60000;
}

/**
 * Art. 214 — Minimum 11h rest between shifts
 */
function checkRestBetweenShifts(
  entries: EntryWithShift[],
  userId: string
): ComplianceViolation[] {
  const violations: ComplianceViolation[] = [];
  const userEntries = entries
    .filter((e) => e.user_id === userId)
    .sort((a, b) => {
      const aStart = shiftStartAbsolute(a.date, a.shift_template);
      const bStart = shiftStartAbsolute(b.date, b.shift_template);
      return aStart - bStart;
    });

  for (let i = 1; i < userEntries.length; i++) {
    const prevEnd = shiftEndAbsolute(
      userEntries[i - 1].date,
      userEntries[i - 1].shift_template
    );
    const currStart = shiftStartAbsolute(
      userEntries[i].date,
      userEntries[i].shift_template
    );
    const restHours = (currStart - prevEnd) / (1000 * 60 * 60);

    if (restHours < 11) {
      violations.push({
        rule: `Descanso de ${restHours.toFixed(1)}h entre turnos (minimo 11h)`,
        code: "REST_11H",
        severity: "block",
        message: `Apenas ${restHours.toFixed(1)}h de descanso entre turnos`,
        date: userEntries[i].date,
        userId,
      });
    }
  }

  return violations;
}

/**
 * Art. 211 — Maximum 40h per week (regular), flag overtime
 */
function checkWeeklyHours(
  entries: EntryWithShift[],
  userId: string,
  profile: Profile
): ComplianceViolation[] {
  const violations: ComplianceViolation[] = [];
  const userEntries = entries.filter((e) => e.user_id === userId);

  // Group by ISO week
  const weeks = new Map<string, number>();
  for (const entry of userEntries) {
    const d = new Date(entry.date);
    // Get ISO week start (Monday)
    const dayOfWeek = d.getDay() || 7; // Convert Sunday=0 to 7
    const monday = new Date(d);
    monday.setDate(d.getDate() - dayOfWeek + 1);
    const weekKey = monday.toISOString().slice(0, 10);

    const hours = shiftDurationMinutes(entry.shift_template) / 60;
    weeks.set(weekKey, (weeks.get(weekKey) || 0) + hours);
  }

  for (const [weekStart, hours] of weeks) {
    const maxHours = profile.weekly_hours || 40;
    if (hours > maxHours + 2) {
      // More than 2h overtime in a week
      violations.push({
        rule: `${hours.toFixed(1)}h na semana de ${weekStart} (maximo ${maxHours}h + 2h extra)`,
        code: "MAX_WEEKLY_HOURS",
        severity: "block",
        message: `Excede horas semanais permitidas`,
        date: weekStart,
        userId,
      });
    } else if (hours > maxHours) {
      violations.push({
        rule: `${hours.toFixed(1)}h na semana de ${weekStart} (contrato: ${maxHours}h)`,
        code: "OVERTIME_WARNING",
        severity: "warning",
        message: `Horas extra: ${(hours - maxHours).toFixed(1)}h`,
        date: weekStart,
        userId,
      });
    }
  }

  return violations;
}

/**
 * Art. 232 — Minimum 1 rest day per 7 consecutive days
 */
function checkWeeklyRest(
  entries: EntryWithShift[],
  userId: string
): ComplianceViolation[] {
  const violations: ComplianceViolation[] = [];
  const userDates = new Set(
    entries.filter((e) => e.user_id === userId).map((e) => e.date)
  );

  // Sort dates
  const dates = Array.from(userDates).sort();
  if (dates.length === 0) return violations;

  // Check for 7 consecutive working days
  let consecutive = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      consecutive++;
      if (consecutive >= 7) {
        violations.push({
          rule: `${consecutive} dias consecutivos sem descanso`,
          code: "WEEKLY_REST",
          severity: "block",
          message: `Obrigatorio 1 dia de descanso por cada 7 dias`,
          date: dates[i],
          userId,
        });
      }
    } else {
      consecutive = 1;
    }
  }

  return violations;
}

/**
 * Art. 213 — Break of 30min after 6 consecutive hours
 * (This is informational — shifts > 6h should have a break built in)
 */
function checkLongShifts(
  entries: EntryWithShift[],
  userId: string
): ComplianceViolation[] {
  const violations: ComplianceViolation[] = [];
  const userEntries = entries.filter((e) => e.user_id === userId);

  for (const entry of userEntries) {
    const hours = shiftDurationMinutes(entry.shift_template) / 60;
    if (hours > 6) {
      violations.push({
        rule: `Turno de ${hours.toFixed(1)}h requer pausa de 30min`,
        code: "BREAK_6H",
        severity: "warning",
        message: `Garantir pausa de 30min (Art. 213)`,
        date: entry.date,
        userId,
      });
    }
  }

  return violations;
}

/**
 * Check max daily hours (8h normal, max 10h with overtime)
 */
function checkDailyHours(
  entries: EntryWithShift[],
  userId: string
): ComplianceViolation[] {
  const violations: ComplianceViolation[] = [];
  const userEntries = entries.filter((e) => e.user_id === userId);

  // Group by date
  const dayHours = new Map<string, number>();
  for (const entry of userEntries) {
    const hours = shiftDurationMinutes(entry.shift_template) / 60;
    dayHours.set(entry.date, (dayHours.get(entry.date) || 0) + hours);
  }

  for (const [date, hours] of dayHours) {
    if (hours > 10) {
      violations.push({
        rule: `${hours.toFixed(1)}h num dia (maximo 10h incluindo extras)`,
        code: "MAX_DAILY_10H",
        severity: "block",
        message: `Excede maximo diario de 10h`,
        date,
        userId,
      });
    } else if (hours > 8) {
      violations.push({
        rule: `${hours.toFixed(1)}h num dia (${(hours - 8).toFixed(1)}h extra)`,
        code: "OVERTIME_DAILY",
        severity: "warning",
        message: `Horas extra neste dia`,
        date,
        userId,
      });
    }
  }

  return violations;
}

/**
 * Run all compliance checks for a set of schedule entries
 */
export function validateCompliance(
  entries: EntryWithShift[],
  profiles: Profile[]
): ComplianceViolation[] {
  const violations: ComplianceViolation[] = [];
  const userIds = [...new Set(entries.map((e) => e.user_id))];

  for (const userId of userIds) {
    const profile = profiles.find((p) => p.id === userId);
    if (!profile) continue;

    violations.push(...checkRestBetweenShifts(entries, userId));
    violations.push(...checkWeeklyHours(entries, userId, profile));
    violations.push(...checkWeeklyRest(entries, userId));
    violations.push(...checkLongShifts(entries, userId));
    violations.push(...checkDailyHours(entries, userId));
  }

  return violations;
}

/**
 * Check violations for a specific user on a specific date
 */
export function getViolationsForCell(
  violations: ComplianceViolation[],
  userId: string,
  date: string
): ComplianceViolation[] {
  return violations.filter((v) => v.userId === userId && v.date === date);
}

/**
 * Check if a proposed assignment would create violations
 */
export function wouldViolate(
  existingEntries: EntryWithShift[],
  newEntry: EntryWithShift,
  profiles: Profile[]
): ComplianceViolation[] {
  const allEntries = [...existingEntries, newEntry];
  return validateCompliance(allEntries, profiles).filter(
    (v) => v.userId === newEntry.user_id
  );
}
