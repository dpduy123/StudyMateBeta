'use client'

import { useEffect, useState, useRef } from 'react'
import { Channel } from 'pusher-js'
import { getPusherClient } from '@/lib/pusher/client'
import { getPresenceChannelName } from '@/lib/pusher/server'

interface UseOtherUserPresenceReturn {
  isOnline: boolean
  error: string | null
}

/**
 * Hook to track another user's online/offline presence using Pusher
 * @param userId - The user ID to track
 * @returns Object with isOnline status and error
 */
export function useOtherUserPresence(userId: string | undefined): UseOtherUserPresenceReturn {
  const [isOnline, setIsOnline] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const channelRef = useRef<Channel | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    if (!userId) {
      setIsOnline(false)
      return
    }

    // Fetch initial status from API
    const fetchInitialStatus = async () => {
      try {
        const response = await fetch(`/api/user/${userId}/status`)
        if (response.ok) {
          const data = await response.json()
          if (mountedRef.current) {
            setIsOnline(data.status === 'online')
          }
        }
      } catch (err) {
        console.error('Failed to fetch initial status:', err)
      }
    }

    fetchInitialStatus()

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
          throw new Error('No access token available')
        }

        if (!mountedRef.current) return

        // Get Pusher client
        pusher = getPusherClient(session.access_token)

        // Subscribe to the other user's presence channel
        const channelName = getPresenceChannelName(userId)
        console.log(`👁️ Watching presence for user ${userId}: ${channelName}`)
        
        const channel = pusher.subscribe(channelName)
        channelRef.current = channel

        // Handle subscription success
        channel.bind('pusher:subscription_succeeded', (members: any) => {
          if (!mountedRef.current) return
          
          // Check if the target user (not observers) is in the members list
          let userIsOnline = false
          members.each((member: any) => {
            // Only count real members, not observers
            if (member.id === userId) {
              userIsOnline = true
            }
          })
          
          console.log(`✅ Presence subscription succeeded for ${userId}, online: ${userIsOnline}`)
          setIsOnline(userIsOnline)
          setError(null)
        })

        // Handle subscription error
        channel.bind('pusher:subscription_error', (err: any) => {
          if (!mountedRef.current) return
          console.error(`❌ Presence subscription error for ${userId}:`, err)
          setError(err.error || 'Failed to subscribe to presence channel')
          setIsOnline(false)
        })

        // Handle member added (user comes online)
        channel.bind('pusher:member_added', (member: any) => {
          if (!mountedRef.current) return
          // Only track the actual user, not observers
          if (member.id === userId) {
            console.log(`👤 User ${userId} came online`)
            setIsOnline(true)
          }
        })

        // Handle member removed (user goes offline)
        channel.bind('pusher:member_removed', (member: any) => {
          if (!mountedRef.current) return
          // Only track the actual user, not observers
          if (member.id === userId) {
            console.log(`👋 User ${userId} went offline`)
            setIsOnline(false)
          }
        })

      } catch (err) {
        if (!mountedRef.current) return
        console.error(`Failed to initialize presence tracking for ${userId}:`, err)
        setError(err instanceof Error ? err.message : 'Failed to connect')
        setIsOnline(false)
      }
    }

    initPresence()

    // Cleanup
    return () => {
      mountedRef.current = false

      if (channelRef.current) {
        console.log(`🔌 Unsubscribing from presence channel for ${userId}`)
        channelRef.current.unbind('pusher:subscription_succeeded')
        channelRef.current.unbind('pusher:subscription_error')
        channelRef.current.unbind('pusher:member_added')
        channelRef.current.unbind('pusher:member_removed')
        channelRef.current.unsubscribe()
        channelRef.current = null
      }
    }
  }, [userId])

  return {
    isOnline,
    error
  }
}
