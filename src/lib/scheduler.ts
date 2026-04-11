/**
 * Auto-Scheduling Algorithm — Mapa de Horário
 *
 * Deterministic scheduler that distributes shifts across employees
 * respecting compliance rules, unavailabilities, and fairness scores.
 *
 * Priority: Compliance > Unavailability > Fairness > Balance
 */

import type { Profile, ShiftTemplate, ScheduleEntry } from "@/types/database";
import { validateCompliance, type ComplianceViolation } from "./compliance";

export interface SchedulerInput {
  employees: Profile[];
  shifts: ShiftTemplate[];
  days: string[]; // All dates in the month as YYYY-MM-DD
  staffOverrides: Record<string, number>;
  unavailableDays: Record<string, Set<string>>;
  existingEntries: (ScheduleEntry & { shift_template: ShiftTemplate })[];
  holidays: Set<string>;
}

export interface SchedulerOutput {
  entries: {
    user_id: string;
    date: string;
    shift_template_id: string;
  }[];
  violations: ComplianceViolation[];
  stats: {
    totalAssigned: number;
    employeeHours: Record<string, number>;
    unfilled: { date: string; shift_id: string; needed: number; assigned: number }[];
  };
}

// Fairness score weights
const W_HOUR = 0.5;
const W_NIGHT = 3;
const W_WEEKEND = 2;
const W_HOLIDAY = 1;

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

function shiftDurationHours(shift: ShiftTemplate): number {
  const start = timeToMinutes(shift.start_time);
  const end = timeToMinutes(shift.end_time);
  let diff = end - start;
  if (diff <= 0) diff += 24 * 60;
  return diff / 60;
}

function isWeekend(dateStr: string): boolean {
  const d = new Date(dateStr + "T00:00:00");
  return d.getDay() === 0 || d.getDay() === 6;
}

function isNightShift(shift: ShiftTemplate): boolean {
  const start = timeToMinutes(shift.start_time);
  return start >= 20 * 60 || start < 6 * 60;
}

/**
 * Fairness score delta for assigning a single shift on a given date.
 * Positive = adds "load" to the employee.
 */
function scoreDelta(
  shift: ShiftTemplate,
  date: string,
  holidays: Set<string>
): number {
  let d = shiftDurationHours(shift) * W_HOUR;
  if (isNightShift(shift)) d += W_NIGHT;
  if (isWeekend(date)) d += W_WEEKEND;
  if (holidays.has(date)) d += W_HOLIDAY;
  return d;
}

/**
 * Build initial fairness score per employee based on entries they already have.
 * Called ONCE at the start of scheduling — updated incrementally afterwards.
 */
function buildInitialScores(
  employees: Profile[],
  existingEntries: (ScheduleEntry & { shift_template: ShiftTemplate })[],
  holidays: Set<string>
): Map<string, number> {
  const scores = new Map<string, number>();
  for (const emp of employees) scores.set(emp.id, 0);
  for (const entry of existingEntries) {
    const current = scores.get(entry.user_id) ?? 0;
    scores.set(
      entry.user_id,
      current + scoreDelta(entry.shift_template, entry.date, holidays)
    );
  }
  return scores;
}

/**
 * Check if assigning a shift to an employee would cause a BLOCK compliance violation.
 * Only validates for the affected employee — much cheaper than running the full org check.
 */
function wouldCauseBlockForUser(
  userEntries: (ScheduleEntry & { shift_template: ShiftTemplate })[],
  newEntry: { user_id: string; date: string; shift_template: ShiftTemplate },
  profile: Profile
): boolean {
  const fakeEntry = {
    id: "temp",
    schedule_id: "temp",
    user_id: newEntry.user_id,
    date: newEntry.date,
    shift_template_id: newEntry.shift_template.id,
    is_holiday: false,
    overtime_hours: 0,
    notes: null,
    created_at: "",
    shift_template: newEntry.shift_template,
  };
  const allWithNew = [...userEntries, fakeEntry];
  const violations = validateCompliance(allWithNew, [profile]);
  return violations.some(
    (v) => v.severity === "block" && v.userId === newEntry.user_id
  );
}

/**
 * Main scheduling algorithm.
 *
 * Improvements over the naive version:
 *   1. Fairness score uses real shift duration (not a flat 8h).
 *   2. Scores are cached and updated incrementally (not rebuilt per slot).
 *   3. Compliance checks are user-scoped (only that employee's own entries).
 *   4. Deterministic tiebreaker on full_name + id so repeat runs match.
 *   5. Holidays carry an explicit fairness weight.
 */
