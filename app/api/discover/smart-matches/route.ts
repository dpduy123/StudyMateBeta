import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'
import { GeminiMatcher, UserProfile } from '@/lib/ai/gemini-matcher'
import { matchCache } from '@/lib/ai/match-cache'
import { matchLogger, MatchingAnalytics } from '@/lib/ai/logger'
import { getOpikClient, flushTraces, scoreTrace } from '@/lib/ai/opik'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const opik = getOpikClient()

  // Create top-level Opik trace for the entire request
  const trace = opik?.trace({
    name: 'smart_matches_request',
    input: { endpoint: 'GET /api/discover/smart-matches' },
    metadata: {
      environment: process.env.NODE_ENV || 'development',
      feature: 'smart_matching',
    },
  })

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
      trace?.update({ output: { error: 'Unauthorized' }, metadata: { status: 401 } })
      trace?.end()
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const excludeIds = searchParams.get('exclude_ids')?.split(',').filter(Boolean) || []

    trace?.update({ input: { userId: currentUser.id, limit, excludeIdsCount: excludeIds.length } })

    matchLogger.info('Smart matches API called', {
      userId: currentUser.id,
      operation: 'get-matches',
      metadata: { limit }
    })

    // Check cache first
    const cachedMatches = matchCache.get(currentUser.id)

    if (cachedMatches && cachedMatches.length > 0) {
      const remaining = matchCache.getRemainingCount(currentUser.id)
      matchLogger.cacheHit(currentUser.id, remaining, cachedMatches.length)
      MatchingAnalytics.recordCacheHit(Date.now() - startTime)

      // Opik: trace cache hit
      const cacheSpan = trace?.span({
        name: 'cache_lookup',
        type: 'general',
        input: { userId: currentUser.id },
      })
      cacheSpan?.update({ output: { hit: true, remaining, total: cachedMatches.length } })
      cacheSpan?.score({ name: 'cache_hit', value: 1.0 })
      cacheSpan?.end()

      // Return cached matches with their scores
      const matches = cachedMatches.slice(0, limit).map(cached => ({
        id: cached.userId,
        firstName: cached.profileData?.firstName || '',
        lastName: cached.profileData?.lastName || '',
        email: cached.profileData?.email || '',
        avatar: cached.profileData?.avatar,
        bio: cached.profileData?.bio,
        university: cached.profileData?.university || '',
        major: cached.profileData?.major || '',
        year: cached.profileData?.year || 1,
        gpa: cached.profileData?.gpa,
        interests: cached.profileData?.interests || [],
        skills: cached.profileData?.skills || [],
        studyGoals: cached.profileData?.studyGoals || [],
        preferredStudyTime: cached.profileData?.preferredStudyTime || [],
        languages: cached.profileData?.languages || [],
        totalMatches: cached.profileData?.totalMatches || 0,
        successfulMatches: cached.profileData?.successfulMatches || 0,
        averageRating: cached.profileData?.averageRating || 0,
        createdAt: cached.profileData?.createdAt || new Date().toISOString(),
        matchScore: cached.score,
        distance: '2.5 km',
        isOnline: cached.profileData?.lastActive ? isUserOnline(cached.profileData.lastActive) : false
      }))

      const executionTime = Date.now() - startTime
      matchLogger.requestSummary(currentUser.id, 'get-matches', {
        totalDuration: executionTime,
        source: 'cache',
        cacheHit: true,
        matchesReturned: matches.length,
        remaining: matchCache.getRemainingCount(currentUser.id)
      })

      // Opik: finalize trace for cache hit path
      trace?.update({
        output: { source: 'cache', matchesReturned: matches.length, remaining: matchCache.getRemainingCount(currentUser.id) },
        metadata: { latencyMs: executionTime, source: 'cache', status: 'success' },
      })
      scoreTrace(trace!, 'latency', Math.max(0, 1 - executionTime / 5000), `${executionTime}ms`)
      trace?.end()
      flushTraces()

      return NextResponse.json({
        matches,
        totalAvailable: cachedMatches.length,
        remaining: matchCache.getRemainingCount(currentUser.id),
        source: 'cache',
        executionTime
      })
    }

    // Cache miss - fetch and sort with Gemini AI
    matchLogger.cacheMiss(currentUser.id)
    MatchingAnalytics.recordCacheMiss()

    // Opik: trace cache miss
    const cacheMissSpan = trace?.span({
      name: 'cache_lookup',
      type: 'general',
      input: { userId: currentUser.id },
    })
    cacheMissSpan?.update({ output: { hit: false } })
    cacheMissSpan?.score({ name: 'cache_hit', value: 0.0 })
    cacheMissSpan?.end()

    // Get processed user IDs to exclude
    const processedIds = matchCache.getProcessedUserIds(currentUser.id)
    const allExcludeIds = [...new Set([...excludeIds, ...processedIds])]

    const dbStartTime = Date.now()
    const dbSpan = trace?.span({
      name: 'database_fetch_candidates',
      type: 'general',
      input: { userId: currentUser.id, excludeCount: allExcludeIds.length, limit: 30 },
    })
    let result = await getSingleOptimizedMatches(
      currentUser.id,
      allExcludeIds,
      30 // Always fetch 30 for Gemini sorting
    )
    const dbDuration = Date.now() - dbStartTime
    dbSpan?.update({
      output: { candidatesFound: result.candidateUsers.length, hasProfile: !!result.currentUserProfile },
      metadata: { latencyMs: dbDuration },
    })
    dbSpan?.end()
    matchLogger.dbQuery('fetch-candidates', dbDuration, result.candidateUsers.length)

    if (!result.currentUserProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // If no candidates found, clear cache and retry without PASS exclusions
    if (result.candidateUsers.length === 0) {
      console.log(`⚠️ No candidates found with current exclusions`)
      console.log(`🔄 Clearing cache and retrying without PASS exclusions...`)
      matchCache.clear(currentUser.id)

      result = await getSingleOptimizedMatches(
        currentUser.id,
        [], // Empty exclude list - only exclude ACCEPTED/BLOCKED/PENDING from DB query
        30
      )

      if (result.candidateUsers.length === 0) {
        console.log(`⚠️ Still no candidates found - truly no matches available`)
        return NextResponse.json({
          matches: [],
          totalAvailable: 0,
          remaining: 0,
          source: 'database',
          executionTime: Date.now() - startTime,
          message: 'No more users available. All users have been matched or blocked.'
        })
      }

      console.log(`✅ Found ${result.candidateUsers.length} candidates after cache clear`)
    }

    const { currentUserProfile, candidateUsers } = result

    // Sort using Gemini AI
    const geminiStartTime = Date.now()
    matchLogger.geminiStart(currentUser.id, candidateUsers.length)

    const geminiSpan = trace?.span({
      name: 'gemini_ai_sort',
      type: 'llm',
      input: {
        model: 'gemini-2.0-flash-exp',
        candidateCount: candidateUsers.length,
        userId: currentUser.id,
      },
    })

    const gemini = new GeminiMatcher()
    const userProfile: UserProfile = {
      id: currentUserProfile.id,
      firstName: currentUserProfile.firstName,
      lastName: currentUserProfile.lastName,
      university: currentUserProfile.university,
      major: currentUserProfile.major,
      year: currentUserProfile.year,
      interests: currentUserProfile.interests,
      skills: currentUserProfile.skills,
      studyGoals: currentUserProfile.studyGoals,
      preferredStudyTime: currentUserProfile.preferredStudyTime,
      languages: currentUserProfile.languages,
      bio: currentUserProfile.bio,
      gpa: currentUserProfile.gpa
    }

    const candidateProfiles: UserProfile[] = candidateUsers.map(c => ({
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      university: c.university,
      major: c.major,
      year: c.year,
      interests: c.interests,
      skills: c.skills,
      studyGoals: c.studyGoals,
      preferredStudyTime: c.preferredStudyTime,
      languages: c.languages,
      bio: c.bio || undefined,
      gpa: c.gpa || undefined
    }))

    const sortedResults = await gemini.sortCandidatesByCompatibility(userProfile, candidateProfiles)
    const geminiDuration = Date.now() - geminiStartTime

    geminiSpan?.update({
      output: { sortedCount: sortedResults.length, topScore: sortedResults[0]?.score, bottomScore: sortedResults[sortedResults.length - 1]?.score },
      metadata: { latencyMs: geminiDuration, model: 'gemini-2.0-flash-exp' },
    })
    geminiSpan?.score({ name: 'latency', value: Math.max(0, 1 - geminiDuration / 10000), reason: `${geminiDuration}ms` })
    geminiSpan?.score({ name: 'completeness', value: sortedResults.length / candidateProfiles.length, reason: `${sortedResults.length}/${candidateProfiles.length} candidates scored` })
    geminiSpan?.end()

    matchLogger.geminiSuccess(currentUser.id, geminiDuration, sortedResults.length)
    MatchingAnalytics.recordGeminiCall(geminiDuration, true)

    // Map sorted results to full candidate data
    const candidateMap = new Map(candidateUsers.map(c => [c.id, c]))
    const sortedMatches = sortedResults
      .map(result => {
        const candidate = candidateMap.get(result.userId)
        if (!candidate) return null
        return {
          userId: result.userId,
          score: result.score,
          reasoning: result.reasoning,
          profileData: candidate
        }
      })
      .filter(Boolean) as any[]

    // Cache the sorted matches
    matchCache.set(currentUser.id, sortedMatches, false)
    console.log(`💾 Cached ${sortedMatches.length} sorted matches`)

    // Return first batch to client
    const matches = sortedMatches.slice(0, limit).map(match => {
      const candidate = match.profileData
      return {
        id: match.userId,
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
        createdAt: candidate.createdAt.toISOString(),
        matchScore: Math.round(match.score),
        distance: '2.5 km',
        isOnline: isUserOnline(candidate.lastActive)
      }
    })

    const executionTime = Date.now() - startTime
    matchLogger.requestSummary(currentUser.id, 'get-matches', {
      totalDuration: executionTime,
      source: 'gemini_ai',
      cacheHit: false,
      matchesReturned: matches.length,
      remaining: sortedMatches.length,
      geminiDuration,
      dbDuration
    })

    // Opik: finalize trace for AI path
    trace?.update({
      output: {
        source: 'gemini_ai',
        matchesReturned: matches.length,
        totalSorted: sortedMatches.length,
        topScore: sortedResults[0]?.score,
      },
      metadata: {
        latencyMs: executionTime,
        dbLatencyMs: dbDuration,
        geminiLatencyMs: geminiDuration,
        source: 'gemini_ai',
        status: 'success',
        candidateCount: candidateUsers.length,
      },
    })
    scoreTrace(trace!, 'overall_latency', Math.max(0, 1 - executionTime / 10000), `${executionTime}ms total`)
    scoreTrace(trace!, 'match_quality', sortedResults[0]?.score ? sortedResults[0].score / 100 : 0, `Top score: ${sortedResults[0]?.score}`)
    trace?.end()
    flushTraces()

    return NextResponse.json({
      matches,
      totalAvailable: sortedMatches.length,
      remaining: sortedMatches.length,
      excludedCount: allExcludeIds.length,
      source: 'gemini_ai',
      executionTime,
      geminiTime: geminiDuration,
      dbTime: dbDuration
    })

  } catch (error) {
    console.error('Error in smart matches API:', error)
    // Opik: trace error
    trace?.update({
      output: { error: error instanceof Error ? error.message : 'Unknown error' },
      metadata: { status: 'error', latencyMs: Date.now() - startTime },
    })
    trace?.end()
    flushTraces()
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
      // Only exclude ACCEPTED and BLOCKED matches, not REJECTED (Pass)
      sentMatches: {
        where: {
          status: {
            in: ['ACCEPTED', 'BLOCKED', 'PENDING']
          }
        },
        select: { receiverId: true, status: true }
      },
      receivedMatches: {
        where: {
          status: {
            in: ['ACCEPTED', 'BLOCKED', 'PENDING']
          }
        },
        select: { senderId: true, status: true }
      }
    }
  })

  console.log(`[DB Query 1] Completed in ${Date.now() - queryStartTime}ms`)

  if (!queryResult) {
    throw new Error('Current user not found')
  }

  // Extract excluded IDs (only ACCEPTED, BLOCKED, PENDING - NOT REJECTED)
  const matchedUserIds = [
    ...queryResult.sentMatches.map(m => m.receiverId),
    ...queryResult.receivedMatches.map(m => m.senderId)
  ]
  
  const allExcludedIds = [...new Set([...matchedUserIds, ...excludeIds, currentUserId])]
  console.log(`[DEBUG] Excluded IDs count: ${allExcludedIds.length}`, allExcludedIds.slice(0, 5))

  // Get candidate users in single query
  console.log(`[DB Query 2] Finding candidate users with limit: ${limit}`)
  const candidatesStartTime = Date.now()

  const candidateUsers = await prisma.user.findMany({
    where: {
      id: { notIn: allExcludedIds },
      isProfilePublic: true,
      lastActive: {
        gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) // Last 60 days
      }
    },
    take: limit, // Use limit directly (30 for Gemini sorting)
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

async function handleBatchActions(userId: string, actions: Array<{targetUserId: string, action: 'LIKE' | 'PASS'}>) {
  const results = []

  // Process all actions
  for (const { targetUserId, action } of actions) {
    try {
      // Pop from cache
      matchCache.pop(userId)
      const remaining = matchCache.getRemainingCount(userId)
      matchLogger.userAction(userId, action, targetUserId, remaining)

      const result = await processSingleAction(userId, targetUserId, action)
      results.push({ targetUserId, action, ...result })
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

  // Check if prefetch needed (after 10 actions, remaining = 20)
  const remaining = matchCache.getRemainingCount(userId)
  const shouldPrefetch = matchCache.shouldPrefetch(userId)

  if (shouldPrefetch) {
    matchLogger.prefetchStart(userId, remaining)
    matchCache.markPrefetchTriggered(userId)
    MatchingAnalytics.recordPrefetch()

    // Prefetch in background (don't await)
    prefetchMatches(userId).catch(err => {
      matchLogger.error('Prefetch failed', err, { userId, operation: 'prefetch' })
    })
  }

  return NextResponse.json({
    success: true,
    results,
    processed: results.length,
    remaining,
    prefetchTriggered: shouldPrefetch
  })
}

// Background prefetch function
async function prefetchMatches(userId: string) {
  const startTime = Date.now()

  try {
    // Get excluded IDs
    const processedIds = matchCache.getProcessedUserIds(userId)

    // Fetch 30 new candidates
    let prefetchResult = await getSingleOptimizedMatches(userId, processedIds, 30)

    if (!prefetchResult.currentUserProfile || prefetchResult.candidateUsers.length === 0) {
      matchLogger.warn('No more candidates for prefetch with current exclusions', { userId, operation: 'prefetch' })

      // Clear cache and retry without PASS exclusions
      console.log(`🔄 [Prefetch] Clearing cache and retrying without PASS exclusions...`)
      matchCache.clear(userId)

      prefetchResult = await getSingleOptimizedMatches(userId, [], 30)

      if (!prefetchResult.currentUserProfile || prefetchResult.candidateUsers.length === 0) {
        matchLogger.warn('No more candidates even after cache clear', { userId, operation: 'prefetch' })
        return
      }

      console.log(`✅ [Prefetch] Found ${prefetchResult.candidateUsers.length} candidates after cache clear`)
    }

    const { currentUserProfile, candidateUsers } = prefetchResult

    // Sort with Gemini
    const gemini = new GeminiMatcher()
    const userProfile: UserProfile = {
      id: currentUserProfile.id,
      firstName: currentUserProfile.firstName,
      lastName: currentUserProfile.lastName,
      university: currentUserProfile.university,
      major: currentUserProfile.major,
      year: currentUserProfile.year,
      interests: currentUserProfile.interests,
      skills: currentUserProfile.skills,
      studyGoals: currentUserProfile.studyGoals,
      preferredStudyTime: currentUserProfile.preferredStudyTime,
      languages: currentUserProfile.languages,
      bio: currentUserProfile.bio,
      gpa: currentUserProfile.gpa
    }

    const candidateProfiles: UserProfile[] = candidateUsers.map(c => ({
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      university: c.university,
      major: c.major,
      year: c.year,
      interests: c.interests,
      skills: c.skills,
      studyGoals: c.studyGoals,
      preferredStudyTime: c.preferredStudyTime,
      languages: c.languages,
      bio: c.bio || undefined,
      gpa: c.gpa || undefined
    }))

    const sortedResults = await gemini.sortCandidatesByCompatibility(userProfile, candidateProfiles)

    // Map to cache format
    const candidateMap = new Map(candidateUsers.map(c => [c.id, c]))
    const sortedMatches = sortedResults
      .map(result => {
        const candidate = candidateMap.get(result.userId)
        if (!candidate) return null
        return {
          userId: result.userId,
          score: result.score,
          reasoning: result.reasoning,
          profileData: candidate
        }
      })
      .filter(Boolean) as any[]

    // Append to existing cache (don't merge)
    matchCache.set(userId, sortedMatches, true)

    const duration = Date.now() - startTime
    const totalInCache = matchCache.getRemainingCount(userId) + sortedMatches.length
    matchLogger.prefetchSuccess(userId, duration, sortedMatches.length, totalInCache)
  } catch (error) {
    const duration = Date.now() - startTime
    matchLogger.prefetchError(userId, error, duration)
  }
}

async function handleSingleAction(userId: string, targetUserId: string, action: 'LIKE' | 'PASS') {
  const result = await processSingleAction(userId, targetUserId, action)
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

  // Get sender info for notification
  const senderData = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      firstName: true,
      lastName: true,
      avatar: true,
      university: true
    }
  })

  // Create match record
  const match = await prisma.match.create({
    data: {
      senderId: userId,
      receiverId: targetUserId,
      status: action === 'LIKE' ? 'PENDING' : 'REJECTED',
      createdAt: new Date()
    }
  })

  // If this is a LIKE, create notification and check for mutual match
  if (action === 'LIKE') {
    // Create notification for the receiver
    await prisma.notification.create({
      data: {
        userId: targetUserId,
        type: 'MATCH_REQUEST',
        title: 'Yeu cau ket noi moi',
        message: `${senderData?.firstName} ${senderData?.lastName} muon ket noi voi ban`,
        relatedUserId: userId,
        relatedMatchId: match.id,
        metadata: {
          senderName: `${senderData?.firstName} ${senderData?.lastName}`,
          senderAvatar: senderData?.avatar,
          senderUniversity: senderData?.university
        }
      }
    })

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
        data: {
          status: 'ACCEPTED',
          respondedAt: new Date()
        }
      })

      // Create notification for both users about the mutual match
      await prisma.notification.create({
        data: {
          userId: targetUserId,
          type: 'MATCH_ACCEPTED',
          title: 'Ket noi thanh cong!',
          message: `Ban va ${senderData?.firstName} ${senderData?.lastName} da ket noi thanh cong`,
          relatedUserId: userId,
          relatedMatchId: match.id,
          metadata: {
            matchedUserName: `${senderData?.firstName} ${senderData?.lastName}`,
            matchedUserAvatar: senderData?.avatar
          }
        }
      })

      // Get receiver data for notification to sender
      const receiverData = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: {
          firstName: true,
          lastName: true,
          avatar: true
        }
      })

      await prisma.notification.create({
        data: {
          userId: userId,
          type: 'MATCH_ACCEPTED',
          title: 'Ket noi thanh cong!',
          message: `Ban va ${receiverData?.firstName} ${receiverData?.lastName} da ket noi thanh cong`,
          relatedUserId: targetUserId,
          relatedMatchId: reciprocalMatch.id,
          metadata: {
            matchedUserName: `${receiverData?.firstName} ${receiverData?.lastName}`,
            matchedUserAvatar: receiverData?.avatar
          }
        }
      })

      // Update successfulMatches count for both users
      await prisma.user.update({
        where: { id: userId },
        data: {
          successfulMatches: { increment: 1 }
        }
      })

      await prisma.user.update({
        where: { id: targetUserId },
        data: {
          successfulMatches: { increment: 1 }
        }
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

function isUserOnline(lastActive: Date): boolean {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
  return lastActive > fiveMinutesAgo
}