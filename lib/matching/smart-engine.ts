import { MatchingUser } from './algorithm'
import { UserProfile } from '@/components/profile/types'
import { traceAICall } from '../ai/opik'

export interface SmartMatchingConfig {
  bufferSize: number
  refillThreshold: number
  maxCacheSize: number
  batchSize: number
}

export interface MatchBuffer {
  matches: MatchingUser[]
  cursor: number
  isLoading: boolean
  hasMore: boolean
  lastFetch: number
}

export interface CachedMatchData {
  matches: MatchingUser[]
  timestamp: number
  excludedIds: string[]
}

export class SmartMatchingEngine {
  private static config: SmartMatchingConfig = {
    bufferSize: 10,
    refillThreshold: 3,
    maxCacheSize: 50,
    batchSize: 15
  }

  private static memoryCache = new Map<string, CachedMatchData>()
  private static buffers = new Map<string, MatchBuffer>()

  /**
   * Initialize smart matching for a user with Opik tracing
   */
  static async initializeBuffer(userId: string, excludedIds: string[] = []): Promise<MatchBuffer> {
    return traceAICall(
      'smart_matching_initialize',
      {
        userId,
        excludedCount: excludedIds.length,
        bufferSize: this.config.bufferSize,
        batchSize: this.config.batchSize,
      },
      async () => {
        const cacheKey = this.getCacheKey(userId, excludedIds)

        // Check memory cache first
        const cached = this.memoryCache.get(cacheKey)
        if (cached && this.isCacheValid(cached)) {
          const buffer: MatchBuffer = {
            matches: cached.matches.slice(0, this.config.bufferSize),
            cursor: 0,
            isLoading: false,
            hasMore: cached.matches.length > this.config.bufferSize,
            lastFetch: cached.timestamp
          }
          this.buffers.set(userId, buffer)
          console.log(`✅ Smart Matching: Buffer initialized from cache for user ${userId}`)
          return buffer
        }

        // Initialize empty buffer and start loading
        const buffer: MatchBuffer = {
          matches: [],
          cursor: 0,
          isLoading: true,
          hasMore: true,
          lastFetch: Date.now()
        }
        this.buffers.set(userId, buffer)

        // Load initial matches
        await this.refillBuffer(userId, excludedIds)

        console.log(`✅ Smart Matching: Buffer initialized from API for user ${userId}`)
        return this.buffers.get(userId)!
      },
      {
        feature: 'smart_matching',
        operation: 'initialize_buffer',
      }
    )
  }

  /**
   * Get next match for user (instant response from buffer)
   */
  static getNextMatch(userId: string): MatchingUser | null {
    const buffer = this.buffers.get(userId)
    if (!buffer || buffer.cursor >= buffer.matches.length) {
      return null
    }

    const match = buffer.matches[buffer.cursor]
    buffer.cursor++

    // Trigger background refill if needed
    this.checkAndRefill(userId)

    return match
  }

  /**
   * Get multiple matches from buffer
   */
  static getMatches(userId: string, count: number): MatchingUser[] {
    const buffer = this.buffers.get(userId)
    if (!buffer) return []

    const startIndex = buffer.cursor
    const endIndex = Math.min(startIndex + count, buffer.matches.length)
    const matches = buffer.matches.slice(startIndex, endIndex)

    buffer.cursor = endIndex
    this.checkAndRefill(userId)

    return matches
  }

  /**
   * Process user action and update buffer with Opik tracing
   */
  static processAction(userId: string, targetUserId: string, action: 'LIKE' | 'PASS') {
    const buffer = this.buffers.get(userId)
    if (!buffer) return

    // Find the match score before removing
    const targetMatch = buffer.matches.find(match => match.id === targetUserId)
    const matchScore = targetMatch?.matchScore

    // Remove the processed user from current buffer
    buffer.matches = buffer.matches.filter(match => match.id !== targetUserId)

    // Adjust cursor if needed
    if (buffer.cursor > 0) {
      buffer.cursor--
    }

    // Update cache to exclude this user
    this.updateCacheExclusions(userId, targetUserId)

    // Trigger refill if buffer is getting low
    this.checkAndRefill(userId)

    // Track action for analytics (non-blocking)
    this.trackMatchAction(userId, targetUserId, action, matchScore)
  }

  /**
   * Track match action for Opik analytics
   */
  private static trackMatchAction(
    userId: string,
    targetUserId: string,
    action: 'LIKE' | 'PASS',
    matchScore?: number
  ) {
    // Fire-and-forget tracing for match actions
    traceAICall(
      'match_action',
      {
        userId,
        targetUserId,
        action,
        matchScore,
        timestamp: new Date().toISOString(),
      },
      async () => {
        return {
          action,
          matchScore,
          outcome: action === 'LIKE' ? 'positive' : 'negative',
        }
      },
      {
        feature: 'smart_matching',
        operation: 'user_action',
        actionType: action,
      }
    ).catch(err => console.error('Failed to track match action:', err))
  }

  /**
   * Background refill buffer when threshold is reached
   */
  private static async checkAndRefill(userId: string) {
    const buffer = this.buffers.get(userId)
    if (!buffer || buffer.isLoading) return

    const remainingMatches = buffer.matches.length - buffer.cursor
    if (remainingMatches <= this.config.refillThreshold && buffer.hasMore) {
      await this.refillBuffer(userId)
    }
  }

