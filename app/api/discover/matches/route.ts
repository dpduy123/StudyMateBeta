import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'
import { AIMatchingEngine } from '@/lib/matching/algorithm'
import { UserProfile } from '@/components/profile/types'

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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const excludeIds = searchParams.get('exclude_ids')?.split(',') || []

    // Get current user's profile from database
    const currentUserProfile = await prisma.user.findUnique({
      where: { id: currentUser.id }
    })

    if (!currentUserProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Get users who have already been matched (exclude only ACCEPTED, BLOCKED, PENDING)
    // REJECTED (Pass) users will appear again
    const existingMatches = await prisma.match.findMany({
      where: {
        OR: [
          { senderId: currentUser.id },
          { receiverId: currentUser.id }
        ],
        status: {
          in: ['ACCEPTED', 'BLOCKED', 'PENDING']
        }
      },
      select: {
        senderId: true,
        receiverId: true
      }
    })

    // Extract matched user IDs (excluding REJECTED ones)
    const matchedUserIds = existingMatches.flatMap(match => [
      match.senderId === currentUser.id ? match.receiverId : match.senderId
    ])

    // Combine with manually excluded IDs
    const allExcludedIds = [...new Set([...matchedUserIds, ...excludeIds, currentUser.id])]

    // Get potential matches from database
    const candidateUsers = await prisma.user.findMany({
      where: {
        id: {
          notIn: allExcludedIds
        },
        isProfilePublic: true
      },
      take: limit * 3 // Get more than needed so we can score and filter
    })

    // Convert to UserProfile format
    const currentUserProfileFormatted: UserProfile = {
      id: currentUserProfile.id,
      firstName: currentUserProfile.firstName,
      lastName: currentUserProfile.lastName,
      email: currentUserProfile.email,
      avatar: currentUserProfile.avatar || undefined,
      bio: currentUserProfile.bio || undefined,
      university: currentUserProfile.university,
      major: currentUserProfile.major,
      year: currentUserProfile.year,
      gpa: currentUserProfile.gpa || undefined,
      interests: currentUserProfile.interests,
      skills: currentUserProfile.skills,
      studyGoals: currentUserProfile.studyGoals,
      preferredStudyTime: currentUserProfile.preferredStudyTime,
      languages: currentUserProfile.languages,
      totalMatches: currentUserProfile.totalMatches,
      successfulMatches: currentUserProfile.successfulMatches,
      averageRating: currentUserProfile.averageRating,
      createdAt: currentUserProfile.createdAt.toISOString()
    }

    const candidateUsersFormatted: UserProfile[] = candidateUsers.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatar: user.avatar || undefined,
      bio: user.bio || undefined,
      university: user.university,
      major: user.major,
      year: user.year,
      gpa: user.gpa || undefined,
      interests: user.interests,
      skills: user.skills,
      studyGoals: user.studyGoals,
      preferredStudyTime: user.preferredStudyTime,
      languages: user.languages,
      totalMatches: user.totalMatches,
      successfulMatches: user.successfulMatches,
      averageRating: user.averageRating,
      createdAt: user.createdAt.toISOString()
    }))

    // TEMPORARY: Skip AI matching, just return users in database order
    const matches = candidateUsersFormatted.slice(0, limit).map(user => {
      // Generate a consistent random score between 75-99 for display
      const userSeed = user.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      const randomScore = 75 + (userSeed % 25)

      return {
        ...user,
        matchScore: randomScore,
        distance: '2.5 km', // Mock data
        isOnline: Math.random() > 0.5 // Random online status
      }
    })

    return NextResponse.json({
      matches,
      totalAvailable: candidateUsers.length,
      excludedCount: allExcludedIds.length
    })

  } catch (error) {
    console.error('Error fetching matches:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
            // Not needed for POST request
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

    const { action, targetUserId } = await request.json()

    if (!targetUserId || !['LIKE', 'PASS'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action or target user' }, { status: 400 })
    }

    // Check if match already exists
    const existingMatch = await prisma.match.findFirst({
      where: {
        OR: [
          { senderId: currentUser.id, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: currentUser.id }
        ]
      }
    })

    if (existingMatch) {
      return NextResponse.json({ error: 'Match already exists' }, { status: 400 })
    }

    // Create match record
    const match = await prisma.match.create({
      data: {
        senderId: currentUser.id,
        receiverId: targetUserId,
        status: action === 'LIKE' ? 'PENDING' : 'REJECTED',
        createdAt: new Date()
      }
    })

    // If this is a LIKE, check if the other user has already liked us
    if (action === 'LIKE') {
      const reciprocalMatch = await prisma.match.findFirst({
        where: {
          senderId: targetUserId,
          receiverId: currentUser.id,
          status: 'PENDING'
        }
      })

      if (reciprocalMatch) {
        // Mutual like! Update both matches to ACCEPTED
        await prisma.match.updateMany({
          where: {
            OR: [
              { id: match.id },
              { id: reciprocalMatch.id }
            ]
          },
          data: {
            status: 'ACCEPTED'
          }
        })

        return NextResponse.json({
          match: true,
          message: 'It\'s a match! You can now message each other.'
        })
      }
    }

    return NextResponse.json({
      match: false,
      message: action === 'LIKE' ? 'Like sent successfully' : 'User passed'
    })

  } catch (error) {
    console.error('Error processing match action:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}