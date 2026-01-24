import { getOpikClient, logFeedback, traceAICall } from './opik'

/**
 * Match outcome types for tracking
 */
export type MatchOutcome = 'accepted' | 'rejected' | 'ignored' | 'mutual_match'

/**
 * Match feedback metadata
 */
export interface MatchFeedbackMetadata {
  matchScore?: number
  matchingFactors?: {
    courseOverlap?: number
    scheduleCompatibility?: number
    learningStyleMatch?: number
    aiScore?: number
  }
  timeToDecision?: number // milliseconds from match shown to action
  sessionId?: string
  platform?: 'web' | 'mobile'
  [key: string]: unknown
}

/**
 * Record the outcome of a match for Opik feedback tracking
 * This helps improve the matching algorithm by tracking user decisions
 */
export async function recordMatchOutcome(
  matchId: string,
  userId: string,
  targetUserId: string,
  outcome: MatchOutcome,
  metadata?: MatchFeedbackMetadata
): Promise<void> {
  const client = getOpikClient()

  if (!client) {
    console.warn('⚠️ Opik not configured - match outcome not recorded')
    return
  }

  // Convert outcome to numeric score for Opik
  const outcomeScores: Record<MatchOutcome, number> = {
    mutual_match: 1.0,  // Best outcome - both users liked each other
    accepted: 0.75,     // User liked this match
    ignored: 0.5,       // User didn't interact
    rejected: 0.0,      // User passed on this match
  }

  const score = outcomeScores[outcome]

  try {
    await logFeedback(matchId, score, 'match_outcome', {
      userId,
      targetUserId,
      outcome,
      ...metadata,
      timestamp: new Date().toISOString(),
    })

    console.log(`✅ Match outcome recorded: ${outcome} (score: ${score}) for match ${matchId}`)
  } catch (error) {
    console.error('❌ Failed to record match outcome:', error)
  }
}

/**
 * Record when a mutual match occurs (both users liked each other)
 */
export async function recordMutualMatch(
  matchId: string,
  userAId: string,
  userBId: string,
  metadata?: MatchFeedbackMetadata
): Promise<{ success: boolean; matchId: string; users: string[] }> {
  return traceAICall(
    'mutual_match',
    {
      matchId,
      userAId,
      userBId,
      matchScore: metadata?.matchScore,
    },
    async () => {
      await recordMatchOutcome(matchId, userAId, userBId, 'mutual_match', metadata)

      return {
        success: true,
        matchId,
        users: [userAId, userBId],
      }
    },
    {
      feature: 'matching_feedback',
      eventType: 'mutual_match',
    }
  )
}

/**
 * Record match quality rating from user
 * Called when user rates the quality of a match after connecting
 */
export async function recordMatchQualityRating(
  matchId: string,
  userId: string,
  rating: number, // 1-5 stars
  feedback?: string
): Promise<void> {
  const client = getOpikClient()

  if (!client) {
    console.warn('⚠️ Opik not configured - quality rating not recorded')
    return
  }

  // Normalize rating to 0-1 scale
  const normalizedRating = (rating - 1) / 4

  try {
    await logFeedback(matchId, normalizedRating, 'match_quality', {
      userId,
      originalRating: rating,
      feedback,
      timestamp: new Date().toISOString(),
    })

    console.log(`✅ Match quality rating recorded: ${rating}/5 for match ${matchId}`)
  } catch (error) {
    console.error('❌ Failed to record match quality rating:', error)
  }
}

/**
 * Record conversation engagement after match
 * Tracks if users actually communicate after matching
 */
export async function recordConversationEngagement(
  matchId: string,
  userAId: string,
  userBId: string,
  engagement: {
    messagesExchanged: number
    conversationDuration: number // minutes
    initiatedStudySession: boolean
  }
): Promise<{ tracked: boolean; engagementScore?: number }> {
  return traceAICall(
    'conversation_engagement',
    {
      matchId,
      userAId,
      userBId,
      ...engagement,
    },
    async () => {
      const client = getOpikClient()

      if (!client) {
        return { tracked: false }
      }

      // Calculate engagement score
      let engagementScore = 0
      if (engagement.messagesExchanged >= 5) engagementScore += 0.3
      if (engagement.messagesExchanged >= 20) engagementScore += 0.2
      if (engagement.conversationDuration >= 10) engagementScore += 0.2
      if (engagement.conversationDuration >= 30) engagementScore += 0.1
      if (engagement.initiatedStudySession) engagementScore += 0.2

      await logFeedback(matchId, engagementScore, 'conversation_engagement', {
        userAId,
        userBId,
        ...engagement,
        timestamp: new Date().toISOString(),
      })

      return {
        tracked: true,
        engagementScore,
      }
    },
    {
      feature: 'matching_feedback',
      eventType: 'conversation_engagement',
    }
  )
}

/**
 * Batch record multiple match outcomes (for analytics sync)
 */
export async function batchRecordMatchOutcomes(
  outcomes: Array<{
    matchId: string
    userId: string
    targetUserId: string
    outcome: MatchOutcome
    metadata?: MatchFeedbackMetadata
  }>
): Promise<{ success: number; failed: number }> {
  let success = 0
  let failed = 0

  for (const item of outcomes) {
    try {
      await recordMatchOutcome(
        item.matchId,
        item.userId,
        item.targetUserId,
        item.outcome,
        item.metadata
      )
      success++
    } catch {
      failed++
    }
  }

  console.log(`📊 Batch match outcomes: ${success} recorded, ${failed} failed`)

  return { success, failed }
}
