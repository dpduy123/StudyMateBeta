import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 })
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

    // Verify user has access to this room
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        members: {
          where: {
            userId: user.id,
            leftAt: null,
            isBanned: false
          }
        }
      }
    })

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    // Check if user is member or owner
    const isMember = room.members.length > 0
    const isOwner = room.ownerId === user.id

    if (!isMember && !isOwner && room.isPrivate) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get room messages
    const messages = await prisma.roomMessage.findMany({
      where: { roomId },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        replyTo: {
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
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit
    })

    // Reverse to show oldest first
    const sortedMessages = messages.reverse()

    return NextResponse.json({
      messages: sortedMessages,
      hasMore: messages.length === limit,
      page,
      limit
    })

  } catch (error) {
    console.error('Error fetching room messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomId, content, type = 'TEXT', fileUrl, fileName, fileSize, replyToId } = body

    if (!roomId || !content) {
      return NextResponse.json({ error: 'Room ID and content are required' }, { status: 400 })
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

    // Verify user has access to this room
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        members: {
          where: {
            userId: user.id,
            leftAt: null,
            isBanned: false
          }
        }
      }
    })

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    // Check if user is member or owner
    const isMember = room.members.length > 0
    const isOwner = room.ownerId === user.id

    if (!isMember && !isOwner) {
      return NextResponse.json({ error: 'Must be a member to send messages' }, { status: 403 })
    }

    // Check if room allows text messages
    if (!room.allowText) {
      return NextResponse.json({ error: 'Text messages are disabled in this room' }, { status: 403 })
    }

    // Create the message
    const message = await prisma.roomMessage.create({
      data: {
        roomId,
        senderId: user.id,
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
        replyTo: {
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
        }
      }
    })

    // Update room last activity
    await prisma.room.update({
      where: { id: roomId },
      data: { lastActivity: new Date() }
    })

    return NextResponse.json({ message }, { status: 201 })

  } catch (error) {
    console.error('Error sending room message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}