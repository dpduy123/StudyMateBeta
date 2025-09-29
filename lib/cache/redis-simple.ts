import { Redis } from 'ioredis'

/**
 * Simple Redis client for basic operations
 * Fallback if the main RedisCache has configuration issues
 */
export class SimpleRedis {
  private static client: Redis | null = null

  static getInstance(): Redis {
    if (!SimpleRedis.client) {
      const redisUrl = process.env.REDIS_URL

      if (redisUrl) {
        // Use Redis URL if provided (for production/cloud)
        SimpleRedis.client = new Redis(redisUrl)
      } else {
        // Use basic local config
        SimpleRedis.client = new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD || undefined,
          db: parseInt(process.env.REDIS_DB || '0')
        })
      }

      SimpleRedis.client.on('error', (error) => {
        console.error('Simple Redis error:', error)
      })

      SimpleRedis.client.on('connect', () => {
        console.log('Simple Redis connected')
      })
    }

    return SimpleRedis.client
  }

  static async isHealthy(): Promise<boolean> {
    try {
      const client = SimpleRedis.getInstance()
      const result = await client.ping()
      return result === 'PONG'
    } catch (error) {
      console.error('Redis health check failed:', error)
      return false
    }
  }

  static async disconnect(): Promise<void> {
    if (SimpleRedis.client) {
      await SimpleRedis.client.quit()
      SimpleRedis.client = null
    }
  }
}