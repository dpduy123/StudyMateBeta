import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'
import { triggerPusherEvent } from '@/lib/pusher/server'

/**
 * POST /api/user/presence
 * Update user's online status and lastActive timestamp
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { status } = body

    if (!status || !['online', 'offline'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "online" or "offline"' },
        { status: 400 }
      )
    }

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
      console.error('User presence auth error:', authError?.message)
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      )
    }

    // Update user's lastActive timestamp in database
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        lastActive: new Date()
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        lastActive: true
      }
    })

    console.log(`👤 User ${user.id} status updated: ${status}`)

    // Trigger Pusher event to notify other users
    // This can be used by other components to show online/offline status
    await triggerPusherEvent(
      `presence-user-${user.id}`,
      'user-status-change',
      {
        userId: user.id,
        status,
        lastActive: updatedUser.lastActive.toISOString(),
        user: {
          id: updatedUser.id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          avatar: updatedUser.avatar
        }
      }
    )

    return NextResponse.json({
      success: true,
      status,
      lastActive: updatedUser.lastActive
    })

  } catch (error) {
    console.error('User presence endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
