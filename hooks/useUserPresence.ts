'use client'

import { useEffect, useState, useCallback } from 'react'
import { Channel } from 'pusher-js'
import { getPusherClient } from '@/lib/pusher/client'
import { useAuth } from '@/components/providers/Providers'
import { getPresenceChannelName } from '@/lib/pusher/server'

interface PresenceMember {
  id: string
  info: {
    name: string
    avatar?: string
  }
}

interface UseUserPresenceReturn {
  isOnline: boolean
  members: PresenceMember[]
  error: string | null
}

/**
 * Hook to manage user presence using Pusher presence channels
 * Automatically subscribes to user's presence channel and handles online/offline status
 */
export function useUserPresence(): UseUserPresenceReturn {
  const { user } = useAuth()
  const [isOnline, setIsOnline] = useState(false)
  const [members, setMembers] = useState<PresenceMember[]>([])
  const [error, setError] = useState<string | null>(null)

  // Update lastActive timestamp in database
  const updateLastActive = useCallback(async () => {
    if (!user) return

    try {
      await fetch('/api/user/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'online' })
      })
    } catch (err) {
      console.error('Failed to update lastActive:', err)
    }
  }, [user])

  useEffect(() => {
    if (!user) return

    let pusher: ReturnType<typeof getPusherClient> | null = null
    let channel: Channel | null = null
    let mounted = true
    let heartbeatInterval: NodeJS.Timeout | null = null

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

        if (!mounted) return

        // Get Pusher client
        pusher = getPusherClient(session.access_token)

        // Subscribe to presence channel
        const channelName = getPresenceChannelName(user.id)
        console.log(`👥 Subscribing to presence channel: ${channelName}`)
        
        channel = pusher.subscribe(channelName)

        // Handle subscription success
        channel.bind('pusher:subscription_succeeded', (members: any) => {
          if (!mounted) return
          console.log('✅ Presence channel subscription succeeded')
          setIsOnline(true)
          setError(null)
          
          // Update lastActive on successful subscription
          updateLastActive()

          // Parse members
          const membersList: PresenceMember[] = []
          members.each((member: any) => {
            membersList.push({
              id: member.id,
              info: member.info
            })
          })
          setMembers(membersList)
        })

        // Handle subscription error
        channel.bind('pusher:subscription_error', (err: any) => {
          if (!mounted) return
          console.error('❌ Presence subscription error:', err)
          setError(err.error || 'Failed to subscribe to presence channel')
          setIsOnline(false)
        })

        // Handle member added
        channel.bind('pusher:member_added', (member: any) => {
          if (!mounted) return
          console.log('👤 Member added:', member.id)
          setMembers(prev => [...prev, { id: member.id, info: member.info }])
        })

        // Handle member removed
        channel.bind('pusher:member_removed', (member: any) => {
          if (!mounted) return
          console.log('👋 Member removed:', member.id)
          setMembers(prev => prev.filter(m => m.id !== member.id))
        })

        // Set up heartbeat to update lastActive every 30 seconds
        heartbeatInterval = setInterval(() => {
          updateLastActive()
        }, 30000)

        // Update lastActive on page visibility change
        const handleVisibilityChange = () => {
          if (document.visibilityState === 'visible') {
            updateLastActive()
          }
        }
        document.addEventListener('visibilitychange', handleVisibilityChange)

        // Handle beforeunload to mark user as offline
        const handleBeforeUnload = async () => {
          try {
            // Use sendBeacon for reliable delivery during page unload
            const blob = new Blob(
              [JSON.stringify({ status: 'offline' })],
              { type: 'application/json' }
            )
            navigator.sendBeacon('/api/user/presence', blob)
          } catch (err) {
            console.error('Failed to send offline status:', err)
          }
        }
        window.addEventListener('beforeunload', handleBeforeUnload)

        return () => {
          document.removeEventListener('visibilitychange', handleVisibilityChange)
          window.removeEventListener('beforeunload', handleBeforeUnload)
        }

      } catch (err) {
        if (!mounted) return
        console.error('Failed to initialize presence:', err)
        setError(err instanceof Error ? err.message : 'Failed to connect')
        setIsOnline(false)
      }
    }

    initPresence()

    // Cleanup
    return () => {
      mounted = false
      
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval)
      }

      if (channel) {
        console.log('🔌 Unsubscribing from presence channel')
        channel.unbind('pusher:subscription_succeeded')
        channel.unbind('pusher:subscription_error')
        channel.unbind('pusher:member_added')
        channel.unbind('pusher:member_removed')
        channel.unsubscribe()
      }

      // Mark user as offline on cleanup
      if (user) {
        fetch('/api/user/presence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'offline' }),
          keepalive: true // Ensure request completes even if page is closing
        }).catch(err => console.error('Failed to mark offline:', err))
      }
    }
  }, [user, updateLastActive])

  return {
    isOnline,
    members,
    error
  }
}
