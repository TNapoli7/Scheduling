import { describe, it, expect } from "vitest";
import { generateSchedule } from "../src/lib/scheduler";
import type { Profile, ShiftTemplate } from "../src/types/database";

// Helpers to build minimal fixtures
function makeEmployee(id: string, overrides: Partial<Profile> = {}): Profile {
  return {
    id,
    org_id: "org1",
    email: `${id}@test.local`,
    full_name: id,
    role: "employee",
    is_active: true,
    contract_type: "full-time",
    contract_hours: 40,
    function: null,
    credential: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  } as Profile;
}

function makeShift(id: string, start: string, end: string, staffing = 1): ShiftTemplate {
  return {
    id,
    org_id: "org1",
    name: id,
    start_time: start,
    end_time: end,
    required_staff: staffing,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  } as ShiftTemplate;
}

function daysInMonth(year: number, month1: number): string[] {
  const out: string[] = [];
  const last = new Date(year, month1, 0).getDate();
  for (let d = 1; d <= last; d++) {
    out.push(`${year}-${String(month1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }
  return out;
}

describe("generateSchedule - basic correctness", () => {
  it("fills every required shift on every day when staffing is feasible", () => {
    const employees = [makeEmployee("e1"), makeEmployee("e2"), makeEmployee("e3")];
    const shifts = [makeShift("morning", "08:00", "16:00", 1)];
    const days = daysInMonth(2026, 4);

    const out = generateSchedule({
      employees,
      shifts,
      days,
      staffOverrides: {},
      unavailableDays: {},
      existingEntries: [],
      holidays: new Set(),
    });

    expect(out.entries.length).toBe(days.length);
    expect(out.stats.unfilled.length).toBe(0);
  });

  it("never double-books an employee on the same day", () => {
    const employees = [makeEmployee("e1"), makeEmployee("e2")];
    const shifts = [
      makeShift("morning", "08:00", "16:00", 1),
      makeShift("afternoon", "14:00", "22:00", 1),
    ];
    const days = daysInMonth(2026, 4);

    const out = generateSchedule({
      employees,
      shifts,
      days,
      staffOverrides: {},
      unavailableDays: {},
      existingEntries: [],
      holidays: new Set(),
    });

    const seen = new Map<string, Set<string>>();
    for (const e of out.entries) {
      const key = `${e.user_id}|${e.date}`;
      if (seen.has(e.user_id)) {
        const set = seen.get(e.user_id)!;
        expect(set.has(e.date)).toBe(false);
        set.add(e.date);
      } else {
        seen.set(e.user_id, new Set([e.date]));
      }
    }
  });
});

describe("generateSchedule - fairness", () => {
  it("distributes hours roughly evenly between equal full-time employees", () => {
    const employees = [makeEmployee("e1"), makeEmployee("e2"), makeEmployee("e3")];
    const shifts = [makeShift("morning", "08:00", "16:00", 1)];
    const days = daysInMonth(2026, 4);

    const out = generateSchedule({
      employees,
      shifts,
      days,
      staffOverrides: {},
      unavailableDays: {},
      existingEntries: [],
      holidays: new Set(),
    });

    const hours = employees.map((e) => out.stats.employeeHours[e.id] ?? 0);
    const min = Math.min(...hours);
    const max = Math.max(...hours);
    // With 30 days / 3 employees the spread should never exceed a single shift (8h)
    expect(max - min).toBeLessThanOrEqual(8);
  });
});

describe("generateSchedule - availability constraints", () => {
  it("does not schedule an employee on a day marked as unavailable", () => {
    const employees = [makeEmployee("e1"), makeEmployee("e2")];
    const shifts = [makeShift("morning", "08:00", "16:00", 1)];
    const days = daysInMonth(2026, 4);
    const blockedDay = "2026-04-15";

    const out = generateSchedule({
      employees,
      shifts,
      days,
      staffOverrides: {},
      unavailableDays: { e1: new Set([blockedDay]) },
      existingEntries: [],
      holidays: new Set(),
    });

    const e1OnBlocked = out.entries.find(
      (e) => e.user_id === "e1" && e.date === blockedDay
    );
    expect(e1OnBlocked).toBeUndefined();
  });
});

describe("generateSchedule - determinism", () => {
  it("returns the same result when given the same input twice", () => {
    const base = {
      employees: [makeEmployee("e1"), makeEmployee("e2")],
      shifts: [makeShift("morning", "08:00", "16:00", 1)],
      days: daysInMonth(2026, 4),
      staffOverrides: {},
      unavailableDays: {},
      existingEntries: [],
      holidays: new Set<string>(),
    };
    const a = generateSchedule(base);
    const b = generateSchedule(base);
    const keyA = a.entries.map((e) => `${e.date}|${e.user_id}|${e.shift_template_id}`).join(";");
    const keyB = b.entries.map((e) => `${e.date}|${e.user_id}|${e.shift_template_id}`).join(";");
    expect(keyA).toBe(keyB);
  });
});
