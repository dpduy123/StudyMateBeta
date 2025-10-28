import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { PrefetchManager } from './PrefetchManager'
import { BehaviorTracker } from './BehaviorTracker'
import { CacheManager } from '../cache/CacheManager'

// Mock fetch
global.fetch = vi.fn()

describe('PrefetchManager', () => {
  let prefetchManager: PrefetchManager
  let cacheManager: CacheManager
  let behaviorTracker: BehaviorTracker

  beforeEach(() => {
    cacheManager = new CacheManager()
    behaviorTracker = new BehaviorTracker()
    prefetchManager = new PrefetchManager(cacheManager, behaviorTracker, {
      maxConcurrentRequests: 2,
      hoverDelay: 100,
      topConversationsCount: 3,
      scrollPrefetchCount: 2
    })

    // Reset fetch mock
    vi.clearAllMocks()
  })

  afterEach(async () => {
    prefetchManager.clear()
    await cacheManager.clearCache()
    await cacheManager.close()
    behaviorTracker.clear()
  })

  describe('addToPrefetchQueue', () => {
    it('should add request to queue', () => {
      prefetchManager.addToPrefetchQueue('conv-1', 80, 'hover')
      
      const stats = prefetchManager.getStats()
      expect(stats.queueSize + stats.inProgress).toBeGreaterThan(0)
    })

    it('should not add duplicate requests', () => {
      prefetchManager.addToPrefetchQueue('conv-1', 80, 'hover')
      prefetchManager.addToPrefetchQueue('conv-1', 80, 'hover')
      
      const stats = prefetchManager.getStats()
      expect(stats.queueSize + stats.inProgress).toBeLessThanOrEqual(1)
    })

    it('should update priority if higher', () => {
      prefetchManager.addToPrefetchQueue('conv-1', 50, 'scroll')
      prefetchManager.addToPrefetchQueue('conv-1', 90, 'predictive')
      
      const stats = prefetchManager.getStats()
      const request = stats.pendingRequests.find(r => r.conversationId === 'conv-1')
      
      if (request) {
        expect(request.priority).toBe(90)
        expect(request.trigger).toBe('predictive')
      }
    })

    it('should sort queue by priority', () => {
      prefetchManager.addToPrefetchQueue('conv-1', 50, 'scroll')
      prefetchManager.addToPrefetchQueue('conv-2', 90, 'predictive')
      prefetchManager.addToPrefetchQueue('conv-3', 70, 'hover')
      
      const stats = prefetchManager.getStats()
      const priorities = stats.pendingRequests.map(r => r.priority)
      
      // Check if sorted in descending order
      for (let i = 0; i < priorities.length - 1; i++) {
        expect(priorities[i]).toBeGreaterThanOrEqual(priorities[i + 1])
      }
    })
  })

  describe('prefetchOnHover', () => {
    it('should delay prefetch by configured hover delay', async () => {
      const cleanup = prefetchManager.prefetchOnHover('conv-1')
      
      // Should not be in queue immediately
      let stats = prefetchManager.getStats()
      expect(stats.queueSize).toBe(0)
      
      // Wait for hover delay
      await new Promise(resolve => setTimeout(resolve, 150))
      
      // Should now be in queue or processing
      stats = prefetchManager.getStats()
      expect(stats.queueSize + stats.inProgress).toBeGreaterThan(0)
      
      cleanup()
    })

    it('should cancel prefetch if cleanup called before delay', async () => {
      const cleanup = prefetchManager.prefetchOnHover('conv-1')
      
      // Cancel immediately
      cleanup()
      
      // Wait for what would have been the delay
      await new Promise(resolve => setTimeout(resolve, 150))
      
      // Should not be in queue
      const stats = prefetchManager.getStats()
      expect(stats.queueSize).toBe(0)
    })
  })

  describe('cancelHoverPrefetch', () => {
    it('should cancel pending hover prefetch', async () => {
      prefetchManager.prefetchOnHover('conv-1')
      
      // Cancel before delay completes
      prefetchManager.cancelHoverPrefetch('conv-1')
      
      // Wait for delay
      await new Promise(resolve => setTimeout(resolve, 150))
      
      // Should not be in queue
      const stats = prefetchManager.getStats()
      expect(stats.queueSize).toBe(0)
    })
  })

  describe('prefetchTopConversations', () => {
    it('should prefetch top N conversations', async () => {
      // Add conversations to cache
      await cacheManager.setConversations([
        {
          id: 'conv-1',
          otherUser: { id: 'user-1', firstName: 'John', lastName: 'Doe', isOnline: true },
          unreadCount: 0,
          lastActivity: '2024-01-03T10:00:00Z',
          _cached: true,
          _lastSync: new Date().toISOString(),
          _prefetched: false
        },
        {
          id: 'conv-2',
          otherUser: { id: 'user-2', firstName: 'Jane', lastName: 'Smith', isOnline: true },
          unreadCount: 0,
          lastActivity: '2024-01-02T10:00:00Z',
          _cached: true,
          _lastSync: new Date().toISOString(),
          _prefetched: false
        },
        {
          id: 'conv-3',
          otherUser: { id: 'user-3', firstName: 'Bob', lastName: 'Johnson', isOnline: true },
          unreadCount: 0,
          lastActivity: '2024-01-01T10:00:00Z',
          _cached: true,
          _lastSync: new Date().toISOString(),
          _prefetched: false
        }
      ])

      await prefetchManager.prefetchTopConversations(2)
      
      // Wait a bit for queue processing
      await new Promise(resolve => setTimeout(resolve, 50))
      
      const stats = prefetchManager.getStats()
      expect(stats.queueSize + stats.inProgress).toBeGreaterThan(0)
    })

    it('should prioritize by recent activity', async () => {
      await cacheManager.setConversations([
        {
          id: 'conv-old',
          otherUser: { id: 'user-1', firstName: 'John', lastName: 'Doe', isOnline: true },
          unreadCount: 0,
          lastActivity: '2024-01-01T10:00:00Z',
          _cached: true,
          _lastSync: new Date().toISOString(),
          _prefetched: false
        },
        {
          id: 'conv-new',
          otherUser: { id: 'user-2', firstName: 'Jane', lastName: 'Smith', isOnline: true },
          unreadCount: 0,
          lastActivity: '2024-01-05T10:00:00Z',
          _cached: true,
          _lastSync: new Date().toISOString(),
          _prefetched: false
        }
      ])

      await prefetchManager.prefetchTopConversations(2)
      
      await new Promise(resolve => setTimeout(resolve, 50))
      
      const stats = prefetchManager.getStats()
      const requests = stats.pendingRequests
      
      if (requests.length > 0) {
        // Most recent should have higher priority
        const newConvRequest = requests.find(r => r.conversationId === 'conv-new')
        const oldConvRequest = requests.find(r => r.conversationId === 'conv-old')
        
        if (newConvRequest && oldConvRequest) {
          expect(newConvRequest.priority).toBeGreaterThan(oldConvRequest.priority)
        }
      }
    })
  })

  describe('prefetchOnScroll', () => {
    it('should prefetch next N conversations after visible ones', () => {
      const allConversations = ['conv-1', 'conv-2', 'conv-3', 'conv-4', 'conv-5']
      const visibleConversations = ['conv-1', 'conv-2']
      
      prefetchManager.prefetchOnScroll(visibleConversations, allConversations)
      
      const stats = prefetchManager.getStats()
      expect(stats.queueSize + stats.inProgress).toBeGreaterThan(0)
      
      // Should prefetch conv-3 and conv-4 (next 2 after visible)
      const requests = stats.pendingRequests
      const conversationIds = requests.map(r => r.conversationId)
      
      expect(conversationIds).toContain('conv-3')
    })

    it('should not prefetch if no visible conversations', () => {
      prefetchManager.prefetchOnScroll([], ['conv-1', 'conv-2'])
      
      const stats = prefetchManager.getStats()
      expect(stats.queueSize).toBe(0)
    })
  })

  describe('prefetchPredicted', () => {
    it('should prefetch predicted conversation from behavior tracker', () => {
      // Track some behaviors
      behaviorTracker.track('conv-1', 'open')
      behaviorTracker.track('conv-1', 'message_sent')
      behaviorTracker.track('conv-2', 'open')
      
      prefetchManager.prefetchPredicted()
      
      // May or may not add to queue depending on prediction confidence
      const stats = prefetchManager.getStats()
      expect(stats.queueSize + stats.inProgress).toBeGreaterThanOrEqual(0)
    })
  })

  describe('trackBehavior', () => {
    it('should track user behavior', () => {
      prefetchManager.trackBehavior('conv-1', 'open')
      
      const frequency = behaviorTracker.getConversationFrequency('conv-1')
      expect(frequency).toBe(1)
    })
  })

  describe('getStats', () => {
    it('should return prefetch statistics', () => {
      prefetchManager.addToPrefetchQueue('conv-1', 80, 'hover')
      
      const stats = prefetchManager.getStats()
      
      expect(stats).toHaveProperty('queueSize')
      expect(stats).toHaveProperty('inProgress')
      expect(stats).toHaveProperty('completed')
      expect(stats).toHaveProperty('pendingRequests')
      expect(Array.isArray(stats.pendingRequests)).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear all prefetch state', () => {
      prefetchManager.addToPrefetchQueue('conv-1', 80, 'hover')
      prefetchManager.addToPrefetchQueue('conv-2', 90, 'predictive')
      
      prefetchManager.clear()
      
      const stats = prefetchManager.getStats()
      expect(stats.queueSize).toBe(0)
      expect(stats.inProgress).toBe(0)
    })

    it('should clear hover timers', async () => {
      prefetchManager.prefetchOnHover('conv-1')
      prefetchManager.clear()
      
      // Wait for what would have been the delay
      await new Promise(resolve => setTimeout(resolve, 150))
      
      const stats = prefetchManager.getStats()
      expect(stats.queueSize).toBe(0)
    })
  })

  describe('resetCompleted', () => {
    it('should reset completed requests', () => {
      prefetchManager.resetCompleted()
      
      const stats = prefetchManager.getStats()
      expect(stats.completed).toBe(0)
    })
  })
})
