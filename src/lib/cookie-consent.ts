/**
 * GDPR/RGPD cookie consent state.
 *
 * Stored in a first-party cookie (not a third-party tracker). Essential
 * cookies load unconditionally; everything else waits for explicit consent.
 * Consent choice is persisted for 1 year; after that, the banner re-prompts.
 */

export type ConsentCategory = "essential" | "functional" | "analytics" | "performance";

export interface ConsentState {
  /** Always true — session, auth, locale, CSRF. */
  essential: true;
  /** User preferences (e.g. UI state saved across sessions). */
  functional: boolean;
  /** Product analytics (Plausible / PostHog / etc.). */
  analytics: boolean;
  /** Performance + error tracking (Sentry). */
  performance: boolean;
  /** Unix ms when the user made this choice. Missing => no choice yet. */
  decidedAt?: number;
  /** Version of the banner copy at time of choice. Bump to re-prompt. */
  version: number;
}

export const CONSENT_COOKIE = "shiftera_cookie_consent";
export const CONSENT_VERSION = 1;
const ONE_YEAR_SECS = 60 * 60 * 24 * 365;

export const DEFAULT_CONSENT: ConsentState = {
  essential: true,
  functional: false,
  analytics: false,
  performance: false,
  version: CONSENT_VERSION,
};

export const ACCEPT_ALL_CONSENT: ConsentState = {
  essential: true,
  functional: true,
  analytics: true,
  performance: true,
  version: CONSENT_VERSION,
};

/** Read the cookie on the client. Returns null if no decision yet. */
export function readConsent(): ConsentState | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CONSENT_COOKIE}=`));
  if (!match) return null;
  try {
    const raw = decodeURIComponent(match.split("=")[1]);
    const parsed = JSON.parse(raw) as ConsentState;
    // Force essential=true and re-prompt if version mismatch (policy changed)
    if (parsed.version !== CONSENT_VERSION) return null;
    return { ...parsed, essential: true };
  } catch {
    return null;
  }
}

/** Write the cookie and broadcast a custom event so listeners can react. */
export function writeConsent(state: ConsentState): void {
  if (typeof document === "undefined") return;
  const full: ConsentState = {
    ...state,
    essential: true,
    decidedAt: Date.now(),
    version: CONSENT_VERSION,
  };
  const value = encodeURIComponent(JSON.stringify(full));
  document.cookie =
    `${CONSENT_COOKIE}=${value}; max-age=${ONE_YEAR_SECS}; path=/; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent("shiftera:consent-changed", { detail: full }));
}

/** Browser-reported Do-Not-Track hint. Respected only as a soft default. */
export function browserPrefersOptOut(): boolean {
  if (typeof navigator === "undefined") return false;
  // Standard navigator.doNotTrack ('1') or legacy msDoNotTrack
  const dnt =
    // @ts-expect-error legacy MS property
    navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
  return dnt === "1" || dnt === "yes";
}

/**
 * Open the banner imperatively (e.g. from footer "Manage cookies" link).
 * Listens in CookieBanner via `shiftera:consent-open` event.
 */
export function openConsentBanner(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("shiftera:consent-open"));
}
