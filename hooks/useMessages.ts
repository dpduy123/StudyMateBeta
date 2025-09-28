'use client'

import useSWR from 'swr'

const fetcher = async (url: string) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  chatId: string
  timestamp: string
  isRead: boolean
  type: 'text' | 'image' | 'file'
}

export interface Chat {
  id: string
  participants: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
    isOnline: boolean
  }[]
  lastMessage?: Message
  unreadCount: number
  createdAt: string
  updatedAt: string
}

export function useChats() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/messages/chats',
    fetcher,
    {
      // Cache for 1 minute (messages change frequently)
      dedupingInterval: 1 * 60 * 1000,
      // Revalidate on focus to get latest messages
      revalidateOnFocus: true,
      // Revalidate when reconnects
      revalidateOnReconnect: true,
      // Refresh every 30 seconds for new messages
      refreshInterval: 30 * 1000,
      // Retry on error
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  )

  return {
    chats: data?.chats || [],
    isLoading,
    error,
    refetch: mutate,
  }
}

export function useMessages(chatId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    chatId ? `/api/messages/${chatId}` : null,
    fetcher,
    {
      // Cache for 30 seconds (messages change very frequently)
      dedupingInterval: 30 * 1000,
      // Revalidate on focus
      revalidateOnFocus: true,
      // Revalidate when reconnects
      revalidateOnReconnect: true,
      // Refresh every 5 seconds for real-time feel
      refreshInterval: 5 * 1000,
      // Retry on error
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  )

  return {
    messages: data?.messages || [],
    isLoading,
    error,
    refetch: mutate,
  }
}

// Hook for sending messages
export function useSendMessage() {
  const sendMessage = async (chatId: string, content: string, type: 'text' | 'image' | 'file' = 'text') => {
    const response = await fetch(`/api/messages/${chatId}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        type,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Không thể gửi tin nhắn')
    }

    return response.json()
  }

  return {
    sendMessage,
  }
}