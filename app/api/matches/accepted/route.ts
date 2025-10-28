import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client
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

    // Get all accepted matches for the user
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { senderId: user.id, status: 'ACCEPTED' },
          { receiverId: user.id, status: 'ACCEPTED' }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            university: true,
            major: true,
            lastActive: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            university: true,
            major: true,
            lastActive: true
          }
        }
      },
      orderBy: {
        respondedAt: 'desc' // Most recent matches first
      }
    })

    // Transform to get the other user in each match
    const acceptedMatches = matches.map(match => {
      const otherUser = match.senderId === user.id ? match.receiver : match.sender
      
      return {
        matchId: match.id,
        matchedAt: match.respondedAt || match.createdAt,
        otherUser: {
          id: otherUser.id,
          firstName: otherUser.firstName,
          lastName: otherUser.lastName,
          avatar: otherUser.avatar,
          university: otherUser.university,
          major: otherUser.major,
          lastActive: otherUser.lastActive,
          isOnline: otherUser.lastActive ? 
            new Date(otherUser.lastActive) > new Date(Date.now() - 15 * 60 * 1000) : false
        }
      }
    })

    return NextResponse.json({
      matches: acceptedMatches,
      total: acceptedMatches.length
    })

  } catch (error) {
    console.error('Error fetching accepted matches:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}