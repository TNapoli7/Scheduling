import { NextRequest, NextResponse } from 'next/server';

const locales = ['pt', 'en', 'es'];

export async function POST(request: NextRequest) {
  try {
    const { locale } = await request.json();

    if (!locale || !locales.includes(locale)) {
      return NextResponse.json(
        { error: 'Invalid locale' },
        { status: 400 }
      );
    }

    const response = NextResponse.json(
      { success: true, locale },
      { status: 200 }
    );

    // Set the language preference cookie
    response.cookies.set('NEXT_LOCALE', locale, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Error setting language:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
