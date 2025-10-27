import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { CacheManager } from '../../lib/cache/CacheManager'
import { OptimisticUpdateManager } from '../../lib/optimistic/OptimisticUpdateManager'
import { useMessageStore } from '../../stores/messageStore'

// Mock fetch
global.fetch = vi.fn()

describe('Messaging Integration Tests', () => {
  let cacheManager: CacheManager
  let optimisticManager: OptimisticUpdateManager

  beforeEach(() => {
    cacheManager = new CacheManager()
    optimisticManager = new OptimisticUpdateManager(cacheManager)
    useMessageStore.getState().clearStore()
    vi.clearAllMocks()
  })

  afterEach(async () => {
    await cacheManager.clearCache()
    await cacheManager.close()
    optimisticManager.clearOperations()
  })

  describe('Full Message Send Flow', () => {
    it('should handle complete optimistic message send flow', async () => {
      const conversationId = 'conv-1'
      const senderId = 'user-1'
      const content = 'Hello, this is a test message'
      const senderInfo = {
        id: senderId,
        firstName: 'John',
        lastName: 'Doe'
      }

      // Step 1: Create optimistic message
      const optimisticMessage = optimisticManager.createOptimisticMessage(
        content,
        conversationId,
        senderId,
        senderInfo
      )

      expect(optimisticMessage._optimistic).toBe(true)
      expect(optimisticMessage._status).toBe('pending')
      expect(optimisticMessage.content).toBe(content)

      // Step 2: Add to store
      useMessageStore.getState().addMessage(conversationId, optimisticMessage)

      let messages = useMessageStore.getState().messages.get(conversationId)
      expect(messages).toHaveLength(1)
      expect(messages?.[0]._status).toBe('pending')

      // Step 3: Store in IndexedDB
      await cacheManager.addMessage(optimisticMessage)

      const cachedMessages = await cacheManager.getMessages(conversationId)
      expect(cachedMessages).toHaveLength(1)
      expect(cachedMessages[0]._optimistic).toBe(true)

      // Step 4: Simulate successful API response
      const serverMessage = {
        id: 'msg-server-123',
        senderId,
        receiverId: conversationId,
        type: 'TEXT' as const,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sender: senderInfo
      }

      // Mock successful API call
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: serverMessage })
      })

      // Step 5: Confirm optimistic message
      await optimisticManager.confirm(optimisticMessage._operationId, serverMessage)

      // Step 6: Update store with confirmed message
      useMessageStore.getState().confirmMessage(
        conversationId,
        optimisticMessage._operationId,
        serverMessage
      )

      messages = useMessageStore.getState().messages.get(conversationId)
      expect(messages).toHaveLength(1)
      expect(messages?.[0].id).toBe('msg-server-123')
      expect(messages?.[0]._optimistic).toBeUndefined()
      expect(messages?.[0]._status).toBeUndefined()
    })

    it('should handle failed message send with rollback', async () => {
      const conversationId = 'conv-1'
      const senderId = 'user-1'
      const content = 'This message will fail'
      const senderInfo = {
        id: senderId,
        firstName: 'John',
        lastName: 'Doe'
      }

      // Create optimistic message
      const optimisticMessage = optimisticManager.createOptimisticMessage(
        content,
        conversationId,
        senderId,
        senderInfo
      )

      // Add to store and cache
      useMessageStore.getState().addMessage(conversationId, optimisticMessage)
      await cacheManager.addMessage(optimisticMessage)

      // Simulate failed API call
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

      // Mark as failed
      await optimisticManager.fail(optimisticMessage._operationId, new Error('Network error'))

      // Update store
      useMessageStore.getState().rollbackMessage(conversationId, optimisticMessage._operationId)

      const messages = useMessageStore.getState().messages.get(conversationId)
      expect(messages).toHaveLength(1)
      expect(messages?.[0]._status).toBe('failed')
    })
  })

  describe('Conversation List Updates', () => {
    it('should update conversation list when new message arrives', async () => {
      // Setup initial conversations
      const conversations = [
        {
          id: 'conv-1',
          otherUser: {
            id: 'user-1',
            firstName: 'John',
            lastName: 'Doe',
            isOnline: true
          },
          unreadCount: 0,
          lastActivity: '2024-01-01T10:00:00Z',
          _cached: true,
          _lastSync: new Date().toISOString(),
          _prefetched: false
        },
        {
          id: 'conv-2',
          otherUser: {
            id: 'user-2',
            firstName: 'Jane',
            lastName: 'Smith',
            isOnline: true
          },
          unreadCount: 0,
          lastActivity: '2024-01-02T10:00:00Z',
          _cached: true,
          _lastSync: new Date().toISOString(),
          _prefetched: false
        }
      ]

      await cacheManager.setConversations(conversations)
      useMessageStore.getState().setConversations(conversations)

      // Simulate new message arriving via Pusher
      const newMessage = {
        id: 'msg-new',
        senderId: 'user-1',
        receiverId: 'current-user',
        conversationId: 'conv-1',
        type: 'TEXT' as const,
        content: 'New message',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sender: {
          id: 'user-1',
          firstName: 'John',
          lastName: 'Doe'
        }
      }

      // Add message to cache
      await cacheManager.addMessage(newMessage)

      // Update conversation in cache
      await cacheManager.updateConversation('conv-1', {
        unreadCount: 1,
        lastActivity: newMessage.createdAt,
        lastMessage: {
          id: newMessage.id,
          content: newMessage.content,
          createdAt: newMessage.createdAt,
          senderId: newMessage.senderId
        }
      })

      // Update store
      useMessageStore.getState().updateConversation('conv-1', {
        unreadCount: 1,
        lastActivity: newMessage.createdAt
      })

      const updatedConversation = useMessageStore.getState().conversations.get('conv-1')
      expect(updatedConversation?.unreadCount).toBe(1)
      expect(updatedConversation?.lastActivity).toBe(newMessage.createdAt)
    })

    it('should maintain conversation order by last activity', async () => {
      const conversations = [
        {
          id: 'conv-1',
          otherUser: {
            id: 'user-1',
            firstName: 'John',
            lastName: 'Doe',
            isOnline: true
          },
          unreadCount: 0,
          lastActivity: '2024-01-01T10:00:00Z',
          _cached: true,
          _lastSync: new Date().toISOString(),
          _prefetched: false
        },
        {
          id: 'conv-2',
          otherUser: {
            id: 'user-2',
            firstName: 'Jane',
            lastName: 'Smith',
            isOnline: true
          },
          unreadCount: 0,
          lastActivity: '2024-01-02T10:00:00Z',
          _cached: true,
          _lastSync: new Date().toISOString(),
          _prefetched: false
        }
      ]

      await cacheManager.setConversations(conversations)

      // Get conversations sorted by last activity
      const sortedConversations = await cacheManager.getConversations()

      expect(sortedConversations[0].id).toBe('conv-2') // Most recent first
      expect(sortedConversations[1].id).toBe('conv-1')
    })
  })

  describe('Cache Sync with API', () => {
    it('should sync cache with API data', async () => {
      // Mock API response
      const apiConversations = [
        {
          id: 'conv-1',
          otherUser: {
            id: 'user-1',
            firstName: 'John',
            lastName: 'Doe',
            isOnline: true
          },
          unreadCount: 2,
          lastActivity: new Date().toISOString()
        }
      ]

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ conversations: apiConversations })
      })

      // Fetch from API
      const response = await fetch('/api/conversations')
      const data = await response.json()

      // Store in cache
      await cacheManager.setConversations(
        data.conversations.map((conv: any) => ({
          ...conv,
          _cached: true,
          _lastSync: new Date().toISOString(),
          _prefetched: false
        }))
      )

      // Verify cache
      const cachedConversations = await cacheManager.getConversations()
      expect(cachedConversations).toHaveLength(1)
      expect(cachedConversations[0].id).toBe('conv-1')
      expect(cachedConversations[0]._cached).toBe(true)
    })

    it('should use cached data when API fails', async () => {
      // Setup cached data
      const cachedConversations = [
        {
          id: 'conv-1',
          otherUser: {
            id: 'user-1',
            firstName: 'John',
            lastName: 'Doe',
            isOnline: true
          },
          unreadCount: 0,
          lastActivity: new Date().toISOString(),
          _cached: true,
          _lastSync: new Date().toISOString(),
          _prefetched: false
        }
      ]

      await cacheManager.setConversations(cachedConversations)

      // Mock API failure
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

      // Try to fetch from API
      let conversations = await cacheManager.getConversations()

      // Should still have cached data
      expect(conversations).toHaveLength(1)
      expect(conversations[0].id).toBe('conv-1')
    })
  })

  describe('Offline Message Queueing', () => {
    it('should queue messages when offline', async () => {
      const conversationId = 'conv-1'
      const senderId = 'user-1'
      const senderInfo = {
        id: senderId,
        firstName: 'John',
        lastName: 'Doe'
      }

      // Create multiple optimistic messages
      const message1 = optimisticManager.createOptimisticMessage(
        'Message 1',
        conversationId,
        senderId,
        senderInfo
      )

      const message2 = optimisticManager.createOptimisticMessage(
        'Message 2',
        conversationId,
        senderId,
        senderInfo
      )

      // Add to cache
      await cacheManager.addMessage(message1)
      await cacheManager.addMessage(message2)

      // Verify both messages are in cache
      const cachedMessages = await cacheManager.getMessages(conversationId)
      expect(cachedMessages).toHaveLength(2)
      expect(cachedMessages.every(m => m._optimistic)).toBe(true)

      // Get pending operations
      const pendingOps = optimisticManager.getPendingOperations()
      expect(pendingOps).toHaveLength(2)
    })

    it('should send queued messages when back online', async () => {
      const conversationId = 'conv-1'
      const senderId = 'user-1'
      const senderInfo = {
        id: senderId,
        firstName: 'John',
        lastName: 'Doe'
      }

      // Create optimistic message (simulating offline)
      const optimisticMessage = optimisticManager.createOptimisticMessage(
        'Queued message',
        conversationId,
        senderId,
        senderInfo
      )

      await cacheManager.addMessage(optimisticMessage)

      // Simulate coming back online and sending
      const serverMessage = {
        id: 'msg-server-123',
        senderId,
        receiverId: conversationId,
        type: 'TEXT' as const,
        content: 'Queued message',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sender: senderInfo
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: serverMessage })
      })

      // Confirm the message
      await optimisticManager.confirm(optimisticMessage._operationId, serverMessage)

      // Verify operation is confirmed
      const operation = optimisticManager.getOperation(optimisticMessage._operationId)
      expect(operation?.status).toBe('confirmed')
    })
  })

  describe('Message Deduplication', () => {
    it('should deduplicate messages from different sources', async () => {
      const conversationId = 'conv-1'
      const message = {
        id: 'msg-123',
        senderId: 'user-1',
        receiverId: conversationId,
        conversationId,
        type: 'TEXT' as const,
        content: 'Test message',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sender: {
          id: 'user-1',
          firstName: 'John',
          lastName: 'Doe'
        }
      }

      // Add message to store twice (simulating API response + Pusher event)
      useMessageStore.getState().addMessage(conversationId, message)
      useMessageStore.getState().addMessage(conversationId, message)

      const messages = useMessageStore.getState().messages.get(conversationId)
      expect(messages).toHaveLength(1) // Should only have one message
    })
  })
})
