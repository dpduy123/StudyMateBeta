import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { triggerPusherEvent, getChatChannelName } from '@/lib/pusher/server'

/**
 * POST /api/messages/typing
 * Trigger typing events (typing-start or typing-stop) on a private chat channel
 */
export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {}
        }
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await req.json()
    const { receiverId, event } = body

    if (!receiverId || !event) {
      return NextResponse.json(
        { error: 'Missing receiverId or event' },
        { status: 400 }
      )
    }

    if (event !== 'typing-start' && event !== 'typing-stop') {
      return NextResponse.json(
        { error: 'Invalid event type. Must be typing-start or typing-stop' },
        { status: 400 }
      )
    }

    // Get channel name for this chat
    const channelName = getChatChannelName(user.id, receiverId)

    // Get user info from database
    const { data: userData } = await supabase
      .from('users')
      .select('id, first_name, last_name')
      .eq('id', user.id)
      .single()

    // Trigger Pusher event
    await triggerPusherEvent(channelName, event, {
      userId: user.id,
      userName: userData ? `${userData.first_name} ${userData.last_name}` : 'User',
      chatId: receiverId
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error triggering typing event:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
