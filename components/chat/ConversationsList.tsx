'use client'

import { useState, useMemo, memo, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

import { usePresence } from '@/hooks/usePresence'
import { useConversations } from '@/hooks/useConversations'
import { useAuth } from '@/components/providers/Providers'
import { cacheManager } from '@/lib/cache/CacheManager'
import { getPrefetchManager } from '@/lib/prefetch/PrefetchManager'
import { getBehaviorTracker } from '@/lib/prefetch/BehaviorTracker'
import { ConversationListSkeleton } from '@/components/ui/SkeletonLoader'
import { Avatar } from '@/components/ui/Avatar'
import { OnlineIndicator } from '@/components/ui/OnlineIndicator'
import { Timestamp } from '@/components/ui/Timestamp'

interface Conversation {
  id: string
  otherUser: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
    lastActive?: string
  }
  lastMessage?: {
    id: string
    content: string
    createdAt: string
    senderId: string
  }
  unreadCount: number
  lastActivity: string
}

// Memoized conversation card component to prevent unnecessary re-renders
interface ConversationCardProps {
  conversation: Conversation
  isSelected: boolean
  isOnline: boolean
  currentUserId: string
  onClick: (conversation: Conversation) => void
  onHoverStart: (conversationId: string) => void
  onHoverEnd: (conversationId: string) => void
}

