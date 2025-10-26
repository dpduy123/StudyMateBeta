import useSWR from 'swr'
import { useState, useCallback, useRef, useEffect } from 'react'
import { MatchingUser } from '@/lib/matching/algorithm'

interface MatchesResponse {
  matches: MatchingUser[]
  totalAvailable: number
  excludedCount: number
  source?: 'buffer' | 'redis' | 'computed'
  executionTime?: number
  bufferStatus?: any
  precomputedScores?: number
  realtimeScores?: number
}

interface MatchActionResponse {
  match: boolean
  message: string
}

interface BatchActionResponse {
  success: boolean
  results: Array<{
    targetUserId: string
    action: string
    match: boolean
    message?: string
    error?: string
  }>
  processed: number
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

// Smart buffer for local state management
class SmartMatchBuffer {
  private matches: MatchingUser[] = []
  private cursor: number = 0
  private isLoading: boolean = false
  private hasMore: boolean = true
  private batchQueue: Array<{ userId: string, action: 'LIKE' | 'PASS' }> = []
  private batchTimeout: NodeJS.Timeout | null = null
  public onBatchProcess?: (actions: Array<{ targetUserId: string, action: 'LIKE' | 'PASS' }>) => Promise<void>

  constructor(
    private excludeIds: string[] = []
  ) { }

  addMatches(matches: MatchingUser[]) {
    // Avoid duplicates
    const existingIds = new Set(this.matches.map(m => m.id))
    const newMatches = matches.filter(match => !existingIds.has(match.id))
    this.matches.push(...newMatches)
  }

  getNext(count: number = 1): MatchingUser[] {
    if (count === 0) {
      // Return all available matches without advancing cursor
      return this.matches.slice(this.cursor)
    }

    const available = this.matches.slice(this.cursor, this.cursor + count)
    this.cursor += available.length
    return available
  }

  getRemainingCount(): number {
    return Math.max(0, this.matches.length - this.cursor)
  }

  processAction(userId: string, action: 'LIKE' | 'PASS') {
    // Remove from current buffer
    this.matches = this.matches.filter(match => match.id !== userId)
    if (this.cursor > 0) this.cursor--

    // Add to batch queue
    this.batchQueue.push({ userId, action })

    // Process batch after delay or when queue is full
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout)
    }

    if (this.batchQueue.length >= 3) {
      this.processBatch()
    } else {
      this.batchTimeout = setTimeout(() => this.processBatch(), 2000)
    }
  }

  private async processBatch() {
    if (this.batchQueue.length === 0 || !this.onBatchProcess) return

    const actions = this.batchQueue.map(item => ({
      targetUserId: item.userId,
      action: item.action
    }))

    this.batchQueue = []
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout)
      this.batchTimeout = null
    }

    try {
      await this.onBatchProcess(actions)
    } catch (error) {
      console.error('Batch processing failed:', error instanceof Error ? error.message : error)
    }
  }

  setLoading(loading: boolean) {
    this.isLoading = loading
  }

  getIsLoading(): boolean {
    return this.isLoading
  }

  setHasMore(hasMore: boolean) {
    this.hasMore = hasMore
  }

  clear() {
    this.matches = []
    this.cursor = 0
    this.batchQueue = []
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout)
      this.batchTimeout = null
    }
  }

  getStatus() {
    return {
      totalMatches: this.matches.length,
      remainingMatches: this.getRemainingCount(),
      isLoading: this.isLoading,
      hasMore: this.hasMore,
      queuedActions: this.batchQueue.length
    }
  }
}

