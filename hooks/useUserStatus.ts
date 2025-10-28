'use client'

import { useEffect, useState } from 'react'
import { usePusher } from './usePusher'
import { getPresenceChannelName } from '@/lib/pusher/server'

export interface UserStatus {
  userId: string
  status: 'online' | 'offline' | 'away'
  lastActive: Date
  user?: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  }
}

interface UseUserStatusOptions {
  userId: string
  enabled?: boolean
}

interface UseUserStatusReturn {
  status: UserStatus | null
  isLoading: boolean
  error: string | null
}

/**
 * Hook to track another user's online/offline status
 * Subscribes to their presence channel and listens for status changes
 */
export function useUserStatus({
  userId,
  enabled = true
}: UseUserStatusOptions): UseUserStatusReturn {
  const [status, setStatus] = useState<UserStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch initial status from API
  useEffect(() => {
    if (!enabled || !userId) {
      setIsLoading(false)
      return
    }

    const fetchInitialStatus = async () => {
      try {
        const response = await fetch(`/api/user/${userId}/status`)
        if (response.ok) {
          const data = await response.json()
          setStatus({
            userId: data.userId,
            status: data.status,
            lastActive: new Date(data.lastActive),
            user: data.user
          })
        }
      } catch (err) {
        console.error('Failed to fetch user status:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialStatus()
  }, [userId, enabled])

  // Subscribe to presence channel for real-time updates
  const { error } = usePusher({
    channelName: getPresenceChannelName(userId),
    enabled: enabled && !!userId,
    events: {
      'user-status-change': (data: any) => {
        console.log('📡 User status changed:', data)
        setStatus({
          userId: data.userId,
          status: data.status,
          lastActive: new Date(data.lastActive),
          user: data.user
        })
      }
    }
  })

  return {
    status,
    isLoading,
    error
  }
}

/**
 * Hook to track multiple users' online/offline status
 * Useful for displaying status in user lists
 */
export function useMultipleUserStatus(
  userIds: string[],
  enabled = true
): Record<string, UserStatus | null> {
  const [statuses, setStatuses] = useState<Record<string, UserStatus | null>>({})

  useEffect(() => {
    if (!enabled || userIds.length === 0) return

    const fetchStatuses = async () => {
      try {
        const response = await fetch('/api/user/status/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userIds })
        })

        if (response.ok) {
          const data = await response.json()
          const statusMap: Record<string, UserStatus> = {}

          data.statuses.forEach((s: any) => {
            statusMap[s.userId] = {
              userId: s.userId,
              status: s.status,
              lastActive: new Date(s.lastActive),
              user: s.user
            }
          })

          setStatuses(statusMap)
        }
      } catch (err) {
        console.error('Failed to fetch user statuses:', err)
      }
    }

    fetchStatuses()
  }, [userIds.join(','), enabled])

  // Subscribe to each user's presence channel
  userIds.forEach(userId => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    usePusher({
      channelName: getPresenceChannelName(userId),
      enabled: enabled && !!userId,
      events: {
        'user-status-change': (data: any) => {
          setStatuses(prev => ({
            ...prev,
            [data.userId]: {
              userId: data.userId,
              status: data.status,
              lastActive: new Date(data.lastActive),
              user: data.user
            }
          }))
        }
      }
    })
  })

  return statuses
}
