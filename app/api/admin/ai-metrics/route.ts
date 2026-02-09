import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { MatchingAnalytics } from '@/lib/ai/logger'
import { matchCache } from '@/lib/ai/match-cache'
import { getOpikClient, flushTraces } from '@/lib/ai/opik'

const ADMIN_EMAILS = [
  'loanb2111414@student.ctu.edu.vn',
  'dpduy@gmail.com',
]

async function isAdmin(request: NextRequest): Promise<boolean> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll() {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  return !!user && ADMIN_EMAILS.includes(user.email || '')
}

/**
 * GET /api/admin/ai-metrics
 * Get AI observability metrics from Opik and local analytics
 */
export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const opik = getOpikClient()

  // Local in-memory analytics
  const analyticsStats = MatchingAnalytics.getStats()
  const cacheStats = matchCache.getStats()

  // Opik connection status
  const opikStatus = {
    connected: !!opik,
    apiKey: process.env.OPIK_API_KEY ? 'configured' : 'missing',
    workspace: process.env.OPIK_WORKSPACE || 'not set',
    projectName: process.env.OPIK_PROJECT_NAME || 'studymate-ai',
    dashboardUrl: process.env.OPIK_WORKSPACE
      ? `https://www.comet.com/opik/${process.env.OPIK_WORKSPACE}`
      : null,
  }

  return NextResponse.json({
    opik: opikStatus,
    analytics: {
      ...analyticsStats,
      description: {
        totalRequests: 'Total API requests to smart-matches',
        cacheHits: 'Requests served from cache (no Gemini call)',
        cacheMisses: 'Requests requiring Gemini AI sorting',
        geminiCalls: 'Total Gemini API calls made',
        geminiErrors: 'Failed Gemini API calls',
        prefetches: 'Background prefetch operations triggered',
        avgGeminiTime: 'Average Gemini response time (ms)',
        cacheHitRate: 'Percentage of requests served from cache',
        geminiSuccessRate: 'Percentage of successful Gemini calls',
      },
    },
    cache: cacheStats,
    tracing: {
      features: [
        { name: 'Smart Matching', traced: true, spans: ['cache_lookup', 'database_fetch_candidates', 'gemini_ai_sort'] },
        { name: 'B2C Query', traced: true, spans: ['gemini_b2c_query'] },
        { name: 'Match Feedback', traced: true, spans: ['match_outcome', 'match_quality', 'conversation_engagement'] },
      ],
      metrics: [
        { name: 'overall_latency', description: 'End-to-end request latency score (0-1)' },
        { name: 'match_quality', description: 'Top match score normalized (0-1)' },
        { name: 'cache_hit', description: 'Whether request was served from cache' },
        { name: 'latency', description: 'Gemini AI response latency score' },
        { name: 'completeness', description: 'Fraction of candidates successfully scored' },
      ],
    },
    evaluation: {
      available: true,
      endpoint: '/api/admin/ai-evaluation',
      datasets: {
        matching: '4 test cases (same-major, different-major, complementary, schedule-conflict)',
        b2c: '3 test cases (simple-major, complex-query, time-mapping)',
      },
    },
    timestamp: new Date().toISOString(),
  })
}

/**
 * POST /api/admin/ai-metrics
 * Actions: reset analytics, flush traces
 */
export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const action = body.action

  switch (action) {
    case 'reset_analytics':
      MatchingAnalytics.reset()
      return NextResponse.json({ success: true, message: 'Analytics reset' })

    case 'flush_traces':
      await flushTraces()
      return NextResponse.json({ success: true, message: 'Traces flushed to Opik' })

    default:
      return NextResponse.json(
        { error: 'Invalid action. Use: reset_analytics, flush_traces' },
        { status: 400 }
      )
  }
}
