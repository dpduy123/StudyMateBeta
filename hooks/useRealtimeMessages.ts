'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

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
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )

  useEffect(() => {
    // Initial fetch of messages
    const fetchMessages = async () => {
      try {
        const endpoint = chatType === 'private' 
          ? `/api/messages/private?chatId=${chatId}`
          : `/api/messages/room?roomId=${chatId}`
        
        const response = await fetch(endpoint)
        if (!response.ok) throw new Error('Failed to fetch messages')
        
        const data = await response.json()
        setMessages(data.messages || [])
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load messages')
        setLoading(false)
      }
    }

    fetchMessages()

    // Set up real-time subscription
    const tableName = chatType === 'private' ? 'messages' : 'room_messages'
    const filterColumn = chatType === 'private' ? 'receiverId' : 'roomId'
    
    const channel = supabase
      .channel(`${tableName}_${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: tableName,
          filter: `${filterColumn}=eq.${chatId}`
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          // Fetch the complete message with sender info
          if (payload.new && 'id' in payload.new) {
            fetchNewMessage((payload.new as any).id)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: tableName,
          filter: `${filterColumn}=eq.${chatId}`
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          // Update existing message
          if (payload.new && 'id' in payload.new) {
            setMessages(prev => prev.map(msg => 
              msg.id === (payload.new as any).id ? { ...msg, ...payload.new } : msg
            ))
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: tableName,
          filter: `${filterColumn}=eq.${chatId}`
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          // Remove deleted message
          if (payload.old && 'id' in payload.old) {
            setMessages(prev => prev.filter(msg => msg.id !== (payload.old as any).id))
          }
        }
      )
      .subscribe()

    // For private chats, also subscribe to messages where user is sender
    let senderChannel: any
    if (chatType === 'private') {
      senderChannel = supabase
        .channel(`${tableName}_sender_${chatId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: tableName,
            filter: `senderId=eq.${userId}`
          },
          (payload: RealtimePostgresChangesPayload<any>) => {
            // Only add if it's for this chat
            if (payload.new && 'id' in payload.new) {
              const newPayload = payload.new as any
              if (newPayload.receiverId === chatId || newPayload.senderId === chatId) {
                fetchNewMessage(newPayload.id)
              }
            }
          }
        )
        .subscribe()
    }

    const fetchNewMessage = async (messageId: string) => {
      try {
        const endpoint = chatType === 'private' 
          ? `/api/messages/private/${messageId}`
          : `/api/messages/room/${messageId}`
        
        const response = await fetch(endpoint)
        if (!response.ok) return
        
        const data = await response.json()
        setMessages(prev => {
          // Avoid duplicates
          if (prev.find(m => m.id === data.message.id)) return prev
          return [...prev, data.message].sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
        })
      } catch (err) {
        console.error('Failed to fetch new message:', err)
      }
    }

    return () => {
      channel.unsubscribe()
      if (senderChannel) senderChannel.unsubscribe()
    }
  }, [chatId, chatType, userId, supabase])

  const sendMessage = async (content: string, type: 'TEXT' | 'FILE' = 'TEXT', fileData?: any) => {
    try {
      const endpoint = chatType === 'private' 
        ? '/api/messages/private'
        : '/api/messages/room'
      
      const payload: any = {
        content,
        type,
        ...(chatType === 'private' ? { receiverId: chatId } : { roomId: chatId }),
        ...fileData
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Failed to send message')
      
      const data = await response.json()
      return data.message
    } catch (err) {
      throw err
    }
  }

  const markAsRead = async (messageId: string) => {
    if (chatType !== 'private') return // Only for private messages
    
    try {
      await fetch(`/api/messages/private/${messageId}/read`, {
        method: 'PATCH'
      })
    } catch (err) {
      console.error('Failed to mark message as read:', err)
    }
  }

  const editMessage = async (messageId: string, newContent: string) => {
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
    } catch (err) {
      throw err
    }
  }

  const deleteMessage = async (messageId: string) => {
    try {
      const endpoint = chatType === 'private' 
        ? `/api/messages/private/${messageId}`
        : `/api/messages/room/${messageId}`
      
      const response = await fetch(endpoint, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete message')
    } catch (err) {
      throw err
    }
  }

  return {
    messages,
    loading,
    error,
    sendMessage,
    markAsRead,
    editMessage,
    deleteMessage
  }
}