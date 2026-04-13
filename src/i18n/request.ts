import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

const supportedLocales = ['pt', 'en', 'es'] as const;
const defaultLocale = 'pt';

function detectLocale(acceptLanguage: string | null, cookieLocale: string | null): string {
  if (cookieLocale && supportedLocales.includes(cookieLocale as any)) {
    return cookieLocale;
  }
  if (acceptLanguage) {
    const preferred = acceptLanguage.split(',').map(l => l.split(';')[0].trim().substring(0, 2).toLowerCase());
    for (const lang of preferred) {
      if (supportedLocales.includes(lang as any)) return lang;
    }
  }
  return defaultLocale;
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value || null;
  const acceptLanguage = headerStore.get('accept-language') || null;
  const locale = detectLocale(acceptLanguage, cookieLocale);

  const messages = (await import(`../messages/${locale}.json`)).default;

  return {
    locale,
    messages,
  };
});
