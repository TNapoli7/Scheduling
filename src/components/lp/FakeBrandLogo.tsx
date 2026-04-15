/**
 * Placeholder brand marks for the register page's social-proof grid.
 * Each SVG is a small abstract logo with a unique shape + colour, so the
 * grid reads as "real brands with distinct identities" without naming any.
 */

type BrandKey =
  | "aurora"
  | "vida-plus"
  | "dental-porto"
  | "luso-med"
  | "fisio-expert"
  | "central";

interface FakeBrandLogoProps {
  brand: BrandKey;
  size?: number;
  className?: string;
}

/** Compact inline SVG brand marks. Rendered at 40–48px. */
export function FakeBrandLogo({
  brand,
  size = 40,
  className = "",
}: FakeBrandLogoProps) {
  const s = size;
  const common = { width: s, height: s, viewBox: "0 0 40 40", "aria-hidden": true as const };

  switch (brand) {
    case "aurora":
      // Amber sunrise over a horizon — "dawn" feel for "Aurora"
      return (
        <svg {...common} className={className}>
          <defs>
            <linearGradient id="auroraSun" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
          <rect width="40" height="40" rx="10" fill="#FEF3C7" />
          <circle cx="20" cy="24" r="8" fill="url(#auroraSun)" />
          <rect x="6" y="27" width="28" height="2" rx="1" fill="#D97706" />
          <rect x="10" y="31" width="20" height="1.5" rx="0.75" fill="#D97706" opacity="0.6" />
        </svg>
      );

    case "vida-plus":
      // Medical cross inside a rounded square — healthcare classic
      return (
        <svg {...common} className={className}>
          <rect width="40" height="40" rx="10" fill="#D1FAE5" />
          <path
            d="M17 11h6v6h6v6h-6v6h-6v-6h-6v-6h6z"
            fill="#059669"
          />
        </svg>
      );

    case "dental-porto":
      // Abstract tooth / arc, cool blue
      return (
        <svg {...common} className={className}>
          <rect width="40" height="40" rx="10" fill="#DBEAFE" />
          <path
            d="M14 10c-2 0-4 2-4 5 0 3 1.5 4.5 2 8 .5 3 1 5 2.5 5 1 0 1.5-2 2-4 .3-1.3.6-2 1.5-2s1.2.7 1.5 2c.5 2 1 4 2 4 1.5 0 2-2 2.5-5 .5-3.5 2-5 2-8 0-3-2-5-4-5-1.8 0-3 1-3.5 1.5-.5.5-1 1-1.5 1s-1-.5-1.5-1S15.8 10 14 10z"
            fill="#2563EB"
          />
        </svg>
      );

    case "luso-med":
      // Hexagon with inner smaller hexagon — molecular/lab vibe
      return (
        <svg {...common} className={className}>
          <rect width="40" height="40" rx="10" fill="#EDE9FE" />
          <path
            d="M20 7l11 6.5v13L20 33 9 26.5v-13z"
            fill="none"
            stroke="#7C3AED"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <circle cx="20" cy="20" r="3.5" fill="#7C3AED" />
        </svg>
      );

    case "fisio-expert":
      // Motion / dynamic curve — movement and recovery
      return (
        <svg {...common} className={className}>
          <rect width="40" height="40" rx="10" fill="#CCFBF1" />
          <path
            d="M8 28c4-2 6-10 12-10s8 8 12 6"
            fill="none"
            stroke="#0D9488"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="32" cy="22" r="2.5" fill="#0D9488" />
        </svg>
      );

    case "central":
      // Target / concentric rings — "central" hub
      return (
        <svg {...common} className={className}>
          <rect width="40" height="40" rx="10" fill="#FEE2E2" />
          <circle cx="20" cy="20" r="11" fill="none" stroke="#DC2626" strokeWidth="2" />
          <circle cx="20" cy="20" r="6.5" fill="none" stroke="#DC2626" strokeWidth="2" />
          <circle cx="20" cy="20" r="2.5" fill="#DC2626" />
        </svg>
      );
  }
}

export type { BrandKey };
