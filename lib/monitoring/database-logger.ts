import { Prisma } from '@prisma/client'

export interface DatabaseLogEntry {
  id: string
  timestamp: Date
  operation: string
  model: string
  query: string
  params: any
  duration: number
  userId?: string
  ip?: string
  userAgent?: string
  success: boolean
  error?: string
  stack?: string
}

export interface DatabaseMetrics {
  totalQueries: number
  averageDuration: number
  slowQueries: number
  errorCount: number
  queriesByModel: Record<string, number>
  queriesByOperation: Record<string, number>
}

export class DatabaseLogger {
  private static instance: DatabaseLogger
  private logs: DatabaseLogEntry[] = []
  private metrics: DatabaseMetrics = {
    totalQueries: 0,
    averageDuration: 0,
    slowQueries: 0,
    errorCount: 0,
    queriesByModel: {},
    queriesByOperation: {}
  }

  private constructor() {}

  static getInstance(): DatabaseLogger {
    if (!DatabaseLogger.instance) {
      DatabaseLogger.instance = new DatabaseLogger()
    }
    return DatabaseLogger.instance
  }

  /**
   * Log a database operation
   */
  logOperation(entry: Omit<DatabaseLogEntry, 'id' | 'timestamp'>): void {
    const logEntry: DatabaseLogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      ...entry
    }

    this.logs.push(logEntry)
    this.updateMetrics(logEntry)

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      this.logToConsole(logEntry)
    }

    // Keep only last 1000 logs to prevent memory issues
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000)
    }
  }

  /**
   * Get recent logs
   */
  getRecentLogs(limit: number = 100): DatabaseLogEntry[] {
    return this.logs.slice(-limit)
  }

  /**
   * Get logs by model
   */
  getLogsByModel(model: string, limit: number = 100): DatabaseLogEntry[] {
    return this.logs
      .filter(log => log.model === model)
      .slice(-limit)
  }

  /**
   * Get slow queries (duration > threshold)
   */
  getSlowQueries(threshold: number = 1000, limit: number = 50): DatabaseLogEntry[] {
    return this.logs
      .filter(log => log.duration > threshold)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit)
  }

  /**
   * Get error logs
   */
  getErrorLogs(limit: number = 50): DatabaseLogEntry[] {
    return this.logs
      .filter(log => !log.success)
      .slice(-limit)
  }

  /**
   * Get current metrics
   */
  getMetrics(): DatabaseMetrics {
    return { ...this.metrics }
  }

  /**
   * Get logs by time range
   */
  getLogsByTimeRange(start: Date, end: Date): DatabaseLogEntry[] {
    return this.logs.filter(log => 
      log.timestamp >= start && log.timestamp <= end
    )
  }

  /**
   * Get logs by user
   */
  getLogsByUser(userId: string, limit: number = 100): DatabaseLogEntry[] {
    return this.logs
      .filter(log => log.userId === userId)
      .slice(-limit)
  }

  /**
   * Clear old logs (older than specified days)
   */
  clearOldLogs(days: number = 7): void {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    this.logs = this.logs.filter(log => log.timestamp > cutoffDate)
  }

  /**
   * Export logs to JSON
   */
  exportLogs(): string {
    return JSON.stringify({
      logs: this.logs,
      metrics: this.metrics,
      exportedAt: new Date().toISOString()
    }, null, 2)
  }

  /**
   * Get query statistics
   */
  getQueryStats(): {
    mostQueriedModels: Array<{ model: string; count: number }>
    mostUsedOperations: Array<{ operation: string; count: number }>
    averageQueryDuration: number
    slowestQueries: Array<{ query: string; duration: number; timestamp: Date }>
  } {
    const modelCounts = Object.entries(this.metrics.queriesByModel)
      .map(([model, count]) => ({ model, count }))
      .sort((a, b) => b.count - a.count)

    const operationCounts = Object.entries(this.metrics.queriesByOperation)
      .map(([operation, count]) => ({ operation, count }))
      .sort((a, b) => b.count - a.count)

    const slowestQueries = this.logs
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)
      .map(log => ({
        query: log.query,
        duration: log.duration,
        timestamp: log.timestamp
      }))

    return {
      mostQueriedModels: modelCounts.slice(0, 5),
      mostUsedOperations: operationCounts.slice(0, 5),
      averageQueryDuration: this.metrics.averageDuration,
      slowestQueries
    }
  }

  private generateId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private updateMetrics(entry: DatabaseLogEntry): void {
    this.metrics.totalQueries++
    
    // Update average duration
    const totalDuration = this.metrics.averageDuration * (this.metrics.totalQueries - 1) + entry.duration
    this.metrics.averageDuration = totalDuration / this.metrics.totalQueries

    // Count slow queries (> 1000ms)
    if (entry.duration > 1000) {
      this.metrics.slowQueries++
    }

    // Count errors
    if (!entry.success) {
      this.metrics.errorCount++
    }

    // Count by model
    this.metrics.queriesByModel[entry.model] = (this.metrics.queriesByModel[entry.model] || 0) + 1

    // Count by operation
    this.metrics.queriesByOperation[entry.operation] = (this.metrics.queriesByOperation[entry.operation] || 0) + 1
  }

  private logToConsole(entry: DatabaseLogEntry): void {
    const status = entry.success ? '✅' : '❌'
    const duration = entry.duration > 1000 ? `🐌 ${entry.duration}ms` : `${entry.duration}ms`
    
    console.log(`[DB ${status}] ${entry.operation} ${entry.model} - ${duration}`)
    
    if (!entry.success && entry.error) {
      console.error(`[DB ERROR] ${entry.error}`)
    }
  }
}
