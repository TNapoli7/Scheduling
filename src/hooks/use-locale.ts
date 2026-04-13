'use client';

import { useEffect, useState } from 'react';

export function useClientLocale() {
  const [locale, setLocale] = useState('pt');

  useEffect(() => {
    // Get locale from cookie
    const cookies = document.cookie.split(';');
    const localeCookie = cookies.find(c => c.trim().startsWith('NEXT_LOCALE='));
    
    if (localeCookie) {
      const cookieLocale = localeCookie.split('=')[1];
      setLocale(cookieLocale);
    } else {
      // Fallback to browser language or Portuguese
      const browserLang = navigator.language.split('-')[0].toLowerCase();
      const locales = ['pt', 'en', 'es'];
      setLocale(locales.includes(browserLang) ? browserLang : 'pt');
    }
  }, []);

  return locale;
}
