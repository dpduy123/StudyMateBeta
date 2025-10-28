'use client'

import { useEffect, useRef, useState } from 'react'
import { Channel } from 'pusher-js'
import { getPusherClient, isPusherConnected } from '@/lib/pusher/client'
import { useAuth } from '@/components/providers/Providers'

interface UsePusherOptions {
  channelName: string
  events: {
    [eventName: string]: (data: any) => void
  }
  enabled?: boolean
}

interface UsePusherReturn {
  channel: Channel | null
  isConnected: boolean
  isSubscribed: boolean
  error: string | null
}

/**
 * React hook for managing Pusher channel subscriptions and events
 * 
 * @example
 * ```tsx
 * const { isConnected, isSubscribed } = usePusher({
 *   channelName: 'private-chat-user1-user2',
 *   events: {
 *     'new-message': (message) => {
 *       console.log('New message:', message)
 *     },
 *     'typing-start': (data) => {
 *       console.log('User typing:', data.userId)
 *     }
 *   }
 * })
 * ```
 */
export function usePusher({
  channelName,
  events,
  enabled = true
}: UsePusherOptions): UsePusherReturn {
  const { user } = useAuth()
  const [channel, setChannel] = useState<Channel | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const channelRef = useRef<Channel | null>(null)
  const eventsRef = useRef(events)

  // Update events ref when events change
  useEffect(() => {
    eventsRef.current = events
  }, [events])

  useEffect(() => {
    // Don't subscribe if disabled or no user
    if (!enabled || !user || !channelName) {
      return
    }

    let pusher: ReturnType<typeof getPusherClient> | null = null
    let mounted = true

    const initPusher = async () => {
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

        if (!mounted) return

        // Get Pusher client
        pusher = getPusherClient(session.access_token)

        // Update connection state
        setIsConnected(isPusherConnected())

        // Listen for connection state changes
        pusher.connection.bind('state_change', (states: any) => {
          if (!mounted) return
          setIsConnected(states.current === 'connected')
        })

        pusher.connection.bind('error', (err: any) => {
          if (!mounted) return

          // Ignore transient errors during channel switching
          if (!err || Object.keys(err).length === 0) {
            return
          }

          // Ignore PusherError with code 4009 (connection closed) - happens during rapid channel switches
          if (err.type === 'PusherError' && err.data?.code === 4009) {
            return
          }

          // Log other errors but don't set error state for transient issues
          console.warn('Pusher connection issue:', err)

          // Only set error state for critical errors
          if (err.data?.code && err.data.code >= 4100) {
            setError(err.data.message || err.message || 'Connection error')
          }
        })

        // Subscribe to channel
        console.log(`📡 Subscribing to Pusher channel: ${channelName}`)
        const channelInstance = pusher.subscribe(channelName)

        if (!mounted) {
          channelInstance.unsubscribe()
          return
        }

        channelRef.current = channelInstance
        setChannel(channelInstance)

        // Bind subscription events
        channelInstance.bind('pusher:subscription_succeeded', () => {
          if (!mounted) return
          console.log(`✅ Subscribed to ${channelName}`)
          setIsSubscribed(true)
          setError(null)
        })

        channelInstance.bind('pusher:subscription_error', (err: any) => {
          if (!mounted) return
          console.error(`❌ Subscription error for ${channelName}:`, err)
          setError(err.error || 'Subscription failed')
          setIsSubscribed(false)
        })

        // Bind custom events
        Object.entries(eventsRef.current).forEach(([eventName, handler]) => {
          channelInstance.bind(eventName, (data: any) => {
            if (!mounted) return
            handler(data)
          })
        })

      } catch (err) {
        if (!mounted) return
        console.error('Failed to initialize Pusher:', err)
        setError(err instanceof Error ? err.message : 'Failed to connect')
      }
    }

    initPusher()

    // Cleanup function
    return () => {
      mounted = false

      if (channelRef.current) {
        console.log(`🔌 Unsubscribing from ${channelName}`)

        // Unbind all custom events
        Object.keys(eventsRef.current).forEach(eventName => {
          channelRef.current?.unbind(eventName)
        })

        // Unbind Pusher events
        channelRef.current.unbind('pusher:subscription_succeeded')
        channelRef.current.unbind('pusher:subscription_error')

        // Unsubscribe from channel
        channelRef.current.unsubscribe()
        channelRef.current = null
      }

      if (pusher) {
        pusher.connection.unbind('state_change')
        pusher.connection.unbind('error')
      }
    }
  }, [channelName, enabled, user])

  return {
    channel,
    isConnected,
    isSubscribed,
    error
  }
}
