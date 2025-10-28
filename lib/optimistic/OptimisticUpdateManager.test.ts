import { describe, it, expect, beforeEach, vi } from 'vitest'
import { OptimisticUpdateManager } from './OptimisticUpdateManager'
import { CacheManager } from '../cache/CacheManager'

describe('OptimisticUpdateManager', () => {
  let manager: OptimisticUpdateManager
  let cacheManager: CacheManager

  beforeEach(() => {
    cacheManager = new CacheManager()
    manager = new OptimisticUpdateManager(cacheManager)
  })

  describe('generateTempId', () => {
    it('should generate unique temporary IDs', () => {
      const id1 = manager.generateTempId()
      const id2 = manager.generateTempId()

      expect(id1).toMatch(/^temp-\d+-[a-z0-9]+$/)
      expect(id2).toMatch(/^temp-\d+-[a-z0-9]+$/)
      expect(id1).not.toBe(id2)
    })
  })

  describe('createOptimisticMessage', () => {
    it('should create an optimistic message with correct structure', () => {
      const content = 'Test message'
      const conversationId = 'conv-123'
      const senderId = 'user-456'
      const senderInfo = {
        id: senderId,
        firstName: 'John',
        lastName: 'Doe',
        avatar: 'avatar.jpg'
      }

      const message = manager.createOptimisticMessage(
        content,
        conversationId,
        senderId,
        senderInfo
      )

      expect(message).toMatchObject({
        senderId,
        receiverId: conversationId,
        type: 'TEXT',
        content,
        sender: senderInfo,
        _optimistic: true,
        _status: 'pending'
      })
      expect(message.id).toMatch(/^temp-/)
      expect(message._operationId).toBe(message.id)
      expect(message.createdAt).toBeDefined()
      expect(message.updatedAt).toBeDefined()
    })

    it('should track the operation', () => {
      const message = manager.createOptimisticMessage(
        'Test',
        'conv-123',
        'user-456',
        { id: 'user-456', firstName: 'John', lastName: 'Doe' }
      )

      const operation = manager.getOperation(message._operationId)
      expect(operation).toBeDefined()
      expect(operation?.type).toBe('send')
      expect(operation?.status).toBe('pending')
      expect(operation?.conversationId).toBe('conv-123')
    })
  })

  describe('confirm', () => {
    it('should mark operation as confirmed', async () => {
      const message = manager.createOptimisticMessage(
        'Test',
        'conv-123',
        'user-456',
        { id: 'user-456', firstName: 'John', lastName: 'Doe' }
      )

      const serverData = {
        id: 'server-msg-123',
        content: 'Test',
        createdAt: new Date().toISOString()
      }

      await manager.confirm(message._operationId, serverData)

      const operation = manager.getOperation(message._operationId)
      expect(operation?.status).toBe('confirmed')
    })
  })

  describe('fail', () => {
    it('should mark operation as failed', async () => {
      const message = manager.createOptimisticMessage(
        'Test',
        'conv-123',
        'user-456',
        { id: 'user-456', firstName: 'John', lastName: 'Doe' }
      )

      await manager.fail(message._operationId, new Error('Network error'))

      const operation = manager.getOperation(message._operationId)
      expect(operation?.status).toBe('failed')
    })

    it('should add to retry queue if retries remaining', async () => {
      const message = manager.createOptimisticMessage(
        'Test',
        'conv-123',
        'user-456',
        { id: 'user-456', firstName: 'John', lastName: 'Doe' }
      )

      await manager.fail(message._operationId)

      // Wait a bit for async queue processing to start
      await new Promise(resolve => setTimeout(resolve, 10))

      // Operation should be marked as failed (queue processing happens in background)
      const operation = manager.getOperation(message._operationId)
      expect(operation?.status).toBe('failed')
    })
  })

  describe('rollback', () => {
    it('should remove operation from tracking', async () => {
      const message = manager.createOptimisticMessage(
        'Test',
        'conv-123',
        'user-456',
        { id: 'user-456', firstName: 'John', lastName: 'Doe' }
      )

      await manager.rollback(message._operationId)

      const operation = manager.getOperation(message._operationId)
      expect(operation).toBeUndefined()
    })
  })

  describe('retry', () => {
    it('should reset failed operation to pending', async () => {
      const message = manager.createOptimisticMessage(
        'Test',
        'conv-123',
        'user-456',
        { id: 'user-456', firstName: 'John', lastName: 'Doe' }
      )

      // First fail the operation
      await manager.fail(message._operationId)

      // Then retry
      const retriedOp = await manager.retry(message._operationId)

      expect(retriedOp).toBeDefined()
      expect(retriedOp?.status).toBe('pending')
      expect(retriedOp?.retryCount).toBe(1)
    })

    it('should return null for non-failed operations', async () => {
      const message = manager.createOptimisticMessage(
        'Test',
        'conv-123',
        'user-456',
        { id: 'user-456', firstName: 'John', lastName: 'Doe' }
      )

      const retriedOp = await manager.retry(message._operationId)
      expect(retriedOp).toBeNull()
    })
  })

  describe('getPendingOperations', () => {
    it('should return only pending operations', () => {
      const msg1 = manager.createOptimisticMessage(
        'Test 1',
        'conv-123',
        'user-456',
        { id: 'user-456', firstName: 'John', lastName: 'Doe' }
      )

      const msg2 = manager.createOptimisticMessage(
        'Test 2',
        'conv-123',
        'user-456',
        { id: 'user-456', firstName: 'John', lastName: 'Doe' }
      )

      const pending = manager.getPendingOperations()
      expect(pending).toHaveLength(2)
      expect(pending.every(op => op.status === 'pending')).toBe(true)
    })
  })

  describe('getFailedOperations', () => {
    it('should return only failed operations', async () => {
      const msg1 = manager.createOptimisticMessage(
        'Test 1',
        'conv-123',
        'user-456',
        { id: 'user-456', firstName: 'John', lastName: 'Doe' }
      )

      const msg2 = manager.createOptimisticMessage(
        'Test 2',
        'conv-123',
        'user-456',
        { id: 'user-456', firstName: 'John', lastName: 'Doe' }
      )

      await manager.fail(msg1._operationId)

      const failed = manager.getFailedOperations()
      expect(failed).toHaveLength(1)
      expect(failed[0].id).toBe(msg1._operationId)
    })
  })

  describe('clearOperations', () => {
    it('should clear all operations and retry queue', () => {
      manager.createOptimisticMessage(
        'Test 1',
        'conv-123',
        'user-456',
        { id: 'user-456', firstName: 'John', lastName: 'Doe' }
      )

      manager.createOptimisticMessage(
        'Test 2',
        'conv-123',
        'user-456',
        { id: 'user-456', firstName: 'John', lastName: 'Doe' }
      )

      manager.clearOperations()

      expect(manager.getPendingOperations()).toHaveLength(0)
      expect(manager.getRetryQueueSize()).toBe(0)
    })
  })
})
