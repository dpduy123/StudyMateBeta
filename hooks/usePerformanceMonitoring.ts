'use client'

/**
 * React hook for performance monitoring
 * Provides easy access to performance tracking in components
 */

import { useEffect, useCallback } from 'react'
import { performanceMonitor } from '@/lib/monitoring/PerformanceMonitor'
import { analytics } from '@/lib/monitoring/Analytics'

export function usePerformanceMonitoring() {
  /**
   * Track conversation click latency
   */
  const trackConversationClick = useCallback(() => {
    const startTime = performance.now()
    return () => {
      performanceMonitor.trackConversationClick(startTime)
    }
  }, [])

  /**
   * Track message render time
   */
  const trackMessageRender = useCallback((messageCount: number) => {
    const startTime = performance.now()
    return () => {
      performanceMonitor.trackMessageRender(startTime, messageCount)
    }
  }, [])

  /**
   * Track cache hit
   */
  const trackCacheHit = useCallback((source: string) => {
    performanceMonitor.trackCacheHit(source)
  }, [])

  /**
   * Track cache miss
   */
  const trackCacheMiss = useCallback((source: string) => {
    performanceMonitor.trackCacheMiss(source)
  }, [])

  return {
    trackConversationClick,
    trackMessageRender,
    trackCacheHit,
    trackCacheMiss
  }
}

export function useAnalytics() {
  /**
   * Track conversation opened
   */
  const trackConversationOpened = useCallback(
    (conversationId: string, loadTime: number, cacheHit: boolean) => {
      analytics.trackConversationOpened({ conversationId, loadTime, cacheHit })
    },
    []
  )

  /**
   * Track message sent
   */
  const trackMessageSent = useCallback(
    (messageId: string, conversationId: string, optimistic: boolean, deliveryTime: number) => {
      analytics.trackMessageSent({ messageId, conversationId, optimistic, deliveryTime })
    },
    []
  )

  /**
   * Track prefetch triggered
   */
  const trackPrefetchTriggered = useCallback(
    (conversationId: string, trigger: 'hover' | 'scroll' | 'predictive' | 'top') => {
      analytics.trackPrefetchTriggered({ conversationId, trigger })
    },
    []
  )

  /**
   * Track error
   */
  const trackError = useCallback(
    (error: string, context: string, metadata?: Record<string, any>) => {
      analytics.trackError({ error, context, metadata })
    },
    []
  )

  /**
   * Track message received
   */
  const trackMessageReceived = useCallback(
    (conversationId: string, messageId: string) => {
      analytics.trackMessageReceived(conversationId, messageId)
    },
    []
  )

  /**
   * Track message read
   */
  const trackMessageRead = useCallback(
    (conversationId: string, messageId: string) => {
      analytics.trackMessageRead(conversationId, messageId)
    },
    []
  )

  /**
   * Track API call
   */
  const trackAPICall = useCallback(
    (endpoint: string, method: string, duration: number, status: number) => {
      analytics.trackAPICall(endpoint, method, duration, status)
    },
    []
  )

  /**
   * Set user ID for tracking
   */
  const setUserId = useCallback((userId: string) => {
    analytics.setUserId(userId)
  }, [])

  return {
    trackConversationOpened,
    trackMessageSent,
    trackPrefetchTriggered,
    trackError,
    trackMessageReceived,
    trackMessageRead,
    trackAPICall,
    setUserId
  }
}

/**
 * Hook to automatically track component mount/unmount performance
 */
export function useComponentPerformance(componentName: string) {
  useEffect(() => {
    const startTime = performance.now()

    return () => {
      const duration = performance.now() - startTime
      performanceMonitor.recordMetric(`${componentName}_lifetime`, duration)
    }
  }, [componentName])
}
