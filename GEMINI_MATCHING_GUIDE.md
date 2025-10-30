# Gemini AI Matching System - Implementation Guide

## 🎯 Overview

StudyMate now uses **Google Gemini AI** to intelligently sort and match students based on compatibility. This replaces the previous random scoring system with smart AI-powered matching.

## 🏗️ Architecture

```
User visits /discover
    ↓
1. Check cache (has sorted matches?)
    ↓ (No)
2. Fetch 30 candidates from Supabase
    ↓
3. Send to Gemini AI Agent
   - Current user profile
   - 30 candidate profiles
   - Scoring criteria
    ↓
4. Gemini returns sorted list (highest to lowest)
    ↓
5. Cache sorted list (30 matches)
    ↓
6. Return first batch to user
    ↓
User Like/Pass
    ↓
7. Pop match from cache
    ↓
8. After 10 actions (20 remaining)
    ↓
9. Background prefetch:
   - Fetch 30 new candidates
   - Sort with Gemini
   - Append to cache (don't merge)
```

## 📊 Scoring Criteria

Gemini AI scores candidates based on:

1. **Major & Academic Alignment (30%)** - Same or related majors
2. **Shared Interests (25%)** - Common study topics, hobbies
3. **Study Time Compatibility (20%)** - Overlapping study times
4. **Skills Complementarity (15%)** - Skills that work well together
5. **University Match (10%)** - Same university bonus

Score range: **60-99**

## 🔧 Setup

### 1. Install Dependencies

```bash
npm install @google/generative-ai
```

### 2. Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy your API key

### 3. Configure Environment

Add to `.env` or `.env.local`:

```env
GEMINI_API_KEY=your_api_key_here
```

### 4. Files Created

```
lib/ai/
  ├── gemini-matcher.ts      # Gemini AI integration
  └── match-cache.ts         # In-memory cache manager

app/api/discover/smart-matches/route.ts  # Updated API
```

## 🚀 How It Works

### Initial Load

```typescript
GET /api/discover/smart-matches?limit=10

Response:
{
  "matches": [...],
  "totalAvailable": 30,
  "remaining": 30,
  "source": "gemini_ai",
  "executionTime": 3500,
  "geminiTime": 2800
}
```

**First time:** ~3-5 seconds (DB fetch + Gemini AI)
**Subsequent:** ~100-200ms (from cache)

### Like/Pass Actions

```typescript
POST /api/discover/smart-matches
Body: {
  "actions": [
    { "targetUserId": "abc123", "action": "LIKE" },
    { "targetUserId": "def456", "action": "PASS" }
  ]
}

Response:
{
  "success": true,
  "results": [...],
  "processed": 2,
  "remaining": 28,
  "prefetchTriggered": false
}
```

### Auto-Prefetch

After 10 actions (20 remaining matches):
- Background job fetches 30 new candidates
- Sorts with Gemini AI
- Appends to cache
- No interruption to user experience

## 💾 Cache Management

### Cache Structure

```typescript
{
  matches: [
    {
      userId: "abc123",
      score: 95,
      reasoning: "Same CS major, 4 shared interests...",
      profileData: { /* full user profile */ }
    }
  ],
  cursor: 0,          // Current position
  lastFetch: Date,
  prefetchTriggered: false
}
```

### Cache Behavior

- **TTL:** 30 minutes
- **Size:** 30 matches per batch
- **Prefetch threshold:** 20 remaining
- **Auto-cleanup:** Every 10 minutes

### Cache Keys

- Main cache: `gemini_sorted_matches:{userId}`
- Prefetch queue: `gemini_prefetch_queue:{userId}`

## 📈 Performance

### Execution Times

| Operation | Time | Source |
|-----------|------|--------|
| First load | 3-5s | DB + Gemini |
| Cache hit | 100-200ms | Memory |
| Prefetch (background) | 3-5s | Non-blocking |

### API Costs (Gemini 1.5 Flash)

- **Input:** ~2000 tokens per request (30 profiles)
- **Output:** ~500 tokens (sorted list)
- **Cost:** ~$0.00025 per sort (very cheap!)
- **Monthly:** ~$7.50 for 30k sorts

## 🔍 Debugging

### Enable Detailed Logs

Check server console for:

```
🔍 Smart matches API called for user abc123
⚠️ Cache miss! Fetching 30 candidates from DB...
📊 Database queries completed in 350ms (30 candidates)
🤖 Sorting 30 candidates with Gemini AI...
✨ Gemini AI sorting completed in 2800ms
💾 Cached 30 sorted matches
✅ Smart matches API completed in 3500ms
```

