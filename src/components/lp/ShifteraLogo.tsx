/**
 * Shiftera brand mark — calendar icon with accent dots.
 * Used in both marketing navbar/footer and the dashboard sidebar so the
 * brand reads the same everywhere. Size defaults to 32px; callers can
 * override via `size` or `className`.
 */

interface ShifteraLogoProps {
  size?: number;
  className?: string;
}

export function ShifteraLogo({ size = 32, className = "" }: ShifteraLogoProps) {
  // Viewbox 96x106 matches the original sidebar mark so styling stays stable.
  const height = Math.round((size * 106) / 96);
  return (
    <svg
      viewBox="0 0 96 106"
      width={size}
      height={height}
      className={className}
      aria-hidden="true"
    >
      {/* Calendar body with subtle top-band */}
      <rect x="4" y="22" width="88" height="76" rx="14" ry="14" fill="#E8850A" />
      <rect x="4" y="22" width="88" height="28" rx="14" ry="14" fill="#D47608" />
      <rect x="4" y="40" width="88" height="10" fill="#D47608" />

      {/* Binding pins */}
      <rect x="26" y="8" width="10" height="26" rx="5" fill="#E8850A" />
      <rect x="60" y="8" width="10" height="26" rx="5" fill="#E8850A" />

      {/* 3×3 date grid — highlighted "today" on row 2 col 2 */}
      {[57, 72, 87].map((cy, row) =>
        [28, 48, 68].map((cx, col) => {
          const highlight = row === 1 && col === 1;
          return (
            <circle
              key={`${cx}-${cy}`}
              cx={cx}
              cy={cy}
              r={highlight ? 4 : 3}
              fill="#FFFFFF"
              opacity={highlight ? 1 : 0.85}
            />
          );
        })
      )}
    </svg>
  );
}
