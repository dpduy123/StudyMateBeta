import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'

// In-memory throttle cache to prevent excessive DB writes
const lastUpdateCache = new Map<string, number>()
const THROTTLE_INTERVAL = 60000 // Only update DB every 60 seconds per user

/**
 * POST /api/user/presence/heartbeat
 * Update user's lastActive timestamp (throttled for performance)
 */
export async function POST(req: NextRequest) {
  try {
    // Get authorization token from header
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    // Try to get token from cookie if not in header
    let finalToken = token
    if (!finalToken) {
      const cookieStore = req.cookies
      const supabaseAuthToken = cookieStore.get('sb-access-token')?.value
      finalToken = supabaseAuthToken
    }

    if (!finalToken) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      )
    }

    // Verify user authentication with Supabase
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() { return [] },
          setAll() { }
        }
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser(finalToken)

    if (authError || !user) {
      console.error('Heartbeat auth error:', authError?.message)
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      )
    }

    // Throttle: Only update DB if enough time has passed
    const now = Date.now()
    const lastUpdate = lastUpdateCache.get(user.id) || 0
    const shouldUpdate = now - lastUpdate >= THROTTLE_INTERVAL

    if (shouldUpdate) {
      // Update user's lastActive timestamp in database
      await prisma.user.update({
        where: { id: user.id },
        data: { lastActive: new Date() },
        select: { id: true } // Only select ID to minimize data transfer
      })
      
      lastUpdateCache.set(user.id, now)
      
      // Clean up old entries (prevent memory leak)
      if (lastUpdateCache.size > 10000) {
        const entries = Array.from(lastUpdateCache.entries())
        entries.sort((a, b) => a[1] - b[1])
        entries.slice(0, 5000).forEach(([key]) => lastUpdateCache.delete(key))
      }
    }

    return NextResponse.json({
      success: true,
      lastActive: new Date().toISOString(),
      throttled: !shouldUpdate
    })

  } catch (error) {
    console.error('Heartbeat endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