export function useMatches(limit: number = 10, excludeIds: string[] = []) {
  const [buffer] = useState(() => new SmartMatchBuffer())
  const excludeIdsParam = excludeIds.length > 0 ? `&exclude_ids=${excludeIds.join(',')}` : ''
  const [debugInfo, setDebugInfo] = useState<any>({})

  const { data, error, isLoading, mutate } = useSWR<MatchesResponse>(
    `/api/discover/smart-matches?limit=${limit}${excludeIdsParam}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000, // Cache for 30 seconds
      onSuccess: (data) => {
        if (data?.matches) {
          buffer.addMatches(data.matches)
          buffer.setHasMore(data.matches.length === limit)

          setDebugInfo({
            source: data.source,
            executionTime: data.executionTime,
            precomputedScores: data.precomputedScores,
            realtimeScores: data.realtimeScores,
            bufferStatus: data.bufferStatus
          })

          // Buffer management is handled by SmartMatchBuffer class above
        }
      }
    }
  )

  // Setup batch processing
  useEffect(() => {
    buffer.onBatchProcess = async (actions) => {
      try {
        const response = await fetch('/api/discover/smart-matches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ actions })
        })

        if (!response.ok) {
          throw new Error('Batch processing failed')
        }

        const result: BatchActionResponse = await response.json()
        console.log('Batch processed:', result)
      } catch (error) {
        console.error('Batch processing error:', error)
      }
    }
  }, [buffer])

  const prefetch = useCallback(async () => {
    if (buffer.getRemainingCount() <= 3 && !buffer.getIsLoading()) {
      buffer.setLoading(true)
      try {
        await mutate()
      } finally {
        buffer.setLoading(false)
      }
    }
  }, [buffer, mutate])

  const matchesForDisplay = buffer.getNext(0)

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('🐛 Hook Debug:', {
      'matches returned': matchesForDisplay.length,
      'buffer status': buffer.getStatus(),
      'first match': matchesForDisplay[0]?.firstName || 'none'
    })
  }

  return {
    matches: matchesForDisplay, // Return all available matches for display
    totalAvailable: data?.totalAvailable || 0,
    excludedCount: data?.excludedCount || 0,
    isLoading: isLoading || buffer.getIsLoading(),
    error,
    refetch: mutate,
    prefetch,
    bufferStatus: buffer.getStatus(),
    debugInfo,
    // New smart methods
    getNextMatches: (count: number) => buffer.getNext(count),
    getRemainingCount: () => buffer.getRemainingCount()
  }
}

export function useMatchActions() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [batchQueue, setBatchQueue] = useState<Array<{ targetUserId: string, action: 'LIKE' | 'PASS' }>>([])
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const performAction = async (action: 'LIKE' | 'PASS', targetUserId: string): Promise<MatchActionResponse> => {
    setIsProcessing(true)
    try {
      const response = await fetch('/api/discover/smart-matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          targetUserId
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to process action')
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error performing match action:', error)
      throw error
    } finally {
      setIsProcessing(false)
    }
  }

  const performBatchActions = async (actions: Array<{ targetUserId: string, action: 'LIKE' | 'PASS' }>): Promise<BatchActionResponse> => {
    setIsProcessing(true)
    try {
      const response = await fetch('/api/discover/smart-matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ actions }),
      })

      if (!response.ok) {
        throw new Error('Failed to process batch actions')
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error performing batch actions:', error)
      throw error
    } finally {
      setIsProcessing(false)
    }
  }

  const queueAction = useCallback((action: 'LIKE' | 'PASS', targetUserId: string) => {
    setBatchQueue(prev => {
      const updated = [...prev, { targetUserId, action }]

      // Clear existing timeout
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current)
      }

      // Process immediately if queue is full, otherwise wait
      if (updated.length >= 3) {
        // Process immediately
        performBatchActions(updated).then(() => {
          setBatchQueue([])
        }).catch(err => console.error('Immediate batch processing error:', err instanceof Error ? err.message : err))
      } else {
        // Set timeout for batch processing
        batchTimeoutRef.current = setTimeout(() => {
          if (updated.length > 0) {
            performBatchActions(updated).then(() => {
              setBatchQueue([])
            }).catch(err => console.error('Timeout batch processing error:', err instanceof Error ? err.message : err))
          }
        }, 2000)
      }

      return updated
    })
  }, [])

  const likeUser = (userId: string) => performAction('LIKE', userId)
  const passUser = (userId: string) => performAction('PASS', userId)

  // Smart batch methods
  const smartLikeUser = (userId: string) => queueAction('LIKE', userId)
  const smartPassUser = (userId: string) => queueAction('PASS', userId)

  // Flush pending actions immediately
  const flushBatch = useCallback(async () => {
    if (batchQueue.length > 0) {
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current)
        batchTimeoutRef.current = null
      }

      const actions = [...batchQueue]
      setBatchQueue([])

      try {
        await performBatchActions(actions)
      } catch (error) {
        console.error('Error flushing batch:', error instanceof Error ? error.message : error)
        // Re-add failed actions to queue
        setBatchQueue(prev => [...prev, ...actions])
      }
    }
  }, [batchQueue])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current)
      }
    }
  }, [])

  return {
    // Legacy methods (for backward compatibility)
    likeUser,
    passUser,
    isProcessing,

    // Smart batch methods
    smartLikeUser,
    smartPassUser,
    performBatchActions,
    flushBatch,

    // Queue status
    queuedActions: batchQueue.length,
    batchQueue: batchQueue
  }
}

export function useMatchFilters() {
  const [filters, setFilters] = useState({
    university: '',
    major: '',
    year: '',
    interests: [] as string[],
    skills: [] as string[],
    studyTime: '',
    minMatchScore: 70
  })

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const resetFilters = () => {
    setFilters({
      university: '',
      major: '',
      year: '',
      interests: [],
      skills: [],
      studyTime: '',
      minMatchScore: 70
    })
  }

  return {
    filters,
    updateFilter,
    resetFilters
  }
}