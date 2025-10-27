import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { BehaviorTracker } from './BehaviorTracker'

describe('BehaviorTracker', () => {
  let tracker: BehaviorTracker

  beforeEach(() => {
    // Clear localStorage before each test
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.clear()
    }
    tracker = new BehaviorTracker()
  })

  afterEach(() => {
    tracker.clear()
  })

  describe('track', () => {
    it('should track user behavior', () => {
      tracker.track('conv-1', 'open')
      
      const stats = tracker.getStats()
      expect(stats.totalBehaviors).toBe(1)
      expect(stats.uniqueConversations).toBe(1)
    })

    it('should track multiple behaviors', () => {
      tracker.track('conv-1', 'open')
      tracker.track('conv-1', 'message_sent')
      tracker.track('conv-2', 'hover')
      
      const stats = tracker.getStats()
      expect(stats.totalBehaviors).toBe(3)
      expect(stats.uniqueConversations).toBe(2)
    })

    it('should limit behaviors to MAX_BEHAVIORS', () => {
      // Track more than MAX_BEHAVIORS (500)
      for (let i = 0; i < 600; i++) {
        tracker.track(`conv-${i % 10}`, 'open')
      }
      
      const stats = tracker.getStats()
      expect(stats.totalBehaviors).toBeLessThanOrEqual(500)
    })
  })

  describe('predictNext', () => {
    it('should return null with insufficient data', () => {
      tracker.track('conv-1', 'open')
      
      const prediction = tracker.predictNext()
      expect(prediction).toBeNull()
    })

    it('should predict based on recency', () => {
      // Track multiple behaviors for different conversations
      for (let i = 0; i < 10; i++) {
        tracker.track('conv-old', 'open')
      }
      
      // Wait a bit
      const now = Date.now()
      vi.setSystemTime(now + 1000)
      
      // Track recent behaviors
      for (let i = 0; i < 10; i++) {
        tracker.track('conv-recent', 'open')
      }
      
      const prediction = tracker.predictNext()
      // Should predict the more recent conversation
      expect(prediction).toBeTruthy()
      
      vi.useRealTimers()
    })

    it('should exclude current conversation from prediction', () => {
      // Track behaviors
      for (let i = 0; i < 10; i++) {
        tracker.track('conv-1', 'open')
        tracker.track('conv-2', 'open')
      }
      
      const prediction = tracker.predictNext('conv-1')
      // Should not predict conv-1 since it's current
      expect(prediction).not.toBe('conv-1')
    })

    it('should predict based on time of day patterns', () => {
      const now = new Date()
      const currentHour = now.getHours()
      
      // Track behaviors at current hour
      for (let i = 0; i < 10; i++) {
        tracker.track('conv-same-hour', 'open')
      }
      
      const prediction = tracker.predictNext()
      expect(prediction).toBeTruthy()
    })
  })

  describe('getConversationFrequency', () => {
    it('should return frequency count', () => {
      tracker.track('conv-1', 'open')
      tracker.track('conv-1', 'message_sent')
      tracker.track('conv-2', 'open')
      
      expect(tracker.getConversationFrequency('conv-1')).toBe(2)
      expect(tracker.getConversationFrequency('conv-2')).toBe(1)
      expect(tracker.getConversationFrequency('conv-3')).toBe(0)
    })
  })

  describe('getMostFrequent', () => {
    it('should return most frequent conversations', () => {
      // Track different frequencies
      for (let i = 0; i < 5; i++) tracker.track('conv-1', 'open')
      for (let i = 0; i < 3; i++) tracker.track('conv-2', 'open')
      for (let i = 0; i < 1; i++) tracker.track('conv-3', 'open')
      
      const mostFrequent = tracker.getMostFrequent(2)
      
      expect(mostFrequent).toHaveLength(2)
      expect(mostFrequent[0]).toBe('conv-1')
      expect(mostFrequent[1]).toBe('conv-2')
    })

    it('should limit results to specified count', () => {
      for (let i = 0; i < 10; i++) {
        tracker.track(`conv-${i}`, 'open')
      }
      
      const mostFrequent = tracker.getMostFrequent(3)
      expect(mostFrequent).toHaveLength(3)
    })
  })

  describe('clear', () => {
    it('should clear all behaviors', () => {
      tracker.track('conv-1', 'open')
      tracker.track('conv-2', 'message_sent')
      
      tracker.clear()
      
      const stats = tracker.getStats()
      expect(stats.totalBehaviors).toBe(0)
      expect(stats.uniqueConversations).toBe(0)
    })
  })

  describe('getStats', () => {
    it('should return correct statistics', () => {
      tracker.track('conv-1', 'open')
      tracker.track('conv-1', 'message_sent')
      tracker.track('conv-2', 'open')
      
      const stats = tracker.getStats()
      
      expect(stats.totalBehaviors).toBe(3)
      expect(stats.uniqueConversations).toBe(2)
      expect(stats.oldestBehavior).toBeTruthy()
      expect(stats.newestBehavior).toBeTruthy()
    })

    it('should return null timestamps when no behaviors', () => {
      const stats = tracker.getStats()
      
      expect(stats.totalBehaviors).toBe(0)
      expect(stats.uniqueConversations).toBe(0)
      expect(stats.oldestBehavior).toBeNull()
      expect(stats.newestBehavior).toBeNull()
    })
  })

  describe('localStorage persistence', () => {
    it('should save behaviors to localStorage', () => {
      tracker.track('conv-1', 'open')
      
      // Create new tracker instance
      const newTracker = new BehaviorTracker()
      
      const stats = newTracker.getStats()
      expect(stats.totalBehaviors).toBe(1)
      
      newTracker.clear()
    })

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      const originalSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error('Storage full')
      })
      
      // Should not throw
      expect(() => {
        tracker.track('conv-1', 'open')
      }).not.toThrow()
      
      // Restore
      Storage.prototype.setItem = originalSetItem
    })
  })
})
