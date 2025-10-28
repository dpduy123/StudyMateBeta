import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/user/status/batch
 * Get multiple users' online/offline status and last active times
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userIds } = body

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'userIds array is required' },
        { status: 400 }
      )
    }

    // Limit to 50 users at a time to prevent abuse
    if (userIds.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 users per request' },
        { status: 400 }
      )
    }

    // Fetch users from database
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        lastActive: true
      }
    })

    // Determine online status for each user (active within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    
    const statuses = users.map(user => ({
      userId: user.id,
      status: user.lastActive > fiveMinutesAgo ? 'online' : 'offline',
      lastActive: user.lastActive.toISOString(),
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar
      }
    }))

    return NextResponse.json({ statuses })

  } catch (error) {
    console.error('Batch user status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
