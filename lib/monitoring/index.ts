// Database monitoring exports
export { DatabaseLogger } from './database-logger'
export { DatabaseMiddlewareManager, middlewareManager } from './middleware-manager'
export { 
  createSimpleDatabaseMonitoringMiddleware,
  createPerformanceMonitoringMiddleware,
  createErrorMonitoringMiddleware 
} from './simple-middleware'
export { 
  captureRequestContext,
  clearRequestContext,
  getCurrentRequestContext 
} from './request-context'
export { 
  DatabaseMonitoringTester,
  quickTest,
  performanceTest 
} from './test-middleware'

// Performance monitoring exports
export { PerformanceMonitor, performanceMonitor } from './PerformanceMonitor'
export { Analytics, analytics } from './Analytics'
export { PerformanceDashboard, performanceDashboard } from './PerformanceDashboard'

// Re-export types
export type { DatabaseLogEntry, DatabaseMetrics } from './database-logger'
export type { 
  PerformanceMetric, 
  CacheMetrics, 
  ConversationMetrics, 
  WebVitalsMetrics 
} from './PerformanceMonitor'
export type {
  AnalyticsEvent,
  ConversationOpenedEvent,
  MessageSentEvent,
  PrefetchTriggeredEvent,
  ErrorEvent
} from './Analytics'
export type { DashboardMetrics, PerformanceAlert } from './PerformanceDashboard'
