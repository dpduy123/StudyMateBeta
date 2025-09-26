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

    // Fetch room with all necessary data
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          }
        },
        members: {
          where: {
            leftAt: null,
            isBanned: false
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              }
            }
          }
        },
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

    // Check if user has access to this room
    const isMember = room.members.some(member => member.userId === user.id)
    const isOwner = room.ownerId === user.id
    const isPublic = !room.isPrivate

    if (!isMember && !isOwner && !isPublic) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Generate tags based on topic and type
    const tags = []
    if (room.topic) {
      const topicTags = room.topic.split(/[,\s]+/).filter(tag => tag.length > 2)
      tags.push(...topicTags.slice(0, 3))
    }
    
    const typeTagMap = {
      'STUDY_GROUP': 'Study Group',
      'HELP_SESSION': 'Help Session', 
      'DISCUSSION': 'Discussion',
      'CASUAL': 'Casual'
    }
    tags.push(typeTagMap[room.type] || room.type)

    if (room.allowVideo) tags.push('Video')
    if (room.allowVoice) tags.push('Voice') 
    if (room.allowScreenShare) tags.push('Screen Share')

    // Transform room data for frontend
    const transformedRoom = {
      id: room.id,
      name: room.name,
      description: room.description || 'Không có mô tả',
      type: room.type,
      topic: room.topic || 'Chung',
      maxMembers: room.maxMembers,
      isPrivate: room.isPrivate,
      currentMembers: room._count.members,
      owner: {
        id: room.owner.id,
        name: `${room.owner.firstName} ${room.owner.lastName}`,
        avatar: room.owner.avatar
      },
      tags: tags.slice(0, 4),
      isMember,
      isOwner,
      allowVideo: room.allowVideo,
      allowVoice: room.allowVoice,
      allowText: room.allowText,
      allowScreenShare: room.allowScreenShare,
      createdAt: room.createdAt,
      lastActivity: room.lastActivity,
      members: room.members.map(member => ({
        id: member.user.id,
        name: `${member.user.firstName} ${member.user.lastName}`,
        avatar: member.user.avatar,
        joinedAt: member.joinedAt
      }))
    }

    return NextResponse.json({ 
      room: transformedRoom
    })

  } catch (error) {
    console.error('Error fetching room:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
