'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Channel } from 'pusher-js'
import { getPusherClient } from '@/lib/pusher/client'
import { getPresenceChannelName } from '@/lib/pusher/server'

interface PresenceUser {
  id: string
  firstName: string
  lastName: string
  avatar?: string
}

interface UsePresenceReturn {
  onlineUsers: Set<string>
  error: string | null
}

/**
 * Unified presence tracking hook
 * Handles both own presence broadcasting and tracking other users' presence
 * 
 * @param userId - Current user's ID (for broadcasting own presence)
 * @param trackUserIds - Array of user IDs to track (optional)
 * @returns Object with set of online user IDs and error
 */
export function usePresence(
  userId: string | undefined,
  trackUserIds: string[] = []
): UsePresenceReturn {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const channelsRef = useRef<Map<string, Channel>>(new Map())
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)

  // Update lastActive timestamp in database
  const updateLastActive = useCallback(async () => {
    if (!userId) return

    try {
      // Get Supabase session for auth token
      const { createBrowserClient } = await import('@supabase/ssr')
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
      )
      
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        return // Silently skip if no session
      }

      await fetch('/api/user/presence/heartbeat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      })
    } catch (err) {
      // Silently fail - this is a background heartbeat
    }
  }, [userId])

  useEffect(() => {
    mountedRef.current = true

    if (!userId) {
      setOnlineUsers(new Set())
      return
    }

    let pusher: ReturnType<typeof getPusherClient> | null = null

    const initPresence = async () => {
      try {
        // Get Supabase token
        const { createBrowserClient } = await import('@supabase/ssr')
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
        )
        
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.access_token) {
          // Silently skip if no session - user not authenticated yet
          return
        }

        if (!mountedRef.current) return

        // Get Pusher client
        pusher = getPusherClient(session.access_token)

        // 1. Subscribe to OWN presence channel to broadcast status
        const ownChannelName = getPresenceChannelName(userId)
        
        const ownChannel = pusher.subscribe(ownChannelName)
        channelsRef.current.set(userId, ownChannel)

        ownChannel.bind('pusher:subscription_succeeded', () => {
          if (!mountedRef.current) return
          updateLastActive()
        })

        ownChannel.bind('pusher:subscription_error', (err: any) => {
          if (!mountedRef.current) return
          // Only log error if it's not an auth issue (user might not be logged in)
          if (err.error && !err.error.includes('Auth')) {
            console.error(`❌ Failed to broadcast own presence:`, err)
            setError(err.error || 'Failed to broadcast presence')
          }
        })

        // 2. Subscribe to OTHER users' presence channels to track them
        trackUserIds.forEach(trackUserId => {
          if (trackUserId === userId) return // Skip own ID

          const channelName = getPresenceChannelName(trackUserId)
          const channel = pusher!.subscribe(channelName)
          channelsRef.current.set(trackUserId, channel)

          // Handle subscription success
          channel.bind('pusher:subscription_succeeded', (members: any) => {
            if (!mountedRef.current) return
            
            // Check if the target user is online
            let userIsOnline = false
            members.each((member: any) => {
              if (member.id === trackUserId) {
                userIsOnline = true
              }
            })
            
            setOnlineUsers(prev => {
              const newSet = new Set(prev)
              if (userIsOnline) {
                newSet.add(trackUserId)
              } else {
                newSet.delete(trackUserId)
              }
              return newSet
            })
          })

          // Handle subscription error
          channel.bind('pusher:subscription_error', (err: any) => {
            if (!mountedRef.current) return
            console.error(`❌ Presence subscription error for ${trackUserId}:`, err)
          })

          // Handle member added (user comes online)
          channel.bind('pusher:member_added', (member: any) => {
            if (!mountedRef.current) return
            if (member.id === trackUserId) {
              setOnlineUsers(prev => new Set(prev).add(trackUserId))
            }
          })

          // Handle member removed (user goes offline)
          channel.bind('pusher:member_removed', (member: any) => {
            if (!mountedRef.current) return
            if (member.id === trackUserId) {
              setOnlineUsers(prev => {
                const newSet = new Set(prev)
                newSet.delete(trackUserId)
                return newSet
              })
            }
          })
        })

        // Set up heartbeat to update lastActive every 60 seconds
        heartbeatIntervalRef.current = setInterval(() => {
          updateLastActive()
        }, 60000)

        // Update lastActive on page visibility change
        const handleVisibilityChange = () => {
          if (document.visibilityState === 'visible') {
            updateLastActive()
          }
        }
        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
          document.removeEventListener('visibilitychange', handleVisibilityChange)
        }

      } catch (err) {
        if (!mountedRef.current) return
        console.error('Failed to initialize presence:', err)
        setError(err instanceof Error ? err.message : 'Failed to connect')
      }
    }

    const cleanup = initPresence()

    // Cleanup on unmount
    return () => {
      mountedRef.current = false

      // Clear heartbeat interval
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
        heartbeatIntervalRef.current = null
      }

      // Unsubscribe from all channels
      channelsRef.current.forEach((channel) => {
        channel.unbind('pusher:subscription_succeeded')
        channel.unbind('pusher:subscription_error')
        channel.unbind('pusher:member_added')
        channel.unbind('pusher:member_removed')
        channel.unsubscribe()
      })
      channelsRef.current.clear()

      // Execute async cleanup if exists
      if (cleanup instanceof Promise) {
        cleanup.then(cleanupFn => {
          if (cleanupFn) cleanupFn()
        })
      }
    }
  }, [userId, trackUserIds.join(','), updateLastActive])

  return {
    onlineUsers,
    error
  }
}
