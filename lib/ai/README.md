# Gemini AI Matching System + Opik Observability

## Quick Start

### 1. Install Packages
```bash
npm install @google/generative-ai opik
```

### 2. Set API Keys
Add to `.env`:
```env
GEMINI_API_KEY=your_gemini_key
OPIK_API_KEY=your_opik_key
OPIK_WORKSPACE=your_workspace
OPIK_PROJECT_NAME=studymate-ai
```

- Gemini key: https://aistudio.google.com/apikey
- Opik key: https://www.comet.com/

### 3. Test
```bash
npm run test:opik              # Verify Opik connection
npm run test:opik:matching     # Test matching + feedback tracing
npm run dev                    # Visit http://localhost:3000/discover
```

## Architecture

```
lib/ai/
├── opik.ts                    # Opik client, traceAICall, traceSpan, scoring
├── gemini-matcher.ts          # Gemini AI sorting (traced with Opik)
├── gemini-b2c-query.ts        # Vietnamese search queries (traced with Opik)
├── match-cache.ts             # In-memory cache manager
├── match-feedback.ts          # Match outcome tracking via Opik
├── logger.ts                  # Structured logging + MatchingAnalytics
├── evaluation/
│   ├── datasets.ts            # Evaluation test datasets (7 test cases)
│   └── runner.ts              # Automated evaluation runner
└── README.md
```

## How It Works

### Matching Flow (with Opik Tracing)

```
User visits /discover
        │
        ▼
┌─────────────────────────────────┐
│  smart_matches_request (trace)  │ ← Opik top-level trace
│                                 │
│  ┌─────────────────────────┐    │
│  │ cache_lookup (span)     │    │ ← Cache hit/miss scored
│  └────────────┬────────────┘    │
│               │ miss            │
│  ┌────────────▼────────────┐    │
│  │ database_fetch (span)   │    │ ← DB query latency tracked
│  └────────────┬────────────┘    │
│               │                 │
│  ┌────────────▼────────────┐    │
│  │ gemini_ai_sort (span)   │    │ ← LLM call with scores:
│  │   type: "llm"           │    │   - latency score
│  │   model: gemini-2.0     │    │   - completeness score
│  └────────────┬────────────┘    │
│               │                 │
│  Scores:                        │
│  - overall_latency              │
│  - match_quality                │
└─────────────────────────────────┘
```

### What Gets Traced

| Operation | Trace/Span | Scores |
|-----------|-----------|--------|
| Full request | `smart_matches_request` trace | `overall_latency`, `match_quality` |
| Cache lookup | `cache_lookup` span | `cache_hit` (0 or 1) |
| DB query | `database_fetch_candidates` span | latency metadata |
| Gemini sort | `gemini_ai_sort` span (type: llm) | `latency`, `completeness` |
| B2C search | `gemini_b2c_query` trace | latency, status |
| Match feedback | `feedback_match_outcome` trace | match_outcome score |
| Quality rating | `feedback_match_quality` trace | normalized 0-1 |
| Engagement | `conversation_engagement` trace | engagement score |

## Opik Integration Details

### Client Setup (`opik.ts`)

```typescript
import { traceAICall, traceSpan, logFeedback, scoreTrace, flushTraces } from './opik'

// Wrap any AI call with automatic tracing
const result = await traceAICall(
  'operation_name',
  { input: 'data' },
  async () => { /* AI logic */ },
  { model: 'gemini-2.0-flash-exp', feature: 'matching' }
)

// Flush before process exit
await flushTraces()
```

### Match Feedback (`match-feedback.ts`)

```typescript
import { recordMatchOutcome, recordMatchQualityRating } from './match-feedback'

// Track user decisions
await recordMatchOutcome(matchId, userId, targetId, 'accepted', {
  matchScore: 92,
  timeToDecision: 3500,
})

// Track match quality
await recordMatchQualityRating(matchId, userId, 4, 'Great partner!')
```

## Evaluation Framework

### Datasets (`evaluation/datasets.ts`)

**Matching tests (4 cases):**
- Same CS Major Students → expect score >80
- Different Major Students → expect score <60
- Complementary Skills → expect score >70
- Schedule Conflict → expect 65-85

**B2C Query tests (3 cases):**
- Simple major search
- Complex multi-criteria query
- Vietnamese time expression mapping

### Running Evaluations

```bash
# Via API (admin only)
POST /api/admin/ai-evaluation
{ "suite": "matching" }  # or "full"

# View results in Opik dashboard
# Each test creates traces with eval_accuracy and eval_latency scores
```

## Admin APIs

### AI Metrics Dashboard
```
GET  /api/admin/ai-metrics      # Get all metrics + Opik status
POST /api/admin/ai-metrics      # Actions: reset_analytics, flush_traces
```

### AI Evaluation
```
GET  /api/admin/ai-evaluation   # List available test datasets
POST /api/admin/ai-evaluation   # Run evaluation suite
```

## Cache Management

- **TTL:** 30 minutes
- **Prefetch threshold:** 5 remaining matches
- **Auto-cleanup:** Every 10 minutes
- **Batch size:** 30 candidates per Gemini call

## Cost

- **Model:** Gemini 2.0 Flash Experimental
- **Cost:** ~$0.00025 per sort (30 profiles)
- **Monthly:** ~$7.50 for 30,000 sorts
- **Opik:** Free tier for open-source

## Fallback

If Gemini fails → candidates returned in original order with scores 75-100 (no crash).
If Opik fails → tracing silently skipped, core functionality unaffected.
