/**
 * Database Monitoring Configuration
 */

export interface MonitoringConfig {
  enabled: boolean
  environment: 'development' | 'production' | 'test'
  logAllQueries: boolean
  logSlowQueries: boolean
  logErrors: boolean
  slowQueryThreshold: number
  excludeModels: string[]
  includeOnlyModels: string[]
  maxLogsInMemory: number
  autoCleanupDays: number
  enableConsoleLogging: boolean
  enablePerformanceMetrics: boolean
  enableErrorTracking: boolean
}

export const defaultConfig: MonitoringConfig = {
  enabled: false,
  environment: 'development',
  logAllQueries: false,
  logSlowQueries: true,
  logErrors: true,
  slowQueryThreshold: 1000,
  excludeModels: [],
  includeOnlyModels: [],
  maxLogsInMemory: 1000,
  autoCleanupDays: 7,
  enableConsoleLogging: true,
  enablePerformanceMetrics: true,
  enableErrorTracking: true
}

export const developmentConfig: MonitoringConfig = {
  ...defaultConfig,
  enabled: true,
  environment: 'development',
  logAllQueries: true,
  logSlowQueries: true,
  logErrors: true,
  slowQueryThreshold: 500,
  enableConsoleLogging: true,
  enablePerformanceMetrics: true,
  enableErrorTracking: true
}

export const productionConfig: MonitoringConfig = {
  ...defaultConfig,
  enabled: true,
  environment: 'production',
  logAllQueries: false,
  logSlowQueries: true,
  logErrors: true,
  slowQueryThreshold: 2000,
  excludeModels: ['Session', 'Log', 'Audit'],
  enableConsoleLogging: false,
  enablePerformanceMetrics: true,
  enableErrorTracking: true
}

export const testConfig: MonitoringConfig = {
  ...defaultConfig,
  enabled: false,
  environment: 'test',
  logAllQueries: false,
  logSlowQueries: false,
  logErrors: true,
  slowQueryThreshold: 5000,
  enableConsoleLogging: false,
  enablePerformanceMetrics: false,
  enableErrorTracking: true
}

/**
 * Get configuration based on environment
 */
export function getMonitoringConfig(): MonitoringConfig {
  const env = process.env.NODE_ENV as 'development' | 'production' | 'test'
  
  switch (env) {
    case 'development':
      return developmentConfig
    case 'production':
      return productionConfig
    case 'test':
      return testConfig
    default:
      return defaultConfig
  }
}

/**
 * Get configuration from environment variables
 */
export function getConfigFromEnv(): Partial<MonitoringConfig> {
  return {
    enabled: process.env.ENABLE_DB_MONITORING === 'true' || process.env.NODE_ENV === 'development',
    logAllQueries: process.env.LOG_ALL_QUERIES === 'true',
    logSlowQueries: process.env.LOG_SLOW_QUERIES !== 'false',
    logErrors: process.env.LOG_ERRORS !== 'false',
    slowQueryThreshold: parseInt(process.env.SLOW_QUERY_THRESHOLD || '1000'),
    maxLogsInMemory: parseInt(process.env.MAX_LOGS_IN_MEMORY || '1000'),
    autoCleanupDays: parseInt(process.env.AUTO_CLEANUP_DAYS || '7'),
    enableConsoleLogging: process.env.ENABLE_CONSOLE_LOGGING !== 'false',
    enablePerformanceMetrics: process.env.ENABLE_PERFORMANCE_METRICS !== 'false',
    enableErrorTracking: process.env.ENABLE_ERROR_TRACKING !== 'false'
  }
}

/**
 * Merge configuration with environment overrides
 */
export function getFinalConfig(): MonitoringConfig {
  const baseConfig = getMonitoringConfig()
  const envOverrides = getConfigFromEnv()
  
  return {
    ...baseConfig,
    ...envOverrides
  }
}
