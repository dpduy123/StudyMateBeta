import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
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

    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    const whereClause: any = (() => {
      const baseClause: any = {}

      if (type === 'sent') {
        baseClause.senderId = currentUser.id
      } else if (type === 'received') {
        baseClause.receiverId = currentUser.id
      } else {
        baseClause.OR = [
          { senderId: currentUser.id },
          { receiverId: currentUser.id }
        ]
      }

      if (status) {
        baseClause.status = status
      }

      return baseClause
    })()

    const matches = await prisma.match.findMany({
      where: whereClause,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            university: true,
            major: true,
            year: true,
            bio: true,
            averageRating: true,
            totalMatches: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            university: true,
            major: true,
            year: true,
            bio: true,
            averageRating: true,
            totalMatches: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedMatches = matches.map(match => {
      const isCurrentUserSender = match.senderId === currentUser.id
      const otherUser = isCurrentUserSender ? match.receiver : match.sender

      return {
        id: match.id,
        status: match.status,
        message: match.message,
        createdAt: match.createdAt,
        respondedAt: match.respondedAt,
        isSender: isCurrentUserSender,
        otherUser: {
          id: otherUser.id,
          firstName: otherUser.firstName,
          lastName: otherUser.lastName,
          email: otherUser.email,
          avatar: otherUser.avatar,
          university: otherUser.university,
          major: otherUser.major,
          year: otherUser.year,
          bio: otherUser.bio,
          averageRating: otherUser.averageRating,
          totalMatches: otherUser.totalMatches
        }
      }
    })

    return NextResponse.json({
      matches: formattedMatches,
      total: formattedMatches.length
    })

  } catch (error) {
    console.error('Error fetching connections:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { targetUserId, message } = body

    if (!targetUserId) {
      return NextResponse.json({ error: 'Target user ID is required' }, { status: 400 })
    }

    if (targetUserId === currentUser.id) {
      return NextResponse.json({ error: 'Cannot connect with yourself' }, { status: 400 })
    }

    const existingMatch = await prisma.match.findFirst({
      where: {
        OR: [
          { senderId: currentUser.id, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: currentUser.id }
        ]
      }
    })

    if (existingMatch) {
      return NextResponse.json({
        error: 'Connection already exists',
        existingMatch: {
          id: existingMatch.id,
          status: existingMatch.status
        }
      }, { status: 400 })
    }

    const currentUserData = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        firstName: true,
        lastName: true,
        avatar: true,
        university: true
      }
    })

    const newMatch = await prisma.match.create({
      data: {
        senderId: currentUser.id,
        receiverId: targetUserId,
        status: 'PENDING',
        message: message || null,
        createdAt: new Date()
      },
      include: {
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            university: true,
            major: true,
            year: true
          }
        }
      }
    })

    await prisma.notification.create({
      data: {
        userId: targetUserId,
        type: 'MATCH_REQUEST',
        title: 'Yeu cau ket noi moi',
        message: `${currentUserData?.firstName} ${currentUserData?.lastName} muon ket noi voi ban`,
        relatedUserId: currentUser.id,
        relatedMatchId: newMatch.id,
        metadata: {
          senderName: `${currentUserData?.firstName} ${currentUserData?.lastName}`,
          senderAvatar: currentUserData?.avatar,
          senderUniversity: currentUserData?.university
        }
      }
    })

    const reciprocalMatch = await prisma.match.findFirst({
      where: {
        senderId: targetUserId,
        receiverId: currentUser.id,
        status: 'PENDING'
      }
    })

    if (reciprocalMatch) {
      await prisma.match.updateMany({
        where: {
          OR: [
            { id: newMatch.id },
            { id: reciprocalMatch.id }
          ]
        },
        data: {
          status: 'ACCEPTED',
          respondedAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        matched: true,
        message: 'Chuc mung! Ban da ket noi thanh cong',
        match: {
          id: newMatch.id,
          status: 'ACCEPTED',
          otherUser: newMatch.receiver
        }
      })
    }

    return NextResponse.json({
      success: true,
      matched: false,
      message: 'Da gui yeu cau ket noi',
      match: {
        id: newMatch.id,
        status: 'PENDING',
        otherUser: newMatch.receiver
      }
    })

  } catch (error) {
    console.error('Error creating connection:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
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

    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { matchId, action } = body

    if (!matchId || !action) {
      return NextResponse.json({ error: 'Match ID and action are required' }, { status: 400 })
    }

    if (!['ACCEPT', 'REJECT', 'BLOCK'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    if (match.receiverId !== currentUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const newStatus = action === 'ACCEPT' ? 'ACCEPTED' : action === 'BLOCK' ? 'BLOCKED' : 'REJECTED'

    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        status: newStatus,
        respondedAt: new Date()
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            university: true,
            major: true,
            year: true
          }
        }
      }
    })

    const actionMessages = {
      ACCEPT: 'Da chap nhan ket noi',
      REJECT: 'Da tu choi ket noi',
      BLOCK: 'Da chan nguoi dung'
    }

    if (action === 'ACCEPT') {
      const currentUserData = await prisma.user.findUnique({
        where: { id: currentUser.id },
        select: {
          firstName: true,
          lastName: true,
          avatar: true
        }
      })

      // Update successfulMatches count for both users
      await prisma.user.update({
        where: { id: currentUser.id },
        data: {
          successfulMatches: { increment: 1 }
        }
      })

      await prisma.user.update({
        where: { id: updatedMatch.sender.id },
        data: {
          successfulMatches: { increment: 1 }
        }
      })

      await prisma.notification.create({
        data: {
          userId: updatedMatch.sender.id,
          type: 'MATCH_ACCEPTED',
          title: 'Yeu cau ket noi duoc chap nhan',
          message: `${currentUserData?.firstName} ${currentUserData?.lastName} da chap nhan ket noi voi ban`,
          relatedUserId: currentUser.id,
          relatedMatchId: matchId,
          metadata: {
            accepterName: `${currentUserData?.firstName} ${currentUserData?.lastName}`,
            accepterAvatar: currentUserData?.avatar
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: actionMessages[action as keyof typeof actionMessages],
      match: {
        id: updatedMatch.id,
        status: updatedMatch.status,
        otherUser: updatedMatch.sender
      }
    })

  } catch (error) {
    console.error('Error responding to connection:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
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

    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get('matchId')

    if (!matchId) {
      return NextResponse.json({ error: 'Match ID is required' }, { status: 400 })
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId }
    })

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    if (match.senderId !== currentUser.id && match.receiverId !== currentUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.match.delete({
      where: { id: matchId }
    })

    return NextResponse.json({
      success: true,
      message: 'Da xoa ket noi thanh cong'
    })

  } catch (error) {
    console.error('Error deleting connection:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
