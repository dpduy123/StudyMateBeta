import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'
import { RedisCache } from '@/lib/cache/redis-client'
import { MatchPrecomputationService } from '@/lib/jobs/match-precomputation'
import { UserProfile } from '@/components/profile/types'

export async function GET(request: NextRequest) {
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
          setAll() {},
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
    const excludeIds = searchParams.get('exclude_ids')?.split(',').filter(Boolean) || []
    const forceRefresh = searchParams.get('force_refresh') === 'true'

    console.log(`Smart matches API called for user ${currentUser.id}, limit: ${limit}, excludeIds: ${excludeIds.length}`)

    // Temporarily disable Redis for testing optimized queries
    const redis = null // RedisCache.getInstance()
    console.log('Redis disabled for testing - using optimized database queries only')

    // Skip Redis cache check for now
    // const cachedMatches = await redis.getUserMatches(currentUser.id, excludeIds)

    // Single optimized query to get everything at once
    console.log(`[MAIN] Starting getSingleOptimizedMatches...`)
    const dbStartTime = Date.now()
    const { currentUserProfile, candidateUsers } = await getSingleOptimizedMatches(currentUser.id, excludeIds, limit)
    console.log(`[MAIN] Database queries completed in ${Date.now() - dbStartTime}ms`)
    
    if (!currentUserProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Compute all scores in one go (skip Redis complexity for now)
    console.log(`[MAIN] Computing scores for ${candidateUsers.length} candidates...`)
    const scoringStartTime = Date.now()
    const scoredCandidates = candidateUsers.map(candidate => {
      const score = computeMatchScore(currentUserProfile, candidate)
      return { candidate, score }
    })
    console.log(`[MAIN] Scoring completed in ${Date.now() - scoringStartTime}ms`)

    // Sort by score and take top matches
    const sortedMatches = scoredCandidates
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    // Convert to MatchingUser format
    const matches = sortedMatches.map(({ candidate, score }) => ({
      id: candidate.id,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
      avatar: candidate.avatar || undefined, // Fix: null -> undefined
      bio: candidate.bio || undefined, // Fix: null -> undefined
      university: candidate.university,
      major: candidate.major,
      year: candidate.year,
      gpa: candidate.gpa || undefined, // Fix: null -> undefined
      interests: candidate.interests,
      skills: candidate.skills,
      studyGoals: candidate.studyGoals,
      preferredStudyTime: candidate.preferredStudyTime,
      languages: candidate.languages,
      totalMatches: candidate.totalMatches,
      successfulMatches: candidate.successfulMatches,
      averageRating: candidate.averageRating,
      createdAt: candidate.createdAt.toISOString(),
      matchScore: Math.round(score),
      distance: '2.5 km', // Mock data - implement geolocation later
      isOnline: isUserOnline(candidate.lastActive)
    }))

    // Try to cache results (disabled for testing)
    // try {
    //   if (redis) {
    //     await redis.cacheUserMatches(currentUser.id, matches, excludeIds)
    //   }
    // } catch (error) {
    //   console.log('Redis cache failed (non-blocking):', error instanceof Error ? error.message : error)
    // }

    const executionTime = Date.now() - startTime
    console.log(`Smart matches API completed in ${executionTime}ms, returning ${matches.length} matches`)

    return NextResponse.json({
      matches,
      totalAvailable: candidateUsers.length,
      excludedCount: 0, // Will be calculated in optimized query
      source: 'optimized_single_query',
      executionTime,
      precomputedScores: 0,
      realtimeScores: matches.length
    })

  } catch (error) {
    console.error('Error in smart matches API:', error)
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
          setAll() {},
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

    const body = await request.json()

    // Handle batch actions
    if (body.actions && Array.isArray(body.actions)) {
      return await handleBatchActions(currentUser.id, body.actions)
    }

    // Handle single action (backward compatibility)
    const { action, targetUserId } = body
    if (!targetUserId || !['LIKE', 'PASS'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action or target user' }, { status: 400 })
    }

    return await handleSingleAction(currentUser.id, targetUserId, action)

  } catch (error) {
    console.error('Error in smart matches POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// OPTIMIZED SINGLE QUERY FUNCTION
async function getSingleOptimizedMatches(currentUserId: string, excludeIds: string[], limit: number) {
  console.log(`[DB Query 1] Finding current user: ${currentUserId}`)
  const queryStartTime = Date.now()
  
  const queryResult = await prisma.user.findFirst({
    where: { id: currentUserId },
    include: {
      // Get current user profile data
      sentMatches: {
        select: { receiverId: true }
      },
      receivedMatches: {
        select: { senderId: true }
      }
    }
  })

  console.log(`[DB Query 1] Completed in ${Date.now() - queryStartTime}ms`)
  
  if (!queryResult) {
    throw new Error('Current user not found')
  }

  // Extract excluded IDs from matches
  const matchedUserIds = [
    ...queryResult.sentMatches.map(m => m.receiverId),
    ...queryResult.receivedMatches.map(m => m.senderId)
  ]
  
  const allExcludedIds = [...new Set([...matchedUserIds, ...excludeIds, currentUserId])]
  console.log(`[DEBUG] Excluded IDs count: ${allExcludedIds.length}`, allExcludedIds.slice(0, 5))

  // Get candidate users in single query
  console.log(`[DB Query 2] Finding candidate users with limit: ${limit * 2}`)
  const candidatesStartTime = Date.now()
  
  const candidateUsers = await prisma.user.findMany({
    where: {
      id: { notIn: allExcludedIds },
      isProfilePublic: true,
      lastActive: {
        gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) // Last 60 days
      }
    },
    take: limit * 2, // Get more to ensure good matches after scoring
    orderBy: { lastActive: 'desc' }
  })

  console.log(`[DB Query 2] Completed in ${Date.now() - candidatesStartTime}ms`)
  console.log(`[DEBUG] Found ${candidateUsers.length} candidate users`)

  // Convert current user to UserProfile format
  const currentUserProfile = {
    id: queryResult.id,
    firstName: queryResult.firstName,
    lastName: queryResult.lastName,
    email: queryResult.email,
    avatar: queryResult.avatar || undefined,
    bio: queryResult.bio || undefined,
    university: queryResult.university,
    major: queryResult.major,
    year: queryResult.year,
    gpa: queryResult.gpa || undefined,
    interests: queryResult.interests,
    skills: queryResult.skills,
    studyGoals: queryResult.studyGoals,
    preferredStudyTime: queryResult.preferredStudyTime,
    languages: queryResult.languages,
    totalMatches: queryResult.totalMatches,
    successfulMatches: queryResult.successfulMatches,
    averageRating: queryResult.averageRating,
    createdAt: queryResult.createdAt.toISOString()
  }

  return { currentUserProfile, candidateUsers }
}

// SIMPLIFIED MATCH SCORING (no external imports needed)
function computeMatchScore(currentUser: any, candidate: any): number {
  let score = 0
  
  // University match (20%)
  if (currentUser.university === candidate.university) {
    score += 20
  } else {
    score += 5 // Different university but still some points
  }
  
  // Major match (25%)
  if (currentUser.major === candidate.major) {
    score += 25
  } else {
    // Check for related majors
    const relatedMajors: Record<string, string[]> = {
      'Computer Science': ['Software Engineering', 'Information Technology'],
      'Business': ['Marketing', 'Economics'],
      'Engineering': ['Computer Science', 'Software Engineering']
    }
    const related = relatedMajors[currentUser.major as string] || []
    if (related.includes(candidate.major)) {
      score += 15
    } else {
      score += 5
    }
  }
  
  // Year compatibility (15%)
  const yearDiff = Math.abs(currentUser.year - candidate.year)
  if (yearDiff === 0) score += 15
  else if (yearDiff === 1) score += 12
  else if (yearDiff === 2) score += 8
  else score += 3
  
  // Interests overlap (20%)
  const userInterests = (currentUser.interests as string[]) || []
  const candidateInterests = (candidate.interests as string[]) || []
  const commonInterests = userInterests.filter(interest => 
    candidateInterests.includes(interest)
  ).length
  const maxInterests = Math.max(userInterests.length || 1, candidateInterests.length || 1)
  score += (commonInterests / maxInterests) * 20
  
  // Skills overlap (10%)
  const userSkills = (currentUser.skills as string[]) || []
  const candidateSkills = (candidate.skills as string[]) || []
  const commonSkills = userSkills.filter(skill => 
    candidateSkills.includes(skill)
  ).length
  const maxSkills = Math.max(userSkills.length || 1, candidateSkills.length || 1)
  score += (commonSkills / maxSkills) * 10
  
  // Study time compatibility (10%)
  const userTimes = (currentUser.preferredStudyTime as string[]) || []
  const candidateTimes = (candidate.preferredStudyTime as string[]) || []
  const commonTimes = userTimes.filter(time => 
    candidateTimes.includes(time)
  ).length
  const maxTimes = Math.max(userTimes.length || 1, candidateTimes.length || 1)
  score += (commonTimes / maxTimes) * 10
  
  return Math.min(100, Math.max(10, score)) // Ensure score is between 10-100
}

// Helper methods for the API
async function getCurrentUserProfile(userId: string, redis: RedisCache): Promise<UserProfile | null> {
  // Try cache first
  const cachedProfile = await redis.getUserProfile(userId)
  if (cachedProfile) {
    return cachedProfile
  }

  // Get from database
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user) return null

  const profile: UserProfile = {
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
  }

  // Cache for future use
  await redis.cacheUserProfile(userId, profile)

  return profile
}

async function getAllExcludedIds(userId: string, additionalExcludeIds: string[]): Promise<string[]> {
  const existingMatches = await prisma.match.findMany({
    where: {
      OR: [
        { senderId: userId },
        { receiverId: userId }
      ]
    },
    select: {
      senderId: true,
      receiverId: true
    }
  })

  const matchedUserIds = existingMatches.flatMap(match => [
    match.senderId === userId ? match.receiverId : match.senderId
  ])

  return [...new Set([...matchedUserIds, ...additionalExcludeIds, userId])]
}

async function getCandidateUsers(excludedIds: string[], limit: number) {
  return await prisma.user.findMany({
    where: {
      id: {
        notIn: excludedIds
      },
      isProfilePublic: true,
      lastActive: {
        gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) // Last 60 days
      }
    },
    take: limit,
    orderBy: {
      lastActive: 'desc' // Prioritize recently active users
    }
  })
}

async function computeRealTimeScores(
  currentUser: UserProfile,
  candidates: any[]
): Promise<Array<{candidate: any, score: number}>> {
  const { AIMatchingEngine } = await import('@/lib/matching/algorithm')

  return candidates.map(candidate => {
    const candidateProfile: UserProfile = {
      id: candidate.id,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
      avatar: candidate.avatar || undefined,
      bio: candidate.bio || undefined,
      university: candidate.university,
      major: candidate.major,
      year: candidate.year,
      gpa: candidate.gpa || undefined,
      interests: candidate.interests,
      skills: candidate.skills,
      studyGoals: candidate.studyGoals,
      preferredStudyTime: candidate.preferredStudyTime,
      languages: candidate.languages,
      totalMatches: candidate.totalMatches,
      successfulMatches: candidate.successfulMatches,
      averageRating: candidate.averageRating,
      createdAt: candidate.createdAt.toISOString()
    }

    // Calculate match score using existing algorithm
    const universityMatch = AIMatchingEngine.calculateUniversityMatch(currentUser, candidateProfile)
    const majorMatch = AIMatchingEngine.calculateMajorMatch(currentUser, candidateProfile)
    const yearCompatibility = AIMatchingEngine.calculateYearCompatibility(currentUser, candidateProfile)
    const interestsMatch = AIMatchingEngine.calculateInterestsMatch(currentUser, candidateProfile)
    const skillsMatch = AIMatchingEngine.calculateSkillsMatch(currentUser, candidateProfile)
    const studyTimeMatch = AIMatchingEngine.calculateStudyTimeMatch(currentUser, candidateProfile)
    const languageMatch = AIMatchingEngine.calculateLanguageMatch(currentUser, candidateProfile)

    const score =
      universityMatch * 0.15 +
      majorMatch * 0.20 +
      yearCompatibility * 0.10 +
      interestsMatch * 0.20 +
      skillsMatch * 0.15 +
      studyTimeMatch * 0.15 +
      languageMatch * 0.05

    return { candidate, score }
  })
}

async function handleBatchActions(userId: string, actions: Array<{targetUserId: string, action: 'LIKE' | 'PASS'}>) {
  const results = []
  const redis = RedisCache.getInstance()

  // Process all actions in a transaction
  for (const { targetUserId, action } of actions) {
    try {
      const result = await processSingleAction(userId, targetUserId, action)
      results.push({ targetUserId, action, ...result })

      // SmartMatchingEngine buffer updates are handled client-side

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      results.push({
        targetUserId,
        action,
        error: errorMessage,
        match: false
      })
    }
  }

  return NextResponse.json({
    success: true,
    results,
    processed: results.length
  })
}

async function handleSingleAction(userId: string, targetUserId: string, action: 'LIKE' | 'PASS') {
  const result = await processSingleAction(userId, targetUserId, action)

  // SmartMatchingEngine buffer updates are handled client-side

  return NextResponse.json(result)
}

async function processSingleAction(userId: string, targetUserId: string, action: 'LIKE' | 'PASS') {
  // Check if match already exists
  const existingMatch = await prisma.match.findFirst({
    where: {
      OR: [
        { senderId: userId, receiverId: targetUserId },
        { senderId: targetUserId, receiverId: userId }
      ]
    }
  })

  if (existingMatch) {
    return { match: false, message: 'Match already exists' }
  }

  // Create match record
  const match = await prisma.match.create({
    data: {
      senderId: userId,
      receiverId: targetUserId,
      status: action === 'LIKE' ? 'PENDING' : 'REJECTED',
      createdAt: new Date()
    }
  })

  // If this is a LIKE, check for mutual match
  if (action === 'LIKE') {
    const reciprocalMatch = await prisma.match.findFirst({
      where: {
        senderId: targetUserId,
        receiverId: userId,
        status: 'PENDING'
      }
    })

    if (reciprocalMatch) {
      // Mutual match! Update both to ACCEPTED
      await prisma.match.updateMany({
        where: {
          OR: [
            { id: match.id },
            { id: reciprocalMatch.id }
          ]
        },
        data: { status: 'ACCEPTED' }
      })

      return {
        match: true,
        message: 'It\'s a match! You can now message each other.'
      }
    }
  }

  return {
    match: false,
    message: action === 'LIKE' ? 'Like sent successfully' : 'User passed'
  }
}

function calculateAge(createdAt: Date): number {
  // This is a placeholder - you'd need actual birthdate
  return Math.floor(18 + Math.random() * 8) // Random age 18-25
}

function isUserOnline(lastActive: Date): boolean {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
  return lastActive > fiveMinutesAgo
}