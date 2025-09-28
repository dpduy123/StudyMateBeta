import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'

const ADMIN_EMAILS = ['23560004@gm.uit.edu.vn']

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
          setAll() {
            // Not needed for GET request
          },
        },
      }
    )

    const {
      data: { user: currentUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin permissions
    if (!ADMIN_EMAILS.includes(currentUser.email || '')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get current date for today's stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Fetch all stats in parallel
    const [
      totalUsers,
      activeUsers,
      totalMatches,
      totalMessages,
      totalRooms,
      activeRooms,
      newUsersToday,
      matchesToday
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Active users (logged in within last 7 days)
      prisma.user.count({
        where: {
          lastActive: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),

      // Total matches
      prisma.match.count(),

      // Total messages (private + room)
      Promise.all([
        prisma.message.count(),
        prisma.roomMessage.count()
      ]).then(([privateMessages, roomMessages]) => privateMessages + roomMessages),

      // Total rooms
      prisma.room.count(),

      // Active rooms (with activity in last 24 hours)
      prisma.room.count({
        where: {
          lastActivity: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      }),

      // New users today
      prisma.user.count({
        where: {
          createdAt: {
            gte: today
          }
        }
      }),

      // Matches today
      prisma.match.count({
        where: {
          createdAt: {
            gte: today
          }
        }
      })
    ])

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalMatches,
      totalMessages,
      totalRooms,
      activeRooms,
      newUsersToday,
      matchesToday
    })

  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}