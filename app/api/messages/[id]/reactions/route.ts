import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'
import { triggerPusherEvent, getChatChannelName } from '@/lib/pusher/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

// POST - Add a reaction to a message
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: messageId } = await context.params
    const body = await request.json()
    const { emoji } = body

    if (!emoji) {
      return NextResponse.json({ error: 'Emoji is required' }, { status: 400 })
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

    // Verify message exists
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: {
        id: true,
        senderId: true,
        receiverId: true
      }
    })

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Check if user is part of the conversation
    if (message.senderId !== user.id && message.receiverId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check if reaction already exists
    const existingReaction = await prisma.messageReaction.findUnique({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId: user.id,
          emoji
        }
      }
    })

    if (existingReaction) {
      // If reaction exists, remove it (toggle behavior)
      await prisma.messageReaction.delete({
        where: { id: existingReaction.id }
      })

      // Get updated reactions for the message
      const reactions = await prisma.messageReaction.findMany({
        where: { messageId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          }
        }
      })

      // Group reactions by emoji
      const groupedReactions = reactions.reduce((acc, reaction) => {
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

      const formattedReactions = Object.values(groupedReactions)

      // Trigger Pusher event for real-time update
      const channelName = getChatChannelName(message.senderId, message.receiverId)
      await triggerPusherEvent(channelName, 'reaction-removed', {
        messageId,
        userId: user.id,
        emoji,
        reactions: formattedReactions
      })

      return NextResponse.json({
        success: true,
        action: 'removed',
        reactions: formattedReactions
      })
    }

    // Create new reaction
    const reaction = await prisma.messageReaction.create({
      data: {
        messageId,
        userId: user.id,
        emoji
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    })

    // Get all reactions for the message
    const reactions = await prisma.messageReaction.findMany({
      where: { messageId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    })

    // Group reactions by emoji
    const groupedReactions = reactions.reduce((acc, reaction) => {
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

    const formattedReactions = Object.values(groupedReactions)

    // Trigger Pusher event for real-time update
    const channelName = getChatChannelName(message.senderId, message.receiverId)
    await triggerPusherEvent(channelName, 'reaction-added', {
      messageId,
      userId: user.id,
      emoji,
      userName: `${reaction.user.firstName} ${reaction.user.lastName}`,
      reactions: formattedReactions
    })

    return NextResponse.json({
      success: true,
      action: 'added',
      reaction,
      reactions: formattedReactions
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Error adding reaction:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE - Remove a reaction from a message
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: messageId } = await context.params
    const { searchParams } = new URL(request.url)
    const emoji = searchParams.get('emoji')

    if (!emoji) {
      return NextResponse.json({ error: 'Emoji is required' }, { status: 400 })
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
            // Not needed for DELETE request
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

    // Find and delete the reaction
    const reaction = await prisma.messageReaction.findUnique({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId: user.id,
          emoji
        }
      }
    })

    if (!reaction) {
      return NextResponse.json({ error: 'Reaction not found' }, { status: 404 })
    }

    await prisma.messageReaction.delete({
      where: { id: reaction.id }
    })

    // Get message details for Pusher event
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: {
        senderId: true,
        receiverId: true
      }
    })

    if (message) {
      // Get updated reactions
      const reactions = await prisma.messageReaction.findMany({
        where: { messageId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      })

      // Group reactions by emoji
      const groupedReactions = reactions.reduce((acc, reaction) => {
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

      const formattedReactions = Object.values(groupedReactions)

      // Trigger Pusher event
      const channelName = getChatChannelName(message.senderId, message.receiverId)
      await triggerPusherEvent(channelName, 'reaction-removed', {
        messageId,
        userId: user.id,
        emoji,
        reactions: formattedReactions
      })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('❌ Error removing reaction:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
