import { NextRequest, NextResponse } from 'next/server';
import { searchKB, getCommonQuestions } from '@/lib/kb-search';

export async function POST(request: NextRequest) {
  try {
    const { query, language = 'en' } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Validate language
    const validLanguages = ['pt', 'en', 'es'];
    const lang = validLanguages.includes(language) ? language : 'en';

    // Search KB
    const results = searchKB(query, lang, 5);

    // If no results, return common questions as suggestions
    if (results.length === 0) {
      const suggestions = getCommonQuestions(lang, 3);
      return NextResponse.json({
        results: [],
        suggestions,
      });
    }

    return NextResponse.json({
      results,
      suggestions: [],
    });
  } catch (error) {
    console.error('Chat search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
