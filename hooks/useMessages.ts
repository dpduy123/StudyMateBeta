'use client'

import useSWR from 'swr'
import { useEffect, useCallback, useState } from 'react'
import { fetcher } from '@/lib/swr/config'
import { cacheManager } from '@/lib/cache/CacheManager'
import { Message } from '@/lib/cache/db-schema'
import { usePusher } from './usePusher'
import { useMessageStore } from '@/stores/messageStore'

export interface MessagesResponse {
  messages: Message[]
  hasMore: boolean
  page: number
  limit: number
}

export interface UseMessagesOptions {
  conversationId: string
  userId?: string
  enabled?: boolean
  limit?: number
  revalidateOnFocus?: boolean
}

/**
 * Custom SWR hook for messages with cache-first loading strategy
 * Implements instant loading from IndexedDB cache, pagination support,
 * and optimistic updates integration
 */
export function useMessages(options: UseMessagesOptions) {
  const {
    conversationId,
    userId,
    enabled = true,
    limit = 50,
    revalidateOnFocus = false,
  } = options

  const [page, setPage] = useState(1)
  const [allMessages, setAllMessages] = useState<Message[]>([])

  // Get optimistic update functions from message store
  const {
    sendMessageOptimistic,
    confirmMessage,
    rollbackMessage,
  } = useMessageStore()

  // Build API URL with pagination
  const apiUrl = enabled && conversationId
    ? `/api/messages/private?chatId=${conversationId}&page=${page}&limit=${limit}`
    : null

  // SWR hook with cache-first strategy
  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<MessagesResponse>(
    apiUrl,
    fetcher,
    {
      // Don't revalidate on focus for messages (rely on Pusher)
      revalidateOnFocus,

      // Revalidate on reconnect
      revalidateOnReconnect: true,

      // Dedupe requests within 5 seconds
      dedupingInterval: 5000,

      // Keep previous data while revalidating
      keepPreviousData: true,

      // Use cache if available
      revalidateIfStale: true,

      // Error retry configuration
      errorRetryCount: 3,
      errorRetryInterval: 1000,

      // On success, update IndexedDB cache
      onSuccess: async (data) => {
        if (data?.messages) {
          try {
            // Store messages in cache
            for (const message of data.messages) {
              try {
                await cacheManager.addMessage({
                  ...message,
                  conversationId,
                })
              } catch (error) {
                // Message might already exist, that's okay
                console.debug('Message already in cache:', message.id)
              }
            }

            // Update accumulated messages
            if (page === 1) {
              setAllMessages(data.messages)
            } else {
              // Append new messages and deduplicate
              setAllMessages(prev => {
                const combined = [...prev, ...data.messages]
                const unique = combined.filter((msg, index, self) =>
                  index === self.findIndex(m => m.id === msg.id)
                )
                return unique.sort((a, b) =>
                  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                )
              })
            }
          } catch (error) {
            console.error('Failed to cache messages:', error)
          }
        }
      },

      // On error, try to load from cache
      onError: async (error) => {
        console.error('Failed to fetch messages:', error)

        // Try to load from IndexedDB cache as fallback
        try {
          const cachedMessages = await cacheManager.getMessages(conversationId, limit)
          if (cachedMessages.length > 0) {
            // Update SWR cache with cached data
            mutate(
              {
                messages: cachedMessages,
                hasMore: false,
                page: 1,
                limit,
              },
              false
            )
            setAllMessages(cachedMessages)
          }
        } catch (cacheError) {
          console.error('Failed to load from cache:', cacheError)
        }
      },
    }
  )

  // Load from IndexedDB cache immediately on mount
  useEffect(() => {
    if (!enabled || !conversationId) return

    const loadFromCache = async () => {
      try {
        const cachedMessages = await cacheManager.getMessages(conversationId, limit)
        if (cachedMessages.length > 0) {
          // Populate SWR cache with cached data immediately
          // This provides instant UI update while API request is in flight
          mutate(
            {
              messages: cachedMessages,
              hasMore: false,
              page: 1,
              limit,
            },
            false // Don't revalidate, let the normal SWR flow handle that
          )
          setAllMessages(cachedMessages)
        }
      } catch (error) {
        console.error('Failed to load messages from cache:', error)
      }
    }

    loadFromCache()
  }, [conversationId, enabled, limit, mutate])

  // Real-time updates via Pusher
  const channelName = userId && conversationId
    ? `private-chat-${[userId, conversationId].sort().join('-')}`
    : ''

  usePusher({
    channelName,
    enabled: !!userId && !!conversationId && enabled,
    events: {
      'new-message': async (message: Message) => {
        // Add message to cache
        try {
          await cacheManager.addMessage({
            ...message,
            conversationId,
          })
        } catch (error) {
          console.debug('Message already in cache:', message.id)
        }

        // Update SWR cache optimistically
        mutate(
          (current) => {
            if (!current) return current

            // Check if message already exists
            const exists = current.messages.some(m => m.id === message.id)
            if (exists) return current

            const messages = [...current.messages, message].sort((a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            )

            return {
              ...current,
              messages,
            }
          },
          false // Don't revalidate
        )

        // Update accumulated messages
        setAllMessages(prev => {
          const exists = prev.some(m => m.id === message.id)
          if (exists) return prev

          return [...prev, message].sort((a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
        })
      },

      'message-updated': async (updatedMessage: Message) => {
        // Update message in cache
        try {
          await cacheManager.updateMessage(updatedMessage.id, updatedMessage)
        } catch (error) {
          console.error('Failed to update message in cache:', error)
        }

        // Update SWR cache
        mutate(
          (current) => {
            if (!current) return current

            const messages = current.messages.map(msg =>
              msg.id === updatedMessage.id ? updatedMessage : msg
            )

            return {
              ...current,
              messages,
            }
          },
          false
        )

        // Update accumulated messages
        setAllMessages(prev =>
          prev.map(msg => (msg.id === updatedMessage.id ? updatedMessage : msg))
        )
      },

      'message-deleted': async (data: { messageId: string }) => {
        // Delete message from cache
        try {
          await cacheManager.deleteMessage(data.messageId)
        } catch (error) {
          console.error('Failed to delete message from cache:', error)
        }

        // Update SWR cache
        mutate(
          (current) => {
            if (!current) return current

            const messages = current.messages.filter(msg => msg.id !== data.messageId)

            return {
              ...current,
              messages,
            }
          },
          false
        )

        // Update accumulated messages
        setAllMessages(prev => prev.filter(msg => msg.id !== data.messageId))
      },

      'message-read': async (data: { messageId: string; readBy: string; readAt: string }) => {
        // Update message in cache
        try {
          await cacheManager.updateMessage(data.messageId, {
            isRead: true,
            readAt: data.readAt,
          } as Partial<Message>)
        } catch (error) {
          console.error('Failed to update message read status in cache:', error)
        }

        // Update SWR cache
        mutate(
          (current) => {
            if (!current) return current

            const messages = current.messages.map(msg =>
              msg.id === data.messageId
                ? { ...msg, isRead: true, readAt: data.readAt }
                : msg
            )

            return {
              ...current,
              messages,
            }
          },
          false
        )

        // Update accumulated messages
        setAllMessages(prev =>
          prev.map(msg =>
            msg.id === data.messageId ? { ...msg, isRead: true, readAt: data.readAt } : msg
          )
        )
      },
    },
  })

  // Pagination: Load more messages
  const loadMore = useCallback(() => {
    if (data?.hasMore && !isValidating) {
      setPage(prev => prev + 1)
    }
  }, [data?.hasMore, isValidating])

  // Reset pagination
  const resetPagination = useCallback(() => {
    setPage(1)
    setAllMessages([])
  }, [])

  // Send message with optimistic update
  const sendMessage = useCallback(
    async (
      content: string,
      type: 'TEXT' | 'FILE' = 'TEXT',
      fileData?: {
        fileUrl?: string
        fileName?: string
        fileSize?: number
      }
    ) => {
      if (!userId || !conversationId) {
        throw new Error('User ID and conversation ID are required')
      }

      // Create optimistic message
      const operationId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      const optimisticMessage: Message = {
        id: operationId,
        senderId: userId,
        receiverId: conversationId,
        conversationId,
        type,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sender: {
          id: userId,
          firstName: 'You',
          lastName: '',
        },
        _optimistic: true,
        _operationId: operationId,
        _status: 'pending',
        ...fileData,
      }

      // Add optimistic message to UI immediately
      setAllMessages(prev => [...prev, optimisticMessage])

      // Also update message store for global state
      sendMessageOptimistic(conversationId, content, userId, optimisticMessage.sender)

      try {
        // Send message to server
        const response = await fetch('/api/messages/private', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            receiverId: conversationId,
            content,
            type,
            ...fileData,
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const { message: serverMessage } = await response.json()

        // Confirm optimistic message with server response
        setAllMessages(prev =>
          prev.map(msg =>
            msg.id === operationId || msg._operationId === operationId
              ? { ...serverMessage, conversationId }
              : msg
          )
        )

        // Update message store
        confirmMessage(conversationId, operationId, serverMessage)

        // Add to cache
        try {
          await cacheManager.addMessage({
            ...serverMessage,
            conversationId,
          })
        } catch (error) {
          console.debug('Message already in cache:', serverMessage.id)
        }

        // Revalidate to ensure consistency
        mutate()

        return serverMessage
      } catch (error) {
        console.error('Failed to send message:', error)

        // Rollback optimistic update
        setAllMessages(prev =>
          prev.map(msg =>
            msg.id === operationId || msg._operationId === operationId
              ? { ...msg, _status: 'failed' as const }
              : msg
          )
        )

        // Update message store
        rollbackMessage(conversationId, operationId)

        throw error
      }
    },
    [userId, conversationId, sendMessageOptimistic, confirmMessage, rollbackMessage, mutate]
  )

  // Update a message
  const updateMessage = useCallback(
    async (messageId: string, updates: Partial<Message>) => {
      // Update in cache
      try {
        await cacheManager.updateMessage(messageId, updates)
      } catch (error) {
        console.error('Failed to update message in cache:', error)
      }

      // Update in local state
      setAllMessages(prev =>
        prev.map(msg => (msg.id === messageId ? { ...msg, ...updates } : msg))
      )

      // Update in SWR cache
      mutate(
        (current) => {
          if (!current) return current

          const messages = current.messages.map(msg =>
            msg.id === messageId ? { ...msg, ...updates } : msg
          )

          return {
            ...current,
            messages,
          }
        },
        false
      )
    },
    [mutate]
  )

  // Delete a message
  const deleteMessage = useCallback(
    async (messageId: string) => {
      // Delete from cache
      try {
        await cacheManager.deleteMessage(messageId)
      } catch (error) {
        console.error('Failed to delete message from cache:', error)
      }

      // Update in local state
      setAllMessages(prev => prev.filter(msg => msg.id !== messageId))

      // Update in SWR cache
      mutate(
        (current) => {
          if (!current) return current

          const messages = current.messages.filter(msg => msg.id !== messageId)

          return {
            ...current,
            messages,
          }
        },
        false
      )
    },
    [mutate]
  )

  // Refresh messages
  const refresh = useCallback(() => {
    resetPagination()
    return mutate()
  }, [mutate, resetPagination])

  return {
    messages: allMessages,
    hasMore: data?.hasMore || false,
    page,
    isLoading,
    isValidating,
    error,
    loadMore,
    resetPagination,
    sendMessage,
    updateMessage,
    deleteMessage,
    refresh,
    mutate,
  }
}
