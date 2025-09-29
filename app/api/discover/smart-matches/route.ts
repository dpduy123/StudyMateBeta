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

    // Initialize Redis cache
    const redis = RedisCache.getInstance()

    // SmartMatchingEngine buffer is handled client-side only
    // Server-side focuses on Redis cache and database queries

    // Check Redis cache
    const cachedMatches = await redis.getUserMatches(currentUser.id, excludeIds)
    if (cachedMatches && !forceRefresh) {
      // Check if cache is still valid (less than 30 minutes old)
      const cacheAge = Date.now() - cachedMatches.timestamp
      if (cacheAge < 30 * 60 * 1000) { // 30 minutes
        console.log(`Returning ${cachedMatches.matches.length} matches from Redis cache`)

        return NextResponse.json({
          matches: cachedMatches.matches.slice(0, limit),
          source: 'redis',
          cacheAge: Math.floor(cacheAge / 1000),
          executionTime: Date.now() - startTime
        })
      }
    }

    // Get current user profile
    const currentUserProfile = await getCurrentUserProfile(currentUser.id, redis)
    if (!currentUserProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Get excluded user IDs (matches + manual excludes)
    const allExcludedIds = await getAllExcludedIds(currentUser.id, excludeIds)

    // Try to get pre-computed scores from Redis
    const candidateUsers = await getCandidateUsers(allExcludedIds, limit * 3)

    // Check for pre-computed scores
    const userPairs = candidateUsers.map(candidate => ({
      userId1: currentUser.id,
      userId2: candidate.id
    }))

    const precomputedScores = await redis.batchGetMatchScores(userPairs)
    console.log(`Found ${precomputedScores.size} pre-computed scores out of ${candidateUsers.length} candidates`)

    // Separate candidates with and without pre-computed scores
    const candidatesWithScores: Array<{candidate: any, score: number}> = []
    const candidatesWithoutScores: any[] = []

    for (const candidate of candidateUsers) {
      const pairKey = `${currentUser.id}:${candidate.id}`
      const precomputedScore = precomputedScores.get(pairKey)

      if (precomputedScore !== undefined) {
        candidatesWithScores.push({ candidate, score: precomputedScore })
      } else {
        candidatesWithoutScores.push(candidate)
      }
    }

    // If we have candidates without pre-computed scores, trigger background computation
    if (candidatesWithoutScores.length > 0) {
      const precompService = MatchPrecomputationService.getInstance()
      await precompService.schedulePrecomputation(currentUser.id, 'high')

      console.log(`Triggered background precomputation for ${candidatesWithoutScores.length} candidates`)
    }

    // Compute scores for remaining candidates (real-time fallback)
    const remainingScores = await computeRealTimeScores(
      currentUserProfile,
      candidatesWithoutScores.slice(0, limit) // Limit real-time computation
    )

    // Combine pre-computed and real-time scores
    const allScoredCandidates = [
      ...candidatesWithScores,
      ...remainingScores
    ]

    // Sort by score and take top matches
    const sortedMatches = allScoredCandidates
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    // Convert to MatchingUser format
    const matches = sortedMatches.map(({ candidate, score }) => ({
      id: candidate.id,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
      avatar: candidate.avatar,
      bio: candidate.bio,
      university: candidate.university,
      major: candidate.major,
      year: candidate.year,
      gpa: candidate.gpa,
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

    // Cache results in Redis
    await redis.cacheUserMatches(currentUser.id, matches, allExcludedIds)

    // Note: SmartMatchingEngine buffer is client-side only
    // Server-side initialization would cause fetch issues

    // Cache any newly computed scores
    if (remainingScores.length > 0) {
      const scoresToCache = remainingScores.map(({ candidate, score }) => ({
        userId1: currentUser.id,
        userId2: candidate.id,
        score
      }))
      await redis.batchCacheMatchScores(scoresToCache)
    }

    const executionTime = Date.now() - startTime
    console.log(`Smart matches API completed in ${executionTime}ms, returning ${matches.length} matches`)

    return NextResponse.json({
      matches,
      totalAvailable: candidateUsers.length,
      excludedCount: allExcludedIds.length,
      source: 'computed',
      executionTime,
      precomputedScores: precomputedScores.size,
      realtimeScores: remainingScores.length
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