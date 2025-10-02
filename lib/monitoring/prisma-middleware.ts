import { DatabaseLogger } from './database-logger'

// Define middleware types manually to avoid Prisma type issues
interface MiddlewareParams {
  model?: string
  action: string
  args: any
  dataPath: string[]
  runInTransaction: boolean
}

interface MiddlewareNext {
  (params: MiddlewareParams): Promise<any>
}

/**
 * Prisma middleware to intercept and log all database operations
 */
export function createDatabaseMonitoringMiddleware() {
  const logger = DatabaseLogger.getInstance()

  return async (params: MiddlewareParams, next: MiddlewareNext) => {
    const startTime = Date.now()
    let success = true
    let error: string | undefined
    let stack: string | undefined

    try {
      // Extract operation details
      const operation = params.action
      const model = params.model || 'Unknown'
      const query = `${operation} ${model}`
      
      // Get request context (if available)
      const request = (global as any).currentRequest
      const userId = request?.user?.id
      const ip = request?.ip || request?.headers?.['x-forwarded-for'] || 'unknown'
      const userAgent = request?.headers?.['user-agent'] || 'unknown'

      // Log the operation start
      logger.logOperation({
        operation,
        model,
        query,
        params: params.args,
        duration: 0, // Will be updated after execution
        userId,
        ip,
        userAgent,
        success: false, // Will be updated after execution
        error: undefined
      })

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
        operation: params.action,
        model: params.model || 'Unknown',
        query: `${params.action} ${params.model}`,
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
 * Enhanced middleware with additional features
 */
export function createAdvancedDatabaseMonitoringMiddleware(options: {
  slowQueryThreshold?: number
  logSlowQueries?: boolean
  logAllQueries?: boolean
  excludeModels?: string[]
  includeOnlyModels?: string[]
} = {}) {
  const logger = DatabaseLogger.getInstance()
  const {
    slowQueryThreshold = 1000,
    logSlowQueries = true,
    logAllQueries = true,
    excludeModels = [],
    includeOnlyModels = []
  } = options

  return async (params: MiddlewareParams, next: MiddlewareNext) => {
    const startTime = Date.now()
    const model = params.model || 'Unknown'
    
    // Check if we should log this model
    if (excludeModels.includes(model)) {
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
      
      // Check if this is a slow query
      const isSlowQuery = duration > slowQueryThreshold
      
      // Log based on configuration
      if (logAllQueries || (logSlowQueries && isSlowQuery)) {
        logger.logOperation({
          operation: params.action,
          model,
          query: `${params.action} ${model}`,
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
      
      // Always log errors
      logger.logOperation({
        operation: params.action,
        model,
        query: `${params.action} ${model}`,
        params: params.args,
        duration,
        userId: (global as any).currentRequest?.user?.id,
        ip: (global as any).currentRequest?.ip || 'unknown',
        userAgent: (global as any).currentRequest?.headers?.['user-agent'] || 'unknown',
        success: false,
        error,
        stack
      })

      throw err
    }
  }
}

/**
 * Middleware for specific operations only
 */
export function createSelectiveDatabaseMonitoringMiddleware(operations: string[]) {
  const logger = DatabaseLogger.getInstance()

  return async (params: MiddlewareParams, next: MiddlewareNext) => {
    // Only log specified operations
    if (!operations.includes(params.action)) {
      return next(params)
    }

    const startTime = Date.now()
    let success = true
    let error: string | undefined

    try {
      const result = await next(params)
      const duration = Date.now() - startTime
      
      logger.logOperation({
        operation: params.action,
        model: params.model || 'Unknown',
        query: `${params.action} ${params.model}`,
        params: params.args,
        duration,
        userId: (global as any).currentRequest?.user?.id,
        ip: (global as any).currentRequest?.ip || 'unknown',
        userAgent: (global as any).currentRequest?.headers?.['user-agent'] || 'unknown',
        success: true
      })

      return result

    } catch (err) {
      success = false
      error = err instanceof Error ? err.message : 'Unknown error'
      
      const duration = Date.now() - startTime
      
      logger.logOperation({
        operation: params.action,
        model: params.model || 'Unknown',
        query: `${params.action} ${params.model}`,
        params: params.args,
        duration,
        userId: (global as any).currentRequest?.user?.id,
        ip: (global as any).currentRequest?.ip || 'unknown',
        userAgent: (global as any).currentRequest?.headers?.['user-agent'] || 'unknown',
        success: false,
        error
      })

      throw err
    }
  }
}
