# Internationalization (i18n) Setup for Shiftera

This document outlines the internationalization implementation for the Shiftera shift scheduling application.

## Overview

The Shiftera app now supports 3 languages:
- Portuguese (PT) - Default
- English (EN)
- Spanish (ES)

Language detection and switching is handled automatically via browser Accept-Language headers, user cookies, and a language selector in the sidebar.

## Architecture

### Language Detection Flow

1. **Initial Request**: When a user first visits the app, the middleware checks for a `NEXT_LOCALE` cookie
2. **Cookie Not Found**: If no cookie exists, the Accept-Language header from the browser is parsed to detect the language
3. **Browser Language Detected**: The detected language is set as a cookie for future requests
4. **Default Fallback**: If no match is found, Portuguese (pt) is used as the default

### Technology Stack

- **next-intl**: ^3.0.0 - Next.js internationalization library
- **Middleware-based detection**: Language is detected in `src/lib/supabase/middleware.ts`
- **API-based preference**: Users can change language via `/api/set-language`

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── set-language/
│   │       └── route.ts              # API endpoint for setting language preference
│   ├── layout.tsx                     # Updated with locale and messages
│   └── (auth)/
│       └── login/
│           └── page.tsx               # Updated with useTranslations hook
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx                # Updated with language selector
│   │   └── language-selector.tsx      # Language selector dropdown component
│   └── providers/
│       └── language-provider.tsx      # IntlProvider wrapper
├── hooks/
│   └── use-locale.ts                  # Hook to get current locale on client
├── i18n/
│   └── request.ts                     # next-intl configuration
├── lib/
│   ├── i18n.ts                        # i18n utility functions
│   └── supabase/
│       └── middleware.ts              # Updated with language detection logic
├── messages/
│   ├── pt.json                        # Portuguese translations
│   ├── en.json                        # English translations
│   └── es.json                        # Spanish translations
├── middleware.ts                      # Root middleware
└── types/
    └── ...

next.config.ts                         # Updated with next-intl plugin
package.json                           # Updated with next-intl dependency
```

## Translation Keys Structure

All translations are organized in the `messages/` folder with the following namespace structure:

- **navigation**: Sidebar navigation labels
- **auth**: Authentication page strings
- **common**: Shared UI elements (buttons, etc.)
- **schedule**: Schedule-related labels
- **language**: Language selection strings

### Example Translation Key Usage

```typescript
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('navigation');
  
  return <h1>{t('dashboard')}</h1>; // Returns "Dashboard", "Panel de control", etc.
}
```

## How Language Switching Works

### 1. User Clicks Language Selector

The language selector in the sidebar triggers a language change:

```typescript
// src/components/layout/language-selector.tsx
async function handleLanguageChange(locale: string) {
  const response = await fetch('/api/set-language', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ locale }),
  });

  if (response.ok) {
    window.location.reload(); // Reload to apply changes
  }
}
```

### 2. API Sets Cookie

The `/api/set-language` endpoint sets a cookie that persists for 1 year:

```typescript
response.cookies.set('NEXT_LOCALE', locale, {
  maxAge: 60 * 60 * 24 * 365, // 1 year
  path: '/',
  sameSite: 'lax',
});
```

### 3. Middleware Applies Language

On the next request, the middleware reads this cookie and applies the language:

```typescript
// src/lib/supabase/middleware.ts
const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
if (cookieLocale && locales.includes(cookieLocale)) {
  locale = cookieLocale;
}
```

## Adding New Translations

To add new translations to the app:

1. **Update all language files** in `src/messages/`:

```json
{
  "namespace": {
    "key": "English translation",
    ...
  }
}
```

For example, to add a new dashboard string:

**pt.json**:
```json
{
  "dashboard": {
    "welcome": "Bem-vindo ao Dashboard"
  }
}
```

**en.json**:
```json
{
  "dashboard": {
    "welcome": "Welcome to Dashboard"
  }
}
```

**es.json**:
```json
{
  "dashboard": {
    "welcome": "Bienvenido al Panel de Control"
  }
}
```

2. **Use in components**:

```typescript
const t = useTranslations('dashboard');
// Returns the translated string based on the user's language preference
return <h1>{t('welcome')}</h1>;
```

## Pages and Components Using Translations

### Currently Translated:
- Login page (`src/app/(auth)/login/page.tsx`)
- Sidebar navigation (`src/components/layout/sidebar.tsx`)
- Language selector (`src/components/layout/language-selector.tsx`)

### Still Need Translation:
- Register page
- Forgot password page
- Reset password page
- All dashboard pages (schedule, employees, shifts, etc.)
- Settings pages
- Common modals and components

## Browser Language Detection

The middleware automatically detects the browser's preferred language from the Accept-Language header:

```typescript
function getLocaleFromAcceptLanguage(acceptLanguage: string | null): string {
  // Parses "pt-PT,pt;q=0.9,en;q=0.8" to extract "pt"
  // Falls back to default (pt) if no match
}
```

## Testing Language Switching

To test the i18n implementation:

1. **Manual language switching**: Use the language selector in the sidebar
2. **Browser language detection**: Change your browser's language settings and visit the login page
3. **Cookie persistence**: Switch languages, close the browser, and reopen - the language preference should persist

## Notes

- Language detection does NOT use URL parameters - it's cookie-based for a cleaner URL structure
- The default language is Portuguese (pt)
- All user preferences are stored in the `NEXT_LOCALE` cookie
- Language switching requires a page reload to apply new translations
- The `use-locale` hook provides client-side access to the current locale

## Environment Variables

No special environment variables are required for i18n to work. The implementation uses Next.js built-in capabilities and next-intl library.

## Performance Considerations

- Translation files are loaded per-request based on the detected locale
- Only the active language's translations are sent to the client
- Language switching clears the cache by reloading the page

## Future Enhancements

- Add more language support (e.g., French, German)
- Implement incremental translations (not all strings need to be translated immediately)
- Add language preference to user profile for persistent selection across devices
- Implement RTL (right-to-left) language support if needed
- Add automatic translation via services like Google Translate API
