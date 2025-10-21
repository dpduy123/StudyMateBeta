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
    const status = searchParams.get('status') || 'ACCEPTED'

    // Get all matches for current user
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { senderId: currentUser.id },
          { receiverId: currentUser.id }
        ],
        status: status as any
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
            year: true,
            bio: true,
            averageRating: true,
            successfulMatches: true
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
            successfulMatches: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Format response to show the "other" user
    const formattedMatches = matches.map(match => {
      const isCurrentUserSender = match.senderId === currentUser.id
      const otherUser = isCurrentUserSender ? match.receiver : match.sender

      return {
        matchId: match.id,
        matchedAt: match.createdAt,
        respondedAt: match.respondedAt,
        status: match.status,
        isSender: isCurrentUserSender,
        user: {
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
          successfulMatches: otherUser.successfulMatches
        }
      }
    })

    return NextResponse.json({
      matches: formattedMatches,
      total: formattedMatches.length
    })

  } catch (error) {
    console.error('Error fetching matches:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
