'use client'

import useSWR from 'swr'

const fetcher = async (url: string) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export interface DashboardData {
  profile: {
    name: string
    avatar?: string
    university: string
    major: string
  }
  userStats: {
    matches: number
    studySessions: number
    hoursStudied: number
    badges: number
  }
  recentMatches: {
    id: string
    userId: string
    name: string
    university: string
    subject: string
    avatar?: string
    matchScore: number
    isOnline: boolean
    matchedAt: string
  }[]
  upcomingEvents: {
    id: string
    title: string
    time: string
    participants: number
    type: string
    topic?: string
    isOwner?: boolean
    maxMembers?: number
    roomType?: string
    description?: string
  }[]
  recentActivity: {
    id: string
    icon: string
    iconColor: string
    iconBg: string
    title: string
    description: string
    time: string
  }[]
}

export function useDashboard() {
  const { data, error, isLoading, mutate } = useSWR<DashboardData>(
    '/api/dashboard',
    fetcher,
    {
      // Cache for 5 minutes
      dedupingInterval: 5 * 60 * 1000,
      // Revalidate when window focuses (optional)
      revalidateOnFocus: false,
      // Revalidate when reconnects (optional)
      revalidateOnReconnect: true,
      // Retry on error
      errorRetryCount: 3,
      errorRetryInterval: 1000,
      // Fallback data
      fallbackData: undefined,
    }
  )

  return {
    data,
    isLoading,
    error,
    refetch: mutate,
  }
}