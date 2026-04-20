"use client";

/**
 * Language selector for public/marketing pages (light navbar).
 * Writes NEXT_LOCALE via /api/set-language then reloads.
 */

import { Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";

const languages = [
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Español", flag: "🇪🇸" },
] as const;

export function LpLanguageSelector() {
  const currentLocale = useLocale();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  async function handleLanguageChange(locale: string) {
    try {
      const response = await fetch("/api/set-language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      if (response.ok) window.location.reload();
    } catch (error) {
      console.error("Error changing language:", error);
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-center p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
        title="Select language"
        aria-label="Select language"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe className="w-[18px] h-[18px]" strokeWidth={2} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-2 bg-white border border-stone-200 rounded-lg shadow-lg z-50 min-w-[180px] overflow-hidden"
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              role="option"
              aria-selected={currentLocale === lang.code}
              onClick={() => {
                handleLanguageChange(lang.code);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                currentLocale === lang.code
                  ? "bg-teal-50 text-teal-700"
                  : "text-stone-700 hover:bg-stone-50"
              }`}
            >
              <span className="mr-2">{lang.flag}</span>
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
