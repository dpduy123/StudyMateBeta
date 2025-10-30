import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { matchCache } from '@/lib/ai/match-cache'
import { MatchingAnalytics } from '@/lib/ai/logger'

/**
 * GET /api/discover/stats
 *
 * Returns current matching system statistics and cache status
 * Useful for monitoring and debugging
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin/authenticated user (optional)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {},
        },
      }
    )

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get cache stats
    const cacheStats = matchCache.getStats()

    // Get analytics (if tracking)
    const analytics = MatchingAnalytics.getStats()

    // Get user-specific cache info
    const userCache = matchCache.get(user.id)
    const userStats = userCache
      ? {
          hasCache: true,
          remaining: matchCache.getRemainingCount(user.id),
          total: userCache.length,
          needsPrefetch: matchCache.shouldPrefetch(user.id),
        }
      : {
          hasCache: false,
          remaining: 0,
          total: 0,
          needsPrefetch: false,
        }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,

      // Current user cache status
      currentUser: {
        userId: user.id,
        ...userStats,
      },

      // System-wide cache stats
      cache: cacheStats,

      // Performance analytics
      analytics,

      // Health check
      health: {
        geminiApiKey: !!process.env.GEMINI_API_KEY,
        cacheActive: cacheStats.totalUsers > 0,
        status: 'operational',
      },
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
