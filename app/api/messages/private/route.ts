import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'
import { triggerPusherEvent, getChatChannelName } from '@/lib/pusher/server'
import { apiCache } from '@/lib/cache/ApiCache'

export async function GET(request: NextRequest) {
  try {
    console.log('📨 Messages API called')
    
    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get('chatId') // Other user's ID
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20') // Reduced from 50 to 20
    const cursor = searchParams.get('cursor') // For cursor-based pagination

    console.log('📨 Params:', { chatId, page, limit, cursor })

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
      console.error('📨 Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('📨 User authenticated:', user.id)

    // Check cache first (only for first page without cursor)
    if (!cursor && page === 1) {
      try {
        const cachedData = await apiCache.getCachedMessages(user.id, chatId, page)
        if (cachedData) {
          console.log('📨 Cache HIT')
          const response = NextResponse.json(cachedData)
          response.headers.set(
            'Cache-Control',
            'private, max-age=30, stale-while-revalidate=120'
          )
          response.headers.set('X-Cache', 'HIT')
          return response
        }
      } catch (cacheError) {
        console.warn('Cache read error (continuing without cache):', cacheError)
      }
    }

    // Build query with cursor-based pagination for better performance
    const whereClause: any = {
      OR: [
        { senderId: user.id, receiverId: chatId },
        { senderId: chatId, receiverId: user.id }
      ]
    }

    // Add cursor condition for pagination
    if (cursor) {
      whereClause.createdAt = {
        lt: new Date(cursor)
      }
    }

    // Get messages with optimized field selection
    const messages = await prisma.message.findMany({
      where: whereClause,
      select: {
        id: true,
        senderId: true,
        receiverId: true,
        type: true,
        content: true,
        fileUrl: true,
        fileName: true,
        fileSize: true,
        isRead: true,
        createdAt: true,
        updatedAt: true,
        readAt: true,
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        reactions: {
          select: {
            id: true,
            emoji: true,
            userId: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1 // Fetch one extra to determine if there are more
    })

    // Check if there are more messages
    const hasMore = messages.length > limit
    const messagesToReturn = hasMore ? messages.slice(0, limit) : messages

    // Reverse to show oldest first
    const sortedMessages = messagesToReturn.reverse()

    // Format reactions for each message
    const messagesWithFormattedReactions = sortedMessages.map(msg => {
      const groupedReactions = msg.reactions.reduce((acc, reaction) => {
        if (!acc[reaction.emoji]) {
          acc[reaction.emoji] = {
            emoji: reaction.emoji,
            users: [],
            count: 0
          }
        }
        acc[reaction.emoji].users.push({
          id: reaction.user.id,
          firstName: reaction.user.firstName,
          lastName: reaction.user.lastName
        })
        acc[reaction.emoji].count++
        return acc
      }, {} as Record<string, any>)

      return {
        ...msg,
        reactions: Object.values(groupedReactions)
      }
    })

    // Get the cursor for next page (oldest message's createdAt)
    const nextCursor = hasMore && messagesToReturn.length > 0
      ? messagesToReturn[messagesToReturn.length - 1].createdAt.toISOString()
      : null

    // Mark messages as read if they were sent to the current user
    const unreadMessageIds = messagesToReturn
      .filter(msg => msg.receiverId === user.id && !msg.isRead)
      .map(msg => msg.id)

    // Execute read updates and Pusher events in parallel
    const readUpdatePromises = []

    if (unreadMessageIds.length > 0) {
      // Update read status
      readUpdatePromises.push(
        prisma.message.updateMany({
          where: { id: { in: unreadMessageIds } },
          data: { isRead: true, readAt: new Date() }
        })
      )

      // Trigger Pusher events for read receipts (batch them)
      const channelName = getChatChannelName(user.id, chatId)
      const readAt = new Date().toISOString()
      
      readUpdatePromises.push(
        triggerPusherEvent(channelName, 'messages-read', {
          messageIds: unreadMessageIds,
          readBy: user.id,
          readAt
        })
      )
    }

    // Wait for all read updates to complete
    await Promise.all(readUpdatePromises)

    console.log('📨 Returning', sortedMessages.length, 'messages')

    // Prepare response data
    const responseData = {
      messages: messagesWithFormattedReactions,
      hasMore,
      nextCursor,
      page,
      limit
    }

    // Cache the response (only for first page)
    if (!cursor && page === 1) {
      try {
        await apiCache.cacheMessages(user.id, chatId, page, responseData)
        console.log('📨 Cached response')
      } catch (cacheError) {
        console.warn('Cache write error (continuing without cache):', cacheError)
      }
    }

    // Create response with cache headers
    const response = NextResponse.json(responseData)

    // Add cache headers for better performance
    // Cache for 30 seconds, allow stale content for 2 minutes while revalidating
    response.headers.set(
      'Cache-Control',
      'private, max-age=30, stale-while-revalidate=120'
    )
    
    // Indicate cache miss
    response.headers.set('X-Cache', 'MISS')

    console.log('📨 Response created successfully')

    return response

  } catch (error) {
    console.error('❌ Error fetching private messages:', error)
    if (error instanceof Error) {
      console.error('❌ Error details:', error.message)
      console.error('❌ Stack:', error.stack)
    }
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { receiverId, content, type = 'TEXT', fileUrl, fileName, fileSize, replyToId, isReceiverViewing = false } = body

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
        fileSize,
        replyToId
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        replyTo: replyToId ? {
          select: {
            id: true,
            content: true,
            senderId: true,
            createdAt: true,
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        } : undefined,
        reactions: {
          select: {
            id: true,
            emoji: true,
            userId: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
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

    // Trigger conversation-updated event for SENDER
    // Update sender's conversation list
    const senderConversationData = {
      otherUserId: receiverId,
      otherUser: {
        id: receiver.id,
        firstName: receiver.firstName,
        lastName: receiver.lastName,
        avatar: receiver.avatar,
        lastActive: receiver.lastActive?.toISOString()
      },
      lastMessage: {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
        senderId: message.senderId
      },
      unreadCount: 0, // Sender has no unread messages from this conversation
      lastActivity: message.createdAt.toISOString()
    }
    
    await triggerPusherEvent(
      `private-user-${user.id}-conversations`,
      'conversation-updated',
      senderConversationData
    )

    // Trigger conversation-updated event for RECEIVER
    // Count unread messages for receiver
    const unreadCount = await prisma.message.count({
      where: {
        senderId: user.id,
        receiverId: receiverId,
        isRead: false
      }
    })

    // Get sender info for receiver's conversation list
    const sender = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        lastActive: true
      }
    })

    const receiverConversationData = {
      otherUserId: user.id,
      otherUser: {
        id: sender!.id,
        firstName: sender!.firstName,
        lastName: sender!.lastName,
        avatar: sender!.avatar,
        lastActive: sender!.lastActive?.toISOString()
      },
      lastMessage: {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
        senderId: message.senderId
      },
      unreadCount,
      lastActivity: message.createdAt.toISOString()
    }
    
    await triggerPusherEvent(
      `private-user-${receiverId}-conversations`,
      'conversation-updated',
      receiverConversationData
    )

    // Invalidate cache for both users
    try {
      await Promise.all([
        apiCache.invalidateConversations(user.id),
        apiCache.invalidateConversations(receiverId),
        apiCache.invalidateMessages(user.id, receiverId),
        apiCache.invalidateMessages(receiverId, user.id)
      ])
    } catch (cacheError) {
      console.warn('Cache invalidation error (continuing):', cacheError)
    }

    return NextResponse.json({ message }, { status: 201 })

  } catch (error) {
    console.error('Error sending private message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}