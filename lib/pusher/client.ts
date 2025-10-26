'use client'

import PusherClient from 'pusher-js'

// Singleton Pusher client instance
let pusherClient: PusherClient | null = null

/**
 * Get or create Pusher client instance
 * @param authToken - Supabase auth token for authentication
 * @returns Pusher client instance
 */
export function getPusherClient(authToken?: string): PusherClient {
  if (!pusherClient) {
    pusherClient = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_KEY!,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        authEndpoint: '/api/pusher/auth',
        auth: {
          headers: authToken ? {
            'Authorization': `Bearer ${authToken}`
          } : {}
        },
        // Enable authorization for private and presence channels
        authorizer: (channel: any) => {
          return {
            authorize: async (socketId: string, callback: Function) => {
              try {
                const response = await fetch('/api/pusher/auth', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authToken ? `Bearer ${authToken}` : ''
                  },
                  body: JSON.stringify({
                    socket_id: socketId,
                    channel_name: channel.name
                  })
                })

                if (!response.ok) {
                  const error = await response.json()
                  callback(new Error(error.error || 'Authorization failed'), null)
                  return
                }

                const data = await response.json()
                callback(null, data)
              } catch (error) {
                console.error('Pusher authorization error:', error)
                callback(error, null)
              }
            }
          }
        }
      }
    )

    // Log connection state changes
    pusherClient.connection.bind('state_change', (states: any) => {
      console.log(`Pusher state: ${states.previous} → ${states.current}`)
    })

    pusherClient.connection.bind('connected', () => {
      console.log('✅ Pusher connected')
    })

    pusherClient.connection.bind('disconnected', () => {
      console.log('⚠️ Pusher disconnected')
    })

    pusherClient.connection.bind('error', (err: any) => {
      console.error('❌ Pusher connection error:', err)
    })
  }

  return pusherClient
}

/**
 * Disconnect and cleanup Pusher client
 */
export function disconnectPusher(): void {
  if (pusherClient) {
    console.log('Disconnecting Pusher client')
    pusherClient.disconnect()
    pusherClient = null
  }
}

/**
 * Get current connection state
 * @returns Connection state (connected, connecting, disconnected, etc.)
 */
export function getPusherConnectionState(): string {
  if (!pusherClient) return 'uninitialized'
  return pusherClient.connection.state
}

/**
 * Check if Pusher is connected
 * @returns True if connected, false otherwise
 */
export function isPusherConnected(): boolean {
  return getPusherConnectionState() === 'connected'
}

/**
 * Update auth token for Pusher client
 * Call this when user logs in or token refreshes
 * @param authToken - New Supabase auth token
 */
export function updatePusherAuthToken(authToken: string): void {
  if (pusherClient) {
    // Disconnect and reconnect with new token
    disconnectPusher()
  }
  // Next call to getPusherClient will create new instance with new token
  getPusherClient(authToken)
}
