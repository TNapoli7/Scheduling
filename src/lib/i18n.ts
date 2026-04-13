import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';

const locales = ['pt', 'en', 'es'];
const defaultLocale = 'pt';

export default getRequestConfig(async () => {
  const headersList = await headers();
  let locale = defaultLocale;

  // Get locale from URL pathname (will be set by middleware)
  // Or from cookie if set by user
  const cookieLocale = headersList.get('cookie')
    ?.split(';')
    .find(c => c.trim().startsWith('NEXT_LOCALE='))
    ?.split('=')[1];

  if (cookieLocale && locales.includes(cookieLocale)) {
    locale = cookieLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
