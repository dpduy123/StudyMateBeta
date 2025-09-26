import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
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

    // Get all accepted matches for the user
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { senderId: user.id, status: 'ACCEPTED' },
          { receiverId: user.id, status: 'ACCEPTED' }
        ]
      },
      include: {
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
      }
    })

    // Get conversations with last message and unread count
    const conversations = await Promise.all(
      matches.map(async (match) => {
        const otherUser = match.senderId === user.id ? match.receiver : match.sender

        // Get last message between users
        const lastMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: user.id, receiverId: otherUser.id },
              { senderId: otherUser.id, receiverId: user.id }
            ]
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true
          }
        })

        // Get unread count (messages sent to current user that are unread)
        const unreadCount = await prisma.message.count({
          where: {
            senderId: otherUser.id,
            receiverId: user.id,
            isRead: false
          }
        })

        return {
          id: match.id,
          otherUser,
          lastMessage,
          unreadCount,
          lastActivity: lastMessage?.createdAt || match.createdAt
        }
      })
    )

    // Sort by last activity (most recent first)
    conversations.sort((a, b) => 
      new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    )

    return NextResponse.json({ conversations })

  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}