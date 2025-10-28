/**
 * Performance Dashboard
 * Aggregates and displays performance metrics and analytics
 */

import { performanceMonitor } from './PerformanceMonitor'
import { analytics } from './Analytics'

interface DashboardMetrics {
  webVitals: {
    CLS?: number
    FID?: number
    FCP?: number
    LCP?: number
    TTFB?: number
    INP?: number
  }
  performance: {
    averageClickLatency: number
    averageMessageRenderTime: number
    cacheHitRate: number
    totalCacheRequests: number
  }
  analytics: {
    conversationsOpened: number
    messagesSent: number
    prefetchesTriggered: number
    errorsOccurred: number
    totalEvents: number
  }
  apiMetrics: {
    averageResponseTime: number
    totalCalls: number
    errorRate: number
  }
}

interface PerformanceAlert {
  type: 'warning' | 'critical'
  metric: string
  value: number
  threshold: number
  message: string
  timestamp: number
}

class PerformanceDashboard {
  private static instance: PerformanceDashboard
  private alerts: PerformanceAlert[] = []
  private thresholds = {
    clickLatency: 100, // ms
    messageRenderTime: 200, // ms
    cacheHitRate: 0.7, // 70%
    LCP: 2500, // ms
    FID: 100, // ms
    CLS: 0.1,
    apiResponseTime: 1000, // ms
    errorRate: 0.05 // 5%
  }

  private constructor() {
    this.startMonitoring()
  }

  static getInstance(): PerformanceDashboard {
    if (!PerformanceDashboard.instance) {
      PerformanceDashboard.instance = new PerformanceDashboard()
    }
    return PerformanceDashboard.instance
  }

  /**
   * Start continuous monitoring
   */
  private startMonitoring() {
    if (typeof window === 'undefined') return

    // Check metrics every 30 seconds
    setInterval(() => {
      this.checkPerformanceThresholds()
    }, 30000)
  }

  /**
   * Get current dashboard metrics
   */
  getDashboardMetrics(): DashboardMetrics {
    const webVitals = performanceMonitor.getWebVitals()
    const cacheMetrics = performanceMonitor.getCacheMetrics()
    const conversationMetrics = performanceMonitor.getConversationMetrics()
    const eventCounts = analytics.getEventCounts()

    // Calculate API metrics
    const apiCalls = analytics.getEventsByName('api_call')
    const apiResponseTimes = apiCalls.map(e => e.properties?.duration || 0)
    const apiErrors = apiCalls.filter(e => (e.properties?.status || 200) >= 400)
    const averageApiResponseTime = apiResponseTimes.length > 0
      ? apiResponseTimes.reduce((a, b) => a + b, 0) / apiResponseTimes.length
      : 0
    const apiErrorRate = apiCalls.length > 0 ? apiErrors.length / apiCalls.length : 0

    return {
      webVitals,
      performance: {
        averageClickLatency: conversationMetrics.averageClickLatency,
        averageMessageRenderTime: conversationMetrics.averageMessageRenderTime,
        cacheHitRate: cacheMetrics.hitRate,
        totalCacheRequests: cacheMetrics.totalRequests
      },
      analytics: {
        conversationsOpened: eventCounts['conversation_opened'] || 0,
        messagesSent: eventCounts['message_sent'] || 0,
        prefetchesTriggered: eventCounts['prefetch_triggered'] || 0,
        errorsOccurred: eventCounts['error'] || 0,
        totalEvents: analytics.getAllEvents().length
      },
      apiMetrics: {
        averageResponseTime: averageApiResponseTime,
        totalCalls: apiCalls.length,
        errorRate: apiErrorRate
      }
    }
  }

  /**
   * Check if metrics exceed thresholds and create alerts
   */
  private checkPerformanceThresholds() {
    const metrics = this.getDashboardMetrics()

    // Check click latency
    if (metrics.performance.averageClickLatency > this.thresholds.clickLatency) {
      this.createAlert(
        'warning',
        'click_latency',
        metrics.performance.averageClickLatency,
        this.thresholds.clickLatency,
        `Average click latency (${metrics.performance.averageClickLatency.toFixed(2)}ms) exceeds threshold (${this.thresholds.clickLatency}ms)`
      )
    }

    // Check message render time
    if (metrics.performance.averageMessageRenderTime > this.thresholds.messageRenderTime) {
      this.createAlert(
        'warning',
        'message_render_time',
        metrics.performance.averageMessageRenderTime,
        this.thresholds.messageRenderTime,
        `Average message render time (${metrics.performance.averageMessageRenderTime.toFixed(2)}ms) exceeds threshold (${this.thresholds.messageRenderTime}ms)`
      )
    }

    // Check cache hit rate
    if (metrics.performance.cacheHitRate < this.thresholds.cacheHitRate) {
      this.createAlert(
        'warning',
        'cache_hit_rate',
        metrics.performance.cacheHitRate,
        this.thresholds.cacheHitRate,
        `Cache hit rate (${(metrics.performance.cacheHitRate * 100).toFixed(1)}%) is below threshold (${this.thresholds.cacheHitRate * 100}%)`
      )
    }

    // Check LCP
    if (metrics.webVitals.LCP && metrics.webVitals.LCP > this.thresholds.LCP) {
      this.createAlert(
        'critical',
        'LCP',
        metrics.webVitals.LCP,
        this.thresholds.LCP,
        `Largest Contentful Paint (${metrics.webVitals.LCP.toFixed(2)}ms) exceeds threshold (${this.thresholds.LCP}ms)`
      )
    }

    // Check FID
    if (metrics.webVitals.FID && metrics.webVitals.FID > this.thresholds.FID) {
      this.createAlert(
        'critical',
        'FID',
        metrics.webVitals.FID,
        this.thresholds.FID,
        `First Input Delay (${metrics.webVitals.FID.toFixed(2)}ms) exceeds threshold (${this.thresholds.FID}ms)`
      )
    }

    // Check CLS
    if (metrics.webVitals.CLS && metrics.webVitals.CLS > this.thresholds.CLS) {
      this.createAlert(
        'critical',
        'CLS',
        metrics.webVitals.CLS,
        this.thresholds.CLS,
        `Cumulative Layout Shift (${metrics.webVitals.CLS.toFixed(3)}) exceeds threshold (${this.thresholds.CLS})`
      )
    }

    // Check API response time
    if (metrics.apiMetrics.averageResponseTime > this.thresholds.apiResponseTime) {
      this.createAlert(
        'warning',
        'api_response_time',
        metrics.apiMetrics.averageResponseTime,
        this.thresholds.apiResponseTime,
        `Average API response time (${metrics.apiMetrics.averageResponseTime.toFixed(2)}ms) exceeds threshold (${this.thresholds.apiResponseTime}ms)`
      )
    }

    // Check API error rate
    if (metrics.apiMetrics.errorRate > this.thresholds.errorRate) {
      this.createAlert(
        'critical',
        'api_error_rate',
        metrics.apiMetrics.errorRate,
        this.thresholds.errorRate,
        `API error rate (${(metrics.apiMetrics.errorRate * 100).toFixed(1)}%) exceeds threshold (${this.thresholds.errorRate * 100}%)`
      )
    }
  }

