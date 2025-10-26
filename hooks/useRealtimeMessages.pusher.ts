'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePusherWithFallback } from './usePusherWithFallback'

// Helper function to get chat channel name (client-side version)
function getChatChannelName(userId1: string, userId2: string): string {
  const sortedIds = [userId1, userId2].sort()
  return `chat-${sortedIds[0]}-${sortedIds[1]}`
}

export interface Message {
  id: string
  senderId: string
  receiverId?: string
  roomId?: string
  type: 'TEXT' | 'FILE' | 'VOICE' | 'VIDEO'
  content: string
  fileUrl?: string
  fileName?: string
  fileSize?: number
  replyToId?: string
  isEdited?: boolean
  editedAt?: string
  isRead?: boolean
  readAt?: string
  createdAt: string
  updatedAt: string
  sender: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  }
  replyTo?: Message
}

interface UseRealtimeMessagesProps {
  chatId: string
  chatType: 'private' | 'room'
  userId: string
}

export function useRealtimeMessages({ chatId, chatType, userId }: UseRealtimeMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [typingUsers, setTypingUsers] = useState<string[]>([])

  // Get channel name for private chat
  const channelName = chatType === 'private' 
    ? `private-${getChatChannelName(userId, chatId)}`
    : `private-room-${chatId}`

  // Fetch messages from API
  const fetchMessages = useCallback(async () => {
    try {
      const endpoint = chatType === 'private' 
        ? `/api/messages/private?chatId=${chatId}`
        : `/api/messages/room?roomId=${chatId}`
      
      const response = await fetch(endpoint)
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }

      const data = await response.json()
      setMessages(data.messages || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError(err instanceof Error ? err.message : 'Failed to load messages')
    }
  }, [chatId, chatType])

  // Initial fetch
  useEffect(() => {
    if (chatId && userId) {
      setLoading(true)
      fetchMessages().finally(() => setLoading(false))
    }
  }, [chatId, userId, fetchMessages])

  // Handle new message event
  const handleNewMessage = useCallback((message: Message) => {
    setMessages(prev => {
      // Avoid duplicates
      if (prev.find(m => m.id === message.id)) return prev
      return [...prev, message].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    })
  }, [])

  // Handle message read event
  const handleMessageRead = useCallback((data: { messageId: string; readBy: string; readAt: string }) => {
    setMessages(prev => prev.map(msg => 
      msg.id === data.messageId 
        ? { ...msg, isRead: true, readAt: data.readAt }
        : msg
    ))
  }, [])

  // Handle typing start event
  const handleTypingStart = useCallback((data: { userId: string; userName: string }) => {
    setTypingUsers(prev => {
      if (prev.includes(data.userId)) return prev
      return [...prev, data.userId]
    })
  }, [])

  // Handle typing stop event
  const handleTypingStop = useCallback((data: { userId: string }) => {
    setTypingUsers(prev => prev.filter(id => id !== data.userId))
  }, [])

  // Subscribe to Pusher channel with fallback
  const { connectionStatus, isPolling } = usePusherWithFallback({
    channelName,
    events: {
      'new-message': handleNewMessage,
      'message-read': handleMessageRead,
      'typing-start': handleTypingStart,
      'typing-stop': handleTypingStop
    },
    enabled: !!chatId && !!userId,
    pollingInterval: 5000,
    onPoll: fetchMessages
  })

  // Send message function
  const sendMessage = useCallback(async (
    content: string, 
    type: 'TEXT' | 'FILE' = 'TEXT', 
    fileData?: {
      fileUrl?: string
      fileName?: string
      fileSize?: number
    }
  ) => {
    try {
      const endpoint = chatType === 'private' 
        ? '/api/messages/private'
        : '/api/messages/room'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: chatType === 'private' ? chatId : undefined,
          roomId: chatType === 'room' ? chatId : undefined,
          content,
          type,
          ...fileData
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      
      // Optimistically add message to local state
      // (Pusher event will also trigger, but we prevent duplicates)
      setMessages(prev => {
        if (prev.find(m => m.id === data.message.id)) return prev
        return [...prev, data.message].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      })
      
      return data.message
    } catch (err) {
      console.error('Error sending message:', err)
      throw err
    }
  }, [chatId, chatType])

  // Mark message as read
  const markAsRead = useCallback(async (messageId: string) => {
    try {
      // Optimistically update UI
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isRead: true, readAt: new Date().toISOString() }
          : msg
      ))

      // The GET endpoint already marks messages as read
      // So we don't need a separate API call here
      // The Pusher event will be triggered by the GET endpoint
    } catch (err) {
      console.error('Error marking message as read:', err)
    }
  }, [])

  // Edit message
  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    try {
      const endpoint = chatType === 'private' 
        ? `/api/messages/private/${messageId}`
        : `/api/messages/room/${messageId}`
      
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent })
      })

      if (!response.ok) throw new Error('Failed to edit message')

      // Optimistically update UI
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: newContent, isEdited: true, editedAt: new Date().toISOString() }
          : msg
      ))
    } catch (err) {
      console.error('Error editing message:', err)
      throw err
    }
  }, [chatType])

  // Delete message
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      const endpoint = chatType === 'private' 
        ? `/api/messages/private/${messageId}`
        : `/api/messages/room/${messageId}`
      
      const response = await fetch(endpoint, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete message')

      // Optimistically update UI
      setMessages(prev => prev.filter(msg => msg.id !== messageId))
    } catch (err) {
      console.error('Error deleting message:', err)
      throw err
    }
  }, [chatType])

  return {
    messages,
    loading,
    error,
    sendMessage,
    markAsRead,
    editMessage,
    deleteMessage,
    typingUsers,
    connectionStatus,
    isPolling,
    isConnected: connectionStatus === 'connected'
  }
}
