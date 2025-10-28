import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'
import { apiCache } from '@/lib/cache/ApiCache'

/**
 * GET /api/conversations
 * Get all conversations for the current user
 * Returns list of conversations with last message, unread count, and other user info
 * 
 * Optimizations:
 * - Field selection to reduce payload size
 * - Parallel queries for better performance
 * - Response compression
 * - Cache headers (max-age=60, stale-while-revalidate=300)
 */
export async function GET(req: NextRequest) {
  try {
    // Verify user authentication with Supabase using cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll()
          },
          setAll() {
            // Not needed for GET request
          }
        }
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      )
    }

    // Check cache first (wrapped in try-catch to prevent cache errors from breaking the API)
    try {
      const cachedData = await apiCache.getCachedConversations(user.id)
      if (cachedData) {
        const response = NextResponse.json(cachedData)
        response.headers.set(
          'Cache-Control',
          'private, max-age=60, stale-while-revalidate=300'
        )
        response.headers.set('X-Cache', 'HIT')
        return response
      }
    } catch (cacheError) {
      console.warn('Cache read error (continuing without cache):', cacheError)
    }

    // Get all messages where user is sender or receiver
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id },
          { receiverId: user.id }
        ]
      },
      select: {
        id: true,
        senderId: true,
        receiverId: true,
        content: true,
        isRead: true,
        createdAt: true,
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            lastActive: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            lastActive: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 200 // Limit to recent messages for performance
    })

    // Group messages by conversation (other user)
    const conversationsMap = new Map()
    const otherUserIds: string[] = []

    for (const message of messages) {
      // Determine the other user (not current user)
      const otherUser = message.senderId === user.id ? message.receiver : message.sender
      
      if (!otherUser) continue

      const conversationId = otherUser.id

      // If this conversation doesn't exist yet, create it
      if (!conversationsMap.has(conversationId)) {
        otherUserIds.push(otherUser.id)
        
        // Calculate if user is online (active within last 5 minutes)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
        const isOnline = otherUser.lastActive ? otherUser.lastActive > fiveMinutesAgo : false

        conversationsMap.set(conversationId, {
          id: conversationId,
          otherUser: {
            id: otherUser.id,
            firstName: otherUser.firstName,
            lastName: otherUser.lastName,
            avatar: otherUser.avatar,
            isOnline,
            lastActive: otherUser.lastActive?.toISOString()
          },
          lastMessage: {
            id: message.id,
            content: message.content.substring(0, 100),
            createdAt: message.createdAt.toISOString(),
            senderId: message.senderId,
            isRead: message.isRead
          },
          unreadCount: 0, // Will be updated below
          lastActivity: message.createdAt.toISOString()
        })
      }
    }

    // Get unread counts for all conversations in parallel
    if (otherUserIds.length > 0) {
      const unreadCounts = await prisma.message.groupBy({
        by: ['senderId'],
        where: {
          receiverId: user.id,
          isRead: false,
          senderId: {
            in: otherUserIds
          }
        },
        _count: {
          id: true
        }
      })

      // Update unread counts in conversations
      for (const count of unreadCounts) {
        const conversation = conversationsMap.get(count.senderId)
        if (conversation) {
          conversation.unreadCount = count._count.id
        }
      }
    }

    // Convert map to array and sort by last activity
    const conversations = Array.from(conversationsMap.values()).sort((a, b) => {
      return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    })

    // Prepare response data
    const responseData = {
      conversations,
      count: conversations.length
    }

    // Cache the response for 60 seconds (wrapped in try-catch to prevent cache errors)
    try {
      await apiCache.cacheConversations(user.id, responseData)
    } catch (cacheError) {
      console.warn('Cache write error (continuing without cache):', cacheError)
    }

    // Create response with cache headers
    const response = NextResponse.json(responseData)

    // Add cache headers for better performance
    // Cache for 60 seconds, allow stale content for 5 minutes while revalidating
    response.headers.set(
      'Cache-Control',
      'private, max-age=60, stale-while-revalidate=300'
    )
    
    // Indicate cache miss
    response.headers.set('X-Cache', 'MISS')

    return response

  } catch (error) {
    console.error('Get conversations error:', error)
    
    // Log detailed error for debugging
    if (error instanceof Error) {
      console.error('Error details:', error.message)
      console.error('Stack trace:', error.stack)
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
