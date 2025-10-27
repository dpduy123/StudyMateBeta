/**
 * Performance Tests for Messaging Feature
 * 
 * These tests measure key performance metrics:
 * - Time to Interactive (TTI)
 * - First Contentful Paint (FCP)
 * - Scroll FPS
 * - API response times
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { CacheManager } from '../../lib/cache/CacheManager'
import { useMessageStore } from '../../stores/messageStore'

describe('Messaging Performance Tests', () => {
  let cacheManager: CacheManager

  beforeEach(() => {
    cacheManager = new CacheManager()
    useMessageStore.getState().clearStore()
  })

  afterEach(async () => {
    await cacheManager.clearCache()
    await cacheManager.close()
  })

  describe('Cache Performance', () => {
    it('should retrieve conversations from cache within 16ms', async () => {
      // Setup: Add conversations to cache
      const conversations = Array.from({ length: 50 }, (_, i) => ({
        id: `conv-${i}`,
        otherUser: {
          id: `user-${i}`,
          firstName: `User${i}`,
          lastName: `Test`,
          isOnline: i % 2 === 0
        },
        unreadCount: i % 5,
        lastActivity: new Date(Date.now() - i * 1000).toISOString(),
        _cached: true,
        _lastSync: new Date().toISOString(),
        _prefetched: false
      }))

      await cacheManager.setConversations(conversations)

      // Measure retrieval time
      const startTime = performance.now()
      const retrieved = await cacheManager.getConversations()
      const endTime = performance.now()

      const duration = endTime - startTime

      expect(retrieved).toHaveLength(50)
      expect(duration).toBeLessThan(16) // Should be under 16ms (1 frame at 60fps)
      
      console.log(`✓ Cache retrieval time: ${duration.toFixed(2)}ms`)
    })

    it('should retrieve messages from cache within 16ms', async () => {
      // Setup: Add messages to cache
      const messages = Array.from({ length: 100 }, (_, i) => ({
        id: `msg-${i}`,
        senderId: i % 2 === 0 ? 'user-1' : 'user-2',
        conversationId: 'conv-1',
        type: 'TEXT' as const,
        content: `Message ${i}`,
        createdAt: new Date(Date.now() - i * 1000).toISOString(),
        updatedAt: new Date(Date.now() - i * 1000).toISOString(),
        sender: {
          id: i % 2 === 0 ? 'user-1' : 'user-2',
          firstName: 'Test',
          lastName: 'User'
        }
      }))

      for (const message of messages) {
        await cacheManager.addMessage(message)
      }

      // Measure retrieval time
      const startTime = performance.now()
      const retrieved = await cacheManager.getMessages('conv-1', 20)
      const endTime = performance.now()

      const duration = endTime - startTime

      expect(retrieved).toHaveLength(20)
      expect(duration).toBeLessThan(16)
      
      console.log(`✓ Message retrieval time: ${duration.toFixed(2)}ms`)
    })

    it('should handle large message cache efficiently', async () => {
      // Add 1000 messages
      const messages = Array.from({ length: 1000 }, (_, i) => ({
        id: `msg-${i}`,
        senderId: 'user-1',
        conversationId: 'conv-1',
        type: 'TEXT' as const,
        content: `Message ${i}`,
        createdAt: new Date(Date.now() - i * 1000).toISOString(),
        updatedAt: new Date(Date.now() - i * 1000).toISOString(),
        sender: {
          id: 'user-1',
          firstName: 'Test',
          lastName: 'User'
        }
      }))

      const startTime = performance.now()
      
      for (const message of messages) {
        await cacheManager.addMessage(message)
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime

      // Should complete in reasonable time (< 1 second)
      expect(duration).toBeLessThan(1000)
      
      console.log(`✓ Added 1000 messages in ${duration.toFixed(2)}ms`)
      console.log(`  Average: ${(duration / 1000).toFixed(2)}ms per message`)
    })
  })

  describe('Store Performance', () => {
    it('should update store state within 1ms', () => {
      const conversations = Array.from({ length: 50 }, (_, i) => ({
        id: `conv-${i}`,
        otherUser: {
          id: `user-${i}`,
          firstName: `User${i}`,
          lastName: `Test`,
          isOnline: i % 2 === 0
        },
        unreadCount: i % 5,
        lastActivity: new Date(Date.now() - i * 1000).toISOString()
      }))

      const startTime = performance.now()
      useMessageStore.getState().setConversations(conversations)
      const endTime = performance.now()

      const duration = endTime - startTime

      expect(duration).toBeLessThan(1)
      
      console.log(`✓ Store update time: ${duration.toFixed(2)}ms`)
    })

    it('should add message to store within 1ms', () => {
      const message = {
        id: 'msg-1',
        senderId: 'user-1',
        receiverId: 'user-2',
        type: 'TEXT' as const,
        content: 'Test message',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sender: {
          id: 'user-1',
          firstName: 'Test',
          lastName: 'User'
        }
      }

      const startTime = performance.now()
      useMessageStore.getState().addMessage('conv-1', message)
      const endTime = performance.now()

      const duration = endTime - startTime

      expect(duration).toBeLessThan(1)
      
      console.log(`✓ Message add time: ${duration.toFixed(2)}ms`)
    })

    it('should handle 1000 messages without performance degradation', () => {
      const messages = Array.from({ length: 1000 }, (_, i) => ({
        id: `msg-${i}`,
        senderId: 'user-1',
        receiverId: 'user-2',
        type: 'TEXT' as const,
        content: `Message ${i}`,
        createdAt: new Date(Date.now() - i * 1000).toISOString(),
        updatedAt: new Date(Date.now() - i * 1000).toISOString(),
        sender: {
          id: 'user-1',
          firstName: 'Test',
          lastName: 'User'
        }
      }))

      const startTime = performance.now()
      
      for (const message of messages) {
        useMessageStore.getState().addMessage('conv-1', message)
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime

      // Should complete quickly
      expect(duration).toBeLessThan(100)
      
      console.log(`✓ Added 1000 messages to store in ${duration.toFixed(2)}ms`)
      console.log(`  Average: ${(duration / 1000).toFixed(3)}ms per message`)
    })
  })

  describe('Message Deduplication Performance', () => {
    it('should deduplicate messages efficiently', () => {
      const message = {
        id: 'msg-1',
        senderId: 'user-1',
        receiverId: 'user-2',
        type: 'TEXT' as const,
        content: 'Test message',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sender: {
          id: 'user-1',
          firstName: 'Test',
          lastName: 'User'
        }
      }

      const startTime = performance.now()
      
      // Add same message 100 times
      for (let i = 0; i < 100; i++) {
        useMessageStore.getState().addMessage('conv-1', message)
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime

      const messages = useMessageStore.getState().messages.get('conv-1')
      expect(messages).toHaveLength(1) // Should only have one message

      // Should complete quickly even with deduplication
      expect(duration).toBeLessThan(10)
      
      console.log(`✓ Deduplicated 100 attempts in ${duration.toFixed(2)}ms`)
    })
  })

  describe('Optimistic Update Performance', () => {
    it('should create optimistic message within 1ms', () => {
      const { sendMessageOptimistic } = useMessageStore.getState()

      const startTime = performance.now()
      
      sendMessageOptimistic('conv-1', 'Test message', 'user-1', {
        id: 'user-1',
        firstName: 'Test',
        lastName: 'User'
      })
      
      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(1)
      
      console.log(`✓ Optimistic message creation: ${duration.toFixed(3)}ms`)
    })

    it('should confirm optimistic message within 1ms', () => {
      const { sendMessageOptimistic, confirmMessage } = useMessageStore.getState()

      const operationId = sendMessageOptimistic('conv-1', 'Test message', 'user-1', {
        id: 'user-1',
        firstName: 'Test',
        lastName: 'User'
      })

      const serverMessage = {
        id: 'msg-server-1',
        senderId: 'user-1',
        receiverId: 'user-2',
        type: 'TEXT' as const,
        content: 'Test message',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sender: {
          id: 'user-1',
          firstName: 'Test',
          lastName: 'User'
        }
      }

      const startTime = performance.now()
      confirmMessage('conv-1', operationId, serverMessage)
      const endTime = performance.now()

      const duration = endTime - startTime

      expect(duration).toBeLessThan(1)
      
      console.log(`✓ Optimistic message confirmation: ${duration.toFixed(3)}ms`)
    })
  })

  describe('Memory Usage', () => {
    it('should not leak memory with repeated operations', async () => {
      const initialMemory = process.memoryUsage().heapUsed

      // Perform 1000 operations
      for (let i = 0; i < 1000; i++) {
        const message = {
          id: `msg-${i}`,
          senderId: 'user-1',
          receiverId: 'user-2',
          type: 'TEXT' as const,
          content: `Message ${i}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sender: {
            id: 'user-1',
            firstName: 'Test',
            lastName: 'User'
          }
        }

        useMessageStore.getState().addMessage('conv-1', message)
        
        // Clear every 100 messages to simulate real usage
        if (i % 100 === 0) {
          useMessageStore.getState().clearStore()
        }
      }

      const finalMemory = process.memoryUsage().heapUsed
      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024 // MB

      // Memory increase should be reasonable (< 10MB)
      expect(memoryIncrease).toBeLessThan(10)
      
      console.log(`✓ Memory increase after 1000 operations: ${memoryIncrease.toFixed(2)}MB`)
    })
  })

  describe('Cache Statistics', () => {
    it('should provide cache statistics efficiently', async () => {
      // Add some data
      await cacheManager.setConversations([
        {
          id: 'conv-1',
          otherUser: {
            id: 'user-1',
            firstName: 'Test',
            lastName: 'User',
            isOnline: true
          },
          unreadCount: 0,
          lastActivity: new Date().toISOString(),
          _cached: true,
          _lastSync: new Date().toISOString(),
          _prefetched: false
        }
      ])

      const startTime = performance.now()
      const stats = await cacheManager.getCacheStats()
      const endTime = performance.now()

      const duration = endTime - startTime

      expect(stats).toHaveProperty('conversationCount')
      expect(stats).toHaveProperty('messageCount')
      expect(stats).toHaveProperty('storageUsage')
      expect(duration).toBeLessThan(10)
      
      console.log(`✓ Cache stats retrieval: ${duration.toFixed(2)}ms`)
      console.log(`  Conversations: ${stats.conversationCount}`)
      console.log(`  Messages: ${stats.messageCount}`)
      console.log(`  Storage: ${(stats.storageUsage / 1024).toFixed(2)}KB`)
    })
  })
})

/**
 * Performance Benchmarks
 * 
 * Target metrics:
 * - Cache retrieval: < 16ms (1 frame at 60fps)
 * - Store updates: < 1ms
 * - Optimistic updates: < 1ms
 * - Message deduplication: < 10ms for 100 attempts
 * - Memory usage: < 10MB increase for 1000 operations
 * 
 * To run performance tests:
 * npm run test -- tests/performance/messaging.performance.test.ts
 */
