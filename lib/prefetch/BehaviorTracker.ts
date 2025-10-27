/**
 * BehaviorTracker
 * 
 * Tracks user behavior patterns to predict likely next conversation.
 * Uses simple heuristics based on time of day, frequency, and recency.
 */

export interface UserBehavior {
  conversationId: string
  timestamp: number
  action: 'open' | 'hover' | 'message_sent'
  hourOfDay: number
  dayOfWeek: number
}

export interface ConversationScore {
  conversationId: string
  score: number
  reasons: string[]
}

export class BehaviorTracker {
  private behaviors: UserBehavior[] = []
  private readonly MAX_BEHAVIORS = 500 // Keep last 500 behaviors
  private readonly STORAGE_KEY = 'studymate_behavior_tracker'

  constructor() {
    this.loadFromStorage()
  }

  /**
   * Track a user behavior
   */
  track(conversationId: string, action: UserBehavior['action']): void {
    const now = new Date()
    const behavior: UserBehavior = {
      conversationId,
      timestamp: now.getTime(),
      action,
      hourOfDay: now.getHours(),
      dayOfWeek: now.getDay()
    }

    this.behaviors.push(behavior)

    // Keep only recent behaviors
    if (this.behaviors.length > this.MAX_BEHAVIORS) {
      this.behaviors = this.behaviors.slice(-this.MAX_BEHAVIORS)
    }

    // Save to localStorage
    this.saveToStorage()
  }

  /**
   * Predict the next likely conversation
   */
  predictNext(currentConversationId?: string): string | null {
    if (this.behaviors.length < 5) {
      // Not enough data to make predictions
      return null
    }

    const now = new Date()
    const currentHour = now.getHours()
    const currentDay = now.getDay()

    // Calculate scores for each conversation
    const scores = new Map<string, ConversationScore>()

    for (const behavior of this.behaviors) {
      // Skip current conversation
      if (behavior.conversationId === currentConversationId) {
        continue
      }

      if (!scores.has(behavior.conversationId)) {
        scores.set(behavior.conversationId, {
          conversationId: behavior.conversationId,
          score: 0,
          reasons: []
        })
      }

      const scoreData = scores.get(behavior.conversationId)!

      // Recency score (more recent = higher score)
      const ageInHours = (now.getTime() - behavior.timestamp) / (1000 * 60 * 60)
      if (ageInHours < 1) {
        scoreData.score += 50
        scoreData.reasons.push('very_recent')
      } else if (ageInHours < 24) {
        scoreData.score += 30
        scoreData.reasons.push('recent')
      } else if (ageInHours < 168) { // 1 week
        scoreData.score += 10
        scoreData.reasons.push('this_week')
      }

      // Time of day pattern (same hour = higher score)
      if (behavior.hourOfDay === currentHour) {
        scoreData.score += 20
        scoreData.reasons.push('same_hour')
      } else if (Math.abs(behavior.hourOfDay - currentHour) <= 1) {
        scoreData.score += 10
        scoreData.reasons.push('similar_hour')
      }

      // Day of week pattern
      if (behavior.dayOfWeek === currentDay) {
        scoreData.score += 15
        scoreData.reasons.push('same_day_of_week')
      }

      // Action weight (open > message_sent > hover)
      if (behavior.action === 'open') {
        scoreData.score += 5
      } else if (behavior.action === 'message_sent') {
        scoreData.score += 3
      } else if (behavior.action === 'hover') {
        scoreData.score += 1
      }
    }

    // Find conversation with highest score
    let bestScore: ConversationScore | null = null
    const allScores = Array.from(scores.values())
    for (const score of allScores) {
      if (!bestScore || score.score > bestScore.score) {
        bestScore = score
      }
    }

    // Only return prediction if score is significant
    if (bestScore && bestScore.score > 30) {
      console.log('[BehaviorTracker] Predicted conversation:', bestScore)
      return bestScore.conversationId
    }

    return null
  }

  /**
   * Get conversation frequency (how often user interacts with it)
   */
  getConversationFrequency(conversationId: string): number {
    return this.behaviors.filter(b => b.conversationId === conversationId).length
  }

  /**
   * Get most frequent conversations
   */
  getMostFrequent(limit: number = 5): string[] {
    const frequencies = new Map<string, number>()

    for (const behavior of this.behaviors) {
      const count = frequencies.get(behavior.conversationId) || 0
      frequencies.set(behavior.conversationId, count + 1)
    }

    return Array.from(frequencies.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id)
  }

  /**
   * Clear all tracked behaviors
   */
  clear(): void {
    this.behaviors = []
    this.saveToStorage()
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalBehaviors: number
    uniqueConversations: number
    oldestBehavior: number | null
    newestBehavior: number | null
  } {
    const uniqueConversations = new Set(this.behaviors.map(b => b.conversationId))
    
    return {
      totalBehaviors: this.behaviors.length,
      uniqueConversations: uniqueConversations.size,
      oldestBehavior: this.behaviors.length > 0 ? this.behaviors[0].timestamp : null,
      newestBehavior: this.behaviors.length > 0 ? this.behaviors[this.behaviors.length - 1].timestamp : null
    }
  }

  /**
   * Save behaviors to localStorage
   */
  private saveToStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.behaviors))
      }
    } catch (error) {
      console.error('[BehaviorTracker] Failed to save to storage:', error)
    }
  }

  /**
   * Load behaviors from localStorage
   */
  private loadFromStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(this.STORAGE_KEY)
        if (stored) {
          this.behaviors = JSON.parse(stored)
        }
      }
    } catch (error) {
      console.error('[BehaviorTracker] Failed to load from storage:', error)
      this.behaviors = []
    }
  }
}

// Singleton instance
let behaviorTrackerInstance: BehaviorTracker | null = null

/**
 * Get or create BehaviorTracker instance
 */
export function getBehaviorTracker(): BehaviorTracker {
  if (!behaviorTrackerInstance) {
    behaviorTrackerInstance = new BehaviorTracker()
  }
  return behaviorTrackerInstance
}
