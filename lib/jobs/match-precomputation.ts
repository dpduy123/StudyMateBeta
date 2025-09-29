import { prisma } from '@/lib/prisma'
import { AIMatchingEngine } from '@/lib/matching/algorithm'
import { RedisCache } from '@/lib/cache/redis-client'
import { UserProfile } from '@/components/profile/types'

export interface PrecomputationJob {
  id: string
  userId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  startedAt?: Date
  completedAt?: Date
  error?: string
  metrics: {
    totalUsers: number
    processedUsers: number
    scoresComputed: number
    cacheHits: number
    cacheMisses: number
    executionTimeMs: number
  }
}

export interface PrecomputationConfig {
  batchSize: number
  maxConcurrentJobs: number
  retryAttempts: number
  cacheInvalidationThreshold: number // days
  scheduleHours: number[] // Hours to run jobs (0-23)
}

export class MatchPrecomputationService {
  private static instance: MatchPrecomputationService
  private redis: RedisCache
  private runningJobs = new Map<string, PrecomputationJob>()
  private config: PrecomputationConfig

  private constructor() {
    this.redis = RedisCache.getInstance()
    this.config = {
      batchSize: 100, // Process 100 users at a time
      maxConcurrentJobs: 3,
      retryAttempts: 3,
      cacheInvalidationThreshold: 7, // Recompute after 7 days
      scheduleHours: [2, 14, 22] // 2AM, 2PM, 10PM
    }
  }

  static getInstance(): MatchPrecomputationService {
    if (!MatchPrecomputationService.instance) {
      MatchPrecomputationService.instance = new MatchPrecomputationService()
    }
    return MatchPrecomputationService.instance
  }

  /**
   * Schedule and run match precomputation for a user
   */
  async schedulePrecomputation(userId: string, priority: 'high' | 'normal' | 'low' = 'normal'): Promise<string> {
    const jobId = `precomp_${userId}_${Date.now()}`

    const job: PrecomputationJob = {
      id: jobId,
      userId,
      status: 'pending',
      progress: 0,
      metrics: {
        totalUsers: 0,
        processedUsers: 0,
        scoresComputed: 0,
        cacheHits: 0,
        cacheMisses: 0,
        executionTimeMs: 0
      }
    }

    this.runningJobs.set(jobId, job)

    // Run immediately for high priority, or schedule for later
    if (priority === 'high') {
      this.executeJob(jobId).catch(error => {
        console.error(`High priority job ${jobId} failed:`, error)
      })
    } else {
      // Schedule for next available slot
      this.scheduleJobExecution(jobId, priority)
    }

    return jobId
  }

