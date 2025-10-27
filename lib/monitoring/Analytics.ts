/**
 * User Analytics for Messaging System
 * Tracks user events: conversation opened, message sent, prefetch triggered, errors
 */

interface AnalyticsEvent {
  name: string
  timestamp: number
  userId?: string
  properties?: Record<string, any>
}

interface ConversationOpenedEvent {
  conversationId: string
  loadTime: number
  cacheHit: boolean
  userId?: string
}

interface MessageSentEvent {
  messageId: string
  conversationId: string
  optimistic: boolean
  deliveryTime: number
  userId?: string
}

interface PrefetchTriggeredEvent {
  conversationId: string
  trigger: 'hover' | 'scroll' | 'predictive' | 'top'
  userId?: string
}

interface ErrorEvent {
  error: string
  context: string
  stack?: string
  userId?: string
  metadata?: Record<string, any>
}

class Analytics {
  private static instance: Analytics
  private events: AnalyticsEvent[] = []
  private maxEvents = 1000
  private userId?: string

  private constructor() {}

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics()
    }
    return Analytics.instance
  }

  /**
   * Set current user ID for tracking
   */
  setUserId(userId: string) {
    this.userId = userId
  }

  /**
   * Clear user ID
   */
  clearUserId() {
    this.userId = undefined
  }

  /**
   * Track a generic event
   */
  track(name: string, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      name,
      timestamp: Date.now(),
      userId: this.userId,
      properties
    }

    this.events.push(event)

    // Keep only last N events
    if (this.events.length > this.maxEvents) {
      this.events.shift()
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] ${name}`, properties || '')
    }

    // Send to external analytics service (placeholder)
    this.sendToAnalyticsService(event)
  }

  /**
   * Track conversation opened event
   */
  trackConversationOpened(data: ConversationOpenedEvent) {
    this.track('conversation_opened', {
      conversationId: data.conversationId,
      loadTime: data.loadTime,
      cacheHit: data.cacheHit,
      userId: data.userId || this.userId
    })
  }

  /**
   * Track message sent event
   */
  trackMessageSent(data: MessageSentEvent) {
    this.track('message_sent', {
      messageId: data.messageId,
      conversationId: data.conversationId,
      optimistic: data.optimistic,
      deliveryTime: data.deliveryTime,
      userId: data.userId || this.userId
    })
  }

  /**
   * Track prefetch triggered event
   */
  trackPrefetchTriggered(data: PrefetchTriggeredEvent) {
    this.track('prefetch_triggered', {
      conversationId: data.conversationId,
      trigger: data.trigger,
      userId: data.userId || this.userId
    })
  }

  /**
   * Track error event
   */
  trackError(data: ErrorEvent) {
    this.track('error', {
      error: data.error,
      context: data.context,
      stack: data.stack,
      userId: data.userId || this.userId,
      ...data.metadata
    })
  }

  /**
   * Track message received event
   */
  trackMessageReceived(conversationId: string, messageId: string) {
    this.track('message_received', {
      conversationId,
      messageId,
      userId: this.userId
    })
  }

  /**
   * Track message read event
   */
  trackMessageRead(conversationId: string, messageId: string) {
    this.track('message_read', {
      conversationId,
      messageId,
      userId: this.userId
    })
  }

  /**
   * Track message edited event
   */
  trackMessageEdited(messageId: string, conversationId: string) {
    this.track('message_edited', {
      messageId,
      conversationId,
      userId: this.userId
    })
  }

  /**
   * Track message deleted event
   */
  trackMessageDeleted(messageId: string, conversationId: string) {
    this.track('message_deleted', {
      messageId,
      conversationId,
      userId: this.userId
    })
  }

  /**
   * Track message reaction event
   */
  trackMessageReaction(messageId: string, conversationId: string, emoji: string) {
    this.track('message_reaction', {
      messageId,
      conversationId,
      emoji,
      userId: this.userId
    })
  }

  /**
   * Track search event
   */
  trackSearch(query: string, resultsCount: number) {
    this.track('search', {
      query,
      resultsCount,
      userId: this.userId
    })
  }

  /**
   * Track file upload event
   */
  trackFileUpload(fileType: string, fileSize: number, conversationId: string) {
    this.track('file_upload', {
      fileType,
      fileSize,
      conversationId,
      userId: this.userId
    })
  }

  /**
   * Track cache operation
   */
  trackCacheOperation(operation: 'hit' | 'miss' | 'set' | 'clear', source: string) {
    this.track('cache_operation', {
      operation,
      source,
      userId: this.userId
    })
  }

  /**
   * Track API call
   */
  trackAPICall(endpoint: string, method: string, duration: number, status: number) {
    this.track('api_call', {
      endpoint,
      method,
      duration,
      status,
      userId: this.userId
    })
  }

  /**
   * Get all events
   */
  getAllEvents(): AnalyticsEvent[] {
    return [...this.events]
  }

  /**
   * Get events by name
   */
  getEventsByName(name: string): AnalyticsEvent[] {
    return this.events.filter(e => e.name === name)
  }

  /**
   * Get events by user
   */
  getEventsByUser(userId: string): AnalyticsEvent[] {
    return this.events.filter(e => e.userId === userId)
  }

  /**
   * Get events in time range
   */
  getEventsInRange(startTime: number, endTime: number): AnalyticsEvent[] {
    return this.events.filter(e => e.timestamp >= startTime && e.timestamp <= endTime)
  }

  /**
   * Get event counts by name
   */
  getEventCounts(): Record<string, number> {
    const counts: Record<string, number> = {}
    this.events.forEach(event => {
      counts[event.name] = (counts[event.name] || 0) + 1
    })
    return counts
  }

  /**
   * Clear all events
   */
  clearEvents() {
    this.events = []
  }

  /**
   * Export events for external analytics
   */
  exportEvents() {
    return {
      events: this.events,
      counts: this.getEventCounts(),
      totalEvents: this.events.length,
      userId: this.userId
    }
  }

  /**
   * Send event to external analytics service
   * This is a placeholder - integrate with your analytics provider
   */
  private sendToAnalyticsService(event: AnalyticsEvent) {
    // Placeholder for external analytics integration
    // Examples: Google Analytics, Mixpanel, Amplitude, etc.
    
    // Example: Send to Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.name, event.properties)
    }

    // Example: Send to custom analytics endpoint
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
      fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }).catch(err => {
        console.error('Failed to send analytics event:', err)
      })
    }
  }
}

export const analytics = Analytics.getInstance()
export { Analytics }
export type {
  AnalyticsEvent,
  ConversationOpenedEvent,
  MessageSentEvent,
  PrefetchTriggeredEvent,
  ErrorEvent
}
