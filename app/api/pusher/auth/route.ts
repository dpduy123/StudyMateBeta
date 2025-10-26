import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { authenticateChannel, authenticatePresenceChannel } from '@/lib/pusher/server'

/**
 * POST /api/pusher/auth
 * Authenticate users for Pusher private and presence channels
 */
export async function POST(req: NextRequest) {
  try {
    // Get Pusher authentication parameters from request body
    const body = await req.json()
    const { socket_id, channel_name } = body

    if (!socket_id || !channel_name) {
      return NextResponse.json(
        { error: 'Missing socket_id or channel_name' },
        { status: 400 }
      )
    }

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
      console.error('Pusher auth error:', authError?.message)
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      )
    }

    console.log(`🔐 Pusher auth request: user=${user.id}, channel=${channel_name}`)

    // Handle presence channels
    if (channel_name.startsWith('presence-')) {
      try {
        // Get user info for presence channel
        const userInfo = {
          name: `${user.user_metadata?.firstName || 'User'} ${user.user_metadata?.lastName || ''}`.trim(),
          avatar: user.user_metadata?.avatar
        }

        const auth = authenticatePresenceChannel(
          socket_id,
          channel_name,
          user.id,
          userInfo
        )

        console.log(`✅ Presence channel authenticated: ${channel_name}`)
        return NextResponse.json(auth)
      } catch (error) {
        console.error('Presence channel auth error:', error)
        return NextResponse.json(
          { error: 'Forbidden: Not authorized for this presence channel' },
          { status: 403 }
        )
      }
    }

    // Handle private channels
    if (channel_name.startsWith('private-')) {
      try {
        const auth = authenticateChannel(socket_id, channel_name, user.id)
        console.log(`✅ Private channel authenticated: ${channel_name}`)
        return NextResponse.json(auth)
      } catch (error) {
        console.error('Private channel auth error:', error)
        return NextResponse.json(
          { error: 'Forbidden: Not authorized for this private channel' },
          { status: 403 }
        )
      }
    }

    // Public channels don't need authentication
    return NextResponse.json(
      { error: 'Bad Request: Channel type not supported' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Pusher auth endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
