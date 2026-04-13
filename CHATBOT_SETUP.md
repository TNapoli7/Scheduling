# Shiftera Chatbot Widget Setup

## Overview

A custom React chatbot widget that floats on every page of the Shiftera app. It searches a Markdown-based Knowledge Base (KB) for answers. If no match is found, users can submit their question via a contact form, which gets stored in Supabase and optionally emailed to the admin via Resend.

## What Was Built

### 1. Knowledge Base Files
Located in `src/content/kb/`

Organized by language (pt, en, es) with 4 topic files each:
- `getting-started.md` - Onboarding, first steps, trial info
- `scheduling.md` - Schedule generation, shifts, fairness
- `account.md` - Profile, password, preferences
- `billing.md` - Pricing, plans, invoices

Each file uses frontmatter for metadata (title, keywords) and Q&A sections (## headers).

**Language Support:**
- Portuguese (pt)
- English (en)
- Spanish (es)

### 2. KB Search Utility
`src/lib/kb-search.ts`

- Loads markdown files and parses them with `gray-matter`
- Simple keyword-based search (no vector DB needed)
- Ranks results by relevance score
- Supports language parameter
- Two main functions:
  - `searchKB(query, language, limit)` - Search for specific query
  - `getCommonQuestions(language, limit)` - Get sample FAQ items

### 3. Chat Widget Component
`src/components/chat/ChatWidget.tsx`

A fully interactive floating widget with:
- Floating button (bottom-right, Shiftera orange #E8850A)
- Chat panel overlay (400px wide, 600px max height, responsive)
- Two modes:
  - **Chat Mode**: User types question, KB is searched, results shown
  - **Contact Mode**: If no KB match, show contact form (name, email, message)
- Language toggle (PT/EN/ES)
- Smooth animations
- Mobile responsive (full screen on mobile)

**Design System Integration:**
- Uses CSS custom properties (--primary, --accent, --background, etc.)
- Matches existing cream/coral design
- Shiftera orange (#E8850A) for primary interactions
- Lucide icons for UI

### 4. Chat Widget Styles
`src/components/chat/chat-widget.css`

- Floating button with hover effects
- Chat panel with slide-up animation
- Message bubbles (user vs. assistant)
- Typing indicator
- Contact form styling
- Mobile breakpoints (< 600px)
- Status messages (success/error)

### 5. API Routes

#### Search Endpoint
`src/app/api/chat/search/route.ts`

POST endpoint:
- Input: `{ query, language }` 
- Output: `{ results: KBQuestion[], suggestions: KBQuestion[] }`
- Returns top 5 matches or common questions if no match
- Validates language (pt/en/es)

#### Submit Endpoint
`src/app/api/chat/submit/route.ts`

POST endpoint:
- Input: `{ name, email, message, language }`
- Stores message in Supabase `support_messages` table
- Attempts to send email via Resend (gracefully skips if API key not configured)
- Email sent to: `napoles.tomas@gmail.com`
- Email from: `Shiftera Support <onboarding@resend.dev>`
- Validates all inputs (email format, length limits)

### 6. Supabase Migration
`supabase/migrations/013_support_messages.sql`

Creates `support_messages` table with:
- Columns: id, name, email, message, language, status, created_at, updated_at
- RLS enabled:
  - Anyone can insert (public form submissions)
  - Only admins/super_admins can read all
- Indexes on created_at, status, email for performance
- Trigger for auto-updating `updated_at`

### 7. Integration Points

#### Dashboard Layout
`src/app/(dashboard)/layout.tsx`

Added `<ChatWidget />` import and component rendering so the widget appears on all dashboard pages.

#### Landing Page
`src/components/landing/LandingPage.tsx`

Added `<ChatWidget />` import and component rendering so the widget appears on the public landing page.

## Installation & Setup

### 1. Install Dependencies

```bash
npm install gray-matter resend
```

Or if using yarn/pnpm:
```bash
yarn add gray-matter resend
pnpm add gray-matter resend
```

**Why these packages:**
- `gray-matter` - Parse YAML frontmatter from markdown files
- `resend` - Send emails via Resend API (optional, graceful fallback)

### 2. Configure Environment Variables

Add to your `.env.local`:

```env
# Optional - only needed if you want email notifications
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
```

**Getting a Resend API Key:**
1. Go to https://resend.com
2. Sign up for free
3. Navigate to API Keys
4. Copy your API key
5. Add to `.env.local`

**Note:** The chatbot works without this key. Messages will be stored in Supabase but emails won't be sent.

### 3. Run Supabase Migration

```bash
supabase migration up
# or
supabase db push
```

This creates the `support_messages` table with proper RLS policies.

### 4. Test the Widget

1. Start dev server: `npm run dev`
2. Navigate to landing page or dashboard
3. Click the orange chat bubble (bottom-right)
4. Try searching the KB
5. Try submitting a contact form

## File Structure

```
src/
├── components/
│   ├── chat/
│   │   ├── ChatWidget.tsx        # Main widget component
│   │   └── chat-widget.css       # Widget styles
│   └── landing/
│       └── LandingPage.tsx       # (modified) Added ChatWidget
├── content/
│   └── kb/
│       ├── pt/
│       │   ├── getting-started.md
│       │   ├── scheduling.md
│       │   ├── account.md
│       │   └── billing.md
│       ├── en/
│       │   └── (same 4 files)
│       └── es/
│           └── (same 4 files)
├── lib/
│   └── kb-search.ts              # KB search logic
└── app/
    ├── api/
    │   └── chat/
    │       ├── search/route.ts
    │       └── submit/route.ts
    └── (dashboard)/
        └── layout.tsx            # (modified) Added ChatWidget
supabase/
└── migrations/
    └── 013_support_messages.sql  # DB schema
```

## How It Works

### User Flow - Knowledge Base Search

1. User opens widget and types question
2. Frontend POSTs to `/api/chat/search`
3. API calls `searchKB()` which:
   - Loads all markdown files for that language
   - Parses frontmatter and content
   - Calculates relevance scores
   - Returns top 5 matches
4. If match found, show answer. If not, offer contact form.

### User Flow - Support Submission

1. User clicks "Need more help?" or KB has no results
2. Widget switches to contact form
3. User fills name, email, message
4. Frontend POSTs to `/api/chat/submit`
5. API:
   - Validates all inputs
   - Stores in Supabase `support_messages`
   - Attempts to email via Resend (if API key configured)
   - Returns success
6. Widget shows confirmation and auto-resets after 3 seconds

## Customization

### Change Brand Color

In `ChatWidget.tsx`, replace `#E8850A` with your color:
```tsx
const SHIFTERA_ORANGE = '#E8850A'; // Change this
```

Also update in `chat-widget.css` if needed.

### Add More KB Content

Create new markdown files in `src/content/kb/{language}/` with:
```markdown
---
title: Topic Name
keywords: [keyword1, keyword2, keyword3]
---

## Question 1?

Answer to question 1...

## Question 2?

Answer to question 2...
```

The search will automatically index all files.

### Change Email Recipient

In `src/app/api/chat/submit/route.ts`:
```tsx
to: 'your-email@example.com', // Change this
```

### Adjust Widget Size/Position

In `chat-widget.css`:
```css
.chat-widget-panel {
  width: 400px;        /* Change width */
  max-height: 600px;   /* Change max height */
  bottom: 100px;       /* Distance from button */
  right: 24px;         /* Distance from edge */
}

.chat-widget-button {
  bottom: 24px;        /* Button position */
  right: 24px;
  width: 56px;         /* Button size */
  height: 56px;
}
```

## API Reference

### POST /api/chat/search

**Request:**
```json
{
  "query": "How do I add employees?",
  "language": "en"
}
```

**Response:**
```json
{
  "results": [
    {
      "question": "How do I invite employees?",
      "answer": "1. Go to **Employees**\n2. Click **Add Employee**...",
      "category": "Getting Started",
      "relevance": 95
    }
  ],
  "suggestions": []
}
```

### POST /api/chat/submit

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "I need help with shifts",
  "language": "en"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Your support request has been received...",
  "emailSent": true
}
```

## Troubleshooting

### KB Search Returns No Results

- Check that markdown files exist in `src/content/kb/{language}/`
- Verify frontmatter format (three dashes before and after)
- Ensure keywords are relevant to questions

### Emails Not Sending

1. Check that `RESEND_API_KEY` is set in `.env.local`
2. Verify API key is valid (test at https://resend.com)
3. Check browser console for errors
4. Note: Messages still save to DB even if email fails

### Widget Not Appearing

1. Clear browser cache
2. Restart dev server
3. Check that ChatWidget is imported in layout
4. Verify CSS loads (no styling issues)
5. Check browser console for JS errors

### Can't Access KB in Language

- Create markdown files in `src/content/kb/{language-code}/`
- Ensure files are named exactly: `getting-started.md`, `scheduling.md`, etc.
- Verify YAML frontmatter syntax

## Performance Notes

- KB files are parsed on each search (cached by Next.js)
- For better performance with large KBs, consider caching parsed content
- Current implementation: ~12 KB total for all KB files (very lightweight)
- Search is instant (no network latency, happens server-side)

## Security Considerations

- Email validation: Basic regex check
- Input sanitization: Length limits (name: 100, message: 5000)
- RLS enabled: Only admins can read submitted messages
- CSRF protection: Standard Next.js API route protection
- No sensitive data should be stored in KB (it's public)

## Future Enhancements

Possible improvements:
1. Add vector embeddings for semantic search (instead of keyword matching)
2. Add admin dashboard to manage submissions
3. Add chatbot responses powered by AI (Claude API)
4. Add user satisfaction ratings
5. Add conversation history (persist to DB)
6. Add agent assignment workflows
7. Add email templates for better formatting
8. Add rate limiting to prevent spam

## Support

For issues or questions:
1. Check the Troubleshooting section
2. Review the API Reference
3. Check browser console for errors
4. Verify Supabase migration was applied
5. Test endpoints manually with curl or Postman
