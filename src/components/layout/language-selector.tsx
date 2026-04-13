'use client';

import { useTranslations } from 'next-intl';
import { Globe } from 'lucide-react';
import { useState } from 'react';

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

  async function handleLanguageChange(locale: string) {
    try {
      // Set the language preference via API
      const response = await fetch('/api/set-language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale }),
      });

      if (response.ok) {
        // Reload to apply the language change
        window.location.reload();
      }
    } catch (error) {
      console.error('Error changing language:', error);
    }
  }

  const currentLanguage = languages.find(lang => lang.code === currentLocale);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium text-[color:var(--sidebar-fg-muted)] hover:bg-white/[0.04] hover:text-[color:var(--sidebar-fg)] transition-all"
        title="Select language"
        aria-label="Select language"
      >
        <Globe className="w-4 h-4" strokeWidth={2} />
        {currentLanguage && <span className="hidden sm:inline">{currentLanguage.flag}</span>}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 bg-white border border-[color:var(--border)] rounded-lg shadow-lg z-50 min-w-[180px]">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                handleLanguageChange(lang.code);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                currentLocale === lang.code
                  ? 'bg-[color:var(--primary-soft)] text-[color:var(--primary)]'
                  : 'text-[color:var(--primary)] hover:bg-[color:var(--surface)]'
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
