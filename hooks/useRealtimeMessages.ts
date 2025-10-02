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
  // Mock messages data
  const generateMockMessages = (chatId: string, currentUserId: string): Message[] => {
    const baseTime = Date.now()
    
    // Different mock conversations based on chatId
    if (chatId === 'user-1') {
      return [
        {
          id: 'msg-1',
          senderId: 'user-1',
          receiverId: currentUserId,
          type: 'TEXT',
          content: 'Chào bạn! Mình thấy bạn đang tìm nhóm học Toán Cao Cấp.',
          createdAt: new Date(baseTime - 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(baseTime - 60 * 60 * 1000).toISOString(),
          sender: {
            id: 'user-1',
            firstName: 'Nguyễn Văn',
            lastName: 'Minh',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
          }
        },
        {
          id: 'msg-2',
          senderId: currentUserId,
          receiverId: 'user-1',
          type: 'TEXT',
          content: 'Chào bạn! Đúng rồi, mình đang cần tìm nhóm ôn thi.',
          createdAt: new Date(baseTime - 55 * 60 * 1000).toISOString(),
          updatedAt: new Date(baseTime - 55 * 60 * 1000).toISOString(),
          sender: {
            id: currentUserId,
            firstName: 'Bạn',
            lastName: '',
          }
        },
        {
          id: 'msg-3',
          senderId: 'user-1',
          receiverId: currentUserId,
          type: 'TEXT',
          content: 'Tuyệt! Nhóm mình đang học chương Đạo hàm và Tích phân. Bạn có muốn tham gia không?',
          createdAt: new Date(baseTime - 50 * 60 * 1000).toISOString(),
          updatedAt: new Date(baseTime - 50 * 60 * 1000).toISOString(),
          sender: {
            id: 'user-1',
            firstName: 'Nguyễn Văn',
            lastName: 'Minh',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
          }
        },
        {
          id: 'msg-4',
          senderId: 'user-1',
          receiverId: currentUserId,
          type: 'TEXT',
          content: 'Mình có thể tham gia nhóm học Toán Cao Cấp không?',
          createdAt: new Date(baseTime - 10 * 60 * 1000).toISOString(),
          updatedAt: new Date(baseTime - 10 * 60 * 1000).toISOString(),
          sender: {
            id: 'user-1',
            firstName: 'Nguyễn Văn',
            lastName: 'Minh',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
          }
        }
      ]
    } else if (chatId === 'user-2') {
      return [
        {
          id: 'msg-5',
          senderId: currentUserId,
          receiverId: 'user-2',
          type: 'TEXT',
          content: 'Bạn có tài liệu ôn thi Toán không?',
          createdAt: new Date(baseTime - 4 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(baseTime - 4 * 60 * 60 * 1000).toISOString(),
          sender: {
            id: currentUserId,
            firstName: 'Bạn',
            lastName: ''
          }
        },
        {
          id: 'msg-6',
          senderId: 'user-2',
          receiverId: currentUserId,
          type: 'TEXT',
          content: 'Có đó! Mình có file PDF các dạng bài tập từ cơ bản đến nâng cao.',
          createdAt: new Date(baseTime - 3.5 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(baseTime - 3.5 * 60 * 60 * 1000).toISOString(),
          sender: {
            id: 'user-2',
            firstName: 'Trần Thị',
            lastName: 'Hoa',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b589?w=100&h=100&fit=crop&crop=face'
          }
        },
        {
          id: 'msg-7',
          senderId: 'user-2',
          receiverId: currentUserId,
          type: 'TEXT',
          content: 'Cảm ơn bạn đã chia sẻ tài liệu! Rất hữu ích 😊',
          createdAt: new Date(baseTime - 3 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(baseTime - 3 * 60 * 60 * 1000).toISOString(),
          sender: {
            id: 'user-2',
            firstName: 'Trần Thị',
            lastName: 'Hoa',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b589?w=100&h=100&fit=crop&crop=face'
          }
        }
      ]
    } else if (chatId === 'user-3') {
      return [
        {
          id: 'msg-8',
          senderId: currentUserId,
          receiverId: 'user-3',
          type: 'TEXT',
          content: 'Bạn có thể gọi video call để cùng làm bài tập không?',
          createdAt: new Date(baseTime - 30 * 60 * 1000).toISOString(),
          updatedAt: new Date(baseTime - 30 * 60 * 1000).toISOString(),
          sender: {
            id: currentUserId,
            firstName: 'Bạn',
            lastName: ''
          }
        },
        {
          id: 'msg-9',
          senderId: 'user-3',
          receiverId: currentUserId,
          type: 'TEXT',
          content: 'Được đó! Tối nay lúc 8h mình có rảnh. Bạn có OK không?',
          createdAt: new Date(baseTime - 25 * 60 * 1000).toISOString(),
          updatedAt: new Date(baseTime - 25 * 60 * 1000).toISOString(),
          sender: {
            id: 'user-3',
            firstName: 'Lê Văn',
            lastName: 'Đức',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
          }
        }
      ]
    } else {
      // Default messages for room or other users
      return [
        {
          id: 'msg-default',
          senderId: chatId,
          receiverId: currentUserId,
          type: 'TEXT',
          content: 'Chào bạn! Hãy bắt đầu cuộc trò chuyện.',
          createdAt: new Date(baseTime - 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(baseTime - 60 * 60 * 1000).toISOString(),
          sender: {
            id: chatId,
            firstName: 'Bạn học',
            lastName: 'StudyMate'
          }
        }
      ]
    }
  }

  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )

  useEffect(() => {
    // Using mock data instead of API fetch
    const mockMessages = generateMockMessages(chatId, userId)
    setMessages(mockMessages)
    setLoading(false)

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
      // Create mock message for demo
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        senderId: userId,
        receiverId: chatType === 'private' ? chatId : undefined,
        roomId: chatType === 'room' ? chatId : undefined,
        type,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sender: {
          id: userId,
          firstName: 'Bạn',
          lastName: ''
        },
        ...fileData
      }

      // Add to messages list
      setMessages(prev => [...prev, newMessage])
      
      return newMessage
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