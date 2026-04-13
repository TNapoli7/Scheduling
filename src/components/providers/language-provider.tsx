'use client';

import { ReactNode } from 'react';
import { IntlProvider } from 'use-intl';
import { useLocale } from 'next-intl';

interface LanguageProviderProps {
  children: ReactNode;
  messages: Record<string, any>;
}

export function LanguageProvider({ children, messages }: LanguageProviderProps) {
  const locale = useLocale();

  return (
    <IntlProvider locale={locale} messages={messages}>
      {children}
    </IntlProvider>
  );
}
