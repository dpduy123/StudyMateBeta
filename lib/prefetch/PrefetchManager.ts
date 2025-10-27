/**
 * PrefetchManager
 * 
 * Manages smart prefetching of conversation messages to eliminate perceived latency.
 * Implements priority queue, request deduplication, and concurrent request limiting.
 */

import { CacheManager } from '../cache/CacheManager'
import { BehaviorTracker } from './BehaviorTracker'

export interface PrefetchRequest {
  conversationId: string
  priority: number // Higher = more important
  timestamp: number
  trigger: 'hover' | 'scroll' | 'predictive' | 'top-conversations'
  status: 'pending' | 'in-progress' | 'completed' | 'failed'
}

export interface PrefetchConfig {
  maxConcurrentRequests: number
  hoverDelay: number // ms to wait before prefetching on hover
  topConversationsCount: number
  scrollPrefetchCount: number
}

export class PrefetchManager {
  private cacheManager: CacheManager
  private behaviorTracker: BehaviorTracker
  private requestQueue: PrefetchRequest[] = []
  private inProgressRequests: Set<string> = new Set()
  private completedRequests: Set<string> = new Set()
  private config: PrefetchConfig
  private isProcessing = false
  private hoverTimers: Map<string, NodeJS.Timeout> = new Map()

  constructor(
    cacheManager: CacheManager,
    behaviorTracker: BehaviorTracker,
    config: Partial<PrefetchConfig> = {}
  ) {
    this.cacheManager = cacheManager
    this.behaviorTracker = behaviorTracker
    this.config = {
      maxConcurrentRequests: 3,
      hoverDelay: 200,
      topConversationsCount: 5,
      scrollPrefetchCount: 3,
      ...config
    }
  }

