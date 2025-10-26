'use client'

import { useEffect, useState } from 'react'
import { Channel } from 'pusher-js'
import { getPusherClient } from '@/lib/pusher/client'
import { getPresenceChannelName } from '@/lib/pusher/server'

interface UseMultipleUsersPresenceReturn {
  onlineUsers: Set<string>
  error: string | null
}

/**
 * Hook to track presence of multiple users using Pusher
 * @param userIds - Array of user IDs to track
 * @returns Object with set of online user IDs and error
 */
export function useMultipleUsersPresence(userIds: string[]): UseMultipleUsersPresenceReturn {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userIds || userIds.length === 0) {
      setOnlineUsers(new Set())
      return
    }

    let pusher: ReturnType<typeof getPusherClient> | null = null
    const channels: Map<string, Channel> = new Map()
    let mounted = true

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

        // Subscribe to each user's presence channel
        userIds.forEach(userId => {
          const channelName = getPresenceChannelName(userId)
          const channel = pusher!.subscribe(channelName)
          channels.set(userId, channel)

          // Handle subscription success
          channel.bind('pusher:subscription_succeeded', (members: any) => {
            if (!mounted) return
            
            // Check if the target user is online
            let userIsOnline = false
            members.each((member: any) => {
              if (member.id === userId) {
                userIsOnline = true
              }
            })
            
            setOnlineUsers(prev => {
              const newSet = new Set(prev)
              if (userIsOnline) {
                newSet.add(userId)
              } else {
                newSet.delete(userId)
              }
              return newSet
            })
          })

          // Handle subscription error
          channel.bind('pusher:subscription_error', (err: any) => {
            if (!mounted) return
            console.error(`❌ Presence subscription error for ${userId}:`, err)
          })

          // Handle member added (user comes online)
          channel.bind('pusher:member_added', (member: any) => {
            if (!mounted) return
            if (member.id === userId) {
              setOnlineUsers(prev => new Set(prev).add(userId))
            }
          })

          // Handle member removed (user goes offline)
          channel.bind('pusher:member_removed', (member: any) => {
            if (!mounted) return
            if (member.id === userId) {
              setOnlineUsers(prev => {
                const newSet = new Set(prev)
                newSet.delete(userId)
                return newSet
              })
            }
          })
        })

      } catch (err) {
        if (!mounted) return
        console.error('Failed to initialize presence tracking:', err)
        setError(err instanceof Error ? err.message : 'Failed to connect')
      }
    }

    initPresence()

    // Cleanup
    return () => {
      mounted = false

      channels.forEach((channel, userId) => {
        channel.unbind('pusher:subscription_succeeded')
        channel.unbind('pusher:subscription_error')
        channel.unbind('pusher:member_added')
        channel.unbind('pusher:member_removed')
        channel.unsubscribe()
      })
      channels.clear()
    }
  }, [userIds.join(',')]) // Re-subscribe when user list changes

  return {
    onlineUsers,
    error
  }
}
