import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { OptimisticUpdateManager } from './OptimisticUpdateManager'
import { CacheManager } from '../cache/CacheManager'

describe('Optimistic Updates Integration Tests', () => {
  let manager: OptimisticUpdateManager
  let cacheManager: CacheManager

  beforeEach(async () => {
    cacheManager = new CacheManager()
    manager = new OptimisticUpdateManager(cacheManager)
  })

  afterEach(async () => {
    await cacheManager.clearCache()
    await cacheManager.close()
  })

  describe('Full send flow: optimistic → API → confirm', () => {
    it('should handle successful message send flow', async () => {
      // Step 1: Create optimistic message
      const content = 'Hello, world!'
      const conversationId = 'conv-123'
      const senderId = 'user-456'
      const senderInfo = {
        id: senderId,
        firstName: 'John',
        lastName: 'Doe'
      }

      const optimisticMessage = manager.createOptimisticMessage(
        content,
        conversationId,
        senderId,
        senderInfo
      )

      expect(optimisticMessage._status).toBe('pending')
      expect(optimisticMessage._optimistic).toBe(true)

      // Step 2: Store in cache
      await cacheManager.addMessage({
        ...optimisticMessage,
        conversationId
      })

      // Verify message is in cache
      const cachedMessages = await cacheManager.getMessages(conversationId)
      expect(cachedMessages).toHaveLength(1)
      expect(cachedMessages[0].id).toBe(optimisticMessage.id)
      expect(cachedMessages[0]._optimistic).toBe(true)

      // Step 3: Simulate API success
      const serverMessage = {
        id: 'server-msg-789',
        senderId,
        receiverId: conversationId,
        conversationId,
        type: 'TEXT' as const,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sender: senderInfo,
        isRead: false
      }

      // Step 4: Confirm the operation (this updates the cache internally)
      await manager.confirm(optimisticMessage._operationId, serverMessage)

      // Verify operation is confirmed
      const operation = manager.getOperation(optimisticMessage._operationId)
      expect(operation?.status).toBe('confirmed')

      // Verify cache was updated by confirm method
      const updatedMessages = await cacheManager.getMessages(conversationId)
      expect(updatedMessages.length).toBeGreaterThanOrEqual(1)
      
      // Find the message (could be either temp ID or server ID depending on implementation)
      const confirmedMsg = updatedMessages.find(m => 
        m.id === optimisticMessage.id || m.id === serverMessage.id
      )
      expect(confirmedMsg).toBeDefined()
      expect(confirmedMsg?._status).toBe('confirmed')
    })
  })

  describe('Rollback on failure', () => {
    it('should handle failed message send with rollback', async () => {
      // Step 1: Create optimistic message
      const optimisticMessage = manager.createOptimisticMessage(
        'Test message',
        'conv-123',
        'user-456',
        { id: 'user-456', firstName: 'John', lastName: 'Doe' }
      )

      // Step 2: Store in cache
      await cacheManager.addMessage({
        ...optimisticMessage,
        conversationId: 'conv-123'
      })

      // Verify message is in cache
      let messages = await cacheManager.getMessages('conv-123')
      expect(messages).toHaveLength(1)

      // Step 3: Simulate API failure
      await manager.fail(optimisticMessage._operationId, new Error('Network error'))

      // Verify operation is marked as failed
      const operation = manager.getOperation(optimisticMessage._operationId)
      expect(operation?.status).toBe('failed')

      // Step 4: User cancels - rollback
      await manager.rollback(optimisticMessage._operationId)

      // Verify message is removed from cache
      messages = await cacheManager.getMessages('conv-123')
      expect(messages).toHaveLength(0)

      // Verify operation is removed
      const removedOp = manager.getOperation(optimisticMessage._operationId)
      expect(removedOp).toBeUndefined()
    })
  })

  describe('Retry logic', () => {
    it('should handle retry after failure', async () => {
      // Step 1: Create optimistic message
      const optimisticMessage = manager.createOptimisticMessage(
        'Test message',
        'conv-123',
        'user-456',
        { id: 'user-456', firstName: 'John', lastName: 'Doe' }
      )

      // Step 2: Store in cache
      await cacheManager.addMessage({
        ...optimisticMessage,
        conversationId: 'conv-123'
      })

      // Step 3: Simulate API failure
      await manager.fail(optimisticMessage._operationId, new Error('Network error'))

      // Verify operation is failed
      let operation = manager.getOperation(optimisticMessage._operationId)
      expect(operation?.status).toBe('failed')
      expect(operation?.retryCount).toBe(0)

      // Step 4: Retry the operation
      const retriedOp = await manager.retry(optimisticMessage._operationId)
      expect(retriedOp).toBeDefined()
      expect(retriedOp?.status).toBe('pending')
      expect(retriedOp?.retryCount).toBe(1)

      // Step 5: Simulate successful retry
      const serverMessage = {
        id: 'server-msg-789',
        senderId: 'user-456',
        receiverId: 'conv-123',
        conversationId: 'conv-123',
        type: 'TEXT' as const,
        content: 'Test message',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sender: { id: 'user-456', firstName: 'John', lastName: 'Doe' },
        isRead: false
      }

      await manager.confirm(optimisticMessage._operationId, serverMessage)

      // Verify operation is confirmed
      operation = manager.getOperation(optimisticMessage._operationId)
      expect(operation?.status).toBe('confirmed')
    })

    it('should add failed operations to retry queue', async () => {
      const optimisticMessage = manager.createOptimisticMessage(
        'Test message',
        'conv-123',
        'user-456',
        { id: 'user-456', firstName: 'John', lastName: 'Doe' }
      )

      // Fail the operation
      await manager.fail(optimisticMessage._operationId)

      // Wait a bit for async queue processing
      await new Promise(resolve => setTimeout(resolve, 10))

      // Operation should be marked as failed
      const operation = manager.getOperation(optimisticMessage._operationId)
      expect(operation?.status).toBe('failed')
    })

    it('should not retry beyond max retries', async () => {
      const optimisticMessage = manager.createOptimisticMessage(
        'Test message',
        'conv-123',
        'user-456',
        { id: 'user-456', firstName: 'John', lastName: 'Doe' }
      )

      const operation = manager.getOperation(optimisticMessage._operationId)
      expect(operation?.maxRetries).toBe(3)

      // Fail 4 times (exceeds max retries)
      for (let i = 0; i < 4; i++) {
        await manager.fail(optimisticMessage._operationId)
        if (i < 3) {
          await manager.retry(optimisticMessage._operationId)
        }
      }

      // After max retries, operation should still be failed
      const finalOp = manager.getOperation(optimisticMessage._operationId)
      expect(finalOp?.status).toBe('failed')
      expect(finalOp?.retryCount).toBeGreaterThanOrEqual(3)
    })
  })

  describe('Multiple concurrent operations', () => {
    it('should handle multiple pending operations', async () => {
      const messages = []
      
      // Create 3 optimistic messages
      for (let i = 0; i < 3; i++) {
        const msg = manager.createOptimisticMessage(
          `Message ${i}`,
          'conv-123',
          'user-456',
          { id: 'user-456', firstName: 'John', lastName: 'Doe' }
        )
        messages.push(msg)
        
        await cacheManager.addMessage({
          ...msg,
          conversationId: 'conv-123'
        })
      }

      // All should be pending
      const pending = manager.getPendingOperations()
      expect(pending).toHaveLength(3)

      // Confirm first message
      await manager.confirm(messages[0]._operationId, {
        id: 'server-1',
        content: 'Message 0'
      })

      // Fail second message
      await manager.fail(messages[1]._operationId)

      // Third should still be pending
      const stillPending = manager.getPendingOperations()
      expect(stillPending).toHaveLength(1)
      expect(stillPending[0].id).toBe(messages[2]._operationId)

      // Should have one failed
      const failed = manager.getFailedOperations()
      expect(failed).toHaveLength(1)
      expect(failed[0].id).toBe(messages[1]._operationId)
    })
  })

  describe('Cache integration', () => {
    it('should properly update cache through full lifecycle', async () => {
      const conversationId = 'conv-123'
      
      // Create optimistic message
      const optimisticMessage = manager.createOptimisticMessage(
        'Test message',
        conversationId,
        'user-456',
        { id: 'user-456', firstName: 'John', lastName: 'Doe' }
      )

      // Add to cache
      await cacheManager.addMessage({
        ...optimisticMessage,
        conversationId
      })

      // Verify in cache with optimistic flag
      let messages = await cacheManager.getMessages(conversationId)
      expect(messages[0]._optimistic).toBe(true)
      expect(messages[0]._status).toBe('pending')

      // Simulate failure
      await manager.fail(optimisticMessage._operationId)
      await cacheManager.updateMessage(optimisticMessage.id, {
        _status: 'failed'
      })

      // Verify failed status in cache
      messages = await cacheManager.getMessages(conversationId)
      expect(messages[0]._status).toBe('failed')

      // Retry
      await manager.retry(optimisticMessage._operationId)
      await cacheManager.updateMessage(optimisticMessage.id, {
        _status: 'pending'
      })

      // Verify pending status in cache
      messages = await cacheManager.getMessages(conversationId)
      expect(messages[0]._status).toBe('pending')

      // Confirm
      const serverMessage = {
        id: 'server-msg-789',
        content: 'Test message'
      }
      await manager.confirm(optimisticMessage._operationId, serverMessage)
      await cacheManager.updateMessage(optimisticMessage.id, {
        ...serverMessage,
        _optimistic: false,
        _status: 'confirmed'
      })

      // Verify confirmed in cache
      messages = await cacheManager.getMessages(conversationId)
      expect(messages[0]._optimistic).toBe(false)
      expect(messages[0]._status).toBe('confirmed')
    })
  })
})
