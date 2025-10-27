/**
 * Performance Monitoring for Messaging System
 * Tracks Web Vitals, conversation click latency, message render time, and cache metrics
 */

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  metadata?: Record<string, any>
}

interface CacheMetrics {
  hits: number
  misses: number
  hitRate: number
  totalRequests: number
}

interface ConversationMetrics {
  clickLatency: number[]
  averageClickLatency: number
  messageRenderTime: number[]
  averageMessageRenderTime: number
}

interface WebVitalsMetrics {
  CLS?: number // Cumulative Layout Shift
  FID?: number // First Input Delay
  FCP?: number // First Contentful Paint
  LCP?: number // Largest Contentful Paint
  TTFB?: number // Time to First Byte
  INP?: number // Interaction to Next Paint
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetric[] = []
  private cacheMetrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    totalRequests: 0
  }
  private conversationMetrics: ConversationMetrics = {
    clickLatency: [],
    averageClickLatency: 0,
    messageRenderTime: [],
    averageMessageRenderTime: 0
  }
  private webVitals: WebVitalsMetrics = {}
  private maxMetrics = 1000

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initWebVitals()
    }
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  /**
   * Initialize Web Vitals tracking
   */
  private initWebVitals() {
    if (typeof window === 'undefined') return

    // Track Web Vitals using PerformanceObserver
    try {
      // Track LCP (Largest Contentful Paint)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        this.webVitals.LCP = lastEntry.renderTime || lastEntry.loadTime
        this.recordMetric('LCP', this.webVitals.LCP)
      })
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })

      // Track FID (First Input Delay)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          this.webVitals.FID = entry.processingStart - entry.startTime
          this.recordMetric('FID', this.webVitals.FID)
        })
      })
      fidObserver.observe({ type: 'first-input', buffered: true })

      // Track CLS (Cumulative Layout Shift)
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
            this.webVitals.CLS = clsValue
            this.recordMetric('CLS', clsValue)
          }
        }
      })
      clsObserver.observe({ type: 'layout-shift', buffered: true })

      // Track FCP (First Contentful Paint)
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.webVitals.FCP = entry.startTime
            this.recordMetric('FCP', entry.startTime)
          }
        })
      })
      fcpObserver.observe({ type: 'paint', buffered: true })

      // Track Navigation Timing for TTFB
      if (window.performance && window.performance.timing) {
        window.addEventListener('load', () => {
          const timing = window.performance.timing
          this.webVitals.TTFB = timing.responseStart - timing.requestStart
          this.recordMetric('TTFB', this.webVitals.TTFB)
        })
      }
    } catch (error) {
      console.error('Error initializing Web Vitals:', error)
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(name: string, value: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata
    }

    this.metrics.push(metric)

    // Keep only last N metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift()
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${value.toFixed(2)}ms`, metadata || '')
    }
  }

  /**
   * Track conversation click latency
   */
  trackConversationClick(startTime: number) {
    const latency = performance.now() - startTime
    this.conversationMetrics.clickLatency.push(latency)
    
    // Keep only last 100 measurements
    if (this.conversationMetrics.clickLatency.length > 100) {
      this.conversationMetrics.clickLatency.shift()
    }

    // Calculate average
    this.conversationMetrics.averageClickLatency = 
      this.conversationMetrics.clickLatency.reduce((a, b) => a + b, 0) / 
      this.conversationMetrics.clickLatency.length

    this.recordMetric('conversation_click_latency', latency)
    
    return latency
  }

  /**
   * Track message render time
   */
  trackMessageRender(startTime: number, messageCount: number) {
    const renderTime = performance.now() - startTime
    this.conversationMetrics.messageRenderTime.push(renderTime)
    
    // Keep only last 100 measurements
    if (this.conversationMetrics.messageRenderTime.length > 100) {
      this.conversationMetrics.messageRenderTime.shift()
    }

    // Calculate average
    this.conversationMetrics.averageMessageRenderTime = 
      this.conversationMetrics.messageRenderTime.reduce((a, b) => a + b, 0) / 
      this.conversationMetrics.messageRenderTime.length

    this.recordMetric('message_render_time', renderTime, { messageCount })
    
    return renderTime
  }

  /**
   * Track cache hit
   */
  trackCacheHit(source: string) {
    this.cacheMetrics.hits++
    this.cacheMetrics.totalRequests++
    this.cacheMetrics.hitRate = this.cacheMetrics.hits / this.cacheMetrics.totalRequests
    
    this.recordMetric('cache_hit', 1, { source, hitRate: this.cacheMetrics.hitRate })
  }

  /**
   * Track cache miss
   */
  trackCacheMiss(source: string) {
    this.cacheMetrics.misses++
    this.cacheMetrics.totalRequests++
    this.cacheMetrics.hitRate = this.cacheMetrics.hits / this.cacheMetrics.totalRequests
    
    this.recordMetric('cache_miss', 1, { source, hitRate: this.cacheMetrics.hitRate })
  }

  /**
   * Get cache metrics
   */
  getCacheMetrics(): CacheMetrics {
    return { ...this.cacheMetrics }
  }

  /**
   * Get conversation metrics
   */
  getConversationMetrics(): ConversationMetrics {
    return { ...this.conversationMetrics }
  }

  /**
   * Get Web Vitals metrics
   */
  getWebVitals(): WebVitalsMetrics {
    return { ...this.webVitals }
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  /**
   * Get metrics by name
   */
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.name === name)
  }

  /**
   * Get metrics summary
   */
  getMetricsSummary() {
    const summary: Record<string, { count: number; average: number; min: number; max: number }> = {}

    this.metrics.forEach(metric => {
      if (!summary[metric.name]) {
        summary[metric.name] = {
          count: 0,
          average: 0,
          min: Infinity,
          max: -Infinity
        }
      }

      const s = summary[metric.name]
      s.count++
      s.average = ((s.average * (s.count - 1)) + metric.value) / s.count
      s.min = Math.min(s.min, metric.value)
      s.max = Math.max(s.max, metric.value)
    })

    return summary
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics = []
    this.cacheMetrics = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalRequests: 0
    }
    this.conversationMetrics = {
      clickLatency: [],
      averageClickLatency: 0,
      messageRenderTime: [],
      averageMessageRenderTime: 0
    }
  }

  /**
   * Export metrics for external analytics
   */
  exportMetrics() {
    return {
      webVitals: this.webVitals,
      cacheMetrics: this.cacheMetrics,
      conversationMetrics: {
        averageClickLatency: this.conversationMetrics.averageClickLatency,
        averageMessageRenderTime: this.conversationMetrics.averageMessageRenderTime
      },
      summary: this.getMetricsSummary()
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance()
export { PerformanceMonitor }
export type { PerformanceMetric, CacheMetrics, ConversationMetrics, WebVitalsMetrics }
