import { DatabaseLogger } from './database-logger'
import { captureRequestContext, clearRequestContext } from './request-context'
import { getFinalConfig, MonitoringConfig } from './config'

/**
 * Comprehensive middleware manager for database monitoring
 */
export class DatabaseMiddlewareManager {
  private static instance: DatabaseMiddlewareManager
  private logger: DatabaseLogger
  private isEnabled: boolean = false

  private constructor() {
    this.logger = DatabaseLogger.getInstance()
    this.loadConfiguration()
  }

  /**
   * Load configuration from environment
   */
  private loadConfiguration(): void {
    const config = getFinalConfig()
    this.isEnabled = config.enabled
  }

  static getInstance(): DatabaseMiddlewareManager {
    if (!DatabaseMiddlewareManager.instance) {
      DatabaseMiddlewareManager.instance = new DatabaseMiddlewareManager()
    }
    return DatabaseMiddlewareManager.instance
  }

  /**
   * Enable database monitoring
   */
  enable(): void {
    this.isEnabled = true
    console.log('🔍 Database monitoring enabled')
  }

  /**
   * Disable database monitoring
   */
  disable(): void {
    this.isEnabled = false
    console.log('🔍 Database monitoring disabled')
  }

  /**
   * Check if monitoring is enabled
   */
  isMonitoringEnabled(): boolean {
    return this.isEnabled
  }

  /**
   * Create comprehensive monitoring middleware
   */
  createComprehensiveMiddleware(options: {
    logAllQueries?: boolean
    logSlowQueries?: boolean
    logErrors?: boolean
    slowQueryThreshold?: number
    excludeModels?: string[]
    includeOnlyModels?: string[]
  } = {}) {
    const config = getFinalConfig()
    const {
      logAllQueries = config.logAllQueries,
      logSlowQueries = config.logSlowQueries,
      logErrors = config.logErrors,
      slowQueryThreshold = config.slowQueryThreshold,
      excludeModels = config.excludeModels,
      includeOnlyModels = config.includeOnlyModels
    } = options

    return async (params: any, next: any) => {
      if (!this.isEnabled) {
        return next(params)
      }

      const startTime = Date.now()
      const model = params.model || 'Unknown'
      const operation = params.action || 'unknown'

      // Check if we should monitor this model
      if (excludeModels.length > 0 && excludeModels.includes(model)) {
        return next(params)
      }

      if (includeOnlyModels.length > 0 && !includeOnlyModels.includes(model)) {
        return next(params)
      }

      let success = true
      let error: string | undefined
      let stack: string | undefined

      try {
        const result = await next(params)
        const duration = Date.now() - startTime

        // Log based on configuration
        const shouldLog = 
          (logAllQueries) ||
          (logSlowQueries && duration > slowQueryThreshold)

        if (shouldLog) {
          this.logger.logOperation({
            operation,
            model,
            query: `${operation} ${model}`,
            params: params.args,
            duration,
            userId: (global as any).currentRequest?.user?.id,
            ip: (global as any).currentRequest?.ip || 'unknown',
            userAgent: (global as any).currentRequest?.headers?.['user-agent'] || 'unknown',
            success: true
          })
        }

        return result

      } catch (err) {
        success = false
        error = err instanceof Error ? err.message : 'Unknown error'
        stack = err instanceof Error ? err.stack : undefined

        const duration = Date.now() - startTime

        // Always log errors if error logging is enabled
        if (logErrors) {
          this.logger.logOperation({
            operation,
            model,
            query: `${operation} ${model}`,
            params: params.args,
            duration,
            userId: (global as any).currentRequest?.user?.id,
            ip: (global as any).currentRequest?.ip || 'unknown',
            userAgent: (global as any).currentRequest?.headers?.['user-agent'] || 'unknown',
            success: false,
            error,
            stack
          })
        }

        throw err
      }
    }
  }

  /**
   * Create development monitoring middleware
   */
  createDevelopmentMiddleware() {
    return this.createComprehensiveMiddleware({
      logAllQueries: true,
      logSlowQueries: true,
      logErrors: true,
      slowQueryThreshold: 500
    })
  }

  /**
   * Create production monitoring middleware
   */
  createProductionMiddleware() {
    return this.createComprehensiveMiddleware({
      logAllQueries: false,
      logSlowQueries: true,
      logErrors: true,
      slowQueryThreshold: 2000
    })
  }

  /**
   * Create performance-focused middleware
   */
  createPerformanceMiddleware(threshold: number = 1000) {
    return this.createComprehensiveMiddleware({
      logAllQueries: false,
      logSlowQueries: true,
      logErrors: true,
      slowQueryThreshold: threshold
    })
  }

  /**
   * Create error-focused middleware
   */
  createErrorMiddleware() {
    return this.createComprehensiveMiddleware({
      logAllQueries: false,
      logSlowQueries: false,
      logErrors: true
    })
  }

  /**
   * Create selective middleware for specific models
   */
  createSelectiveMiddleware(models: string[]) {
    return this.createComprehensiveMiddleware({
      logAllQueries: true,
      logSlowQueries: true,
      logErrors: true,
      includeOnlyModels: models
    })
  }

  /**
   * Create middleware that excludes specific models
   */
  createExclusiveMiddleware(excludeModels: string[]) {
    return this.createComprehensiveMiddleware({
      logAllQueries: true,
      logSlowQueries: true,
      logErrors: true,
      excludeModels
    })
  }

  /**
   * Get monitoring statistics
   */
  getStatistics() {
    return {
      isEnabled: this.isEnabled,
      metrics: this.logger.getMetrics(),
      stats: this.logger.getQueryStats()
    }
  }

  /**
   * Clear old logs
   */
  clearOldLogs(days: number = 7) {
    this.logger.clearOldLogs(days)
  }

  /**
   * Export logs
   */
  exportLogs() {
    return this.logger.exportLogs()
  }
}

/**
 * Global middleware manager instance
 */
export const middlewareManager = DatabaseMiddlewareManager.getInstance()
