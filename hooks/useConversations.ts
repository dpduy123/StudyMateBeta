'use client'

import useSWR from 'swr'
import { useEffect, useCallback } from 'react'
import { fetcher } from '@/lib/swr/config'
import { cacheManager } from '@/lib/cache/CacheManager'
import { Conversation } from '@/lib/cache/db-schema'
import { usePusher } from './usePusher'

export interface ConversationsResponse {
  conversations: Conversation[]
  count: number
}

export interface UseConversationsOptions {
  userId?: string
  enabled?: boolean
  revalidateOnFocus?: boolean
  refreshInterval?: number
}

/**
 * Custom SWR hook for conversations with cache-first loading strategy
 * Implements instant loading from IndexedDB cache, then revalidates in background
 * Integrates with Pusher for real-time updates
 */
export function useConversations(options: UseConversationsOptions = {}) {
  const {
    userId,
    enabled = true,
    revalidateOnFocus = true,
    refreshInterval = 0,
  } = options

  // SWR hook with cache-first strategy
  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<ConversationsResponse>(
    enabled ? '/api/conversations' : null,
    fetcher,
    {
      // Revalidate on focus to keep data fresh
      revalidateOnFocus,
      
      // Revalidate on reconnect
      revalidateOnReconnect: true,
      
      // Dedupe requests within 5 seconds
      dedupingInterval: 5000,
      
      // Refresh interval (0 = disabled, rely on Pusher for updates)
      refreshInterval,
      
      // Keep previous data while revalidating
      keepPreviousData: true,
      
      // Use cache if available
      revalidateIfStale: true,
      
      // Fallback data from IndexedDB
      fallbackData: undefined,
      
      // Error retry configuration
      errorRetryCount: 3,
      errorRetryInterval: 1000,
      
      // On success, update IndexedDB cache
      onSuccess: async (data) => {
        if (data?.conversations) {
          try {
            await cacheManager.setConversations(data.conversations)
          } catch (error) {
            console.error('Failed to cache conversations:', error)
          }
        }
      },
      
      // On error, try to load from cache
      onError: async (error) => {
        console.error('Failed to fetch conversations:', error)
        
        // Try to load from IndexedDB cache as fallback
        try {
          const cachedConversations = await cacheManager.getConversations()
          if (cachedConversations.length > 0) {
            // Update SWR cache with cached data
            mutate({ conversations: cachedConversations, count: cachedConversations.length }, false)
          }
        } catch (cacheError) {
          console.error('Failed to load from cache:', cacheError)
        }
      },
    }
  )

  // Load from IndexedDB cache immediately on mount
  useEffect(() => {
    if (!enabled) return

    const loadFromCache = async () => {
      try {
        const cachedConversations = await cacheManager.getConversations()
        if (cachedConversations.length > 0) {
          // Populate SWR cache with cached data immediately
          // This provides instant UI update while API request is in flight
          mutate(
            { conversations: cachedConversations, count: cachedConversations.length },
            false // Don't revalidate, let the normal SWR flow handle that
          )
        }
      } catch (error) {
        console.error('Failed to load conversations from cache:', error)
      }
    }

    loadFromCache()
  }, [enabled, mutate])

  // Real-time updates via Pusher
  // Listen for conversation updates
  usePusher({
    channelName: userId ? `private-user-${userId}-conversations` : '',
    enabled: !!userId && enabled,
    events: {
      'conversation-updated': async (data: any) => {
        console.log('📬 Conversation updated via Pusher:', data)
        
        // Build updated conversation object
        const updatedConversation: Conversation = {
          id: data.otherUserId,
          otherUser: data.otherUser,
          lastMessage: data.lastMessage,
          unreadCount: data.unreadCount,
          lastActivity: data.lastActivity,
          _cached: true,
          _lastSync: new Date().toISOString(),
          _prefetched: false,
        }

        // Update conversation in cache
        try {
          await cacheManager.updateConversation(updatedConversation.id, updatedConversation)
        } catch (error) {
          console.error('Failed to update conversation in cache:', error)
        }

        // Update SWR cache optimistically
        mutate(
          (current) => {
            if (!current) return current

            const existingIndex = current.conversations.findIndex(
              conv => conv.id === updatedConversation.id
            )

            let conversations: Conversation[]
            if (existingIndex >= 0) {
              // Update existing conversation
              conversations = [...current.conversations]
              conversations[existingIndex] = updatedConversation
            } else {
              // Add new conversation
              conversations = [updatedConversation, ...current.conversations]
            }

            // Sort by last activity (most recent first)
            conversations.sort((a, b) =>
              new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
            )

            return {
              conversations,
              count: conversations.length,
            }
          },
          false // Don't revalidate
        )
      },
    },
  })

  // Helper to update a specific conversation
  const updateConversation = useCallback(
    async (conversationId: string, updates: Partial<Conversation>) => {
      // Update in cache
      try {
        await cacheManager.updateConversation(conversationId, updates)
      } catch (error) {
        console.error('Failed to update conversation in cache:', error)
      }

      // Update in SWR cache
      mutate(
        (current) => {
          if (!current) return current

          const conversations = current.conversations.map(conv =>
            conv.id === conversationId ? { ...conv, ...updates } : conv
          )

          return {
            conversations,
            count: conversations.length,
          }
        },
        false
      )
    },
    [mutate]
  )

  // Helper to mark conversation as read
  const markConversationAsRead = useCallback(
    async (conversationId: string) => {
      await updateConversation(conversationId, { unreadCount: 0 })
    },
    [updateConversation]
  )

  // Helper to delete a conversation
  const deleteConversation = useCallback(
    async (conversationId: string) => {
      // Delete from cache
      try {
        await cacheManager.deleteConversation(conversationId)
      } catch (error) {
        console.error('Failed to delete conversation from cache:', error)
      }

      // Update SWR cache
      mutate(
        (current) => {
          if (!current) return current

          const conversations = current.conversations.filter(
            conv => conv.id !== conversationId
          )

          return {
            conversations,
            count: conversations.length,
          }
        },
        false
      )
    },
    [mutate]
  )

  // Helper to refresh conversations
  const refresh = useCallback(() => {
    return mutate()
  }, [mutate])

  return {
    conversations: data?.conversations || [],
    count: data?.count || 0,
    isLoading,
    isValidating,
    error,
    updateConversation,
    markConversationAsRead,
    deleteConversation,
    refresh,
    mutate,
  }
}
