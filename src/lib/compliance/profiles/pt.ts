import type { LegalProfile } from "./types";

/**
 * Portugal — Código do Trabalho (DL 7/2009, consolidado).
 * References:
 * - Art. 213 (breaks)
 * - Art. 214 (rest between shifts — 11h minimum)
 * - Art. 211 (weekly hours — 40h + max 2h overtime/day)
 * - Art. 232 (weekly rest — 1 day per 7)
 */
export const PT_PROFILE: LegalProfile = {
  code: "PT",
  name: "Portugal (Código do Trabalho)",
  minRestBetweenShifts: 11,
  maxConsecutiveWorkDays: 7,
  maxDailyHoursBlock: 10,
  maxDailyHoursWarn: 8,
  weeklyOvertimeBuffer: 2,
  breakThresholdHours: 6,
  breakDurationMinutes: 30,
};
