import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'
import { createMockMatchingData, clearMockData } from '@/lib/mock-data/matching-data'

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
          setAll() {},
        },
      }
    )

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Add admin role check here
    // For now, allow any authenticated user to seed data

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'create'
    const clearFirst = searchParams.get('clear') === 'true'

    if (action === 'clear') {
      await clearMockData()
      return NextResponse.json({ 
        message: 'Mock data cleared successfully',
        clearedAt: new Date().toISOString()
      })
    }

    if (action === 'create') {
      // Clear existing data if requested
      if (clearFirst) {
        console.log('🧹 Clearing existing mock data first...')
        await clearMockData()
      }

      // Create mock data
      const mockData = await createMockMatchingData()
      
      return NextResponse.json({
        message: 'Mock matching data created successfully',
        data: {
          users: mockData.users.length,
          matches: mockData.matches.length,
          messages: mockData.messages.length,
          rooms: mockData.rooms.length,
          badges: mockData.badges.length,
          achievements: mockData.achievements.length,
          ratings: mockData.ratings.length
        },
        createdAt: new Date().toISOString()
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Error seeding matching data:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

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

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current data counts
    const [
      userCount,
      matchCount,
      messageCount,
      roomCount,
      badgeCount,
      achievementCount,
      ratingCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.match.count(),
      prisma.message.count(),
      prisma.room.count(),
      prisma.badge.count(),
      prisma.achievement.count(),
      prisma.rating.count()
    ])

    return NextResponse.json({
      currentData: {
        users: userCount,
        matches: matchCount,
        messages: messageCount,
        rooms: roomCount,
        badges: badgeCount,
        achievements: achievementCount,
        ratings: ratingCount
      },
      checkedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error getting data counts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
