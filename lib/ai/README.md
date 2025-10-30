# Gemini AI Matching System

## Quick Start

### 1. Install Package
```bash
npm install @google/generative-ai
```

### 2. Set API Key
Add to `.env`:
```env
GEMINI_API_KEY=your_api_key_here
```

Get your key: https://makersuite.google.com/app/apikey

### 3. Test
```bash
npm run dev
# Visit http://localhost:3000/discover
```

## Files

- **`gemini-matcher.ts`** - Gemini AI integration for sorting candidates
- **`match-cache.ts`** - In-memory cache manager for sorted matches

## How It Works

1. User visits `/discover`
2. Fetch 30 candidates from DB
3. Sort with Gemini AI (3-5 seconds)
4. Cache sorted list
5. Display matches one by one
6. After 10 likes/passes → prefetch 30 more (background)

## API Response

```json
{
  "matches": [...],
  "source": "gemini_ai",
  "remaining": 28,
  "geminiTime": 2800
}
```

## Cache Management

- **TTL:** 30 minutes
- **Prefetch threshold:** 20 remaining matches
- **Auto-cleanup:** Every 10 minutes

## Cost

- **Model:** Gemini 1.5 Flash
- **Cost:** ~$0.00025 per sort (30 profiles)
- **Monthly:** ~$7.50 for 30,000 sorts

## Fallback

If Gemini fails → random scoring (no crash)

---

See `GEMINI_MATCHING_GUIDE.md` for full documentation.
