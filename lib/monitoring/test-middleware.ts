/**
 * Test utilities for database monitoring middleware
 */

import { DatabaseLogger } from './database-logger'
import { middlewareManager } from './middleware-manager'

/**
 * Test database monitoring functionality
 */
export class DatabaseMonitoringTester {
  private logger: DatabaseLogger

  constructor() {
    this.logger = DatabaseLogger.getInstance()
  }

  /**
   * Test basic logging functionality
   */
  async testBasicLogging() {
    console.log('🧪 Testing basic logging...')
    
    // Simulate a database operation
    this.logger.logOperation({
      operation: 'findMany',
      model: 'User',
      query: 'findMany User',
      params: { where: { active: true } },
      duration: 45,
      userId: 'test-user-123',
      ip: '127.0.0.1',
      userAgent: 'Test Agent',
      success: true
    })

    const logs = this.logger.getRecentLogs(1)
    console.log('✅ Basic logging test passed:', logs.length > 0)
    return logs.length > 0
  }

  /**
   * Test slow query detection
   */
  async testSlowQueryDetection() {
    console.log('🧪 Testing slow query detection...')
    
    // Simulate a slow query
    this.logger.logOperation({
      operation: 'findMany',
      model: 'User',
      query: 'findMany User with complex join',
      params: { include: { matches: true, messages: true } },
      duration: 2500,
      userId: 'test-user-123',
      ip: '127.0.0.1',
      userAgent: 'Test Agent',
      success: true
    })

    const slowQueries = this.logger.getSlowQueries(1000, 10)
    console.log('✅ Slow query detection test passed:', slowQueries.length > 0)
    return slowQueries.length > 0
  }

  /**
   * Test error logging
   */
  async testErrorLogging() {
    console.log('🧪 Testing error logging...')
    
    // Simulate an error
    this.logger.logOperation({
      operation: 'create',
      model: 'User',
      query: 'create User',
      params: { data: { email: 'invalid-email' } },
      duration: 120,
      userId: 'test-user-123',
      ip: '127.0.0.1',
      userAgent: 'Test Agent',
      success: false,
      error: 'Invalid email format',
      stack: 'Error: Invalid email format\n    at validateEmail...'
    })

    const errors = this.logger.getErrorLogs(10)
    console.log('✅ Error logging test passed:', errors.length > 0)
    return errors.length > 0
  }

  /**
   * Test metrics calculation
   */
  async testMetricsCalculation() {
    console.log('🧪 Testing metrics calculation...')
    
    const metrics = this.logger.getMetrics()
    const stats = this.logger.getQueryStats()
    
    console.log('📊 Current metrics:', {
      totalQueries: metrics.totalQueries,
      averageDuration: metrics.averageDuration,
      slowQueries: metrics.slowQueries,
      errorCount: metrics.errorCount
    })

    console.log('📈 Query statistics:', {
      mostQueriedModels: stats.mostQueriedModels.slice(0, 3),
      mostUsedOperations: stats.mostUsedOperations.slice(0, 3),
      averageQueryDuration: stats.averageQueryDuration
    })

    return metrics.totalQueries > 0
  }

  /**
   * Test middleware manager
   */
  async testMiddlewareManager() {
    console.log('🧪 Testing middleware manager...')
    
    const isEnabled = middlewareManager.isMonitoringEnabled()
    const statistics = middlewareManager.getStatistics()
    
    console.log('🔧 Middleware manager status:', {
      isEnabled,
      hasMetrics: !!statistics.metrics,
      hasStats: !!statistics.stats
    })

    return isEnabled
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🚀 Running database monitoring tests...\n')
    
    const results = {
      basicLogging: await this.testBasicLogging(),
      slowQueryDetection: await this.testSlowQueryDetection(),
      errorLogging: await this.testErrorLogging(),
      metricsCalculation: await this.testMetricsCalculation(),
      middlewareManager: await this.testMiddlewareManager()
    }

    console.log('\n📋 Test Results:')
    console.log('================')
    Object.entries(results).forEach(([test, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`)
    })

    const allPassed = Object.values(results).every(Boolean)
    console.log(`\n🎯 Overall: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`)
    
    return results
  }

  /**
   * Clear test data
   */
  clearTestData() {
    this.logger.clearOldLogs(0) // Clear all logs
    console.log('🧹 Test data cleared')
  }
}

/**
 * Quick test function
 */
export async function quickTest() {
  const tester = new DatabaseMonitoringTester()
  const results = await tester.runAllTests()
  tester.clearTestData()
  return results
}

/**
 * Performance test
 */
export async function performanceTest(iterations: number = 100) {
  console.log(`🏃‍♂️ Running performance test with ${iterations} iterations...`)
  
  const logger = DatabaseLogger.getInstance()
  const startTime = Date.now()
  
  for (let i = 0; i < iterations; i++) {
    logger.logOperation({
      operation: 'findMany',
      model: 'User',
      query: `findMany User ${i}`,
      params: { where: { id: i } },
      duration: Math.random() * 100,
      userId: `user-${i}`,
      ip: '127.0.0.1',
      userAgent: 'Performance Test',
      success: true
    })
  }
  
  const endTime = Date.now()
  const totalTime = endTime - startTime
  const avgTime = totalTime / iterations
  
  console.log(`⏱️ Performance test results:`)
  console.log(`   Total time: ${totalTime}ms`)
  console.log(`   Average time per operation: ${avgTime.toFixed(2)}ms`)
  console.log(`   Operations per second: ${(1000 / avgTime).toFixed(2)}`)
  
  return {
    totalTime,
    avgTime,
    operationsPerSecond: 1000 / avgTime
  }
}
