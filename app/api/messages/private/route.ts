import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'
import { triggerPusherEvent, getChatChannelName } from '@/lib/pusher/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get('chatId') // Other user's ID
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 })
    }

    // Create Supabase client to get the current user
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {
            // Not needed for GET request
          },
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

    // Get messages between the two users
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: chatId },
          { senderId: chatId, receiverId: user.id }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit
    })

    // Reverse to show oldest first
    const sortedMessages = messages.reverse()

    // Mark messages as read if they were sent to the current user
    const unreadMessageIds = messages
      .filter(msg => msg.receiverId === user.id && !msg.isRead)
      .map(msg => msg.id)

    if (unreadMessageIds.length > 0) {
      await prisma.message.updateMany({
        where: { id: { in: unreadMessageIds } },
        data: { isRead: true, readAt: new Date() }
      })

      // Trigger Pusher events for read receipts
      const channelName = getChatChannelName(user.id, chatId)
      for (const messageId of unreadMessageIds) {
        await triggerPusherEvent(channelName, 'message-read', {
          messageId,
          readBy: user.id,
          readAt: new Date().toISOString()
        })
      }
    }

    return NextResponse.json({
      messages: sortedMessages,
      hasMore: messages.length === limit,
      page,
      limit
    })

  } catch (error) {
    console.error('Error fetching private messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { receiverId, content, type = 'TEXT', fileUrl, fileName, fileSize, isReceiverViewing = false } = body

    if (!receiverId || !content) {
      return NextResponse.json({ error: 'Receiver ID and content are required' }, { status: 400 })
    }

    // Create Supabase client to get the current user
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {
            // Not needed for POST request
          },
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

    // Verify receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    })

    if (!receiver) {
      return NextResponse.json({ error: 'Receiver not found' }, { status: 404 })
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        senderId: user.id,
        receiverId,
        content,
        type,
        fileUrl,
        fileName,
        fileSize
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    })

    // Trigger Pusher event for real-time delivery
    const channelName = getChatChannelName(user.id, receiverId)
    await triggerPusherEvent(channelName, 'new-message', message)

    // Only trigger notification event if receiver is not viewing the chat
    if (!isReceiverViewing) {
      await triggerPusherEvent(
        `private-notifications-${receiverId}`,
        'message-notification',
        {
          senderId: user.id,
          senderName: `${message.sender.firstName} ${message.sender.lastName}`,
          senderAvatar: message.sender.avatar,
          content: content.substring(0, 100), // Preview
          messageId: message.id,
          chatId: user.id,
          timestamp: message.createdAt
        }
      )
    }

    return NextResponse.json({ message }, { status: 201 })

  } catch (error) {
    console.error('Error sending private message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}