const ConversationCard = memo(({ 
  conversation, 
  isSelected, 
  isOnline, 
  currentUserId, 
  onClick,
  onHoverStart,
  onHoverEnd
}: ConversationCardProps) => {
  return (
    <div
      data-conversation-id={conversation.id}
      onClick={() => onClick(conversation)}
      onMouseEnter={() => onHoverStart(conversation.id)}
      onMouseLeave={() => onHoverEnd(conversation.id)}
      className={`p-4 flex items-center space-x-3 cursor-pointer hardware-accelerated card-press border-l-4 ${
        isSelected 
          ? 'bg-primary-50 border-l-primary-500' 
          : 'border-l-transparent hover:border-l-gray-200 hover:bg-gray-50'
      }`}
      style={{
        contentVisibility: 'auto', // Optimize off-screen rendering
        containIntrinsicSize: '80px', // Hint for content-visibility
      }}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <Avatar
          src={conversation.otherUser.avatar}
          alt={`${conversation.otherUser.firstName} ${conversation.otherUser.lastName}`}
          firstName={conversation.otherUser.firstName}
          lastName={conversation.otherUser.lastName}
          size="md"
        />
        <OnlineIndicator 
          isOnline={isOnline} 
          size="md"
          className="absolute -bottom-0.5 -right-0.5"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <p className="font-semibold text-gray-900 truncate">
            {conversation.otherUser.firstName} {conversation.otherUser.lastName}
          </p>
          <Timestamp
            date={conversation.lastMessage?.createdAt || conversation.lastActivity}
            className="text-xs text-gray-500 flex-shrink-0 ml-2"
          />
        </div>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-gray-600 truncate">
            {conversation.lastMessage ? (
              <>
                {conversation.lastMessage.senderId === currentUserId && (
                  <span className="text-gray-500">Bạn: </span>
                )}
                {conversation.lastMessage.content}
              </>
            ) : (
              <span className="text-gray-400 italic">Chưa có tin nhắn</span>
            )}
          </p>
          {conversation.unreadCount > 0 && (
            <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ml-2">
              {conversation.unreadCount}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  return (
    prevProps.conversation.id === nextProps.conversation.id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isOnline === nextProps.isOnline &&
    prevProps.conversation.unreadCount === nextProps.conversation.unreadCount &&
    prevProps.conversation.lastMessage?.id === nextProps.conversation.lastMessage?.id &&
    prevProps.conversation.lastMessage?.content === nextProps.conversation.lastMessage?.content &&
    prevProps.conversation.lastActivity === nextProps.conversation.lastActivity &&
    prevProps.onHoverStart === nextProps.onHoverStart &&
    prevProps.onHoverEnd === nextProps.onHoverEnd
  )
})

ConversationCard.displayName = 'ConversationCard'

interface ConversationsListProps {
  currentUserId: string
  onSelectConversation?: (conversation: Conversation) => void
  selectedConversationId?: string
}

export function ConversationsList({ 
  currentUserId, 
  onSelectConversation, 
  selectedConversationId 
}: ConversationsListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const { user } = useAuth()
  const prefetchManagerRef = useRef<ReturnType<typeof getPrefetchManager> | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const visibleConversationsRef = useRef<Set<string>>(new Set())

  // Use cache-first conversations hook with real-time updates
  const { conversations, isLoading, error } = useConversations({
    userId: currentUserId,
    enabled: !!currentUserId,
    revalidateOnFocus: true,
  })

  // Get all user IDs from conversations for presence tracking
  const userIds = useMemo(() => 
    conversations.map(c => c.otherUser.id),
    [conversations]
  )

  // Track presence of all users in conversations (also broadcasts own presence)
  const { onlineUsers } = usePresence(currentUserId, userIds)

  // Memoize filtered and sorted conversations to prevent unnecessary recalculations
  const filteredConversations = useMemo(() => {
    return conversations.filter(conversation =>
      `${conversation.otherUser.firstName} ${conversation.otherUser.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
  }, [conversations, searchQuery])

  // Initialize prefetch manager
  useEffect(() => {
    if (!prefetchManagerRef.current) {
      const behaviorTracker = getBehaviorTracker()
      prefetchManagerRef.current = getPrefetchManager(cacheManager, behaviorTracker)
    }
  }, [])

  // Prefetch top conversations on page load
  useEffect(() => {
    if (prefetchManagerRef.current && conversations.length > 0) {
      // Prefetch top 5 conversations in background
      prefetchManagerRef.current.prefetchTopConversations()
      
      // Also prefetch predicted conversation
      prefetchManagerRef.current.prefetchPredicted(selectedConversationId)
    }
  }, [conversations, selectedConversationId])

  // Set up Intersection Observer for scroll-based prefetching
  useEffect(() => {
    if (!scrollContainerRef.current || filteredConversations.length === 0) {
      return
    }

    // Clean up existing observer
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const conversationId = entry.target.getAttribute('data-conversation-id')
          if (!conversationId) return

          if (entry.isIntersecting) {
            visibleConversationsRef.current.add(conversationId)
          } else {
            visibleConversationsRef.current.delete(conversationId)
          }
        })

        // Trigger prefetch when user scrolls near bottom
        if (prefetchManagerRef.current && visibleConversationsRef.current.size > 0) {
          const visibleIds = Array.from(visibleConversationsRef.current)
          const allIds = filteredConversations.map(c => c.id)
          prefetchManagerRef.current.prefetchOnScroll(visibleIds, allIds)
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: '0px 0px 200px 0px', // Trigger 200px before reaching bottom
        threshold: 0.1
      }
    )

    // Observe all conversation cards
    const conversationElements = scrollContainerRef.current.querySelectorAll('[data-conversation-id]')
    conversationElements.forEach((element) => {
      observerRef.current?.observe(element)
    })

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [filteredConversations])

  // Hover handlers for prefetching
  const handleHoverStart = useCallback((conversationId: string) => {
    if (prefetchManagerRef.current) {
      prefetchManagerRef.current.prefetchOnHover(conversationId)
      prefetchManagerRef.current.trackBehavior(conversationId, 'hover')
    }
  }, [])

  const handleHoverEnd = useCallback((conversationId: string) => {
    if (prefetchManagerRef.current) {
      prefetchManagerRef.current.cancelHoverPrefetch(conversationId)
    }
  }, [])

  // Memoize click handler to prevent recreation on every render
  const handleConversationClick = useCallback((conversation: Conversation) => {
    // Track behavior for prediction
    if (prefetchManagerRef.current) {
      prefetchManagerRef.current.trackBehavior(conversation.id, 'open')
      
      // Prefetch predicted next conversation
      prefetchManagerRef.current.prefetchPredicted(conversation.id)
    }

    // Optimistic selection - update UI immediately
    if (onSelectConversation) {
      onSelectConversation(conversation)
    } else {
      router.push(`/messages/${conversation.otherUser.id}`)
    }
    
    // Fetch latest user status in background (non-blocking)
    fetch(`/api/user/${conversation.otherUser.id}/status`)
      .then(response => {
        if (response.ok) {
          return response.json()
        }
        return null
      })
      .then(data => {
        if (data && onSelectConversation) {
          // Update with latest status if callback is still available
          const updatedConversation = {
            ...conversation,
            otherUser: {
              ...conversation.otherUser,
              lastActive: data.lastActive
            }
          }
          onSelectConversation(updatedConversation)
        }
      })
      .catch(err => {
        console.error('Failed to fetch user status:', err)
        // Silently fail - we already showed the conversation
      })
  }, [onSelectConversation, router])

  // Check if user is online using Pusher presence
  const isOnline = (userId: string) => {
    return onlineUsers.has(userId)
  }

  // Show skeleton only when loading AND no data available (not even from cache)
  // Note: Due to cache-first strategy, this will rarely show
  // The skeleton is primarily for first-time users with no cached data
  if (isLoading && conversations.length === 0) {
    return <ConversationListSkeleton />
  }

  // Show error only if we have no cached data
  if (error && conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>Lỗi tải cuộc trò chuyện</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-primary-600 hover:text-primary-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm cuộc trò chuyện..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Conversations List */}
      {/* Note: Virtual scrolling with react-window can be added for 100+ conversations if needed */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có cuộc trò chuyện</h3>
            <p className="text-gray-500">Hãy kết nối với bạn học để bắt đầu trò chuyện!</p>
          </div>
        ) : (
          // Regular rendering for < 100 conversations
          filteredConversations.map((conversation) => (
            <ConversationCard
              key={conversation.id}
              conversation={conversation}
              isSelected={selectedConversationId === conversation.id}
              isOnline={isOnline(conversation.otherUser.id)}
              currentUserId={currentUserId}
              onClick={handleConversationClick}
              onHoverStart={handleHoverStart}
              onHoverEnd={handleHoverEnd}
            />
          ))
        )}
      </div>
    </div>
  )
}