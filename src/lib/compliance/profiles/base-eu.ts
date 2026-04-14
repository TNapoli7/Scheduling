import type { LegalProfile } from "./types";

/**
 * EU baseline fallback — Working Time Directive 2003/88/EC.
 * Conservative defaults used when no country-specific profile exists.
 * The WTD sets minimum EU-wide standards; member states may be stricter.
 */
export const BASE_EU_PROFILE: LegalProfile = {
  code: "EU",
  name: "European Union (WTD 2003/88/EC)",
  minRestBetweenShifts: 11,
  maxConsecutiveWorkDays: 6, // WTD requires 1 rest day per 7
  maxDailyHoursBlock: 13, // indirect via 11h rest rule
  maxDailyHoursWarn: 8,
  weeklyOvertimeBuffer: 8, // average 48h/week incl. overtime
  breakThresholdHours: 6,
  breakDurationMinutes: 30,
};
