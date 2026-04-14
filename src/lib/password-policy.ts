/**
 * Client-side password policy.
 *
 * Enforces a stronger baseline than the Supabase default (6) while the HIBP
 * server-side toggle is pending. Rules are intentionally modest:
 *   - at least 10 characters
 *   - at least one letter AND one digit
 *
 * Returns a translation KEY (not a message) so UIs can localize.
 * Callers pass the `t` function to format.
 */

export type PasswordIssue =
  | "tooShort"
  | "needsLetter"
  | "needsDigit";

export interface PasswordCheckResult {
  ok: boolean;
  issue?: PasswordIssue;
}

export const MIN_PASSWORD_LENGTH = 10;

export function validatePasswordStrength(password: string): PasswordCheckResult {
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, issue: "tooShort" };
  }
  if (!/[A-Za-zÀ-ÿ]/.test(password)) {
    return { ok: false, issue: "needsLetter" };
  }
  if (!/\d/.test(password)) {
    return { ok: false, issue: "needsDigit" };
  }
  return { ok: true };
}
