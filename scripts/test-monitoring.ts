/**
 * Test script for monitoring and analytics system
 */

import { performanceMonitor } from '../lib/monitoring/PerformanceMonitor'
import { analytics } from '../lib/monitoring/Analytics'
import { performanceDashboard } from '../lib/monitoring/PerformanceDashboard'

console.log('🧪 Testing Monitoring and Analytics System\n')

// Test Performance Monitor
console.log('1️⃣ Testing Performance Monitor...')
performanceMonitor.recordMetric('test_metric', 123.45, { test: true })
performanceMonitor.trackConversationClick(performance.now() - 50)
performanceMonitor.trackMessageRender(performance.now() - 100, 20)
performanceMonitor.trackCacheHit('conversations')
performanceMonitor.trackCacheHit('messages')
performanceMonitor.trackCacheMiss('conversations')

const cacheMetrics = performanceMonitor.getCacheMetrics()
console.log('   Cache Metrics:', {
  hits: cacheMetrics.hits,
  misses: cacheMetrics.misses,
  hitRate: `${(cacheMetrics.hitRate * 100).toFixed(1)}%`
})

const conversationMetrics = performanceMonitor.getConversationMetrics()
console.log('   Conversation Metrics:', {
  avgClickLatency: `${conversationMetrics.averageClickLatency.toFixed(2)}ms`,
  avgRenderTime: `${conversationMetrics.averageMessageRenderTime.toFixed(2)}ms`
})

// Test Analytics
console.log('\n2️⃣ Testing Analytics...')
analytics.setUserId('test-user-123')
analytics.trackConversationOpened({
  conversationId: 'conv-1',
  loadTime: 45,
  cacheHit: true
})
analytics.trackMessageSent({
  messageId: 'msg-1',
  conversationId: 'conv-1',
  optimistic: true,
  deliveryTime: 120
})
analytics.trackPrefetchTriggered({
  conversationId: 'conv-2',
  trigger: 'hover'
})
analytics.trackError({
  error: 'Test error',
  context: 'test-context',
  metadata: { test: true }
})

const eventCounts = analytics.getEventCounts()
console.log('   Event Counts:', eventCounts)

// Test Performance Dashboard
console.log('\n3️⃣ Testing Performance Dashboard...')
const dashboardMetrics = performanceDashboard.getDashboardMetrics()
console.log('   Dashboard Metrics:', {
  cacheHitRate: `${(dashboardMetrics.performance.cacheHitRate * 100).toFixed(1)}%`,
  conversationsOpened: dashboardMetrics.analytics.conversationsOpened,
  messagesSent: dashboardMetrics.analytics.messagesSent,
  errorsOccurred: dashboardMetrics.analytics.errorsOccurred
})

// Generate report
console.log('\n4️⃣ Generating Performance Report...')
const report = performanceDashboard.generateReport()
console.log('   Report Summary:', {
  totalAlerts: report.alerts.total,
  warnings: report.alerts.warnings,
  critical: report.alerts.critical,
  recommendations: report.recommendations.length
})

if (report.recommendations.length > 0) {
  console.log('\n   Recommendations:')
  report.recommendations.forEach((rec, i) => {
    console.log(`   ${i + 1}. ${rec}`)
  })
}

// Export data
console.log('\n5️⃣ Exporting Data...')
const exportedMetrics = performanceMonitor.exportMetrics()
const exportedEvents = analytics.exportEvents()
const exportedDashboard = performanceDashboard.exportDashboard()

console.log('   Exported Metrics:', {
  metricsCount: Object.keys(exportedMetrics.summary).length,
  eventsCount: exportedEvents.totalEvents,
  alertsCount: exportedDashboard.alerts.length
})

console.log('\n✅ All tests completed successfully!')
console.log('\n📊 Summary:')
console.log(`   - Performance metrics tracked: ${Object.keys(exportedMetrics.summary).length}`)
console.log(`   - Analytics events tracked: ${exportedEvents.totalEvents}`)
console.log(`   - Cache hit rate: ${(cacheMetrics.hitRate * 100).toFixed(1)}%`)
console.log(`   - Alerts generated: ${exportedDashboard.alerts.length}`)
