'use client'

import { useEffect, useRef, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { RealtimeChannel } from '@supabase/supabase-js'

interface SignalingMessage {
  type: 'joinRoom' | 'leaveRoom' | 'offer' | 'answer' | 'iceCandidate' | 'mediaStateChange' | 'userPresence'
  roomId: string
  fromUserId: string
  targetUserId?: string
  data?: any
  timestamp?: number
}

interface UseVideoCallSignalingProps {
  roomId: string
  userId: string
  userName: string
  onMessage: (message: SignalingMessage) => void
}

export function useVideoCallSignaling({ roomId, userId, userName, onMessage }: UseVideoCallSignalingProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
  
  const channelRef = useRef<RealtimeChannel | null>(null)
  const isConnectedRef = useRef(false)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  const sendMessage = useCallback((message: Omit<SignalingMessage, 'fromUserId' | 'timestamp'>) => {
    if (channelRef.current && isConnectedRef.current) {
      const fullMessage: SignalingMessage = {
        ...message,
        fromUserId: userId,
        timestamp: Date.now()
      }
      
      try {
        channelRef.current.send({
          type: 'broadcast',
          event: 'video_signal',
          payload: fullMessage
        })
      } catch (error) {
        console.error('Error sending message:', error)
        // Will handle reconnection in setupChannel
      }
    }
  }, [userId])

  const joinRoom = useCallback(() => {
    sendMessage({
      type: 'joinRoom',
      roomId,
      data: { userName }
    })
  }, [sendMessage, roomId, userName])

  const leaveRoom = useCallback(() => {
    sendMessage({
      type: 'leaveRoom',
      roomId
    })
  }, [sendMessage, roomId])

  const sendOffer = useCallback((targetUserId: string, offer: RTCSessionDescriptionInit) => {
    sendMessage({
      type: 'offer',
      roomId,
      targetUserId,
      data: { offer }
    })
  }, [sendMessage, roomId])

  const sendAnswer = useCallback((targetUserId: string, answer: RTCSessionDescriptionInit) => {
    sendMessage({
      type: 'answer',
      roomId,
      targetUserId,
      data: { answer }
    })
  }, [sendMessage, roomId])

  const sendIceCandidate = useCallback((targetUserId: string, candidate: RTCIceCandidate) => {
    sendMessage({
      type: 'iceCandidate',
      roomId,
      targetUserId,
      data: { candidate }
    })
  }, [sendMessage, roomId])

  const sendMediaStateChange = useCallback((mediaType: string, enabled: boolean) => {
    sendMessage({
      type: 'mediaStateChange',
      roomId,
      data: { mediaType, enabled }
    })
  }, [sendMessage, roomId])


  const setupChannel = useCallback(() => {
    // Create a unique channel for this room with presence tracking
    const channel = supabase.channel(`video_room_${roomId}`, {
      config: {
        broadcast: { self: true },
        presence: { key: userId }
      }
    })

    const handleReconnect = () => {
      if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        console.error('Max reconnection attempts reached')
        return
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }

      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectAttemptsRef.current += 1
        console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`)
        
        if (channelRef.current) {
          channelRef.current.unsubscribe()
        }
        
        setupChannel()
      }, Math.pow(2, reconnectAttemptsRef.current) * 1000)
    }

    channel
      .on('broadcast', { event: 'video_signal' }, (payload) => {
        const message = payload.payload as SignalingMessage
        
        // Don't process messages from ourselves
        if (message.fromUserId === userId) return
        
        // Only process messages for this room
        if (message.roomId !== roomId) return
        
        // If message has a target, only process if we're the target
        if (message.targetUserId && message.targetUserId !== userId) return
        
        onMessage(message)
      })
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState()
        console.log('Presence sync:', newState)
        // Notify about current participants
        Object.keys(newState).forEach(presenceId => {
          if (presenceId !== userId) {
            const presenceData = newState[presenceId]?.[0] as any
            onMessage({
              type: 'userPresence',
              roomId,
              fromUserId: presenceId,
              data: { 
                status: 'joined',
                userName: presenceData?.userName || 'Unknown'
              },
              timestamp: Date.now()
            })
          }
        })
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences)
        if (key !== userId) {
          const presenceData = newPresences?.[0] as any
          onMessage({
            type: 'userPresence',
            roomId,
            fromUserId: key,
            data: { 
              status: 'joined',
              userName: presenceData?.userName || 'Unknown'
            },
            timestamp: Date.now()
          })
        }
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences)
        if (key !== userId) {
          const presenceData = leftPresences?.[0] as any
          onMessage({
            type: 'userPresence',
            roomId,
            fromUserId: key,
            data: { 
              status: 'left',
              userName: presenceData?.userName || 'Unknown'
            },
            timestamp: Date.now()
          })
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          isConnectedRef.current = true
          reconnectAttemptsRef.current = 0 // Reset attempts on successful connection
          console.log('Connected to video signaling channel')
          
          // Track user presence
          await channel.track({
            userId: userId,
            userName: userName,
            joinedAt: new Date().toISOString()
          })
        } else if (status === 'CHANNEL_ERROR') {
          isConnectedRef.current = false
          console.error('Failed to connect to video signaling channel')
          handleReconnect()
        } else if (status === 'CLOSED') {
          isConnectedRef.current = false
          console.log('Disconnected from video signaling channel')
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            handleReconnect()
          }
        }
      })

    channelRef.current = channel
  }, [roomId, userId, onMessage, supabase])

  useEffect(() => {
    setupChannel()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      
      if (channelRef.current) {
        // Send leave message before disconnecting
        if (isConnectedRef.current) {
          leaveRoom()
        }
        channelRef.current.unsubscribe()
        channelRef.current = null
        isConnectedRef.current = false
      }
    }
  }, [setupChannel, leaveRoom])

  return {
    sendMessage,
    joinRoom,
    leaveRoom,
    sendOffer,
    sendAnswer,
    sendIceCandidate,
    sendMediaStateChange,
    isConnected: isConnectedRef.current
  }
}