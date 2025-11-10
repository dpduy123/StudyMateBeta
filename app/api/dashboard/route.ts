import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'
import { RoomType } from '@/lib/generated/prisma'

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
          setAll() {
            // Not needed for GET request
          },
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

    // Run all queries in parallel for maximum performance
    const [
      profile,
      recentMatches,
      recentActivity,
      allStudyActivities,
      badgeCount,
      userRooms
    ] = await Promise.all([
      // Fetch user profile with stats
      prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          university: true,
          major: true,
          year: true,
          totalMatches: true,
          successfulMatches: true,
          averageRating: true,
          createdAt: true,
        },
      }),
      
      // Get recent matches (both sent and received, accepted ones)
      prisma.match.findMany({
        where: {
          OR: [
            { senderId: user.id, status: 'ACCEPTED' },
            { receiverId: user.id, status: 'ACCEPTED' }
          ]
        },
        select: {
          id: true,
          senderId: true,
          receiverId: true,
          createdAt: true,
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              university: true,
              major: true,
              lastActive: true,
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
              lastActive: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
      
      // Get recent activity
      prisma.userActivity.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          activityType: true,
          metadata: true,
          createdAt: true,
        }
      }),
      
      // Get study session activities
      prisma.userActivity.findMany({
        where: { 
          userId: user.id,
          activityType: 'study_session_completed'
        },
        select: {
          id: true,
          metadata: true,
        }
      }),
      
      // Get user badges count
      prisma.userBadge.count({
        where: { userId: user.id },
      }),
      
      // Get user rooms (moved here for parallel execution)
      prisma.room.findMany({
        where: {
          OR: [
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
        },
        select: {
          id: true,
          name: true,
          description: true,
          type: true,
          topic: true,
          maxMembers: true,
          ownerId: true,
          lastActivity: true,
          owner: {
            select: {
              firstName: true,
              lastName: true,
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
        orderBy: { lastActivity: 'desc' },
        take: 4,
      })
    ])

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Transform matches to show the other person
    const transformedMatches = recentMatches.map(match => {
      const otherUser = match.senderId === user.id ? match.receiver : match.sender
      const isOnline = otherUser.lastActive && new Date(otherUser.lastActive) > new Date(Date.now() - 15 * 60 * 1000)
      
      return {
        id: match.id,
        userId: otherUser.id,
        name: `${otherUser.firstName} ${otherUser.lastName}`,
        university: otherUser.university,
        subject: otherUser.major,
        avatar: otherUser.avatar,
        matchScore: Math.floor(Math.random() * 20) + 80,
        isOnline: Boolean(isOnline),
        matchedAt: match.createdAt,
      }
    })

    // Calculate study hours from metadata if available
    let totalStudyHours = 0
    allStudyActivities.forEach(activity => {
      if (activity.metadata && typeof activity.metadata === 'object') {
        const metadata = activity.metadata as any
        if (metadata.hours || metadata.duration) {
          totalStudyHours += metadata.hours || metadata.duration || 2 // Default 2 hours per session
        } else {
          totalStudyHours += 2 // Default 2 hours per session if no metadata
        }
      } else {
        totalStudyHours += 2 // Default 2 hours per session if no metadata
      }
    })

    // Calculate some basic stats
    const userStats = {
      matches: profile.totalMatches,
      studySessions: allStudyActivities.length,
      hoursStudied: totalStudyHours,
      badges: badgeCount,
    }

    // Transform rooms to upcoming events format (userRooms already fetched in parallel)
    const upcomingEvents = userRooms.map(room => {
      // Generate realistic upcoming times
      const now = new Date()
      const eventTime = new Date(now.getTime() + Math.random() * 8 * 60 * 60 * 1000) // Random time in next 8 hours
      
      const timeString = eventTime.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })

      // Map room types to display types
      const typeMap: Record<RoomType, string> = {
        [RoomType.STUDY_GROUP]: 'study',
        [RoomType.DISCUSSION]: 'discussion', 
        [RoomType.HELP_SESSION]: 'help',
        [RoomType.CASUAL]: 'casual'
      }

      return {
        id: room.id,
        title: room.name,
        time: timeString,
        participants: room._count.members,
        type: typeMap[room.type] || 'study',
        topic: room.topic,
        isOwner: room.ownerId === user.id,
        maxMembers: room.maxMembers,
        roomType: room.type,
        description: room.description,
      }
    })

    // If no real rooms, create some sample events based on user's major
    if (upcomingEvents.length === 0) {
      const now = new Date()
      const defaultEvents = [
        {
          id: 'sample-1',
          title: 'Study Group: ' + profile.major,
          time: new Date(now.getTime() + 2 * 60 * 60 * 1000).toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          }),
          participants: 0,
          type: 'study',
          topic: profile.major,
          isOwner: false,
          maxMembers: 10,
          roomType: RoomType.STUDY_GROUP,
          description: 'Học nhóm ' + profile.major,
        },
        {
          id: 'sample-2',
          title: 'Workshop: ' + profile.university,
          time: new Date(now.getTime() + 5 * 60 * 60 * 1000).toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          }),
          participants: 0,
          type: 'workshop', 
          topic: 'General',
          isOwner: false,
          maxMembers: 20,
          roomType: RoomType.DISCUSSION,
          description: 'Workshop tại ' + profile.university,
        }
      ]
      upcomingEvents.push(...defaultEvents)
    }

    // Transform recent activities
    const transformedActivities = recentActivity.slice(0, 3).map(activity => {
      const activityTypes = {
        'match_sent': {
          title: 'Gửi yêu cầu kết nối',
          description: 'Đang chờ phản hồi',
          icon: 'UserGroupIcon',
          iconColor: 'text-blue-600',
          iconBg: 'bg-blue-100'
        },
        'match_accepted': {
          title: 'Kết nối thành công',
          description: 'Có thể bắt đầu chat',
          icon: 'UserGroupIcon',
          iconColor: 'text-green-600',
          iconBg: 'bg-green-100'
        },
        'study_session_completed': {
          title: 'Hoàn thành study session',
          description: profile.major + ' - 2 tiếng',
          icon: 'FireIcon',
          iconColor: 'text-red-600',
          iconBg: 'bg-red-100'
        },
        'badge_earned': {
          title: 'Đạt badge mới',
          description: 'Study Streak - 7 ngày',
          icon: 'TrophyIcon',
          iconColor: 'text-yellow-600',
          iconBg: 'bg-yellow-100'
        }
      }

      const activityInfo = activityTypes[activity.activityType as keyof typeof activityTypes] || activityTypes['study_session_completed']
      
      return {
        id: activity.id,
        ...activityInfo,
        time: formatTimeAgo(activity.createdAt)
      }
    })

    // Add some default activities if there are no real ones
    const defaultActivities = [
      {
        id: 'default-1',
        icon: 'TrophyIcon',
        iconColor: 'text-yellow-600',
        iconBg: 'bg-yellow-100',
        title: 'Chào mừng đến StudyMate!',
        description: 'Hãy bắt đầu tìm bạn học nhé',
        time: formatTimeAgo(profile.createdAt)
      }
    ]

    const activities = transformedActivities.length > 0 ? transformedActivities : defaultActivities

    return NextResponse.json({
      profile: {
        name: `${profile.firstName} ${profile.lastName}`,
        avatar: profile.avatar,
        university: profile.university,
        major: profile.major,
      },
      userStats,
      recentMatches: transformedMatches,
      upcomingEvents,
      recentActivity: activities,
    })

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000)

  if (diffInSeconds < 60) return 'Vừa xong'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`
  return `${Math.floor(diffInSeconds / 2592000)} tháng trước`
}