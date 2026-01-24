'use client'

import { useState, useMemo, memo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MagnifyingGlassIcon, SparklesIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

import { usePresence } from '@/hooks/usePresence'
import { useConversations } from '@/hooks/useConversations'
import { useAuth } from '@/components/providers/Providers'
import { ConversationListSkeleton } from '@/components/ui/SkeletonLoader'
import { Avatar } from '@/components/ui/Avatar'
import { OnlineIndicator } from '@/components/ui/OnlineIndicator'
import { Timestamp } from '@/components/ui/Timestamp'

// Special ID for AI chatbot conversation
export const AI_CHATBOT_ID = 'ai-studymate'

export interface Conversation {
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
}

const ConversationCard = memo(({ 
  conversation, 
  isSelected, 
  isOnline, 
  currentUserId, 
  onClick
}: ConversationCardProps) => {
  return (
    <div
      onClick={() => onClick(conversation)}
      className={`p-4 flex items-center space-x-3 cursor-pointer transition-colors border-l-4 ${
        isSelected 
          ? 'bg-primary-50 border-l-primary-500' 
          : 'border-l-transparent hover:border-l-gray-200 hover:bg-gray-50'
      }`}
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
        <div className="flex justify-between items-center mb-1">
          <p className={`font-bold text-gray-900 truncate ${conversation.unreadCount > 0 ? 'text-gray-900' : ''}`}>
            {conversation.otherUser.firstName} {conversation.otherUser.lastName}
          </p>
          <Timestamp
            date={conversation.otherUser.lastActive || conversation.lastMessage?.createdAt || conversation.lastActivity}
            className={`text-xs flex-shrink-0 ml-2 ${conversation.unreadCount > 0 ? 'text-primary-600 font-semibold' : 'text-gray-500'}`}
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
    prevProps.conversation.lastActivity === nextProps.conversation.lastActivity
  )
})

ConversationCard.displayName = 'ConversationCard'

// AI Chatbot card component
interface AIChatbotCardProps {
  isSelected: boolean
  onClick: () => void
}

const AIChatbotCard = memo(({ isSelected, onClick }: AIChatbotCardProps) => {
  return (
    <div
      onClick={onClick}
      className={`p-4 flex items-center space-x-3 cursor-pointer transition-colors border-l-4 ${
        isSelected
          ? 'bg-gradient-to-r from-purple-50 to-primary-50 border-l-purple-500'
          : 'border-l-transparent hover:border-l-purple-200 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-primary-50/50'
      }`}
    >
      {/* AI Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-primary-500 rounded-full flex items-center justify-center">
          <Image
            src="/logo.svg"
            alt="StudyMate AI"
            width={24}
            height={24}
            className="w-6 h-6"
          />
        </div>
        {/* Always online indicator */}
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-1.5">
            <p className="font-bold text-gray-900">StudyMate AI</p>
            <SparklesIcon className="w-4 h-4 text-purple-500" />
          </div>
          <span className="text-xs text-purple-600 font-medium bg-purple-100 px-2 py-0.5 rounded-full">
            AI
          </span>
        </div>
        <p className="text-sm text-gray-500 truncate">
          Trợ lý AI - Hỗ trợ học tập & tìm bạn học
        </p>
      </div>
    </div>
  )
})

AIChatbotCard.displayName = 'AIChatbotCard'

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

  // Simplified: Use SWR with built-in caching
  const { conversations, isLoading, error } = useConversations({
    userId: currentUserId,
    enabled: !!currentUserId,
    revalidateOnFocus: false, // Reduce unnecessary revalidations
    refreshInterval: 30000, // Refresh every 30 seconds
  })

  // Get all user IDs from conversations for presence tracking
  const userIds = useMemo(() => 
    conversations.map(c => c.otherUser.id),
    [conversations]
  )

  // Track presence of all users in conversations
  // Also broadcast own presence to let others see us online
  const { onlineUsers } = usePresence(currentUserId, userIds)

  // Memoize filtered conversations
  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations
    
    return conversations.filter(conversation =>
      `${conversation.otherUser.firstName} ${conversation.otherUser.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
  }, [conversations, searchQuery])

  // Simplified click handler
  const handleConversationClick = useCallback((conversation: Conversation) => {
    if (onSelectConversation) {
      onSelectConversation(conversation)
    } else {
      router.push(`/messages/${conversation.otherUser.id}`)
    }
  }, [onSelectConversation, router])

  // Handle AI chatbot click
  const handleAIChatbotClick = useCallback(() => {
    const aiConversation: Conversation = {
      id: AI_CHATBOT_ID,
      otherUser: {
        id: AI_CHATBOT_ID,
        firstName: 'StudyMate',
        lastName: 'AI',
        avatar: '/logo.svg',
        lastActive: new Date().toISOString()
      },
      unreadCount: 0,
      lastActivity: new Date().toISOString()
    }

    if (onSelectConversation) {
      onSelectConversation(aiConversation)
    } else {
      router.push(`/messages/${AI_CHATBOT_ID}`)
    }
  }, [onSelectConversation, router])

  // Check if user is online using Pusher presence with fallback to lastActive
  const isOnline = useCallback((userId: string) => {
    // First check Pusher presence (real-time)
    if (onlineUsers.has(userId)) {
      return true
    }
    
    // Fallback: Check lastActive from API (within 5 minutes)
    const conversation = conversations.find(c => c.otherUser.id === userId)
    if (conversation?.otherUser.lastActive) {
      const lastActive = new Date(conversation.otherUser.lastActive)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      return lastActive > fiveMinutesAgo
    }
    
    return false
  }, [onlineUsers, conversations])

  // Show loading state
  if (isLoading) {
    return <ConversationListSkeleton />
  }

  // Show error state
  if (error) {
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
      <div className="flex-1 overflow-y-auto">
        {/* Pinned AI Chatbot - Always show at top */}
        {(!searchQuery || 'studymate ai'.includes(searchQuery.toLowerCase())) && (
          <>
            <AIChatbotCard
              isSelected={selectedConversationId === AI_CHATBOT_ID}
              onClick={handleAIChatbotClick}
            />
            <div className="border-b border-gray-100" />
          </>
        )}

        {filteredConversations.length === 0 && !searchQuery ? (
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
          filteredConversations.map((conversation) => (
            <ConversationCard
              key={conversation.id}
              conversation={conversation}
              isSelected={selectedConversationId === conversation.id}
              isOnline={isOnline(conversation.otherUser.id)}
              currentUserId={currentUserId}
              onClick={handleConversationClick}
            />
          ))
        )}
      </div>
    </div>
  )
}