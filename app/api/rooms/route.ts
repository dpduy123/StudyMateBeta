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

    // Get search parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const filter = searchParams.get('filter') || 'all' // all, public, my-rooms, joined
    const type = searchParams.get('type') || '' // STUDY_GROUP, HELP_SESSION, DISCUSSION, CASUAL

    // Build where conditions
    const whereConditions: any = {
      AND: []
    }

    // Search filter
    if (search) {
      whereConditions.AND.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { topic: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    }

    // Type filter
    if (type && ['STUDY_GROUP', 'HELP_SESSION', 'DISCUSSION', 'CASUAL'].includes(type)) {
      whereConditions.AND.push({ type })
    }

    // Room access filter
    switch (filter) {
      case 'public':
        whereConditions.AND.push({ isPrivate: false })
        break
      case 'my-rooms':
        whereConditions.AND.push({ ownerId: user.id })
        break
      case 'joined':
        whereConditions.AND.push({
          members: {
            some: {
              userId: user.id,
              leftAt: null,
              isBanned: false
            }
          }
        })
        break
      default:
        // For 'all', show public rooms + user's rooms + rooms user joined
        whereConditions.AND.push({
          OR: [
            { isPrivate: false },
            { ownerId: user.id },
            {
              members: {
                some: {
                  userId: user.id,
                  leftAt: null,
                  isBanned: false
                }
              }
            }
          ]
        })
        break
    }

    // Fetch rooms with all necessary data
    const rooms = await prisma.room.findMany({
      where: whereConditions.AND.length > 0 ? whereConditions : {},
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
      },
      orderBy: [
        { lastActivity: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 50, // Limit to 50 rooms for performance
    })

    // Transform rooms data for frontend
    const transformedRooms = rooms.map(room => {
      // Check if current user is a member
      const isMember = room.members.some(member => member.userId === user.id)
      const isOwner = room.ownerId === user.id

      // Generate tags based on topic and type
      const tags = []
      if (room.topic) {
        // Split topic into potential tags
        const topicTags = room.topic.split(/[,\s]+/).filter(tag => tag.length > 2)
        tags.push(...topicTags.slice(0, 3)) // Max 3 topic tags
      }
      
      // Add type-based tags
      const typeTagMap = {
        'STUDY_GROUP': 'Study Group',
        'HELP_SESSION': 'Help Session', 
        'DISCUSSION': 'Discussion',
        'CASUAL': 'Casual'
      }
      tags.push(typeTagMap[room.type] || room.type)

      // Add feature tags
      if (room.allowVideo) tags.push('Video')
      if (room.allowVoice) tags.push('Voice') 
      if (room.allowScreenShare) tags.push('Screen Share')

      return {
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
        tags: tags.slice(0, 4), // Limit to 4 tags
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
    })

    return NextResponse.json({ 
      rooms: transformedRooms,
      total: transformedRooms.length 
    })

  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json()
    const {
      name,
      description,
      type,
      topic,
      maxMembers,
      isPrivate,
      password,
      allowVideo,
      allowVoice,
      allowText,
      allowScreenShare
    } = body

    // Validate required fields
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      )
    }

    // Validate type
    if (!['STUDY_GROUP', 'HELP_SESSION', 'DISCUSSION', 'CASUAL'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid room type' },
        { status: 400 }
      )
    }

    // Create new room
    const newRoom = await prisma.room.create({
      data: {
        name,
        description: description || null,
        type,
        topic: topic || null,
        maxMembers: maxMembers || 10,
        isPrivate: isPrivate || false,
        password: password || null,
        ownerId: user.id,
        allowVideo: allowVideo !== false, // Default true
        allowVoice: allowVoice !== false, // Default true
        allowText: allowText !== false,   // Default true
        allowScreenShare: allowScreenShare || false, // Default false
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          }
        },
        _count: {
          select: {
            members: true
          }
        }
      }
    })

    // Add owner as member
    await prisma.roomMember.create({
      data: {
        roomId: newRoom.id,
        userId: user.id,
      }
    })

    // Transform response
    const transformedRoom = {
      id: newRoom.id,
      name: newRoom.name,
      description: newRoom.description || 'Không có mô tả',
      type: newRoom.type,
      topic: newRoom.topic || 'Chung',
      maxMembers: newRoom.maxMembers,
      isPrivate: newRoom.isPrivate,
      currentMembers: 1, // Owner is automatically a member
      owner: {
        id: newRoom.owner.id,
        name: `${newRoom.owner.firstName} ${newRoom.owner.lastName}`,
        avatar: newRoom.owner.avatar
      },
      tags: [],
      isMember: true,
      isOwner: true,
      allowVideo: newRoom.allowVideo,
      allowVoice: newRoom.allowVoice,
      allowText: newRoom.allowText,
      allowScreenShare: newRoom.allowScreenShare,
      createdAt: newRoom.createdAt,
      lastActivity: newRoom.lastActivity
    }

    return NextResponse.json({ 
      room: transformedRoom,
      message: 'Room created successfully'
    })

  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}