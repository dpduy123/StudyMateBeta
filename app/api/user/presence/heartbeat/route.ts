import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/user/presence/heartbeat
 * Update user's lastActive timestamp to indicate they are online
 * Called periodically by useMyPresence hook
 */
export async function POST(req: NextRequest) {
  try {
    // Get authorization token from header
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
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

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      )
    }

    // Update user's lastActive timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() }
    })

    return NextResponse.json({ 
      success: true,
      userId: user.id,
      lastActive: new Date().toISOString()
    })

  } catch (error) {
    console.error('Presence heartbeat error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
