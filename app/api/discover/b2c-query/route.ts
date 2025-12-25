import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'
import { GeminiB2CQuery, B2CUserProfile } from '@/lib/ai/gemini-b2c-query'

// Admin emails that have access to B2C discovery
const ADMIN_EMAILS = ['23560004@gm.uit.edu.vn', '23520362@gm.uit.edu.vn']

export async function POST(request: NextRequest) {
  const startTime = Date.now()

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
            // Not needed for this request
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
      return NextResponse.json({ error: 'B2C Partner access required' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { query } = body

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // Fetch all users from database
    const users = await prisma.user.findMany({
      where: {
        isProfilePublic: true,
        status: 'ACTIVE',
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
      },
      take: 500
    })

    // Convert to B2CUserProfile format
    const userProfiles: B2CUserProfile[] = users.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      university: user.university,
      major: user.major,
      year: user.year,
      interests: user.interests || [],
      skills: user.skills || [],
      studyGoals: user.studyGoals || [],
      preferredStudyTime: user.preferredStudyTime || [],
      languages: user.languages || [],
      bio: user.bio,
      gpa: user.gpa,
      averageRating: user.averageRating,
      totalMatches: user.totalMatches,
      subscriptionTier: user.subscriptionTier
    }))

    // Process query with Gemini AI
    const geminiQuery = new GeminiB2CQuery()
    const queryResult = await geminiQuery.queryUsers(query.trim(), userProfiles)

    // Map scored results back to full user data
    const scoredUsersWithData = queryResult.scoredUsers.map(scored => {
      const fullUser = users.find(u => u.id === scored.userId)
      return {
        ...fullUser,
        matchScore: scored.score,
        aiReasoning: scored.reasoning,
        matchedCriteria: scored.matchedCriteria
      }
    }).filter(user => user.id) // Filter out any null matches

    const executionTime = Date.now() - startTime

    return NextResponse.json({
      query: query.trim(),
      extractedCriteria: queryResult.extractedCriteria,
      users: scoredUsersWithData,
      total: scoredUsersWithData.length,
      executionTime,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error processing B2C query:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
