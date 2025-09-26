import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'

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

    // Check if room exists and user is the owner
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: { ownerId: true }
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    if (room.ownerId !== user.id) {
      return NextResponse.json(
        { error: 'Only room owner can delete this room' },
        { status: 403 }
      )
    }

    // Delete the room (this will cascade delete all related records due to onDelete: Cascade)
    await prisma.room.delete({
      where: { id: roomId }
    })

    return NextResponse.json({
      message: 'Room deleted successfully',
      roomId: roomId
    })

  } catch (error) {
    console.error('Error deleting room:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
