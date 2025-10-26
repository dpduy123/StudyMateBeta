'use client'

import { useEffect, useRef } from 'react'
import { Channel } from 'pusher-js'
import { getPusherClient } from '@/lib/pusher/client'
import { getPresenceChannelName } from '@/lib/pusher/server'

/**
 * Hook for user to subscribe to their own presence channel
 * This broadcasts the user's online status to others who are watching
 * 
 * IMPORTANT: User must subscribe to their OWN presence channel for others to see them online
 * This is how Pusher presence channels work - you join your own channel, others observe it
 */
export function useMyPresence(userId: string | undefined) {
  const channelRef = useRef<Channel | null>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!userId) {
      return
    }

    let pusher: ReturnType<typeof getPusherClient> | null = null
    let mounted = true

    const initMyPresence = async () => {
      try {
        // Get Supabase token
        const { createBrowserClient } = await import('@supabase/ssr')
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
        )
        
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.access_token) {
          console.warn('⚠️ No access token available for presence')
          return
        }

        if (!mounted) return

        // Get Pusher client
        pusher = getPusherClient(session.access_token)

        // Subscribe to OWN presence channel
        const channelName = getPresenceChannelName(userId)
        console.log(`👤 Subscribing to own presence channel: ${channelName}`)
        
        const channel = pusher.subscribe(channelName)
        channelRef.current = channel

        // Handle subscription success
        channel.bind('pusher:subscription_succeeded', (members: any) => {
          if (!mounted) return
          console.log(`✅ Successfully joined own presence channel. Members count: ${members.count}`)
        })

        // Handle subscription error
        channel.bind('pusher:subscription_error', (err: any) => {
          if (!mounted) return
          console.error(`❌ Failed to join own presence channel:`, err)
        })

        // Send heartbeat to update lastActive timestamp
        const sendHeartbeat = async () => {
          try {
            await fetch('/api/user/presence/heartbeat', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
              }
            })
          } catch (error) {
            console.error('Failed to send presence heartbeat:', error)
          }
        }

        // Send initial heartbeat immediately
        sendHeartbeat()

        // Send heartbeat every 60 seconds to keep presence active
        heartbeatIntervalRef.current = setInterval(sendHeartbeat, 60000)

        // Handle page visibility changes
        const handleVisibilityChange = () => {
          if (document.visibilityState === 'visible') {
            // User came back to tab, send heartbeat
            sendHeartbeat()
          }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)

        // Cleanup function
        return () => {
          document.removeEventListener('visibilitychange', handleVisibilityChange)
        }

      } catch (err) {
        if (!mounted) return
        console.error('Failed to initialize own presence:', err)
      }
    }

    const cleanup = initMyPresence()

    // Cleanup on unmount
    return () => {
      mounted = false

      // Clear heartbeat interval
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
        heartbeatIntervalRef.current = null
      }

      // Unsubscribe from channel
      if (channelRef.current) {
        console.log(`🔌 Unsubscribing from own presence channel`)
        channelRef.current.unbind('pusher:subscription_succeeded')
        channelRef.current.unbind('pusher:subscription_error')
        channelRef.current.unsubscribe()
        channelRef.current = null
      }

      // Execute async cleanup if exists
      if (cleanup instanceof Promise) {
        cleanup.then(cleanupFn => {
          if (cleanupFn) cleanupFn()
        })
      }
    }
  }, [userId])
}
