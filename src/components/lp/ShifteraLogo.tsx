/**
 * Shiftera brand assets.
 *
 * Two components share this file so the whole brand system is in one place:
 *
 *  - <ShifteraLogo />    : mark only (coral rounded-square with a white
 *                          calendar+clock glyph). Default brand icon; used
 *                          in the sidebar, favicons, avatars, app tiles.
 *  - <ShifteraLockup />  : horizontal lockup (mark + "Shiftera" wordmark).
 *                          Used on the marketing navbar, login/register,
 *                          onboarding, emails and other "first-impression"
 *                          surfaces where the wordmark needs to read.
 *
 * The mark is inlined as SVG (no network fetch, fits React SSR cleanly).
 * The wordmark uses the same font stack as the rest of the product so it
 * renders consistently with headings — no bundled font file needed.
 */

interface ShifteraLogoProps {
  /** Mark height in pixels. Width matches (the mark is square). */
  size?: number;
  /** Tailwind / custom classes forwarded to the outer svg. */
  className?: string;
  /**
   * Color variant:
   *  - "color": default coral-gradient badge with white glyph
   *  - "mono-white": outlined white-only variant for ultra-saturated surfaces
   */
  variant?: "color" | "mono-white";
}

export function ShifteraLogo({
  size = 32,
  className = "",
  variant = "color",
}: ShifteraLogoProps) {
  // Unique gradient ID per instance so multiple logos on one page don't
  // collide (SVG <defs> IDs are global to the document).
  const gradId = `shiftera-coral-${Math.random().toString(36).slice(2, 8)}`;
  const isMono = variant === "mono-white";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Shiftera"
    >
      {!isMono && (
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3DBDAD" />
            <stop offset="1" stopColor="#1C7A6E" />
          </linearGradient>
        </defs>
      )}

      {/* Rounded-square badge */}
      <rect
        x="0"
        y="0"
        width="256"
        height="256"
        rx="56"
        ry="56"
        fill={isMono ? "none" : `url(#${gradId})`}
        stroke={isMono ? "#FFFFFF" : "none"}
        strokeWidth={isMono ? 6 : 0}
      />

      {/* Calendar binder tabs */}
      <rect x="82" y="48" width="14" height="32" rx="7" fill="#FFFFFF" />
      <rect x="160" y="48" width="14" height="32" rx="7" fill="#FFFFFF" />

      {/* Calendar body + header divider */}
      <rect
        x="52"
        y="72"
        width="152"
        height="140"
        rx="20"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="14"
      />
      <line x1="52" y1="110" x2="204" y2="110" stroke="#FFFFFF" strokeWidth="14" />

      {/* Clock face with hour + minute hands */}
      <circle cx="128" cy="162" r="30" fill="none" stroke="#FFFFFF" strokeWidth="9" />
      <line
        x1="128"
        y1="162"
        x2="128"
        y2="144"
        stroke="#FFFFFF"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <line
        x1="128"
        y1="162"
        x2="146"
        y2="162"
        stroke="#FFFFFF"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface ShifteraLockupProps {
  /** Height of the mark; wordmark scales proportionally. Default 32px. */
  size?: number;
  /** Container / svg class passthrough. */
  className?: string;
  /**
   * Wordmark colour. "navy" for light surfaces (marketing, auth pages);
   * "white" for dark surfaces (navy hero sections, footer on dark bg).
   */
  wordmarkColor?: "navy" | "white";
}

export function ShifteraLockup({
  size = 36,
  className = "",
  wordmarkColor = "navy",
}: ShifteraLockupProps) {
  // Render mark + wordmark inside an inline-flex wrapper so the baseline
  // aligns naturally. The mark carries its own aspect ratio; the wordmark
  // uses the app's body font stack at a size visually tuned to the mark.
  const wordmarkSize = Math.round(size * 0.78);
  const colorClass = wordmarkColor === "white" ? "text-white" : "text-[color:var(--primary)]";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <ShifteraLogo size={size} />
      <span
        className={`font-display font-extrabold tracking-tight ${colorClass}`}
        style={{ fontSize: `${wordmarkSize}px`, lineHeight: 1 }}
      >
        Shiftera
      </span>
    </span>
  );
}
