import { Redis, RedisOptions } from 'ioredis'
import { MatchingUser } from '@/lib/matching/algorithm'

export interface RedisConfig {
  host: string
  port: number
  password?: string
  db: number
  keyPrefix: string
  ttl: {
    matches: number
    scores: number
    userProfiles: number
  }
}

export class RedisCache {
  private static instance: RedisCache
  private client: Redis
  private config: RedisConfig

  private constructor() {
    this.config = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      keyPrefix: 'studymate:',
      ttl: {
        matches: 24 * 60 * 60, // 24 hours
        scores: 7 * 24 * 60 * 60, // 7 days
        userProfiles: 60 * 60 // 1 hour
      }
    }

    // Create Redis client with proper typing
    const redisOptions: RedisOptions = {
      host: this.config.host,
      port: this.config.port,
      db: this.config.db,
      keyPrefix: this.config.keyPrefix,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      password: this.config.password || undefined
    }

    this.client = new Redis(redisOptions)

    this.setupErrorHandling()
  }

  static getInstance(): RedisCache {
    if (!RedisCache.instance) {
      RedisCache.instance = new RedisCache()
    }
    return RedisCache.instance
  }

  private setupErrorHandling() {
    this.client.on('error', (error) => {
      console.error('Redis client error:', error)
    })

    this.client.on('connect', () => {
      console.log('Connected to Redis')
    })

    this.client.on('reconnecting', () => {
      console.log('Reconnecting to Redis...')
    })
  }

  // Match Score Caching
  async cacheMatchScore(userId1: string, userId2: string, score: number): Promise<void> {
    try {
      const key = this.getMatchScoreKey(userId1, userId2)
      await this.client.setex(key, this.config.ttl.scores, score.toString())
    } catch (error) {
      console.error('Error caching match score:', error)
    }
  }

  async getMatchScore(userId1: string, userId2: string): Promise<number | null> {
    try {
      const key = this.getMatchScoreKey(userId1, userId2)
      const score = await this.client.get(key)
      return score ? parseFloat(score) : null
    } catch (error) {
      console.error('Error getting cached match score:', error)
      return null
    }
  }

  async batchCacheMatchScores(scores: Array<{userId1: string, userId2: string, score: number}>): Promise<void> {
    if (scores.length === 0) return

    const pipeline = this.client.pipeline()

    for (const {userId1, userId2, score} of scores) {
      const key = this.getMatchScoreKey(userId1, userId2)
      pipeline.setex(key, this.config.ttl.scores, score.toString())
    }

    try {
      await pipeline.exec()
    } catch (error) {
      console.error('Error batch caching match scores:', error)
    }
  }

  // User Matches Caching
  async cacheUserMatches(userId: string, matches: MatchingUser[], excludedIds: string[]): Promise<void> {
    try {
      const key = this.getUserMatchesKey(userId, excludedIds)
      const data = JSON.stringify({
        matches,
        timestamp: Date.now(),
        excludedIds
      })
      await this.client.setex(key, this.config.ttl.matches, data)
    } catch (error) {
      console.error('Error caching user matches:', error)
    }
  }

  async getUserMatches(userId: string, excludedIds: string[]): Promise<{
    matches: MatchingUser[]
    timestamp: number
    excludedIds: string[]
  } | null> {
    try {
      const key = this.getUserMatchesKey(userId, excludedIds)
      const data = await this.client.get(key)

      if (!data) return null

      return JSON.parse(data)
    } catch (error) {
      console.error('Error getting cached user matches:', error)
      return null
    }
  }

  // User Profile Caching
  async cacheUserProfile(userId: string, profile: any): Promise<void> {
    try {
      const key = this.getUserProfileKey(userId)
      await this.client.setex(key, this.config.ttl.userProfiles, JSON.stringify(profile))
    } catch (error) {
      console.error('Error caching user profile:', error)
    }
  }

  async getUserProfile(userId: string): Promise<any | null> {
    try {
      const key = this.getUserProfileKey(userId)
      const data = await this.client.get(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Error getting cached user profile:', error)
      return null
    }
  }

  // Batch operations
  async batchGetMatchScores(pairs: Array<{userId1: string, userId2: string}>): Promise<Map<string, number>> {
    const results = new Map<string, number>()

    if (pairs.length === 0) return results

    const pipeline = this.client.pipeline()
    const keyMap = new Map<string, string>()

    for (const {userId1, userId2} of pairs) {
      const key = this.getMatchScoreKey(userId1, userId2)
      const pairKey = `${userId1}:${userId2}`
      keyMap.set(key, pairKey)
      pipeline.get(key)
    }

    try {
      const responses = await pipeline.exec()
      if (!responses) return results

      let index = 0
      for (const [key, pairKey] of keyMap.entries()) {
        const [err, score] = responses[index] || [null, null]
        if (!err && score) {
          results.set(pairKey, parseFloat(score as string))
        }
        index++
      }
    } catch (error) {
      console.error('Error batch getting match scores:', error)
    }

    return results
  }

  // Analytics and Performance
  async getCacheStats(): Promise<{
    totalKeys: number
    memoryUsage: string
    hitRate: number
    missRate: number
  }> {
    try {
      const info = await this.client.info('stats')
      const keyspace = await this.client.info('keyspace')

      // Parse Redis info response
      const stats = this.parseRedisInfo(info)
      const keyspaceInfo = this.parseRedisInfo(keyspace)

      return {
        totalKeys: parseInt(keyspaceInfo.db0?.split(',')[0]?.split('=')[1] || '0'),
        memoryUsage: stats.used_memory_human || '0B',
        hitRate: parseFloat(stats.keyspace_hit_rate || '0'),
        missRate: parseFloat(stats.keyspace_miss_rate || '0')
      }
    } catch (error) {
      console.error('Error getting cache stats:', error)
      return {
        totalKeys: 0,
        memoryUsage: '0B',
        hitRate: 0,
        missRate: 0
      }
    }
  }

  // Cleanup methods
  async invalidateUserMatches(userId: string): Promise<void> {
    try {
      const pattern = `${this.config.keyPrefix}matches:${userId}:*`
      const keys = await this.client.keys(pattern)

      if (keys.length > 0) {
        await this.client.del(...keys)
      }
    } catch (error) {
      console.error('Error invalidating user matches:', error)
    }
  }

  async invalidateMatchScores(userId: string): Promise<void> {
    try {
      const pattern1 = `${this.config.keyPrefix}score:${userId}:*`
      const pattern2 = `${this.config.keyPrefix}score:*:${userId}`

      const keys1 = await this.client.keys(pattern1)
      const keys2 = await this.client.keys(pattern2)

      const allKeys = [...keys1, ...keys2]
      if (allKeys.length > 0) {
        await this.client.del(...allKeys)
      }
    } catch (error) {
      console.error('Error invalidating match scores:', error)
    }
  }

  async clearCache(): Promise<void> {
    try {
      await this.client.flushdb()
    } catch (error) {
      console.error('Error clearing cache:', error)
    }
  }

  // Private helper methods
  private getMatchScoreKey(userId1: string, userId2: string): string {
    // Ensure consistent key regardless of parameter order
    const [first, second] = [userId1, userId2].sort()
    return `score:${first}:${second}`
  }

  private getUserMatchesKey(userId: string, excludedIds: string[]): string {
    const sortedExcluded = [...excludedIds].sort().join(',')
    return `matches:${userId}:${this.hashString(sortedExcluded)}`
  }

  private getUserProfileKey(userId: string): string {
    return `profile:${userId}`
  }

  private hashString(str: string): string {
    let hash = 0
    if (str.length === 0) return hash.toString()

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }

    return Math.abs(hash).toString(36)
  }

  private parseRedisInfo(info: string): Record<string, string> {
    const result: Record<string, string> = {}

    info.split('\r\n').forEach(line => {
      const [key, value] = line.split(':')
      if (key && value) {
        result[key] = value
      }
    })

    return result
  }

  // Health check
  async isHealthy(): Promise<boolean> {
    try {
      const pong = await this.client.ping()
      return pong === 'PONG'
    } catch (error) {
      console.error('Redis health check failed:', error)
      return false
    }
  }

  // Graceful shutdown
  async disconnect(): Promise<void> {
    try {
      await this.client.quit()
    } catch (error) {
      console.error('Error disconnecting from Redis:', error)
    }
  }
}