/**
 * Auto-Scheduling Algorithm — Mapa de Horario
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
  staffOverrides: Record<string, number>; // shift_template_id -> min_staff for this generation
  unavailableDays: Record<string, Set<string>>; // user_id -> Set of unavailable dates
  existingEntries: (ScheduleEntry & { shift_template: ShiftTemplate })[]; // Already assigned
  holidays: Set<string>; // National holiday dates
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
 * Build a fairness-weighted score for each employee.
 * Lower score = should get priority for better shifts.
 * Higher score = has been getting favorable treatment, can take harder shifts.
 */
function buildEmployeeScores(
  employees: Profile[],
  existingEntries: (ScheduleEntry & { shift_template: ShiftTemplate })[],
  newAssignments: Map<string, { shiftId: string; date: string }[]>
): Map<string, number> {
  const scores = new Map<string, number>();

  for (const emp of employees) {
    let totalHours = 0;
    let nightCount = 0;
    let weekendCount = 0;

    // Count from existing entries
    const empEntries = existingEntries.filter((e) => e.user_id === emp.id);
    for (const entry of empEntries) {
      totalHours += shiftDurationHours(entry.shift_template);
      if (isNightShift(entry.shift_template)) nightCount++;
      if (isWeekend(entry.date)) weekendCount++;
    }

    // Count from new assignments in this generation
    const newAssigns = newAssignments.get(emp.id) || [];
    // We don't have shift details for new assigns yet in scoring, but we can count
    totalHours += newAssigns.length * 8; // Approximate
    for (const a of newAssigns) {
      if (isWeekend(a.date)) weekendCount++;
    }

    // Composite score: higher = more loaded
    scores.set(emp.id, totalHours * 0.5 + nightCount * 3 + weekendCount * 2);
  }

  return scores;
}

/**
 * Check if assigning a shift to an employee on a date would violate compliance.
 * Returns true if the assignment would cause a BLOCK violation.
 */
function wouldCauseBlock(
  allEntries: (ScheduleEntry & { shift_template: ShiftTemplate })[],
  newEntry: { user_id: string; date: string; shift_template: ShiftTemplate },
  profiles: Profile[]
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

  const allWithNew = [...allEntries, fakeEntry];
  const violations = validateCompliance(allWithNew, profiles);
  return violations.some(
    (v) => v.severity === "block" && v.userId === newEntry.user_id
  );
}

/**
 * Main scheduling algorithm.
 *
 * For each day, for each shift that needs staffing:
 * 1. Filter to available employees (not unavailable, not already assigned that day)
 * 2. Filter out those who would cause compliance violations
 * 3. Sort by fairness score (lowest first = needs more shifts)
 * 4. Assign top N employees (where N = min_staff)
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
  const newAssignments = new Map<string, { shiftId: string; date: string }[]>();
  const allEntries = [...existingEntries];
  const result: SchedulerOutput["entries"] = [];
  const unfilled: SchedulerOutput["stats"]["unfilled"] = [];

  // Track assigned days per employee to avoid double-booking
  const assignedDays = new Map<string, Set<string>>();
  for (const emp of activeEmployees) {
    const empDates = new Set(
      existingEntries.filter((e) => e.user_id === emp.id).map((e) => e.date)
    );
    assignedDays.set(emp.id, empDates);
    newAssignments.set(emp.id, []);
  }

  // Sort shifts: night shifts first (harder to fill), then by start time
  const sortedShifts = [...shifts].sort((a, b) => {
    const aNight = isNightShift(a) ? 0 : 1;
    const bNight = isNightShift(b) ? 0 : 1;
    if (aNight !== bNight) return aNight - bNight;
    return timeToMinutes(a.start_time) - timeToMinutes(b.start_time);
  });

  // Process each day
  for (const day of days) {
    // Process each shift for this day
    for (const shift of sortedShifts) {
      const neededStaff = staffOverrides[shift.id] ?? shift.min_staff;
      if (neededStaff <= 0) continue;

      // Count already assigned for this shift+day
      const alreadyAssigned = allEntries.filter(
        (e) => e.date === day && e.shift_template_id === shift.id
      ).length;

      const toFill = neededStaff - alreadyAssigned;
      if (toFill <= 0) continue;

      // Get available candidates
      const candidates = activeEmployees.filter((emp) => {
        // Not unavailable
        const unavail = unavailableDays[emp.id];
        if (unavail && unavail.has(day)) return false;

        // Not already assigned this day
        const empDays = assignedDays.get(emp.id);
        if (empDays && empDays.has(day)) return false;

        // Compliance check — would this cause a block?
        if (wouldCauseBlock(allEntries, { user_id: emp.id, date: day, shift_template: shift }, activeEmployees)) {
          return false;
        }

        return true;
      });

      // Sort candidates by fairness score (lowest = should get more shifts)
      const scores = buildEmployeeScores(activeEmployees, allEntries, newAssignments);
      candidates.sort((a, b) => {
        const scoreA = scores.get(a.id) || 0;
        const scoreB = scores.get(b.id) || 0;
        return scoreA - scoreB; // Lowest score first
      });

      // Assign top N candidates
      const toAssign = candidates.slice(0, toFill);

      for (const emp of toAssign) {
        const entry = {
          user_id: emp.id,
          date: day,
          shift_template_id: shift.id,
        };
        result.push(entry);

        // Track in all entries for compliance checks
        const fakeEntry = {
          id: `gen-${day}-${shift.id}-${emp.id}`,
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
        allEntries.push(fakeEntry);

        // Track assignments
        assignedDays.get(emp.id)?.add(day);
        newAssignments.get(emp.id)?.push({ shiftId: shift.id, date: day });
      }

      // Track unfilled
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

  // Calculate final compliance violations
  const finalViolations = validateCompliance(allEntries, activeEmployees);

  // Calculate hours per employee
  const employeeHours: Record<string, number> = {};
  for (const entry of result) {
    const shift = shifts.find((s) => s.id === entry.shift_template_id);
    if (shift) {
      employeeHours[entry.user_id] = (employeeHours[entry.user_id] || 0) + shiftDurationHours(shift);
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
