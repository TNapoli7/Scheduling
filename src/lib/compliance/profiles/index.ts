/**
 * Central registry of legal profiles.
 * Use `getLegalProfile(countryCode)` to resolve a profile by code, with
 * safe fallback to the EU baseline then PT.
 */

import type { LegalProfile } from "./types";
import { PT_PROFILE } from "./pt";
import { BASE_EU_PROFILE } from "./base-eu";

const REGISTRY: Record<string, LegalProfile> = {
  PT: PT_PROFILE,
  EU: BASE_EU_PROFILE,
};

/**
 * Returns the `LegalProfile` for a given ISO-like country code.
 * Falls back to PT_PROFILE if the code is unknown (current default market).
 * Pass `null`/`undefined` to get PT.
 */
export function getLegalProfile(code?: string | null): LegalProfile {
  if (!code) return PT_PROFILE;
  const upper = code.toUpperCase();
  return REGISTRY[upper] || PT_PROFILE;
}

export { PT_PROFILE, BASE_EU_PROFILE };
export type { LegalProfile };