export function generateSchedule(input: SchedulerInput): SchedulerOutput {
  const {
    employees,
    shifts,
    days,
    staffOverrides,
    unavailableDays,
    existingEntries,
    holidays,
  } = input;

  const activeEmployees = employees.filter((e) => e.is_active);
  const profileById = new Map<string, Profile>(
    activeEmployees.map((e) => [e.id, e])
  );

  // Initial scores (from pre-existing entries)
  const scores = buildInitialScores(activeEmployees, existingEntries, holidays);

  // Track assigned dates per employee (avoid double-booking)
  const assignedDays = new Map<string, Set<string>>();
  // Track ALL entries per user (for incremental compliance checks)
  const entriesByUser = new Map<
    string,
    (ScheduleEntry & { shift_template: ShiftTemplate })[]
  >();
  for (const emp of activeEmployees) {
    assignedDays.set(emp.id, new Set());
    entriesByUser.set(emp.id, []);
  }
  for (const e of existingEntries) {
    assignedDays.get(e.user_id)?.add(e.date);
    entriesByUser.get(e.user_id)?.push(e);
  }

  const result: SchedulerOutput["entries"] = [];
  const unfilled: SchedulerOutput["stats"]["unfilled"] = [];

  // Sort shifts: night shifts first (harder to fill), then by start time
  const sortedShifts = [...shifts].sort((a, b) => {
    const aNight = isNightShift(a) ? 0 : 1;
    const bNight = isNightShift(b) ? 0 : 1;
    if (aNight !== bNight) return aNight - bNight;
    return timeToMinutes(a.start_time) - timeToMinutes(b.start_time);
  });

  // Process each day
  for (const day of days) {
    for (const shift of sortedShifts) {
      const neededStaff = staffOverrides[shift.id] ?? shift.min_staff;
      if (neededStaff <= 0) continue;

      // Count already assigned for this shift+day (across all users)
      let alreadyAssigned = 0;
      for (const emp of activeEmployees) {
        const arr = entriesByUser.get(emp.id) || [];
        for (const e of arr) {
          if (e.date === day && e.shift_template_id === shift.id) {
            alreadyAssigned++;
          }
        }
      }
      const toFill = neededStaff - alreadyAssigned;
      if (toFill <= 0) continue;

      // Filter candidates
      const candidates: Profile[] = [];
      for (const emp of activeEmployees) {
        // Not unavailable
        const unavail = unavailableDays[emp.id];
        if (unavail && unavail.has(day)) continue;
        // Not already assigned this day
        const empDays = assignedDays.get(emp.id);
        if (empDays && empDays.has(day)) continue;
        // Compliance check — user-scoped only
        const userEntries = entriesByUser.get(emp.id) || [];
        const profile = profileById.get(emp.id);
        if (!profile) continue;
        if (
          wouldCauseBlockForUser(
            userEntries,
            { user_id: emp.id, date: day, shift_template: shift },
            profile
          )
        ) {
          continue;
        }
        candidates.push(emp);
      }

      // Sort by cached score (lowest = needs more shifts).
      // Deterministic tiebreaker: full_name then id.
      candidates.sort((a, b) => {
        const sa = scores.get(a.id) ?? 0;
        const sb = scores.get(b.id) ?? 0;
        if (sa !== sb) return sa - sb;
        const na = (a.full_name || "").localeCompare(b.full_name || "");
        if (na !== 0) return na;
        return a.id.localeCompare(b.id);
      });

      const toAssign = candidates.slice(0, toFill);
      for (const emp of toAssign) {
        result.push({
          user_id: emp.id,
          date: day,
          shift_template_id: shift.id,
        });
        // Update caches incrementally
        const fakeEntry = {
          id: "gen-" + day + "-" + shift.id + "-" + emp.id,
          schedule_id: "gen",
          user_id: emp.id,
          date: day,
          shift_template_id: shift.id,
          is_holiday: holidays.has(day),
          overtime_hours: 0,
          notes: null,
          created_at: "",
          shift_template: shift,
        };
        entriesByUser.get(emp.id)?.push(fakeEntry);
        assignedDays.get(emp.id)?.add(day);
        scores.set(
          emp.id,
          (scores.get(emp.id) ?? 0) + scoreDelta(shift, day, holidays)
        );
      }

      if (toAssign.length < toFill) {
        unfilled.push({
          date: day,
          shift_id: shift.id,
          needed: toFill,
          assigned: toAssign.length,
        });
      }
    }
  }

  // Final compliance validation across all entries (for reporting only)
  const allFinal: (ScheduleEntry & { shift_template: ShiftTemplate })[] = [];
  for (const arr of entriesByUser.values()) allFinal.push(...arr);
  const finalViolations = validateCompliance(allFinal, activeEmployees);

  // Calculate hours per employee from NEW entries only
  const employeeHours: Record<string, number> = {};
  for (const entry of result) {
    const shift = shifts.find((s) => s.id === entry.shift_template_id);
    if (shift) {
      employeeHours[entry.user_id] =
        (employeeHours[entry.user_id] || 0) + shiftDurationHours(shift);
    }
  }

  return {
    entries: result,
    violations: finalViolations,
    stats: {
      totalAssigned: result.length,
      employeeHours,
      unfilled,
    },
  };
}
