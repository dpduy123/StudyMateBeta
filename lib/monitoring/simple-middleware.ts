import { DatabaseLogger } from './database-logger'

/**
 * Simple database monitoring middleware that works with any Prisma version
 */
export function createSimpleDatabaseMonitoringMiddleware() {
  const logger = DatabaseLogger.getInstance()

  return async (params: any, next: any) => {
    const startTime = Date.now()
    let success = true
    let error: string | undefined
    let stack: string | undefined

    try {
      // Extract operation details
      const operation = params.action || 'unknown'
      const model = params.model || 'Unknown'
      const query = `${operation} ${model}`
      
      // Get request context (if available)
      const request = (global as any).currentRequest
      const userId = request?.user?.id
      const ip = request?.ip || request?.headers?.['x-forwarded-for'] || 'unknown'
      const userAgent = request?.headers?.['user-agent'] || 'unknown'

      // Execute the operation
      const result = await next(params)
      
      // Calculate duration
      const duration = Date.now() - startTime
      
      // Log successful operation
      logger.logOperation({
        operation,
        model,
        query,
        params: params.args,
        duration,
        userId,
        ip,
        userAgent,
        success: true
      })

      return result

    } catch (err) {
      success = false
      error = err instanceof Error ? err.message : 'Unknown error'
      stack = err instanceof Error ? err.stack : undefined
      
      const duration = Date.now() - startTime
      
      // Log failed operation
      logger.logOperation({
        operation: params.action || 'unknown',
        model: params.model || 'Unknown',
        query: `${params.action || 'unknown'} ${params.model || 'Unknown'}`,
        params: params.args,
        duration,
        userId: (global as any).currentRequest?.user?.id,
        ip: (global as any).currentRequest?.ip || 'unknown',
        userAgent: (global as any).currentRequest?.headers?.['user-agent'] || 'unknown',
        success: false,
        error,
        stack
      })

      // Re-throw the error
      throw err
    }
  }
}

/**
 * Performance-focused middleware that only logs slow queries
 */
export function createPerformanceMonitoringMiddleware(threshold: number = 1000) {
  const logger = DatabaseLogger.getInstance()

  return async (params: any, next: any) => {
    const startTime = Date.now()

    try {
      const result = await next(params)
      const duration = Date.now() - startTime
      
      // Only log if query is slow
      if (duration > threshold) {
        logger.logOperation({
          operation: params.action || 'unknown',
          model: params.model || 'Unknown',
          query: `${params.action || 'unknown'} ${params.model || 'Unknown'}`,
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
      const duration = Date.now() - startTime
      
      // Always log errors
      logger.logOperation({
        operation: params.action || 'unknown',
        model: params.model || 'Unknown',
        query: `${params.action || 'unknown'} ${params.model || 'Unknown'}`,
        params: params.args,
        duration,
        userId: (global as any).currentRequest?.user?.id,
        ip: (global as any).currentRequest?.ip || 'unknown',
        userAgent: (global as any).currentRequest?.headers?.['user-agent'] || 'unknown',
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      })

      throw err
    }
  }
}

/**
 * Error-only middleware that only logs failed operations
 */
export function createErrorMonitoringMiddleware() {
  const logger = DatabaseLogger.getInstance()

  return async (params: any, next: any) => {
    const startTime = Date.now()

    try {
      return await next(params)
    } catch (err) {
      const duration = Date.now() - startTime
      
      // Log error
      logger.logOperation({
        operation: params.action || 'unknown',
        model: params.model || 'Unknown',
        query: `${params.action || 'unknown'} ${params.model || 'Unknown'}`,
        params: params.args,
        duration,
        userId: (global as any).currentRequest?.user?.id,
        ip: (global as any).currentRequest?.ip || 'unknown',
        userAgent: (global as any).currentRequest?.headers?.['user-agent'] || 'unknown',
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      })

      throw err
    }
  }
}
