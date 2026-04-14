'use client';

import { Globe } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface LanguageSelectorProps {
  currentLocale: string;
}

const languages = [
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

export function LanguageSelector({ currentLocale }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open]);

  async function handleLanguageChange(locale: string) {
    try {
      const response = await fetch('/api/set-language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale }),
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error changing language:', error);
    }
  }

  const currentLanguage = languages.find((lang) => lang.code === currentLocale);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium text-[color:var(--sidebar-fg-muted)] hover:bg-white/[0.04] hover:text-[color:var(--sidebar-fg)] transition-all"
        title="Select language"
        aria-label="Select language"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe className="w-4 h-4" strokeWidth={2} />
        {currentLanguage && <span className="hidden sm:inline">{currentLanguage.flag}</span>}
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute bottom-full left-0 mb-2 bg-white border border-[color:var(--border)] rounded-lg shadow-lg z-50 min-w-[180px] overflow-hidden"
        >
          {languages.map((lang, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === languages.length - 1;
            const radius =
              isFirst && isLast
                ? 'rounded-lg'
                : isFirst
                ? 'rounded-t-lg'
                : isLast
                ? 'rounded-b-lg'
                : '';
            return (
              <button
                key={lang.code}
                role="option"
                aria-selected={currentLocale === lang.code}
                onClick={() => {
                  handleLanguageChange(lang.code);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${radius} ${
                  currentLocale === lang.code
                    ? 'bg-[color:var(--primary-soft)] text-[color:var(--primary)]'
                    : 'text-[color:var(--primary)] hover:bg-[color:var(--surface-sunken)]'
                }`}
              >
                <span className="mr-2">{lang.flag}</span>
                {lang.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
