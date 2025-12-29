import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'

// GET: Get suggested users to connect with
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

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user's profile
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        university: true,
        major: true,
        interests: true,
      },
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get users that are already matched
    const existingMatches = await prisma.match.findMany({
      where: {
        OR: [
          { senderId: user.id },
          { receiverId: user.id },
        ],
      },
      select: {
        senderId: true,
        receiverId: true,
      },
    })

    const matchedUserIds = new Set<string>()
    existingMatches.forEach((match) => {
      matchedUserIds.add(match.senderId)
      matchedUserIds.add(match.receiverId)
    })

    // Find suggested users - prioritize same university or major
    const suggestedUsers = await prisma.user.findMany({
      where: {
        id: {
          notIn: [...matchedUserIds, user.id],
        },
        status: 'ACTIVE',
        isProfilePublic: true,
        OR: [
          { university: currentUser.university },
          { major: currentUser.major },
          {
            interests: {
              hasSome: currentUser.interests,
            },
          },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        university: true,
        major: true,
        year: true,
      },
      take: 5,
      orderBy: {
        lastActive: 'desc',
      },
    })

    // If not enough suggestions, get random active users
    if (suggestedUsers.length < 5) {
      const additionalUsers = await prisma.user.findMany({
        where: {
          id: {
            notIn: [...matchedUserIds, user.id, ...suggestedUsers.map((u) => u.id)],
          },
          status: 'ACTIVE',
          isProfilePublic: true,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          university: true,
          major: true,
          year: true,
        },
        take: 5 - suggestedUsers.length,
        orderBy: {
          lastActive: 'desc',
        },
      })

      suggestedUsers.push(...additionalUsers)
    }

    return NextResponse.json({
      users: suggestedUsers,
    })
  } catch (error) {
    console.error('Error fetching suggested users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
