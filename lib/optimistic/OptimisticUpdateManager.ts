/**
 * OptimisticUpdateManager
 * 
 * Manages optimistic UI updates for instant feedback on user actions.
 * Handles temporary ID generation, operation tracking, and retry queue for failed operations.
 */

import { CacheManager } from '../cache/CacheManager'

export interface OptimisticOperation {
  id: string
  type: 'send' | 'edit' | 'delete'
  conversationId: string
  messageId?: string
  content?: string
  timestamp: number
  retryCount: number
  maxRetries: number
  status: 'pending' | 'confirmed' | 'failed'
}

export interface OptimisticMessage {
  id: string
  senderId: string
  receiverId?: string
  roomId?: string
  type: 'TEXT' | 'FILE' | 'VOICE' | 'VIDEO'
  content: string
  createdAt: string
  updatedAt: string
  sender: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  }
  _optimistic: true
  _operationId: string
  _status: 'pending' | 'confirmed' | 'failed'
}

export class OptimisticUpdateManager {
  private operations: Map<string, OptimisticOperation> = new Map()
  private retryQueue: OptimisticOperation[] = []
  private cacheManager: CacheManager
  private isProcessingQueue = false

  constructor(cacheManager: CacheManager) {
    this.cacheManager = cacheManager
  }

