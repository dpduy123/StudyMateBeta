import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'

// Admin emails that have access to B2C discovery
const ADMIN_EMAILS = ['23560004@gm.uit.edu.vn', '23520362@gm.uit.edu.vn']

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

    // Check if user is admin or has B2C partner access
    const isAdmin = ADMIN_EMAILS.includes(currentUser.email || '')

    if (!isAdmin) {
      // TODO: Add check for B2C partner accounts when that feature is implemented
      // For now, only admins can access
      return NextResponse.json({ error: 'B2C Partner access required' }, { status: 403 })
    }

    // Fetch all users with relevant information
    const users = await prisma.user.findMany({
      where: {
        isProfilePublic: true,
        status: 'ACTIVE',
        // Exclude the current user
        NOT: {
          id: currentUser.id
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        university: true,
        major: true,
        year: true,
        bio: true,
        interests: true,
        skills: true,
        languages: true,
        preferredStudyTime: true,
        studyGoals: true,
        totalMatches: true,
        successfulMatches: true,
        averageRating: true,
        gpa: true,
        status: true,
        subscriptionTier: true,
        isProfilePublic: true,
        lastActive: true,
        createdAt: true,
      },
      orderBy: [
        { subscriptionTier: 'desc' }, // Show premium users first
        { lastActive: 'desc' },        // Then by activity
        { createdAt: 'desc' }          // Then by join date
      ],
      take: 500 // Limit to 500 users for performance
    })

    return NextResponse.json({
      users,
      total: users.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching B2C users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