  /**
   * Fetch more matches and add to buffer
   * Note: This method is designed for client-side usage only
   */
  private static async refillBuffer(userId: string, additionalExcludeIds: string[] = []) {
    const buffer = this.buffers.get(userId)
    if (!buffer) return

    // Skip refilling on server-side to avoid fetch issues
    if (typeof window === 'undefined') {
      console.log('Skipping buffer refill on server-side')
      buffer.hasMore = false
      return
    }

    buffer.isLoading = true

    try {
      // Get current excluded IDs from processed matches
      const processedIds = this.getProcessedIds(userId)
      const excludeIds = [...processedIds, ...additionalExcludeIds]

      // Fetch new matches (client-side only)
      const response = await fetch(`/api/discover/smart-matches?limit=${this.config.batchSize}&exclude_ids=${excludeIds.join(',')}`)

      if (!response.ok) {
        throw new Error('Failed to fetch matches')
      }

      const data = await response.json()
      const newMatches: MatchingUser[] = data.matches || []

      // Add to buffer (avoid duplicates)
      const existingIds = new Set(buffer.matches.map(m => m.id))
      const uniqueNewMatches = newMatches.filter(match => !existingIds.has(match.id))

      buffer.matches.push(...uniqueNewMatches)
      buffer.hasMore = newMatches.length === this.config.batchSize
      buffer.lastFetch = Date.now()

      // Update memory cache
      this.updateMemoryCache(userId, [...buffer.matches, ...uniqueNewMatches], excludeIds)

    } catch (error) {
      console.error('Error refilling buffer:', error)
      buffer.hasMore = false
    } finally {
      buffer.isLoading = false
    }
  }

  /**
   * Prefetch matches for better UX
   */
  static async prefetchMatches(userId: string, priority: 'high' | 'low' = 'low') {
    const buffer = this.buffers.get(userId)
    if (!buffer || buffer.isLoading) return

    // Only prefetch if we have room and it's been a while
    const timeSinceLastFetch = Date.now() - buffer.lastFetch
    if (buffer.matches.length < this.config.maxCacheSize && timeSinceLastFetch > 30000) {
      if (priority === 'high') {
        await this.refillBuffer(userId)
      } else {
        // Low priority - use setTimeout to avoid blocking
        setTimeout(() => this.refillBuffer(userId), 1000)
      }
    }
  }

  /**
   * Get buffer status for debugging
   */
  static getBufferStatus(userId: string): {
    totalMatches: number
    remainingMatches: number
    isLoading: boolean
    hasMore: boolean
    lastFetch: number
  } | null {
    const buffer = this.buffers.get(userId)
    if (!buffer) return null

    return {
      totalMatches: buffer.matches.length,
      remainingMatches: buffer.matches.length - buffer.cursor,
      isLoading: buffer.isLoading,
      hasMore: buffer.hasMore,
      lastFetch: buffer.lastFetch
    }
  }

  /**
   * Clear buffer and cache for user
   */
  static clearBuffer(userId: string) {
    this.buffers.delete(userId)

    // Clear related cache entries
    for (const [key] of this.memoryCache.entries()) {
      if (key.startsWith(`${userId}:`)) {
        this.memoryCache.delete(key)
      }
    }
  }

  // Private helper methods
  private static getCacheKey(userId: string, excludedIds: string[]): string {
    const sortedIds = [...excludedIds].sort().join(',')
    return `${userId}:${sortedIds}`
  }

  private static isCacheValid(cached: CachedMatchData, maxAge: number = 300000): boolean {
    return Date.now() - cached.timestamp < maxAge
  }

  private static getProcessedIds(userId: string): string[] {
    const buffer = this.buffers.get(userId)
    if (!buffer) return []

    // Return IDs of matches that have been shown (cursor position)
    return buffer.matches.slice(0, buffer.cursor).map(match => match.id)
  }

  private static updateMemoryCache(userId: string, matches: MatchingUser[], excludedIds: string[]) {
    const cacheKey = this.getCacheKey(userId, excludedIds)

    // Implement LRU eviction if cache is full
    if (this.memoryCache.size >= this.config.maxCacheSize) {
      const oldestKey = this.memoryCache.keys().next().value
      if (oldestKey) {
        this.memoryCache.delete(oldestKey)
      }
    }

    this.memoryCache.set(cacheKey, {
      matches,
      timestamp: Date.now(),
      excludedIds
    })
  }

  private static updateCacheExclusions(userId: string, excludedId: string) {
    // Update all cache entries for this user to include the new exclusion
    for (const [key, cached] of this.memoryCache.entries()) {
      if (key.startsWith(`${userId}:`)) {
        cached.excludedIds.push(excludedId)
        cached.matches = cached.matches.filter(match => match.id !== excludedId)
      }
    }
  }

  /**
   * Performance monitoring
   */
  static getPerformanceMetrics() {
    return {
      activeBuffers: this.buffers.size,
      cacheSize: this.memoryCache.size,
      memoryUsage: this.calculateMemoryUsage(),
      config: this.config
    }
  }

  private static calculateMemoryUsage(): number {
    let totalSize = 0
    for (const [, cached] of this.memoryCache.entries()) {
      totalSize += JSON.stringify(cached).length
    }
    return totalSize
  }
}