  /**
   * Generate a unique temporary ID for optimistic operations
   */
  generateTempId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 11)
    return `temp-${timestamp}-${random}`
  }

  /**
   * Create an optimistic message for immediate display
   */
  createOptimisticMessage(
    content: string,
    conversationId: string,
    senderId: string,
    senderInfo: OptimisticMessage['sender'],
    type: 'TEXT' | 'FILE' | 'VOICE' | 'VIDEO' = 'TEXT'
  ): OptimisticMessage {
    const operationId = this.generateTempId()
    const now = new Date().toISOString()

    const optimisticMessage: OptimisticMessage = {
      id: operationId,
      senderId,
      receiverId: conversationId,
      type,
      content,
      createdAt: now,
      updatedAt: now,
      sender: senderInfo,
      _optimistic: true,
      _operationId: operationId,
      _status: 'pending'
    }

    // Track the operation
    this.trackOperation({
      id: operationId,
      type: 'send',
      conversationId,
      content,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: 3,
      status: 'pending'
    })

    return optimisticMessage
  }

  /**
   * Track an optimistic operation
   */
  private trackOperation(operation: OptimisticOperation): void {
    this.operations.set(operation.id, operation)
  }

  /**
   * Get an operation by ID
   */
  getOperation(operationId: string): OptimisticOperation | undefined {
    return this.operations.get(operationId)
  }

  /**
   * Confirm a successful operation
   */
  async confirm(operationId: string, serverData: any): Promise<void> {
    const operation = this.operations.get(operationId)
    if (!operation) {
      console.warn(`Operation ${operationId} not found`)
      return
    }

    // Update operation status
    operation.status = 'confirmed'
    this.operations.set(operationId, operation)

    // Update IndexedDB cache - replace temp message with server message
    try {
      await this.cacheManager.updateMessage(operationId, {
        ...serverData,
        _optimistic: false,
        _status: 'confirmed'
      })
    } catch (error) {
      console.error('Failed to update cache on confirm:', error)
    }

    // Clean up operation after a delay
    setTimeout(() => {
      this.operations.delete(operationId)
    }, 5000)
  }

  /**
   * Mark an operation as failed and add to retry queue
   */
  async fail(operationId: string, error?: Error): Promise<void> {
    const operation = this.operations.get(operationId)
    if (!operation) {
      console.warn(`Operation ${operationId} not found`)
      return
    }

    // Update operation status
    operation.status = 'failed'
    this.operations.set(operationId, operation)

    // Update message status in cache
    try {
      await this.cacheManager.updateMessage(operationId, {
        _status: 'failed'
      })
    } catch (cacheError) {
      console.error('Failed to update cache on fail:', cacheError)
    }

    // Add to retry queue if retries remaining
    if (operation.retryCount < operation.maxRetries) {
      this.addToRetryQueue(operation)
    } else {
      console.error(`Operation ${operationId} failed after ${operation.maxRetries} retries`, error)
    }
  }

  /**
   * Rollback an operation (remove optimistic update)
   */
  async rollback(operationId: string): Promise<void> {
    const operation = this.operations.get(operationId)
    if (!operation) {
      console.warn(`Operation ${operationId} not found`)
      return
    }

    // Remove from cache
    try {
      await this.cacheManager.deleteMessage(operationId)
    } catch (error) {
      console.error('Failed to rollback message from cache:', error)
    }

    // Remove from operations
    this.operations.delete(operationId)

    // Remove from retry queue if present
    this.retryQueue = this.retryQueue.filter(op => op.id !== operationId)
  }

  /**
   * Add operation to retry queue
   */
  private addToRetryQueue(operation: OptimisticOperation): void {
    // Check if already in queue
    if (this.retryQueue.find(op => op.id === operation.id)) {
      return
    }

    this.retryQueue.push(operation)
    
    // Start processing queue if not already processing
    if (!this.isProcessingQueue) {
      this.processRetryQueue()
    }
  }

  /**
   * Process retry queue with exponential backoff
   */
  private async processRetryQueue(): Promise<void> {
    if (this.isProcessingQueue || this.retryQueue.length === 0) {
      return
    }

    this.isProcessingQueue = true

    while (this.retryQueue.length > 0) {
      const operation = this.retryQueue.shift()
      if (!operation) continue

      // Calculate backoff delay: 1s, 2s, 4s, 8s...
      const backoffDelay = Math.min(1000 * Math.pow(2, operation.retryCount), 10000)
      
      // Wait for backoff period
      await new Promise(resolve => setTimeout(resolve, backoffDelay))

      // Increment retry count
      operation.retryCount++
      operation.status = 'pending'
      this.operations.set(operation.id, operation)

      // Update cache to show pending status
      try {
        await this.cacheManager.updateMessage(operation.id, {
          _status: 'pending'
        })
      } catch (error) {
        console.error('Failed to update cache during retry:', error)
      }

      // Note: The actual retry logic (API call) should be handled by the caller
      // This manager just tracks the retry state
    }

    this.isProcessingQueue = false
  }

  /**
   * Manually retry a failed operation
   */
  async retry(operationId: string): Promise<OptimisticOperation | null> {
    const operation = this.operations.get(operationId)
    if (!operation) {
      console.warn(`Operation ${operationId} not found`)
      return null
    }

    if (operation.status !== 'failed') {
      console.warn(`Operation ${operationId} is not in failed state`)
      return null
    }

    // Reset status to pending
    operation.status = 'pending'
    operation.retryCount++
    this.operations.set(operationId, operation)

    // Update cache
    try {
      await this.cacheManager.updateMessage(operationId, {
        _status: 'pending'
      })
    } catch (error) {
      console.error('Failed to update cache during manual retry:', error)
    }

    return operation
  }

  /**
   * Get all pending operations
   */
  getPendingOperations(): OptimisticOperation[] {
    return Array.from(this.operations.values()).filter(op => op.status === 'pending')
  }

  /**
   * Get all failed operations
   */
  getFailedOperations(): OptimisticOperation[] {
    return Array.from(this.operations.values()).filter(op => op.status === 'failed')
  }

  /**
   * Clear all operations (useful for cleanup)
   */
  clearOperations(): void {
    this.operations.clear()
    this.retryQueue = []
  }

  /**
   * Get retry queue size
   */
  getRetryQueueSize(): number {
    return this.retryQueue.length
  }
}

// Singleton instance
let optimisticUpdateManagerInstance: OptimisticUpdateManager | null = null

/**
 * Get or create OptimisticUpdateManager instance
 */
export function getOptimisticUpdateManager(cacheManager?: CacheManager): OptimisticUpdateManager {
  if (!optimisticUpdateManagerInstance) {
    if (!cacheManager) {
      throw new Error('CacheManager is required to initialize OptimisticUpdateManager')
    }
    optimisticUpdateManagerInstance = new OptimisticUpdateManager(cacheManager)
  }
  return optimisticUpdateManagerInstance
}
