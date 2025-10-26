import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/conversations
 * Get all conversations for the current user
 * Returns list of conversations with last message, unread count, and other user info
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

    // Get all messages where user is sender or receiver
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id },
          { receiverId: user.id }
        ]
      },
      include: {
        sender: true,
        receiver: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Group messages by conversation (other user)
    const conversationsMap = new Map()

    for (const message of messages) {
      // Determine the other user (not current user)
      const otherUser = message.senderId === user.id ? message.receiver : message.sender
      
      if (!otherUser) continue

      const conversationId = otherUser.id

      // If this conversation doesn't exist yet, create it
      if (!conversationsMap.has(conversationId)) {
        // Count unread messages from this user
        const unreadCount = await prisma.message.count({
          where: {
            senderId: otherUser.id,
            receiverId: user.id,
            isRead: false
          }
        })

        conversationsMap.set(conversationId, {
          id: conversationId,
          otherUser: {
            id: otherUser.id,
            firstName: otherUser.firstName,
            lastName: otherUser.lastName,
            avatar: otherUser.avatar,
            lastActive: otherUser.lastActive?.toISOString()
          },
          lastMessage: {
            id: message.id,
            content: message.content,
            createdAt: message.createdAt.toISOString(),
            senderId: message.senderId
          },
          unreadCount,
          lastActivity: message.createdAt.toISOString()
        })
      }
    }

    // Convert map to array and sort by last activity
    const conversations = Array.from(conversationsMap.values()).sort((a, b) => {
      return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    })

    return NextResponse.json({
      conversations,
      count: conversations.length
    })

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
