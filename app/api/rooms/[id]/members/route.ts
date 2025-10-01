import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
          setAll() {},
        },
      }
    )

    // Get current user from Supabase
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: roomId } = await params

    // Check if room exists and user has access
    const room = await prisma.room.findUnique({
      where: { id: roomId }
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    // Check if user is a member of the room
    const userMembership = await prisma.roomMember.findFirst({
      where: {
        roomId: roomId,
        userId: user.id,
        leftAt: null,
        isBanned: false
      }
    })

    if (!userMembership && room.ownerId !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get all active members
    const members = await prisma.roomMember.findMany({
      where: {
        roomId: roomId,
        leftAt: null,
        isBanned: false
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            university: true,
            major: true
          }
        }
      },
      orderBy: {
        joinedAt: 'asc'
      }
    })

    // Format response
    const formattedMembers = members.map(member => ({
      id: member.id,
      userId: member.user.id,
      name: `${member.user.firstName} ${member.user.lastName}`,
      email: member.user.email,
      avatar: member.user.avatar,
      university: member.user.university,
      major: member.user.major,
      joinedAt: member.joinedAt,
      isMuted: member.isMuted,
      isOwner: member.user.id === room.ownerId
    }))

    return NextResponse.json({
      members: formattedMembers,
      totalMembers: members.length,
      maxMembers: room.maxMembers
    })

  } catch (error) {
    console.error('Error fetching room members:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
          setAll() {},
        },
      }
    )

    // Get current user from Supabase
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: roomId } = await params
    const body = await request.json()
    const { targetUserId, action } = body

    // Check if room exists and user is owner
    const room = await prisma.room.findUnique({
      where: { id: roomId }
    })

    if (!room || room.ownerId !== user.id) {
      return NextResponse.json(
        { error: 'Access denied. Only room owner can manage members.' },
        { status: 403 }
      )
    }

    // Find target member
    const targetMember = await prisma.roomMember.findFirst({
      where: {
        roomId: roomId,
        userId: targetUserId,
        leftAt: null
      }
    })

    if (!targetMember) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Perform action
    switch (action) {
      case 'mute':
        await prisma.roomMember.update({
          where: { id: targetMember.id },
          data: { isMuted: true }
        })
        break
      
      case 'unmute':
        await prisma.roomMember.update({
          where: { id: targetMember.id },
          data: { isMuted: false }
        })
        break
      
      case 'kick':
        await prisma.roomMember.update({
          where: { id: targetMember.id },
          data: { leftAt: new Date() }
        })
        break
      
      case 'ban':
        await prisma.roomMember.update({
          where: { id: targetMember.id },
          data: { 
            leftAt: new Date(),
            isBanned: true 
          }
        })
        break
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      message: `Successfully ${action}ed member`,
      action,
      targetUserId
    })

  } catch (error) {
    console.error('Error managing room member:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}