  /**
   * Add a prefetch request to the priority queue
   */
  addToPrefetchQueue(
    conversationId: string,
    priority: number,
    trigger: PrefetchRequest['trigger']
  ): void {
    // Check if already completed
    if (this.completedRequests.has(conversationId)) {
      return
    }

    // Check if already in progress
    if (this.inProgressRequests.has(conversationId)) {
      return
    }

    // Check if already in queue - update priority if higher
    const existingIndex = this.requestQueue.findIndex(
      req => req.conversationId === conversationId
    )

    if (existingIndex !== -1) {
      const existing = this.requestQueue[existingIndex]
      if (priority > existing.priority) {
        existing.priority = priority
        existing.trigger = trigger
        // Re-sort queue
        this.sortQueue()
      }
      return
    }

    // Add new request
    const request: PrefetchRequest = {
      conversationId,
      priority,
      timestamp: Date.now(),
      trigger,
      status: 'pending'
    }

    this.requestQueue.push(request)
    this.sortQueue()

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processPrefetchQueue()
    }
  }

  /**
   * Sort queue by priority (highest first)
   */
  private sortQueue(): void {
    this.requestQueue.sort((a, b) => b.priority - a.priority)
  }

  /**
   * Process the prefetch queue with concurrent request limiting
   */
  private async processPrefetchQueue(): Promise<void> {
    if (this.isProcessing) {
      return
    }

    this.isProcessing = true

    while (this.requestQueue.length > 0) {
      // Wait if we've hit the concurrent request limit
      while (this.inProgressRequests.size >= this.config.maxConcurrentRequests) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Get next request
      const request = this.requestQueue.shift()
      if (!request) continue

      // Skip if already completed or in progress
      if (
        this.completedRequests.has(request.conversationId) ||
        this.inProgressRequests.has(request.conversationId)
      ) {
        continue
      }

      // Start prefetch (non-blocking)
      this.prefetchConversation(request)
    }

    this.isProcessing = false
  }

  /**
   * Prefetch a single conversation's messages
   */
  private async prefetchConversation(request: PrefetchRequest): Promise<void> {
    const { conversationId } = request

    // Mark as in progress
    this.inProgressRequests.add(conversationId)
    request.status = 'in-progress'

    try {
      // Check if already cached
      const cachedMessages = await this.cacheManager.getMessages(conversationId, 20)
      
      if (cachedMessages.length > 0) {
        // Already cached, mark as complete
        this.completedRequests.add(conversationId)
        this.inProgressRequests.delete(conversationId)
        request.status = 'completed'
        return
      }

      // Fetch from API
      const response = await fetch(`/api/messages/${conversationId}?limit=20`)
      
      if (!response.ok) {
        throw new Error(`Failed to prefetch: ${response.statusText}`)
      }

      const data = await response.json()
      const messages = data.messages || []

      // Store in cache
      for (const message of messages) {
        await this.cacheManager.addMessage(message)
      }

      // Mark conversation as prefetched
      await this.cacheManager.updateConversation(conversationId, {
        _prefetched: true,
        _lastSync: new Date().toISOString()
      })

      // Mark as completed
      this.completedRequests.add(conversationId)
      request.status = 'completed'

      console.log(`[Prefetch] Successfully prefetched conversation ${conversationId} (${request.trigger})`)
    } catch (error) {
      console.error(`[Prefetch] Failed to prefetch conversation ${conversationId}:`, error)
      request.status = 'failed'
    } finally {
      this.inProgressRequests.delete(conversationId)
    }
  }

  /**
   * Prefetch on hover with delay
   */
  prefetchOnHover(conversationId: string): () => void {
    // Clear existing timer if any
    const existingTimer = this.hoverTimers.get(conversationId)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // Set new timer
    const timer = setTimeout(() => {
      this.addToPrefetchQueue(conversationId, 80, 'hover')
      this.hoverTimers.delete(conversationId)
    }, this.config.hoverDelay)

    this.hoverTimers.set(conversationId, timer)

    // Return cleanup function
    return () => {
      const timer = this.hoverTimers.get(conversationId)
      if (timer) {
        clearTimeout(timer)
        this.hoverTimers.delete(conversationId)
      }
    }
  }

  /**
   * Cancel hover prefetch
   */
  cancelHoverPrefetch(conversationId: string): void {
    const timer = this.hoverTimers.get(conversationId)
    if (timer) {
      clearTimeout(timer)
      this.hoverTimers.delete(conversationId)
    }
  }

  /**
   * Prefetch top N conversations by recent activity
   */
  async prefetchTopConversations(count?: number): Promise<void> {
    const prefetchCount = count || this.config.topConversationsCount

    try {
      // Get conversations from cache
      const conversations = await this.cacheManager.getConversations()

      // Sort by last activity (most recent first)
      const sortedConversations = conversations
        .sort((a, b) => 
          new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
        )
        .slice(0, prefetchCount)

      // Add to prefetch queue with high priority
      for (let i = 0; i < sortedConversations.length; i++) {
        const conversation = sortedConversations[i]
        // Priority decreases with position: 100, 95, 90, 85, 80
        const priority = 100 - (i * 5)
        this.addToPrefetchQueue(conversation.id, priority, 'top-conversations')
      }

      console.log(`[Prefetch] Queued top ${sortedConversations.length} conversations for prefetching`)
    } catch (error) {
      console.error('[Prefetch] Failed to prefetch top conversations:', error)
    }
  }

  /**
   * Prefetch next N conversations in scroll direction
   */
  prefetchOnScroll(visibleConversationIds: string[], allConversationIds: string[]): void {
    if (visibleConversationIds.length === 0 || allConversationIds.length === 0) {
      return
    }

    // Find the last visible conversation
    const lastVisibleId = visibleConversationIds[visibleConversationIds.length - 1]
    const lastVisibleIndex = allConversationIds.indexOf(lastVisibleId)

    if (lastVisibleIndex === -1) {
      return
    }

    // Prefetch next N conversations
    const nextConversations = allConversationIds.slice(
      lastVisibleIndex + 1,
      lastVisibleIndex + 1 + this.config.scrollPrefetchCount
    )

    for (let i = 0; i < nextConversations.length; i++) {
      const conversationId = nextConversations[i]
      // Priority: 70, 65, 60
      const priority = 70 - (i * 5)
      this.addToPrefetchQueue(conversationId, priority, 'scroll')
    }
  }

  /**
   * Prefetch predicted next conversation based on user behavior
   */
  prefetchPredicted(currentConversationId?: string): void {
    const predictedId = this.behaviorTracker.predictNext(currentConversationId)
    
    if (predictedId) {
      // High priority for predicted conversation
      this.addToPrefetchQueue(predictedId, 90, 'predictive')
      console.log(`[Prefetch] Queued predicted conversation: ${predictedId}`)
    }
  }

  /**
   * Track user behavior for prediction
   */
  trackBehavior(conversationId: string, action: 'open' | 'hover' | 'message_sent'): void {
    this.behaviorTracker.track(conversationId, action)
  }

  /**
   * Get prefetch statistics
   */
  getStats(): {
    queueSize: number
    inProgress: number
    completed: number
    pendingRequests: PrefetchRequest[]
  } {
    return {
      queueSize: this.requestQueue.length,
      inProgress: this.inProgressRequests.size,
      completed: this.completedRequests.size,
      pendingRequests: [...this.requestQueue]
    }
  }

  /**
   * Clear all prefetch state
   */
  clear(): void {
    this.requestQueue = []
    this.inProgressRequests.clear()
    this.completedRequests.clear()
    
    // Clear all hover timers
    const timers = Array.from(this.hoverTimers.values())
    for (const timer of timers) {
      clearTimeout(timer)
    }
    this.hoverTimers.clear()
  }

  /**
   * Reset completed requests (useful for cache invalidation)
   */
  resetCompleted(): void {
    this.completedRequests.clear()
  }
}

// Singleton instance
let prefetchManagerInstance: PrefetchManager | null = null

/**
 * Get or create PrefetchManager instance
 */
export function getPrefetchManager(
  cacheManager?: CacheManager,
  behaviorTracker?: BehaviorTracker,
  config?: Partial<PrefetchConfig>
): PrefetchManager {
  if (!prefetchManagerInstance) {
    if (!cacheManager) {
      throw new Error('CacheManager is required to initialize PrefetchManager')
    }
    if (!behaviorTracker) {
      throw new Error('BehaviorTracker is required to initialize PrefetchManager')
    }
    prefetchManagerInstance = new PrefetchManager(cacheManager, behaviorTracker, config)
  }
  return prefetchManagerInstance
}
