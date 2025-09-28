import useSWR from 'swr'
import { useState } from 'react'
import { MatchingUser } from '@/lib/matching/algorithm'

interface MatchesResponse {
  matches: MatchingUser[]
  totalAvailable: number
  excludedCount: number
}

interface MatchActionResponse {
  match: boolean
  message: string
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useMatches(limit: number = 10, excludeIds: string[] = []) {
  const excludeIdsParam = excludeIds.length > 0 ? `&exclude_ids=${excludeIds.join(',')}` : ''
  const { data, error, isLoading, mutate } = useSWR<MatchesResponse>(
    `/api/discover/matches?limit=${limit}${excludeIdsParam}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000 // Cache for 1 minute
    }
  )

  return {
    matches: data?.matches || [],
    totalAvailable: data?.totalAvailable || 0,
    excludedCount: data?.excludedCount || 0,
    isLoading,
    error,
    refetch: mutate
  }
}

export function useMatchActions() {
  const [isProcessing, setIsProcessing] = useState(false)

  const performAction = async (action: 'LIKE' | 'PASS', targetUserId: string): Promise<MatchActionResponse> => {
    setIsProcessing(true)
    try {
      const response = await fetch('/api/discover/matches', {
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

  const likeUser = (userId: string) => performAction('LIKE', userId)
  const passUser = (userId: string) => performAction('PASS', userId)

  return {
    likeUser,
    passUser,
    isProcessing
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