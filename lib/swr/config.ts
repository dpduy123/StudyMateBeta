import { SWRConfiguration, Cache } from 'swr'
import { cacheManager } from '../cache/CacheManager'

/**
 * Custom SWR cache provider that uses IndexedDB as backend
 * This provides persistent caching across page reloads
 */
class IndexedDBCacheProvider implements Cache {
  private memoryCache: Map<string, any> = new Map()
  private cachePrefix = 'swr-cache:'

  get(key: string): any {
    // Return from memory cache synchronously
    return this.memoryCache.get(key)
  }

  set(key: string, value: any): void {
    // Store in memory cache immediately
    this.memoryCache.set(key, value)

    // Store in IndexedDB asynchronously (fire and forget)
    this.persistToIndexedDB(key, value).catch(error => {
      console.error('Error persisting to IndexedDB:', error)
    })
  }

  delete(key: string): void {
    this.memoryCache.delete(key)
    
    // Also delete from IndexedDB
    this.deleteFromIndexedDB(key).catch(error => {
      console.error('Error deleting from IndexedDB:', error)
    })
  }

  keys(): IterableIterator<string> {
    return this.memoryCache.keys()
  }

  /**
   * Load data from IndexedDB into memory cache
   * Call this on initialization to restore cached data
   */
  async loadFromIndexedDB(key: string): Promise<any> {
    try {
      const cacheKey = this.getCacheKey(key)
      
      // For conversations, use CacheManager
      if (key.includes('/api/conversations')) {
        const conversations = await cacheManager.getConversations()
        if (conversations.length > 0) {
          const data = { conversations }
          this.memoryCache.set(key, data)
          return data
        }
      }
      
      // For messages, use CacheManager
      if (key.includes('/api/messages/private')) {
        const conversationId = this.extractConversationId(key)
        if (conversationId) {
          const messages = await cacheManager.getMessages(conversationId)
          if (messages.length > 0) {
            const data = { messages }
            this.memoryCache.set(key, data)
            return data
          }
        }
      }
    } catch (error) {
      console.error('Error reading from IndexedDB cache:', error)
    }

    return undefined
  }

  private getCacheKey(key: string): string {
    return `${this.cachePrefix}${key}`
  }

  private extractConversationId(url: string): string | null {
    const match = url.match(/chatId=([^&]+)/)
    return match ? match[1] : null
  }

  private async persistToIndexedDB(key: string, value: any): Promise<void> {
    try {
      // For conversations, store in CacheManager
      if (key.includes('/api/conversations') && value?.conversations) {
        await cacheManager.setConversations(value.conversations)
      }
      
      // For messages, store in CacheManager
      if (key.includes('/api/messages/private') && value?.messages) {
        const conversationId = this.extractConversationId(key)
        if (conversationId) {
          // Store messages individually
          for (const message of value.messages) {
            try {
              await cacheManager.addMessage({
                ...message,
                conversationId,
              })
            } catch (error) {
              // Message might already exist, that's okay
              console.debug('Message already in cache:', message.id)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error persisting to IndexedDB:', error)
    }
  }

  private async deleteFromIndexedDB(key: string): Promise<void> {
    try {
      // For conversations, clear all
      if (key.includes('/api/conversations')) {
        // Don't clear all conversations, just invalidate the cache
        // The next fetch will update them
      }
      
      // For messages, we could clear specific conversation
      if (key.includes('/api/messages/private')) {
        const conversationId = this.extractConversationId(key)
        if (conversationId) {
          // Don't delete messages, just let them be refreshed
        }
      }
    } catch (error) {
      console.error('Error deleting from IndexedDB:', error)
    }
  }
}

/**
 * Create IndexedDB cache provider instance
 */
export const indexedDBCacheProvider = new IndexedDBCacheProvider()

/**
 * Global SWR configuration with IndexedDB backend
 * Implements stale-while-revalidate strategy for optimal performance
 */
export const swrConfig: SWRConfiguration = {
  // Use IndexedDB cache provider for persistence
  provider: () => indexedDBCacheProvider as any,

  // Stale-while-revalidate strategy
  // Show cached data immediately, then revalidate in background
  revalidateOnMount: true,
  revalidateIfStale: true,
  
  // Revalidate when window regains focus
  revalidateOnFocus: true,
  
  // Revalidate when network reconnects
  revalidateOnReconnect: true,

  // Dedupe requests within 2 seconds
  dedupingInterval: 2000,

  // Keep data fresh for 60 seconds before considering it stale
  focusThrottleInterval: 60000,

  // Error retry configuration
  errorRetryCount: 3,
  errorRetryInterval: 1000,
  shouldRetryOnError: true,

  // Loading timeout (show error after 10 seconds)
  loadingTimeout: 10000,

  // Global error handler
  onError: (error, key) => {
    console.error('SWR Error:', error, 'Key:', key)

    // Handle authentication errors globally
    if (error.status === 401) {
      // Could redirect to login or refresh token
      console.warn('Authentication error, user may need to re-login')
    }

    // Handle network errors
    if (error.message?.includes('fetch')) {
      console.warn('Network error, using cached data if available')
    }
  },

  // Global success handler
  onSuccess: (data, key) => {
    // Could track analytics or update other caches
    console.debug('SWR Success:', key)
  },

  // Global loading state handler
  onLoadingSlow: (key) => {
    console.warn('SWR loading slow:', key)
  },

  // Compare function for data equality
  compare: (a, b) => {
    // Deep equality check for objects
    return JSON.stringify(a) === JSON.stringify(b)
  },

  // Keep previous data while revalidating
  keepPreviousData: true,
}

/**
 * Helper function to create consistent fetcher with error handling
 */
export const createFetcher = (baseURL = '') => {
  return async (url: string) => {
    const response = await fetch(`${baseURL}${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Include credentials for authentication
      credentials: 'include',
    })

    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`) as any
      error.status = response.status
      error.info = await response.json().catch(() => ({}))
      throw error
    }

    return response.json()
  }
}

/**
 * Default fetcher instance
 */
export const fetcher = createFetcher()

/**
 * Helper to create mutation fetcher for POST/PUT/PATCH/DELETE
 */
export const createMutationFetcher = (method: 'POST' | 'PUT' | 'PATCH' | 'DELETE') => {
  return async (url: string, { arg }: { arg: any }) => {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(arg),
    })

    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`) as any
      error.status = response.status
      error.info = await response.json().catch(() => ({}))
      throw error
    }

    return response.json()
  }
}

/**
 * Helper to invalidate cache for a specific key pattern
 */
export const invalidateCache = (pattern: string) => {
  const keys = Array.from(indexedDBCacheProvider.keys())
  keys.forEach(key => {
    if (key.includes(pattern)) {
      indexedDBCacheProvider.delete(key)
    }
  })
}

/**
 * Helper to clear all SWR cache
 */
export const clearAllCache = () => {
  const keys = Array.from(indexedDBCacheProvider.keys())
  keys.forEach(key => {
    indexedDBCacheProvider.delete(key)
  })
}
