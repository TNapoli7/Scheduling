import fs from 'fs';
import path from 'path';
import matter from 'gray-matter'


export interface KBQuestion {
  question: string;
  answer: string;
  category: string;
  relevance: number;
}

interface KBMatter {
  title: string;
  keywords: string[];
}

const KB_CONTENT_PATH = path.join(process.cwd(), 'src/content/kb');

// Simple tokenization for keyword matching
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

// Calculate relevance score between query and content
function calculateRelevance(query: string, content: string, keywords: string[]): number {
  const queryTokens = tokenize(query);
  const contentTokens = tokenize(content);
  const keywordTokens = tokenize(keywords.join(' '));

  let score = 0;

  // Exact phrase match (highest weight)
  if (content.toLowerCase().includes(query.toLowerCase())) {
    score += 100;
  }

  // Keyword matches
  queryTokens.forEach((token) => {
    if (keywordTokens.includes(token)) {
      score += 30;
    }
    if (contentTokens.includes(token)) {
      score += 5;
    }
  });

  return score;
}

// Parse markdown KB file and extract Q&A pairs
function parseKBFile(filePath: string, language: string): KBQuestion[] {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    const metadata = data as KBMatter;

    const questions: KBQuestion[] = [];

    // Split content by headers (## format)
    const lines = content.split('\n');
    let currentQuestion = '';
    let currentAnswer = '';

    for (const line of lines) {
      if (line.startsWith('## ')) {
        // Save previous Q&A if exists
        if (currentQuestion && currentAnswer) {
          questions.push({
            question: currentQuestion,
            answer: currentAnswer.trim(),
            category: metadata.title || 'General',
            relevance: 0, // Will be calculated during search
          });
        }
        // Start new question
        currentQuestion = line.replace(/^## /, '').trim();
        currentAnswer = '';
      } else if (currentQuestion) {
        // Accumulate answer
        currentAnswer += line + '\n';
      }
    }

    // Don't forget the last Q&A
    if (currentQuestion && currentAnswer) {
      questions.push({
        question: currentQuestion,
        answer: currentAnswer.trim(),
        category: metadata.title || 'General',
        relevance: 0,
      });
    }

    return questions;
  } catch (error) {
    console.error(`Error parsing KB file ${filePath}:`, error);
    return [];
  }
}

// Load all KB files for a language
function loadKBForLanguage(language: string): KBQuestion[] {
  const languagePath = path.join(KB_CONTENT_PATH, language);
  const questions: KBQuestion[] = [];

  try {
    if (!fs.existsSync(languagePath)) {
      console.warn(`KB language path not found: ${languagePath}`);
      return questions;
    }

    const files = fs.readdirSync(languagePath).filter((file) => file.endsWith('.md'));

    files.forEach((file) => {
      const filePath = path.join(languagePath, file);
      const fileQuestions = parseKBFile(filePath, language);
      questions.push(...fileQuestions);
    });
  } catch (error) {
    console.error(`Error loading KB for language ${language}:`, error);
  }

  return questions;
}

// Search KB with keyword matching
export function searchKB(query: string, language: string = 'en', limit: number = 5): KBQuestion[] {
  if (!query.trim()) {
    return [];
  }

  const questions = loadKBForLanguage(language);

  if (questions.length === 0) {
    console.warn(`No KB content found for language: ${language}`);
    return [];
  }

  // Calculate relevance for each question
  questions.forEach((q) => {
    const relevance = calculateRelevance(
      query,
      q.question + ' ' + q.answer,
      [] // Keywords are already in the parsed content
    );
    q.relevance = relevance;
  });

  // Filter and sort by relevance
  return questions
    .filter((q) => q.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit);
}

// Get common questions for a language (first N questions from each category)
export function getCommonQuestions(language: string = 'en', limit: number = 5): KBQuestion[] {
  const questions = loadKBForLanguage(language);

  if (questions.length === 0) {
    return [];
  }

  // Group by category and take first from each
  const byCategory: Record<string, KBQuestion[]> = {};
  questions.forEach((q) => {
    if (!byCategory[q.category]) {
      byCategory[q.category] = [];
    }
    byCategory[q.category].push(q);
  });

  // Flatten and take first N
  const result: KBQuestion[] = [];
  Object.values(byCategory).forEach((categoryQuestions) => {
    result.push(...categoryQuestions.slice(0, 2));
  });

  return result.slice(0, limit);
}
