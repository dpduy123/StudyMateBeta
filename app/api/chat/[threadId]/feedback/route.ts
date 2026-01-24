// Chat Feedback API
// POST /api/chat/[threadId]/feedback - Submit feedback for a message

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await params

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

    const body = await request.json()
    const { messageId, feedback, feedbackText } = body

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 })
    }

    if (typeof feedback !== 'number' || feedback < 1 || feedback > 5) {
      return NextResponse.json({ error: 'Feedback must be 1-5' }, { status: 400 })
    }

    // Verify thread ownership
    const thread = await prisma.chatThread.findFirst({
      where: {
        id: threadId,
        userId: user.id
      }
    })

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
    }

    // Update message feedback
    const message = await prisma.chatMessage.updateMany({
      where: {
        id: messageId,
        threadId: threadId
      },
      data: {
        feedback,
        feedbackText: feedbackText || null
      }
    })

    if (message.count === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Feedback error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
