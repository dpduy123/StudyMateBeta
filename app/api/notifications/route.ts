import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'
import { simpleCache } from '@/lib/cache/simple-cache'

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
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')

    // Check cache first (30 second TTL)
    const cacheKey = `notifications:${currentUser.id}:${unreadOnly}:${limit}`
    const cached = simpleCache.get<{ notifications: any[], unreadCount: number, total: number }>(cacheKey)
    
    if (cached) {
      return NextResponse.json(cached)
    }

    const whereClause: any = { userId: currentUser.id }
    if (unreadOnly) {
      whereClause.isRead = false
    }

    // Run queries in parallel for better performance
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          isRead: true,
          relatedUserId: true,
          relatedMatchId: true,
          relatedMessageId: true,
          relatedRoomId: true,
          metadata: true,
          createdAt: true,
          readAt: true,
        }
      }),
      prisma.notification.count({
        where: {
          userId: currentUser.id,
          isRead: false
        }
      })
    ])

    const result = {
      notifications,
      unreadCount,
      total: notifications.length
    }

    // Cache for 30 seconds
    simpleCache.set(cacheKey, result, 30000)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error fetching notifications:', error)
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
    const { notificationId, action } = body

    if (action === 'mark_read' && notificationId) {
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId }
      })

      if (!notification || notification.userId !== currentUser.id) {
        return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
      }

      await prisma.notification.update({
        where: { id: notificationId },
        data: {
          isRead: true,
          readAt: new Date()
        }
      })

      // Invalidate cache
      simpleCache.invalidatePattern(`notifications:${currentUser.id}:`)

      return NextResponse.json({ success: true, message: 'Notification marked as read' })
    }

    if (action === 'mark_all_read') {
      await prisma.notification.updateMany({
        where: {
          userId: currentUser.id,
          isRead: false
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      })

      // Invalidate cache
      simpleCache.invalidatePattern(`notifications:${currentUser.id}:`)

      return NextResponse.json({ success: true, message: 'All notifications marked as read' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Error updating notification:', error)
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
    const notificationId = searchParams.get('notificationId')

    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID required' }, { status: 400 })
    }

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    })

    if (!notification || notification.userId !== currentUser.id) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    await prisma.notification.delete({
      where: { id: notificationId }
    })

    // Invalidate cache
    simpleCache.invalidatePattern(`notifications:${currentUser.id}:`)

    return NextResponse.json({ success: true, message: 'Notification deleted' })

  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
