import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'

// This is a development endpoint to seed sample data for testing
export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
    }

    // Create Supabase client to get the current user
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

    // Create sample study activities
    const sampleActivities = [
      {
        userId: user.id,
        activityType: 'study_session_completed',
        metadata: {
          subject: 'Data Structures',
          hours: 3,
          roomId: 'room-1',
          participants: 4
        }
      },
      {
        userId: user.id,
        activityType: 'study_session_completed', 
        metadata: {
          subject: 'Algorithms',
          hours: 2,
          roomId: 'room-2',
          participants: 2
        }
      },
      {
        userId: user.id,
        activityType: 'match_accepted',
        metadata: {
          matchId: 'match-1',
          otherUserId: 'other-user-1'
        }
      },
      {
        userId: user.id,
        activityType: 'badge_earned',
        metadata: {
          badgeId: 'study-streak',
          badgeName: 'Study Streak',
          requirement: '7 days consecutive'
        }
      },
      {
        userId: user.id,
        activityType: 'study_session_completed',
        metadata: {
          subject: 'Machine Learning',
          hours: 4,
          roomId: 'room-3',
          participants: 6
        }
      }
    ]

    // Get user profile for creating relevant rooms
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: { major: true, university: true, firstName: true, lastName: true }
    })

    // Insert activities
    const createdActivities = await Promise.all(
      sampleActivities.map(activity =>
        prisma.userActivity.create({
          data: {
            ...activity,
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last 7 days
          }
        })
      )
    )

    // Create sample rooms
    const sampleRooms = [
      {
        name: 'Study Group: ' + (userProfile?.major || 'Computer Science'),
        description: 'Weekly study group for ' + (userProfile?.major || 'Computer Science'),
        type: 'STUDY_GROUP' as const,
        topic: userProfile?.major || 'Computer Science',
        maxMembers: 8,
        isPrivate: false,
        ownerId: user.id,
        allowVideo: true,
        allowVoice: true,
        allowText: true,
        allowScreenShare: true,
        lastActivity: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000), // Active within last 2 hours
      },
      {
        name: 'Help Session: Algorithms',
        description: 'Get help with algorithm problems',
        type: 'HELP_SESSION' as const, 
        topic: 'Algorithms',
        maxMembers: 5,
        isPrivate: false,
        ownerId: user.id,
        allowVideo: true,
        allowVoice: true,
        allowText: true,
        allowScreenShare: false,
        lastActivity: new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000), // Active within last 4 hours
      },
      {
        name: userProfile?.university + ' Discussion',
        description: 'General discussion for ' + (userProfile?.university || 'University') + ' students',
        type: 'DISCUSSION' as const,
        topic: 'General',
        maxMembers: 15,
        isPrivate: false,
        ownerId: user.id,
        allowVideo: false,
        allowVoice: true,
        allowText: true,
        allowScreenShare: false,
        lastActivity: new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000), // Active within last 6 hours
      }
    ]

    const createdRooms = await Promise.all(
      sampleRooms.map(room =>
        prisma.room.create({
          data: room
        })
      )
    )

    // Add user as member to the first room (not owner)
    if (createdRooms.length > 0) {
      await prisma.roomMember.create({
        data: {
          roomId: createdRooms[0].id,
          userId: user.id,
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: `Created ${createdActivities.length} sample activities and ${createdRooms.length} sample rooms`,
      activities: createdActivities,
      rooms: createdRooms
    })

  } catch (error) {
    console.error('Error seeding dashboard data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}