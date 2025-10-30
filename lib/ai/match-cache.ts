/**
 * In-Memory Cache for Gemini AI Sorted Matches
 *
 * Workflow:
 * 1. User visits /discover
 * 2. Fetch 30 candidates from DB
 * 3. Sort using Gemini AI
 * 4. Cache sorted list (30 items)
 * 5. User likes/passes → pop from cache
 * 6. After 10 actions → prefetch 30 more (append, don't merge)
 */

interface CachedMatch {
  userId: string
  score: number
  reasoning: string
  profileData?: any // Full profile for quick access
}

interface UserMatchCache {
  matches: CachedMatch[]
  cursor: number // Current position in the list
  lastFetch: number // Timestamp of last fetch
  prefetchTriggered: boolean // Track if prefetch is in progress
}

class MatchCacheManager {
  private cache: Map<string, UserMatchCache> = new Map()
  private readonly CACHE_TTL = 30 * 60 * 1000 // 30 minutes
  private readonly PREFETCH_THRESHOLD = 5 // Trigger prefetch when 5 matches remain
  private readonly BATCH_SIZE = 30 // Fetch 30 candidates per batch

  /**
   * Get cached matches for a user
   */
  get(userId: string): CachedMatch[] | null {
    const cached = this.cache.get(userId)

    if (!cached) {
      return null
    }

    // Check if cache expired
    if (Date.now() - cached.lastFetch > this.CACHE_TTL) {
      console.log(`⏰ Cache expired for user ${userId}`)
      this.cache.delete(userId)
      return null
    }

    // Return remaining matches (from cursor onwards)
    const remaining = cached.matches.slice(cached.cursor)
    console.log(`📦 Cache hit for user ${userId}: ${remaining.length} matches remaining (cursor: ${cached.cursor}/${cached.matches.length})`)

    return remaining
  }

  /**
   * Set sorted matches in cache
   */
  set(userId: string, matches: CachedMatch[], append: boolean = false): void {
    const existing = this.cache.get(userId)

    if (append && existing) {
      // Append new matches to existing list (for prefetch)
      console.log(`➕ Appending ${matches.length} matches to cache for user ${userId}`)
      existing.matches.push(...matches)
      existing.prefetchTriggered = false
      console.log(`📦 Cache updated: ${existing.matches.length} total matches (cursor: ${existing.cursor})`)
    } else {
      // Create new cache entry
      console.log(`💾 Caching ${matches.length} sorted matches for user ${userId}`)
      this.cache.set(userId, {
        matches,
        cursor: 0,
        lastFetch: Date.now(),
        prefetchTriggered: false
      })
    }
  }

  /**
   * Pop next match from cache (after like/pass)
   */
  pop(userId: string): CachedMatch | null {
    const cached = this.cache.get(userId)

    if (!cached || cached.cursor >= cached.matches.length) {
      console.log(`⚠️ No more matches in cache for user ${userId}`)
      return null
    }

    const match = cached.matches[cached.cursor]
    cached.cursor++

    const remaining = cached.matches.length - cached.cursor
    console.log(`👆 Popped match for user ${userId}: ${match.userId} (${remaining} remaining)`)

    // Check if prefetch needed
    if (remaining === this.PREFETCH_THRESHOLD && !cached.prefetchTriggered) {
      console.log(`🚀 Prefetch threshold reached for user ${userId} (${remaining} matches left)`)
      cached.prefetchTriggered = true
      // Return match with prefetch signal
      return { ...match, shouldPrefetch: true } as any
    }

    return match
  }

  /**
   * Get remaining count for a user
   */
  getRemainingCount(userId: string): number {
    const cached = this.cache.get(userId)
    if (!cached) return 0
    return cached.matches.length - cached.cursor
  }

  /**
   * Check if prefetch is needed
   */
  shouldPrefetch(userId: string): boolean {
    const remaining = this.getRemainingCount(userId)
    const cached = this.cache.get(userId)
    return remaining <= this.PREFETCH_THRESHOLD && !cached?.prefetchTriggered
  }

  /**
   * Mark prefetch as triggered
   */
  markPrefetchTriggered(userId: string): void {
    const cached = this.cache.get(userId)
    if (cached) {
      cached.prefetchTriggered = true
    }
  }

  /**
   * Get all processed user IDs (for exclusion in next fetch)
   */
  getProcessedUserIds(userId: string): string[] {
    const cached = this.cache.get(userId)
    if (!cached) return []

    // Return IDs of all matches up to current cursor
    return cached.matches.slice(0, cached.cursor).map(m => m.userId)
  }

  /**
   * Clear cache for a user
   */
  clear(userId: string): void {
    console.log(`🗑️ Clearing cache for user ${userId}`)
    this.cache.delete(userId)
  }

  /**
   * Clear all expired caches (run periodically)
   */
  clearExpired(): void {
    const now = Date.now()
    let cleared = 0

    for (const [userId, cache] of this.cache.entries()) {
      if (now - cache.lastFetch > this.CACHE_TTL) {
        this.cache.delete(userId)
        cleared++
      }
    }

    if (cleared > 0) {
      console.log(`🧹 Cleared ${cleared} expired caches`)
    }
  }

  /**
   * Get cache stats for debugging
   */
  getStats() {
    return {
      totalUsers: this.cache.size,
      users: Array.from(this.cache.entries()).map(([userId, cache]) => ({
        userId,
        totalMatches: cache.matches.length,
        cursor: cache.cursor,
        remaining: cache.matches.length - cache.cursor,
        age: Math.round((Date.now() - cache.lastFetch) / 1000 / 60), // minutes
        prefetchTriggered: cache.prefetchTriggered
      }))
    }
  }
}

// Singleton instance
export const matchCache = new MatchCacheManager()

// Auto-cleanup expired caches every 10 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    matchCache.clearExpired()
  }, 10 * 60 * 1000)
}
