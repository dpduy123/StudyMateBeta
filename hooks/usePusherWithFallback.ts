'use client'

import { useEffect, useRef, useState } from 'react'
import { usePusher } from './usePusher'

interface UsePusherWithFallbackOptions {
  channelName: string
  events: {
    [eventName: string]: (data: any) => void
  }
  enabled?: boolean
  pollingInterval?: number
  onPoll?: () => Promise<void>
}

interface UsePusherWithFallbackReturn {
  isConnected: boolean
  isSubscribed: boolean
  isPolling: boolean
  error: string | null
  connectionStatus: 'connected' | 'disconnected' | 'polling' | 'error'
}

/**
 * Enhanced Pusher hook with automatic fallback to polling
 * 
 * When Pusher connection fails, automatically falls back to polling
 * to ensure data is still updated (though not real-time)
 * 
 * @example
 * ```tsx
 * const { connectionStatus, isPolling } = usePusherWithFallback({
 *   channelName: 'private-chat-user1-user2',
 *   events: {
 *     'new-message': (message) => setMessages(prev => [...prev, message])
 *   },
 *   pollingInterval: 5000, // Poll every 5 seconds if Pusher fails
 *   onPoll: async () => {
 *     // Fetch latest data from API
 *     const response = await fetch('/api/messages/private?chatId=...')
 *     const data = await response.json()
 *     setMessages(data.messages)
 *   }
 * })
 * ```
 */
export function usePusherWithFallback({
  channelName,
  events,
  enabled = true,
  pollingInterval = 5000,
  onPoll
}: UsePusherWithFallbackOptions): UsePusherWithFallbackReturn {
  const [isPolling, setIsPolling] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'polling' | 'error'>('disconnected')
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const hasShownPollingWarning = useRef(false)

  // Use Pusher hook
  const { isConnected, isSubscribed, error } = usePusher({
    channelName,
    events,
    enabled
  })

  // Update connection status
  useEffect(() => {
    if (isConnected && isSubscribed) {
      setConnectionStatus('connected')
      setIsPolling(false)
    } else if (error) {
      setConnectionStatus('error')
    } else if (isPolling) {
      setConnectionStatus('polling')
    } else {
      setConnectionStatus('disconnected')
    }
  }, [isConnected, isSubscribed, error, isPolling])

  // Handle fallback to polling
  useEffect(() => {
    if (!enabled || !onPoll) return

    // If Pusher is connected, stop polling
    if (isConnected && isSubscribed) {
      if (pollingIntervalRef.current) {
        console.log('✅ Pusher connected, stopping polling')
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
        setIsPolling(false)
        hasShownPollingWarning.current = false
      }
      return
    }

    // If Pusher fails after 10 seconds, start polling
    const fallbackTimer = setTimeout(() => {
      if (!isConnected || !isSubscribed) {
        if (!hasShownPollingWarning.current) {
          console.warn('⚠️ Pusher not connected, falling back to polling')
          hasShownPollingWarning.current = true
        }
        
        setIsPolling(true)

        // Start polling
        if (!pollingIntervalRef.current) {
          pollingIntervalRef.current = setInterval(async () => {
            try {
              await onPoll()
            } catch (err) {
              console.error('Polling error:', err)
            }
          }, pollingInterval)

          // Initial poll
          onPoll().catch(err => console.error('Initial poll error:', err))
        }
      }
    }, 10000) // Wait 10 seconds before falling back

    return () => {
      clearTimeout(fallbackTimer)
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [isConnected, isSubscribed, enabled, onPoll, pollingInterval])

  return {
    isConnected,
    isSubscribed,
    isPolling,
    error,
    connectionStatus
  }
}
