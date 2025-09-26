import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'

export async function POST(
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

    // Check if room exists
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        _count: {
          select: {
            members: {
              where: {
                leftAt: null,
                isBanned: false
              }
            }
          }
        }
      }
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    // Check if room is full
    if (room._count.members >= room.maxMembers) {
      return NextResponse.json(
        { error: 'Room is full' },
        { status: 400 }
      )
    }

    // Check if user is already a member
    const existingMembership = await prisma.roomMember.findFirst({
      where: {
        roomId: roomId,
        userId: user.id,
        leftAt: null
      }
    })

    if (existingMembership) {
      return NextResponse.json(
        { error: 'Already a member of this room' },
        { status: 400 }
      )
    }

    // Check if user was previously banned
    const bannedMembership = await prisma.roomMember.findFirst({
      where: {
        roomId: roomId,
        userId: user.id,
        isBanned: true
      }
    })

    if (bannedMembership) {
      return NextResponse.json(
        { error: 'You are banned from this room' },
        { status: 403 }
      )
    }

    // Parse request body for password if private room
    let password = null
    if (room.isPrivate) {
      const body = await request.json()
      password = body.password
      
      if (!password || password !== room.password) {
        return NextResponse.json(
          { error: 'Invalid password' },
          { status: 401 }
        )
      }
    }

    // Create or reactivate membership
    const previousMembership = await prisma.roomMember.findFirst({
      where: {
        roomId: roomId,
        userId: user.id,
      }
    })

    if (previousMembership) {
      // Reactivate previous membership
      await prisma.roomMember.update({
        where: { id: previousMembership.id },
        data: {
          leftAt: null,
          joinedAt: new Date(),
          isMuted: false,
          isBanned: false
        }
      })
    } else {
      // Create new membership
      await prisma.roomMember.create({
        data: {
          roomId: roomId,
          userId: user.id,
        }
      })
    }

    // Update room last activity
    await prisma.room.update({
      where: { id: roomId },
      data: { lastActivity: new Date() }
    })

    return NextResponse.json({
      message: 'Successfully joined room',
      roomId: roomId
    })

  } catch (error) {
    console.error('Error joining room:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Find membership
    const membership = await prisma.roomMember.findFirst({
      where: {
        roomId: roomId,
        userId: user.id,
        leftAt: null
      }
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Not a member of this room' },
        { status: 400 }
      )
    }

    // Leave room by setting leftAt timestamp
    await prisma.roomMember.update({
      where: { id: membership.id },
      data: { leftAt: new Date() }
    })

    return NextResponse.json({
      message: 'Successfully left room',
      roomId: roomId
    })

  } catch (error) {
    console.error('Error leaving room:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}