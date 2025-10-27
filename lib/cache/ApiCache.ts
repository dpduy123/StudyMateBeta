/**
 * API Response Caching Layer
 * 
 * Provides caching for API responses with support for:
 * - In-memory cache (development)
 * - Redis cache (production)
 * - Cache invalidation
 * - TTL management
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class InMemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60000)
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Check if entry has expired
    const now = Date.now()
    if (now - entry.timestamp > entry.ttl * 1000) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  async set<T>(key: string, data: T, ttl: number): Promise<void> {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key)
  }

  async deletePattern(pattern: string): Promise<void> {
    // Convert glob pattern to regex
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
    )

    const keysToDelete: string[] = []
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key))
  }

  async clear(): Promise<void> {
    this.cache.clear()
  }

  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl * 1000) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key))
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.cache.clear()
  }
}

// Redis cache implementation (optional)
class RedisCache {
  private client: any = null

  constructor() {
    // Try to initialize Redis client if available
    this.initRedis()
  }

  private async initRedis() {
    try {
      // Only import Redis if REDIS_URL is configured
      if (process.env.REDIS_URL) {
        // Dynamic import to avoid errors when redis is not installed
        const redis = await import('redis').catch(() => null)
        if (!redis) {
          console.warn('⚠️  Redis package not installed, using in-memory cache')
          return
        }
        
        this.client = redis.createClient({
          url: process.env.REDIS_URL
        })
        
        this.client.on('error', (err: Error) => {
          console.error('Redis Client Error:', err)
          this.client = null
        })

        await this.client.connect()
        console.log('✅ Redis cache connected')
      }
    } catch (error) {
      console.warn('⚠️  Redis not available, using in-memory cache')
      this.client = null
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client) return null

    try {
      const data = await this.client.get(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Redis get error:', error)
      return null
    }
  }

  async set<T>(key: string, data: T, ttl: number): Promise<void> {
    if (!this.client) return

    try {
      await this.client.setEx(key, ttl, JSON.stringify(data))
    } catch (error) {
      console.error('Redis set error:', error)
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.client) return

    try {
      await this.client.del(key)
    } catch (error) {
      console.error('Redis delete error:', error)
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    if (!this.client) return

    try {
      const keys = await this.client.keys(pattern)
      if (keys.length > 0) {
        await this.client.del(keys)
      }
    } catch (error) {
      console.error('Redis deletePattern error:', error)
    }
  }

  async clear(): Promise<void> {
    if (!this.client) return

    try {
      await this.client.flushDb()
    } catch (error) {
      console.error('Redis clear error:', error)
    }
  }
}

/**
 * API Cache Manager
 * Automatically uses Redis if available, falls back to in-memory cache
 */
class ApiCacheManager {
  private memoryCache: InMemoryCache
  private redisCache: RedisCache | null = null
  private useRedis: boolean = false

  constructor() {
    this.memoryCache = new InMemoryCache()
    
    // Initialize Redis if available
    if (process.env.REDIS_URL) {
      this.redisCache = new RedisCache()
      this.useRedis = true
    }
  }

  private getCache() {
    return this.useRedis && this.redisCache ? this.redisCache : this.memoryCache
  }

  /**
   * Get cached data
   */
  async get<T>(key: string): Promise<T | null> {
    return this.getCache().get<T>(key)
  }

  /**
   * Set cached data with TTL (in seconds)
   */
  async set<T>(key: string, data: T, ttl: number = 60): Promise<void> {
    return this.getCache().set(key, data, ttl)
  }

  /**
   * Delete cached data
   */
  async delete(key: string): Promise<void> {
    return this.getCache().delete(key)
  }

  /**
   * Delete all keys matching pattern (supports * wildcard)
   */
  async deletePattern(pattern: string): Promise<void> {
    return this.getCache().deletePattern(pattern)
  }

  /**
   * Clear all cached data
   */
  async clear(): Promise<void> {
    return this.getCache().clear()
  }

  /**
   * Invalidate conversation cache for a user
   */
  async invalidateConversations(userId: string): Promise<void> {
    await this.delete(`conversations:${userId}`)
  }

  /**
   * Invalidate messages cache for a conversation
   */
  async invalidateMessages(userId: string, chatId: string): Promise<void> {
    await this.deletePattern(`messages:${userId}:${chatId}:*`)
  }

  /**
   * Cache conversations for a user
   */
  async cacheConversations(userId: string, data: any): Promise<void> {
    await this.set(`conversations:${userId}`, data, 60) // 60 seconds TTL
  }

  /**
   * Get cached conversations for a user
   */
  async getCachedConversations(userId: string): Promise<any | null> {
    return this.get(`conversations:${userId}`)
  }

  /**
   * Cache messages for a conversation
   */
  async cacheMessages(userId: string, chatId: string, page: number, data: any): Promise<void> {
    await this.set(`messages:${userId}:${chatId}:${page}`, data, 30) // 30 seconds TTL
  }

  /**
   * Get cached messages for a conversation
   */
  async getCachedMessages(userId: string, chatId: string, page: number): Promise<any | null> {
    return this.get(`messages:${userId}:${chatId}:${page}`)
  }
}

// Export singleton instance
export const apiCache = new ApiCacheManager()

// Export types
export type { CacheEntry }