  /**
   * Run precomputation for all active users (batch job)
   */
  async runBatchPrecomputation(): Promise<string[]> {
    console.log('Starting batch precomputation for all users...')

    // Get all active users
    const activeUsers = await prisma.user.findMany({
      where: {
        isProfilePublic: true,
        lastActive: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      select: { id: true },
      take: 1000 // Limit for safety
    })

    const jobIds: string[] = []

    // Schedule jobs in batches to avoid overwhelming the system
    for (let i = 0; i < activeUsers.length; i += this.config.batchSize) {
      const batch = activeUsers.slice(i, i + this.config.batchSize)

      for (const user of batch) {
        // Check if user needs recomputation
        if (await this.needsRecomputation(user.id)) {
          const jobId = await this.schedulePrecomputation(user.id, 'normal')
          jobIds.push(jobId)
        }
      }

      // Wait between batches to avoid overload
      if (i + this.config.batchSize < activeUsers.length) {
        await this.delay(5000) // 5 second delay between batches
      }
    }

    console.log(`Scheduled ${jobIds.length} precomputation jobs`)
    return jobIds
  }

  /**
   * Execute a specific precomputation job
   */
  private async executeJob(jobId: string): Promise<void> {
    const job = this.runningJobs.get(jobId)
    if (!job) {
      throw new Error(`Job ${jobId} not found`)
    }

    // Check if we're already running too many jobs
    const runningCount = Array.from(this.runningJobs.values())
      .filter(j => j.status === 'processing').length

    if (runningCount >= this.config.maxConcurrentJobs) {
      console.log(`Job ${jobId} queued - max concurrent jobs (${this.config.maxConcurrentJobs}) reached`)
      return
    }

    job.status = 'processing'
    job.startedAt = new Date()
    const startTime = Date.now()

    try {
      // Get current user profile
      const currentUser = await prisma.user.findUnique({
        where: { id: job.userId }
      })

      if (!currentUser) {
        throw new Error(`User ${job.userId} not found`)
      }

      // Convert to UserProfile format
      const currentUserProfile: UserProfile = {
        id: currentUser.id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        avatar: currentUser.avatar || undefined,
        bio: currentUser.bio || undefined,
        university: currentUser.university,
        major: currentUser.major,
        year: currentUser.year,
        gpa: currentUser.gpa || undefined,
        interests: currentUser.interests,
        skills: currentUser.skills,
        studyGoals: currentUser.studyGoals,
        preferredStudyTime: currentUser.preferredStudyTime,
        languages: currentUser.languages,
        totalMatches: currentUser.totalMatches,
        successfulMatches: currentUser.successfulMatches,
        averageRating: currentUser.averageRating,
        createdAt: currentUser.createdAt.toISOString()
      }

      // Get all potential match candidates
      const candidates = await prisma.user.findMany({
        where: {
          id: { not: job.userId },
          isProfilePublic: true,
          lastActive: {
            gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) // Last 60 days
          }
        },
        take: 5000 // Reasonable limit
      })

      job.metrics.totalUsers = candidates.length
      console.log(`Computing matches for user ${job.userId} against ${candidates.length} candidates`)

      // Process candidates in batches
      const batchSize = 50
      const scoresComputed: Array<{userId1: string, userId2: string, score: number}> = []

      for (let i = 0; i < candidates.length; i += batchSize) {
        const batch = candidates.slice(i, i + batchSize)

        // Check cache first for this batch
        const cacheChecks = await Promise.all(
          batch.map(async candidate => {
            const cached = await this.redis.getMatchScore(job.userId, candidate.id)
            if (cached !== null) {
              job.metrics.cacheHits++
              return null // Already cached
            } else {
              job.metrics.cacheMisses++
              return candidate
            }
          })
        )

        // Filter out cached candidates
        const uncachedCandidates = cacheChecks.filter((candidate): candidate is NonNullable<typeof candidate> =>
          candidate !== null && candidate !== undefined
        )

        // Compute scores for uncached candidates
        if (uncachedCandidates.length > 0) {
          const candidateProfiles: UserProfile[] = uncachedCandidates.map(candidate => ({
            id: candidate.id,
            firstName: candidate.firstName,
            lastName: candidate.lastName,
            email: candidate.email,
            avatar: candidate.avatar || undefined,
            bio: candidate.bio || undefined,
            university: candidate.university,
            major: candidate.major,
            year: candidate.year,
            gpa: candidate.gpa || undefined,
            interests: candidate.interests,
            skills: candidate.skills,
            studyGoals: candidate.studyGoals,
            preferredStudyTime: candidate.preferredStudyTime,
            languages: candidate.languages,
            totalMatches: candidate.totalMatches,
            successfulMatches: candidate.successfulMatches,
            averageRating: candidate.averageRating,
            createdAt: candidate.createdAt.toISOString()
          }))

          // Compute match scores
          for (const candidateProfile of candidateProfiles) {
            const score = this.calculateMatchScore(currentUserProfile, candidateProfile)
            scoresComputed.push({
              userId1: job.userId,
              userId2: candidateProfile.id,
              score
            })
          }
        }

        // Update progress
        job.metrics.processedUsers = Math.min(i + batchSize, candidates.length)
        job.progress = Math.floor((job.metrics.processedUsers / job.metrics.totalUsers) * 100)

        // Cache scores for this batch
        if (scoresComputed.length >= batchSize || i + batchSize >= candidates.length) {
          await this.redis.batchCacheMatchScores(scoresComputed)
          job.metrics.scoresComputed += scoresComputed.length
          scoresComputed.length = 0 // Clear array
        }

        // Small delay to prevent overwhelming the system
        await this.delay(100)
      }

      job.status = 'completed'
      job.completedAt = new Date()
      job.metrics.executionTimeMs = Date.now() - startTime
      job.progress = 100

      console.log(`Job ${jobId} completed successfully:`, job.metrics)

    } catch (error) {
      job.status = 'failed'
      job.error = error instanceof Error ? error.message : 'Unknown error'
      job.completedAt = new Date()
      job.metrics.executionTimeMs = Date.now() - startTime

      console.error(`Job ${jobId} failed:`, error)
    }
  }

