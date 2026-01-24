// Tool: Find Study Rooms

import { prisma } from '@/lib/prisma'

interface FindRoomsArgs {
  topic: string
  limit?: number
}

interface RoomResult {
  id: string
  name: string
  description: string | null
  topic: string | null
  type: string
  memberCount: number
  maxMembers: number
  isPrivate: boolean
  ownerName: string
  lastActivity: Date
}

export async function findStudyRooms(
  args: Record<string, unknown>,
  currentUserId: string
): Promise<{ rooms: RoomResult[]; total: number; message: string }> {
  const topic = (args.topic as string) || ''
  const limit = (args.limit as number) || 5

  console.log(`🏠 [Chatbot Tool] Finding rooms for topic: "${topic}"`)

  try {
    // Search rooms by topic, name, or description
    const searchTerms = topic.toLowerCase().split(' ')

    const rooms = await prisma.room.findMany({
      where: {
        AND: [
          // Search by topic, name, or description
          {
            OR: [
              { topic: { contains: topic, mode: 'insensitive' } },
              { name: { contains: topic, mode: 'insensitive' } },
              { description: { contains: topic, mode: 'insensitive' } }
            ]
          },
          // Only show public rooms or rooms user is a member of
          {
            OR: [
              { isPrivate: false },
              { members: { some: { userId: currentUserId, isBanned: false } } }
            ]
          }
        ]
      },
      include: {
        owner: {
          select: { firstName: true, lastName: true }
        },
        members: {
          where: { leftAt: null, isBanned: false },
          select: { id: true }
        }
      },
      orderBy: { lastActivity: 'desc' },
      take: limit * 2 // Get more to filter
    })

    // Filter active rooms (had activity in last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const activeRooms = rooms
      .filter(room => room.lastActivity >= sevenDaysAgo)
      .slice(0, limit)

    const roomResults: RoomResult[] = activeRooms.map(room => ({
      id: room.id,
      name: room.name,
      description: room.description,
      topic: room.topic,
      type: room.type,
      memberCount: room.members.length,
      maxMembers: room.maxMembers,
      isPrivate: room.isPrivate,
      ownerName: `${room.owner.firstName} ${room.owner.lastName}`,
      lastActivity: room.lastActivity
    }))

    console.log(`✅ [Chatbot Tool] Found ${roomResults.length} rooms`)

    if (roomResults.length === 0) {
      // Try a broader search with individual terms
      const broaderRooms = await prisma.room.findMany({
        where: {
          isPrivate: false,
          lastActivity: { gte: sevenDaysAgo }
        },
        include: {
          owner: { select: { firstName: true, lastName: true } },
          members: {
            where: { leftAt: null, isBanned: false },
            select: { id: true }
          }
        },
        orderBy: { lastActivity: 'desc' },
        take: limit
      })

      if (broaderRooms.length > 0) {
        return {
          rooms: broaderRooms.map(room => ({
            id: room.id,
            name: room.name,
            description: room.description,
            topic: room.topic,
            type: room.type,
            memberCount: room.members.length,
            maxMembers: room.maxMembers,
            isPrivate: room.isPrivate,
            ownerName: `${room.owner.firstName} ${room.owner.lastName}`,
            lastActivity: room.lastActivity
          })),
          total: broaderRooms.length,
          message: `Không tìm thấy phòng học về "${topic}", nhưng đây là một số phòng đang hoạt động.`
        }
      }

      return {
        rooms: [],
        total: 0,
        message: `Không có phòng học nào đang hoạt động. Bạn có thể tạo phòng mới trong mục "Phòng học".`
      }
    }

    return {
      rooms: roomResults,
      total: roomResults.length,
      message: `Tìm thấy ${roomResults.length} phòng học về "${topic}".`
    }
  } catch (error) {
    console.error('❌ [Chatbot Tool] Find rooms error:', error)
    throw new Error('Không thể tìm phòng học lúc này. Vui lòng thử lại.')
  }
}
