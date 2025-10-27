'use client'

import { useEffect, useState } from 'react'
import { usePusher } from './usePusher'
import { cacheManager } from '@/lib/cache/CacheManager'
import { getOptimisticUpdateManager } from '@/lib/optimistic/OptimisticUpdateManager'

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

  // Optimistic update metadata
  _optimistic?: boolean
  _operationId?: string
  _status?: 'pending' | 'confirmed' | 'failed'
}

interface UseRealtimeMessagesProps {
  chatId: string
  chatType: 'private' | 'room'
  userId: string
}

interface TypingUser {
  userId: string
  userName: string
}

export function useRealtimeMessages({ chatId, chatType, userId }: UseRealtimeMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])

  // Helper function to add conversationId to message for cache
  const addConversationIdToMessage = (message: Message, conversationId: string): any => {
    const messageWithConversation = {
      ...message,
      conversationId,
      replyTo: message.replyTo ? {
        ...message.replyTo,
        conversationId
      } : undefined
    }
    return messageWithConversation
  }

  // Get channel name for Pusher (for private chats)
  const getChannelName = () => {
    if (chatType === 'private') {
      const sortedIds = [userId, chatId].sort()
      return `private-chat-${sortedIds[0]}-${sortedIds[1]}`
    }
    return `private-room-${chatId}`
  }

  // Listen for new messages, typing events and read receipts via Pusher
  usePusher({
    channelName: getChannelName(),
    enabled: chatType === 'private',
    events: {
      'new-message': async (message: Message) => {
        setMessages(prev => {
          // Avoid duplicates
          if (prev.find(m => m.id === message.id)) return prev
          return [...prev, message].sort((a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
        })

        // Update IndexedDB cache with new message
        try {
          await cacheManager.addMessage(addConversationIdToMessage(message, chatId))
        } catch (error) {
          console.error('Failed to cache new message:', error)
        }
      },
      'typing-start': (data: TypingUser) => {
        // Don't show typing indicator for current user
        if (data.userId === userId) return

        setTypingUsers(prev => {
          // Add user if not already in list
          if (!prev.find(u => u.userId === data.userId)) {
            return [...prev, data]
          }
          return prev
        })
      },
      'typing-stop': (data: TypingUser) => {
        setTypingUsers(prev => prev.filter(u => u.userId !== data.userId))
      },
      'message-read': (data: { messageId: string; readBy: string; readAt: string }) => {
        // Update message read status in local state
        setMessages(prev => prev.map(msg =>
          msg.id === data.messageId
            ? { ...msg, isRead: true, readAt: data.readAt }
            : msg
        ))
      }
    }
  })

  // Send typing start event
  const sendTypingStart = async () => {
    if (chatType !== 'private') return

    try {
      // Trigger typing-start event via client event (for Pusher)
      await fetch('/api/messages/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: chatId,
          event: 'typing-start'
        })
      })
    } catch (err) {
      console.error('Failed to send typing-start event:', err)
    }
  }

  // Send typing stop event
  const sendTypingStop = async () => {
    if (chatType !== 'private') return

    try {
      // Trigger typing-stop event via client event (for Pusher)
      await fetch('/api/messages/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: chatId,
          event: 'typing-stop'
        })
      })
    } catch (err) {
      console.error('Failed to send typing-stop event:', err)
    }
  }

  // Fetch initial messages with IndexedDB cache-first strategy
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // Step 1: Read from IndexedDB cache first (instant display within 16ms)
        const cachedMessages = await cacheManager.getMessages(chatId, 100)

        if (cachedMessages.length > 0) {
          // Display cached messages immediately (no loading state)
          setMessages(cachedMessages)
          setLoading(false)
        } else {
          // Only show loading if no cached data
          setLoading(true)
        }

        // Step 2: Fetch fresh messages from API in background
        const endpoint = chatType === 'private'
          ? `/api/messages/private?chatId=${chatId}`
          : `/api/messages/room?roomId=${chatId}`

        const response = await fetch(endpoint)

        if (!response.ok) {
          throw new Error('Failed to fetch messages')
        }

        const data = await response.json()
        const freshMessages = data.messages || []

        // Step 3: Update UI with fresh data (without showing loader)
        setMessages(freshMessages)

        // Step 4: Update IndexedDB cache with fresh data
        if (chatType === 'private' && freshMessages.length > 0) {
          // Clear old messages for this conversation first
          const existingMessages = await cacheManager.getMessages(chatId)
          await Promise.all(
            existingMessages.map(msg => cacheManager.deleteMessage(msg.id))
          )

          // Add fresh messages to cache
          await Promise.all(
            freshMessages.map((msg: Message) =>
              cacheManager.addMessage(addConversationIdToMessage(msg, chatId))
            )
          )
        }
      } catch (err) {
        console.error('Error fetching messages:', err)
        setError(err instanceof Error ? err.message : 'Failed to load messages')

        // If we have cached messages, keep showing them
        const cachedMessages = await cacheManager.getMessages(chatId, 100)
        if (cachedMessages.length === 0) {
          // Only fallback to mock data if no cache exists
          setMessages(generateMockMessages(chatId, userId))
        }
      } finally {
        setLoading(false)
      }
    }

    if (chatId && userId) {
      fetchMessages()
    }
  }, [chatId, chatType, userId])



  // Mock messages data (fallback)
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



  const sendMessage = async (
    content: string,
    type: 'TEXT' | 'FILE' = 'TEXT',
    fileData?: any,
    isReceiverViewing = false,
    currentUserInfo?: { id: string; firstName: string; lastName: string; avatar?: string }
  ) => {
    // Get optimistic update manager
    const optimisticManager = getOptimisticUpdateManager(cacheManager)

    let operationId: string | null = null

    try {
      // Create optimistic message for immediate display
      if (currentUserInfo && chatType === 'private') {
        const optimisticMessage = optimisticManager.createOptimisticMessage(
          content,
          chatId,
          currentUserInfo.id,
          currentUserInfo,
          type
        )

        operationId = optimisticMessage._operationId

        // Add to local state immediately
        setMessages(prev => {
          // Check if message already exists
          if (prev.find(m => m.id === optimisticMessage.id)) return prev
          return [...prev, optimisticMessage].sort((a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
        })

        // Store in IndexedDB with optimistic flag
        try {
          await cacheManager.addMessage(addConversationIdToMessage(optimisticMessage, chatId))
        } catch (cacheError) {
          console.error('Failed to cache optimistic message:', cacheError)
          // Continue with API call even if cache fails
        }
      }

      // Send message via API in background
      if (chatType === 'private') {
        const response = await fetch('/api/messages/private', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            receiverId: chatId,
            content,
            type,
            isReceiverViewing,
            ...fileData
          })
        })

        if (!response.ok) {
          throw new Error('Failed to send message via API')
        }

        const data = await response.json()

        // Confirm optimistic update with server data
        if (operationId) {
          await optimisticManager.confirm(operationId, data.message)

          // Update local state to replace temp message with server message
          setMessages(prev => prev.map(msg => {
            if (msg.id === operationId || msg._operationId === operationId) {
              // Remove optimistic flags
              const { _optimistic, _operationId: _, _status, ...cleanMessage } = data.message
              return cleanMessage
            }
            return msg
          }))
        } else {
          // No optimistic update, just add the message
          setMessages(prev => {
            if (prev.find(m => m.id === data.message.id)) return prev
            return [...prev, data.message].sort((a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            )
          })
        }

        return data.message
      } else {
        // For room messages, use API (no optimistic updates for rooms yet)
        const response = await fetch('/api/messages/room', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId: chatId,
            content,
            type,
            ...fileData
          })
        })

        if (!response.ok) {
          throw new Error('Failed to send message')
        }

        const data = await response.json()
        return data.message
      }
    } catch (err) {
      // Handle failure - mark optimistic message as failed
      if (operationId) {
        await optimisticManager.fail(operationId, err as Error)

        // Update local state to show failed status
        setMessages(prev => prev.map(msg => {
          if (msg.id === operationId || msg._operationId === operationId) {
            return { ...msg, _status: 'failed' as const }
          }
          return msg
        }))
      }

      throw err
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

  const markMessageAsRead = async (messageId: string) => {
    try {
      if (chatType !== 'private') return

      const response = await fetch(`/api/messages/private/${messageId}/read`, {
        method: 'PATCH'
      })

      if (!response.ok) throw new Error('Failed to mark message as read')

      const data = await response.json()

      // Update local state
      setMessages(prev => prev.map(msg =>
        msg.id === messageId
          ? { ...msg, isRead: true, readAt: data.message.readAt }
          : msg
      ))
    } catch (err) {
      console.error('Failed to mark message as read:', err)
    }
  }

  const retryMessage = async (operationId: string, currentUserInfo?: { id: string; firstName: string; lastName: string; avatar?: string }) => {
    const optimisticManager = getOptimisticUpdateManager(cacheManager)

    // Get the operation details
    const operation = optimisticManager.getOperation(operationId)
    if (!operation) {
      console.error('Operation not found:', operationId)
      return
    }

    // Retry the operation
    const retriedOperation = await optimisticManager.retry(operationId)
    if (!retriedOperation) {
      console.error('Failed to retry operation:', operationId)
      return
    }

    // Update UI to show pending status
    setMessages(prev => prev.map(msg => {
      if (msg.id === operationId || msg._operationId === operationId) {
        return { ...msg, _status: 'pending' as const }
      }
      return msg
    }))

    // Retry sending the message
    try {
      await sendMessage(
        retriedOperation.content || '',
        'TEXT',
        undefined,
        false,
        currentUserInfo
      )
    } catch (err) {
      console.error('Retry failed:', err)
    }
  }

  const cancelMessage = async (operationId: string) => {
    const optimisticManager = getOptimisticUpdateManager(cacheManager)

    // Rollback the operation
    await optimisticManager.rollback(operationId)

    // Remove message from local state
    setMessages(prev => prev.filter(msg =>
      msg.id !== operationId && msg._operationId !== operationId
    ))
  }

  return {
    messages,
    loading,
    error,
    sendMessage,
    retryMessage,
    cancelMessage,
    markMessageAsRead,
    editMessage,
    deleteMessage,
    sendTypingStart,
    sendTypingStop,
    typingUsers
  }
}