### Cache Stats API

```bash
# Add this endpoint for debugging
GET /api/discover/cache-stats

Response:
{
  "totalUsers": 5,
  "users": [
    {
      "userId": "abc123",
      "totalMatches": 60,
      "cursor": 10,
      "remaining": 50,
      "age": 5,  // minutes
      "prefetchTriggered": false
    }
  ]
}
```

## ⚙️ Configuration

### Gemini Model Selection

In `lib/ai/gemini-matcher.ts`:

```typescript
// Fast & cheap (recommended)
model: 'gemini-1.5-flash'

// Better quality but slower/expensive
model: 'gemini-1.5-pro'
```

### Temperature Setting

```typescript
temperature: 0.3  // Lower = more consistent scoring
```

### Cache TTL

In `lib/ai/match-cache.ts`:

```typescript
private readonly CACHE_TTL = 30 * 60 * 1000 // 30 minutes
```

### Prefetch Threshold

```typescript
private readonly PREFETCH_THRESHOLD = 20 // Trigger when 20 left
private readonly BATCH_SIZE = 30         // Fetch 30 per batch
```

## 🚨 Error Handling

### Gemini API Failures

If Gemini fails, system falls back to:
- Random scoring (75-100 range)
- Original order preserved
- User experience not interrupted

```typescript
try {
  const sorted = await gemini.sortCandidates(...)
} catch (error) {
  // Fallback: return in original order
  return candidates.map((c, i) => ({
    userId: c.id,
    score: 75 + (25 - i),
    reasoning: 'Fallback scoring (AI error)'
  }))
}
```

## 🧪 Testing

### Test Gemini Integration

```bash
# Check if API key is set
echo $GEMINI_API_KEY

# Test API endpoint
curl http://localhost:3000/api/discover/smart-matches \
  -H "Cookie: your-session-cookie"
```

### Verify Cache Behavior

1. Load discover page (cache miss - slow)
2. Reload page (cache hit - fast)
3. Like/pass 10 times
4. Check logs for prefetch trigger
5. Continue liking (should be seamless)

## 📊 Monitoring

### Key Metrics to Track

- Cache hit rate
- Average Gemini response time
- Prefetch success rate
- User satisfaction (like rate)

### Logs to Monitor

```bash
# Cache performance
grep "Cache hit" logs | wc -l
grep "Cache miss" logs | wc -l

# Gemini performance
grep "Gemini AI sorting completed" logs | grep -oP '\d+ms'

# Prefetch triggers
grep "Triggering prefetch" logs | wc -l
```

## 🔐 Security

### API Key Protection

- ✅ Server-side only (not exposed to client)
- ✅ Environment variable
- ✅ Not committed to git

### Rate Limiting

Consider adding rate limits:
- Max 100 sorts per user per day
- Max 10 cache refreshes per hour

## 🎯 Next Steps

### Future Improvements

1. **Learn from feedback:**
   - Track which matches users like
   - Adjust scoring weights dynamically
   - Personalized scoring per user

2. **Collaborative filtering:**
   - "Users like you also liked..."
   - Improve recommendations over time

3. **A/B Testing:**
   - Compare AI vs random scoring
   - Track conversion rates

4. **Multi-modal matching:**
   - Add image analysis (profile pictures)
   - Study schedule compatibility
   - Location-based matching

## 📚 References

- [Google Gemini AI Documentation](https://ai.google.dev/)
- [Gemini API Pricing](https://ai.google.dev/pricing)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

## ❓ Troubleshooting

### "GEMINI_API_KEY is not set"

```bash
# Check if key exists
cat .env | grep GEMINI_API_KEY

# Add if missing
echo "GEMINI_API_KEY=your_key" >> .env
```

### "Gemini AI sorting failed"

1. Check API key validity
2. Check internet connection
3. Check Gemini API status
4. Review error logs

### Slow performance

1. Check if cache is working (logs)
2. Verify prefetch is triggering
3. Consider using faster model (flash vs pro)
4. Check database query performance

## 🎉 Success Criteria

System is working well if:

- ✅ First load < 5 seconds
- ✅ Cache hit rate > 80%
- ✅ Prefetch seamless (no lag)
- ✅ Match scores 70-95+ range
- ✅ Users like 30%+ of shown matches

---

**Implementation Status:** ✅ Complete
**Last Updated:** 2025-10-28
**Version:** 1.0.0
