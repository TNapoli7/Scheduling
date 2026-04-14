/**
 * Legal profile schema — a country-specific bundle of labour-law parameters.
 *
 * Adding a new country = add a new file under `profiles/` that exports a
 * `LegalProfile` and register it in `profiles/index.ts`. No need to touch
 * the compliance engine itself.
 */

export interface LegalProfile {
  /** ISO-like short code: 'PT', 'ES', 'FR', 'EU' (baseline fallback). */
  code: string;
  /** Human-readable name, used in admin UI. */
  name: string;
  /** Minimum hours of rest between two consecutive shifts. */
  minRestBetweenShifts: number;
  /** How many consecutive working days trigger a mandatory rest-day block. */
  maxConsecutiveWorkDays: number;
  /** Hard block above this many hours worked in a single calendar day. */
  maxDailyHoursBlock: number;
  /** Warn when daily hours exceed this (but do not block). */
  maxDailyHoursWarn: number;
  /** Weekly overtime buffer above contracted hours before blocking. */
  weeklyOvertimeBuffer: number;
  /** Shift length (hours) that triggers a break requirement. */
  breakThresholdHours: number;
  /** Minimum break duration in minutes when the threshold is crossed. */
  breakDurationMinutes: number;
}
