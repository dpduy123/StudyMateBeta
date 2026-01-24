// Tool: Send Connection Request

import { prisma } from '@/lib/prisma'

interface SendConnectionArgs {
  targetUserId: string
  message?: string
}

interface ConnectionResult {
  success: boolean
  isMutualMatch: boolean
  message: string
}

export async function sendConnectionRequest(
  args: Record<string, unknown>,
  currentUserId: string
): Promise<ConnectionResult> {
  const targetUserId = (args.targetUserId as string) || ''
  const message = args.message as string | undefined

  console.log(`🤝 [Chatbot Tool] Sending connection: ${currentUserId} -> ${targetUserId}`)

  try {
    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, firstName: true, lastName: true }
    })

    if (!targetUser) {
      return {
        success: false,
        isMutualMatch: false,
        message: 'Không tìm thấy người dùng này.'
      }
    }

    // Check if already connected or pending
    const existingMatch = await prisma.match.findFirst({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: currentUserId }
        ]
      }
    })

    if (existingMatch) {
      if (existingMatch.status === 'ACCEPTED') {
        return {
          success: false,
          isMutualMatch: false,
          message: `Bạn đã kết nối với ${targetUser.firstName} ${targetUser.lastName} rồi.`
        }
      }
      if (existingMatch.status === 'PENDING') {
        // Check if this is a reciprocal request (mutual match!)
        if (existingMatch.senderId === targetUserId) {
          // Target user already sent us a request - accept it!
          await prisma.match.update({
            where: { id: existingMatch.id },
            data: {
              status: 'ACCEPTED',
              respondedAt: new Date()
            }
          })

          // Update successful matches count for both users
          await prisma.user.updateMany({
            where: { id: { in: [currentUserId, targetUserId] } },
            data: { successfulMatches: { increment: 1 } }
          })

          // Create notifications for mutual match
          await createMutualMatchNotifications(currentUserId, targetUserId)

          return {
            success: true,
            isMutualMatch: true,
            message: `Chúc mừng! Bạn và ${targetUser.firstName} ${targetUser.lastName} đã match thành công! Các bạn có thể nhắn tin cho nhau ngay.`
          }
        }

        return {
          success: false,
          isMutualMatch: false,
          message: `Bạn đã gửi lời mời đến ${targetUser.firstName} ${targetUser.lastName} trước đó rồi. Đang chờ phản hồi.`
        }
      }
      if (existingMatch.status === 'BLOCKED') {
        return {
          success: false,
          isMutualMatch: false,
          message: 'Không thể kết nối với người dùng này.'
        }
      }
    }

    // Get sender info for notification
    const sender = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { firstName: true, lastName: true, avatar: true, university: true }
    })

    // Create new match request
    const match = await prisma.match.create({
      data: {
        senderId: currentUserId,
        receiverId: targetUserId,
        status: 'PENDING',
        message: message || null
      }
    })

    // Create notification for target user
    await prisma.notification.create({
      data: {
        userId: targetUserId,
        type: 'MATCH_REQUEST',
        title: 'Yêu cầu kết nối mới',
        message: `${sender?.firstName} ${sender?.lastName} muốn kết nối với bạn`,
        relatedUserId: currentUserId,
        relatedMatchId: match.id,
        metadata: {
          senderName: `${sender?.firstName} ${sender?.lastName}`,
          senderAvatar: sender?.avatar,
          senderUniversity: sender?.university,
          customMessage: message
        }
      }
    })

    console.log(`✅ [Chatbot Tool] Connection request sent`)

    return {
      success: true,
      isMutualMatch: false,
      message: `Đã gửi lời mời kết nối đến ${targetUser.firstName} ${targetUser.lastName}. Bạn sẽ được thông báo khi họ phản hồi.`
    }
  } catch (error) {
    console.error('❌ [Chatbot Tool] Send connection error:', error)
    throw new Error('Không thể gửi lời mời kết nối lúc này. Vui lòng thử lại.')
  }
}

async function createMutualMatchNotifications(userId1: string, userId2: string) {
  const [user1, user2] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId1 },
      select: { firstName: true, lastName: true, avatar: true }
    }),
    prisma.user.findUnique({
      where: { id: userId2 },
      select: { firstName: true, lastName: true, avatar: true }
    })
  ])

  await prisma.notification.createMany({
    data: [
      {
        userId: userId1,
        type: 'MATCH_ACCEPTED',
        title: 'Kết nối thành công!',
        message: `Bạn và ${user2?.firstName} ${user2?.lastName} đã kết nối thành công`,
        relatedUserId: userId2,
        metadata: {
          matchedUserName: `${user2?.firstName} ${user2?.lastName}`,
          matchedUserAvatar: user2?.avatar
        }
      },
      {
        userId: userId2,
        type: 'MATCH_ACCEPTED',
        title: 'Kết nối thành công!',
        message: `Bạn và ${user1?.firstName} ${user1?.lastName} đã kết nối thành công`,
        relatedUserId: userId1,
        metadata: {
          matchedUserName: `${user1?.firstName} ${user1?.lastName}`,
          matchedUserAvatar: user1?.avatar
        }
      }
    ]
  })
}