  /**
   * Create a performance alert
   */
  private createAlert(
    type: 'warning' | 'critical',
    metric: string,
    value: number,
    threshold: number,
    message: string
  ) {
    const alert: PerformanceAlert = {
      type,
      metric,
      value,
      threshold,
      message,
      timestamp: Date.now()
    }

    this.alerts.push(alert)

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts.shift()
    }

    // Log alert
    console.warn(`[Performance Alert] ${type.toUpperCase()}: ${message}`)

    // Send to external monitoring service
    this.sendAlertToMonitoring(alert)
  }

  /**
   * Get all alerts
   */
  getAlerts(): PerformanceAlert[] {
    return [...this.alerts]
  }

  /**
   * Get alerts by type
   */
  getAlertsByType(type: 'warning' | 'critical'): PerformanceAlert[] {
    return this.alerts.filter(a => a.type === type)
  }

  /**
   * Clear alerts
   */
  clearAlerts() {
    this.alerts = []
  }

  /**
   * Update performance thresholds
   */
  updateThresholds(newThresholds: Partial<typeof this.thresholds>) {
    this.thresholds = { ...this.thresholds, ...newThresholds }
  }

  /**
   * Get current thresholds
   */
  getThresholds() {
    return { ...this.thresholds }
  }

  /**
   * Generate performance report
   */
  generateReport() {
    const metrics = this.getDashboardMetrics()
    const metricsSummary = performanceMonitor.getMetricsSummary()
    const alerts = this.getAlerts()

    return {
      timestamp: Date.now(),
      metrics,
      metricsSummary,
      alerts: {
        total: alerts.length,
        warnings: alerts.filter(a => a.type === 'warning').length,
        critical: alerts.filter(a => a.type === 'critical').length,
        recent: alerts.slice(-10)
      },
      recommendations: this.generateRecommendations(metrics)
    }
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(metrics: DashboardMetrics): string[] {
    const recommendations: string[] = []

    if (metrics.performance.averageClickLatency > this.thresholds.clickLatency) {
      recommendations.push('Consider implementing more aggressive prefetching to reduce click latency')
    }

    if (metrics.performance.cacheHitRate < this.thresholds.cacheHitRate) {
      recommendations.push('Improve cache strategy - current hit rate is below optimal')
    }

    if (metrics.webVitals.LCP && metrics.webVitals.LCP > this.thresholds.LCP) {
      recommendations.push('Optimize largest contentful paint by lazy loading images and code splitting')
    }

    if (metrics.webVitals.CLS && metrics.webVitals.CLS > this.thresholds.CLS) {
      recommendations.push('Reduce layout shifts by reserving space for dynamic content')
    }

    if (metrics.apiMetrics.averageResponseTime > this.thresholds.apiResponseTime) {
      recommendations.push('Optimize API endpoints or implement more aggressive caching')
    }

    if (metrics.apiMetrics.errorRate > this.thresholds.errorRate) {
      recommendations.push('Investigate and fix API errors - error rate is above acceptable threshold')
    }

    return recommendations
  }

  /**
   * Send alert to external monitoring service
   */
  private sendAlertToMonitoring(alert: PerformanceAlert) {
    // Placeholder for external monitoring integration
    // Examples: Sentry, DataDog, New Relic, etc.
    
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MONITORING_ENDPOINT) {
      fetch(process.env.NEXT_PUBLIC_MONITORING_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert)
      }).catch(err => {
        console.error('Failed to send alert to monitoring service:', err)
      })
    }
  }

  /**
   * Export dashboard data
   */
  exportDashboard() {
    return {
      metrics: this.getDashboardMetrics(),
      alerts: this.getAlerts(),
      thresholds: this.getThresholds(),
      report: this.generateReport()
    }
  }
}

export const performanceDashboard = PerformanceDashboard.getInstance()
export { PerformanceDashboard }
export type { DashboardMetrics, PerformanceAlert }
