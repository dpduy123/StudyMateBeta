/**
 * Structured Logger for Gemini AI Matching System
 *
 * Provides consistent logging format with timestamps and context
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogContext {
  userId?: string
  operation?: string
  duration?: number
  metadata?: Record<string, any>
}

class MatchingLogger {
  private prefix = '[Gemini Matcher]'

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const emoji = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      debug: '🔍'
    }[level]

    let formatted = `${emoji} ${timestamp} ${this.prefix} ${message}`

    if (context?.userId) {
      formatted += ` [User: ${context.userId.substring(0, 8)}...]`
    }

    if (context?.operation) {
      formatted += ` [Op: ${context.operation}]`
    }

    if (context?.duration !== undefined) {
      formatted += ` [${context.duration}ms]`
    }

    if (context?.metadata) {
      formatted += ` ${JSON.stringify(context.metadata)}`
    }

    return formatted
  }

  info(message: string, context?: LogContext) {
    console.log(this.formatMessage('info', message, context))
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage('warn', message, context))
  }

  error(message: string, error?: any, context?: LogContext) {
    console.error(this.formatMessage('error', message, context))
    if (error) {
      console.error(error)
    }
  }

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      console.log(this.formatMessage('debug', message, context))
    }
  }

  // Specialized methods for common operations
  cacheHit(userId: string, remaining: number, total: number) {
    this.info('Cache hit', {
      userId,
      operation: 'cache-get',
      metadata: { remaining, total, hitRate: '100%' }
    })
  }

  cacheMiss(userId: string) {
    this.warn('Cache miss - fetching from DB', {
      userId,
      operation: 'cache-get'
    })
  }

  geminiStart(userId: string, candidateCount: number) {
    this.info(`Starting Gemini AI sort`, {
      userId,
      operation: 'gemini-sort',
      metadata: { candidates: candidateCount }
    })
  }

  geminiSuccess(userId: string, duration: number, sortedCount: number) {
    this.info('Gemini AI sort completed', {
      userId,
      operation: 'gemini-sort',
      duration,
      metadata: { sorted: sortedCount }
    })
  }

  geminiError(userId: string, error: any, duration: number) {
    this.error('Gemini AI sort failed - using fallback', error, {
      userId,
      operation: 'gemini-sort',
      duration
    })
  }

  prefetchStart(userId: string, remaining: number) {
    this.info('Prefetch triggered', {
      userId,
      operation: 'prefetch',
      metadata: { remainingBeforePrefetch: remaining }
    })
  }

  prefetchSuccess(userId: string, duration: number, newCount: number, totalNow: number) {
    this.info('Prefetch completed', {
      userId,
      operation: 'prefetch',
      duration,
      metadata: { newMatches: newCount, totalInCache: totalNow }
    })
  }

  prefetchError(userId: string, error: any, duration: number) {
    this.error('Prefetch failed', error, {
      userId,
      operation: 'prefetch',
      duration
    })
  }

  userAction(userId: string, action: 'LIKE' | 'PASS', targetId: string, remaining: number) {
    this.info(`User ${action}`, {
      userId,
      operation: 'user-action',
      metadata: { action, target: targetId.substring(0, 8), remaining }
    })
  }

  dbQuery(operation: string, duration: number, resultCount?: number) {
    this.info(`Database query: ${operation}`, {
      operation: 'db-query',
      duration,
      metadata: resultCount !== undefined ? { results: resultCount } : undefined
    })
  }

  // Metrics summary (call at end of request)
  requestSummary(userId: string, operation: string, metrics: {
    totalDuration: number
    source: 'cache' | 'gemini_ai' | 'fallback'
    cacheHit: boolean
    matchesReturned: number
    remaining?: number
    geminiDuration?: number
    dbDuration?: number
  }) {
    this.info('Request completed', {
      userId,
      operation,
      duration: metrics.totalDuration,
      metadata: metrics
    })
  }
}

export const matchLogger = new MatchingLogger()

// Analytics tracking (optional - for future use)
export class MatchingAnalytics {
  private static metrics = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    geminiCalls: 0,
    geminiErrors: 0,
    prefetches: 0,
    avgGeminiTime: 0,
    avgCacheTime: 0
  }

  static recordCacheHit(duration: number) {
    this.metrics.cacheHits++
    this.metrics.totalRequests++
    this.metrics.avgCacheTime =
      (this.metrics.avgCacheTime * (this.metrics.cacheHits - 1) + duration) / this.metrics.cacheHits
  }

  static recordCacheMiss() {
    this.metrics.cacheMisses++
    this.metrics.totalRequests++
  }

  static recordGeminiCall(duration: number, success: boolean) {
    this.metrics.geminiCalls++
    if (!success) {
      this.metrics.geminiErrors++
    } else {
      this.metrics.avgGeminiTime =
        (this.metrics.avgGeminiTime * (this.metrics.geminiCalls - this.metrics.geminiErrors - 1) + duration)
        / (this.metrics.geminiCalls - this.metrics.geminiErrors)
    }
  }

  static recordPrefetch() {
    this.metrics.prefetches++
  }

  static getStats() {
    const cacheHitRate = this.metrics.totalRequests > 0
      ? (this.metrics.cacheHits / this.metrics.totalRequests * 100).toFixed(2)
      : '0.00'

    return {
      ...this.metrics,
      cacheHitRate: `${cacheHitRate}%`,
      geminiSuccessRate: this.metrics.geminiCalls > 0
        ? `${((this.metrics.geminiCalls - this.metrics.geminiErrors) / this.metrics.geminiCalls * 100).toFixed(2)}%`
        : '0.00%'
    }
  }

  static reset() {
    this.metrics = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      geminiCalls: 0,
      geminiErrors: 0,
      prefetches: 0,
      avgGeminiTime: 0,
      avgCacheTime: 0
    }
  }
}
