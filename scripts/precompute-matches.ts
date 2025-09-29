#!/usr/bin/env ts-node
/**
 * Background job to pre-compute match scores for all users
 * Run this script periodically (e.g., daily via cron) to keep cache fresh
 */

import { MatchPrecomputationService } from '../lib/jobs/match-precomputation'
import { RedisCache } from '../lib/cache/redis-client'

async function main() {
  console.log('🚀 Starting match precomputation job...')

  try {
    // Initialize services
    const precompService = MatchPrecomputationService.getInstance()
    const redis = RedisCache.getInstance()

    // Check Redis connection
    const isRedisHealthy = await redis.isHealthy()
    if (!isRedisHealthy) {
      throw new Error('Redis is not available')
    }

    console.log('✅ Redis connection verified')

    // Run batch precomputation for all active users
    const jobIds = await precompService.runBatchPrecomputation()

    console.log(`📋 Created ${jobIds.length} precomputation jobs`)

    // Monitor job progress
    let completedJobs = 0
    let failedJobs = 0

    const checkProgress = () => {
      const allJobs = precompService.getAllJobs()
      const completed = allJobs.filter(j => j.status === 'completed').length
      const failed = allJobs.filter(j => j.status === 'failed').length
      const inProgress = allJobs.filter(j => j.status === 'processing').length

      if (completed !== completedJobs || failed !== failedJobs) {
        completedJobs = completed
        failedJobs = failed

        console.log(`📊 Progress: ${completed} completed, ${failed} failed, ${inProgress} in progress`)

        // Show performance stats
        if (completed > 0 || failed > 0) {
          const stats = precompService.getPerformanceStats()
          console.log(`⚡ Performance: Avg ${Math.round(stats.averageExecutionTime)}ms, ${stats.totalScoresComputed} scores computed`)
        }
      }
    }

    // Check progress every 10 seconds
    const progressInterval = setInterval(checkProgress, 10000)

    // Wait for all jobs to complete
    let allComplete = false
    while (!allComplete) {
      const allJobs = precompService.getAllJobs()
      const remaining = allJobs.filter(j => j.status === 'pending' || j.status === 'processing').length

      if (remaining === 0) {
        allComplete = true
      } else {
        console.log(`⏳ Waiting for ${remaining} jobs to complete...`)
        await new Promise(resolve => setTimeout(resolve, 30000)) // Wait 30 seconds
      }
    }

    clearInterval(progressInterval)

    // Final statistics
    const finalStats = precompService.getPerformanceStats()
    console.log('\n🎉 Precomputation job completed!')
    console.log(`📈 Final Stats:`)
    console.log(`   • Total Jobs: ${finalStats.totalJobs}`)
    console.log(`   • Completed: ${finalStats.completedJobs}`)
    console.log(`   • Failed: ${finalStats.failedJobs}`)
    console.log(`   • Average Execution Time: ${Math.round(finalStats.averageExecutionTime)}ms`)
    console.log(`   • Total Match Scores Computed: ${finalStats.totalScoresComputed}`)

    // Get cache statistics
    const cacheStats = await redis.getCacheStats()
    console.log(`💾 Cache Stats:`)
    console.log(`   • Total Keys: ${cacheStats.totalKeys}`)
    console.log(`   • Memory Usage: ${cacheStats.memoryUsage}`)
    console.log(`   • Hit Rate: ${(cacheStats.hitRate * 100).toFixed(1)}%`)

    // Cleanup old jobs
    precompService.cleanupCompletedJobs()

    process.exit(0)

  } catch (error) {
    console.error('❌ Precomputation job failed:', error)
    process.exit(1)
  }
}

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...')
  process.exit(0)
})

// Run the job
if (require.main === module) {
  main()
}