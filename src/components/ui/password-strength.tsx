"use client";

import { MIN_PASSWORD_LENGTH } from "@/lib/password-policy";

type Strength = "empty" | "weak" | "fair" | "strong";

function getStrength(password: string): Strength {
  if (!password) return "empty";

  let score = 0;

  // Length scoring
  if (password.length >= MIN_PASSWORD_LENGTH) score++;
  if (password.length >= 14) score++;

  // Character variety
  if (/[A-Za-zÀ-ÿ]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-zÀ-ÿ\d\s]/.test(password)) score++;

  if (score <= 2) return "weak";
  if (score <= 3) return "fair";
  return "strong";
}

const CONFIG: Record<Exclude<Strength, "empty">, { bars: number; color: string; label: string }> = {
  weak: { bars: 1, color: "var(--danger)", label: "Fraca" },
  fair: { bars: 2, color: "var(--warning)", label: "Razoável" },
  strong: { bars: 3, color: "var(--success)", label: "Forte" },
};

interface PasswordStrengthProps {
  password: string;
  labels?: { weak: string; fair: string; strong: string };
}

export function PasswordStrength({ password, labels }: PasswordStrengthProps) {
  const strength = getStrength(password);

  if (strength === "empty") return null;

  const cfg = CONFIG[strength];
  const label = labels?.[strength] ?? cfg.label;

  return (
    <div className="mt-2 flex items-center gap-2.5">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i <= cfg.bars ? cfg.color : "var(--border)",
            }}
          />
        ))}
      </div>
      <span
        className="text-[11px] font-medium shrink-0 transition-colors duration-300"
        style={{ color: cfg.color }}
      >
        {label}
      </span>
    </div>
  );
}