  /**
   * Check if a user needs match recomputation
   */
  private async needsRecomputation(userId: string): Promise<boolean> {
    try {
      // Check when user was last processed
      const lastJobKey = `last_precomp:${userId}`
      const lastRun = await this.redis.getUserProfile(lastJobKey)

      if (!lastRun) return true

      const daysSinceLastRun = (Date.now() - lastRun.timestamp) / (1000 * 60 * 60 * 24)
      return daysSinceLastRun >= this.config.cacheInvalidationThreshold
    } catch (error) {
      console.error('Error checking recomputation need:', error)
      return true // Default to needing recomputation
    }
  }

  /**
   * Calculate match score between two users
   */
  private calculateMatchScore(user1: UserProfile, user2: UserProfile): number {
    // Use the existing AIMatchingEngine logic
    const universityMatch = AIMatchingEngine.calculateUniversityMatch(user1, user2)
    const majorMatch = AIMatchingEngine.calculateMajorMatch(user1, user2)
    const yearCompatibility = AIMatchingEngine.calculateYearCompatibility(user1, user2)
    const interestsMatch = AIMatchingEngine.calculateInterestsMatch(user1, user2)
    const skillsMatch = AIMatchingEngine.calculateSkillsMatch(user1, user2)
    const studyTimeMatch = AIMatchingEngine.calculateStudyTimeMatch(user1, user2)
    const languageMatch = AIMatchingEngine.calculateLanguageMatch(user1, user2)

    // Weighted calculation
    const totalScore =
      universityMatch * 0.15 +      // 15%
      majorMatch * 0.20 +           // 20%
      yearCompatibility * 0.10 +    // 10%
      interestsMatch * 0.20 +       // 20%
      skillsMatch * 0.15 +          // 15%
      studyTimeMatch * 0.15 +       // 15%
      languageMatch * 0.05          // 5%

    return Math.round(totalScore * 100) / 100 // Round to 2 decimal places
  }

  /**
   * Schedule job execution for later
   */
  private scheduleJobExecution(jobId: string, priority: 'normal' | 'low') {
    const delay = priority === 'normal' ? 60000 : 300000 // 1 min or 5 min delay
    setTimeout(() => {
      this.executeJob(jobId).catch(error => {
        console.error(`Scheduled job ${jobId} failed:`, error)
      })
    }, delay)
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): PrecomputationJob | null {
    return this.runningJobs.get(jobId) || null
  }

  /**
   * Get all running jobs
   */
  getAllJobs(): PrecomputationJob[] {
    return Array.from(this.runningJobs.values())
  }

  /**
   * Cancel a job
   */
  cancelJob(jobId: string): boolean {
    const job = this.runningJobs.get(jobId)
    if (job && job.status === 'pending') {
      job.status = 'failed'
      job.error = 'Cancelled by user'
      return true
    }
    return false
  }

  /**
   * Clean up completed jobs
   */
  cleanupCompletedJobs() {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000 // 24 hours ago

    for (const [jobId, job] of this.runningJobs.entries()) {
      if (job.completedAt && job.completedAt.getTime() < cutoff) {
        this.runningJobs.delete(jobId)
      }
    }
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): {
    totalJobs: number
    completedJobs: number
    failedJobs: number
    averageExecutionTime: number
    totalScoresComputed: number
  } {
    const jobs = Array.from(this.runningJobs.values())

    return {
      totalJobs: jobs.length,
      completedJobs: jobs.filter(j => j.status === 'completed').length,
      failedJobs: jobs.filter(j => j.status === 'failed').length,
      averageExecutionTime: jobs
        .filter(j => j.metrics.executionTimeMs > 0)
        .reduce((sum, j) => sum + j.metrics.executionTimeMs, 0) / Math.max(jobs.length, 1),
      totalScoresComputed: jobs.reduce((sum, j) => sum + j.metrics.scoresComputed, 0)
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}