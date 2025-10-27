'use client'

import { useEffect, useRef, useState, useMemo, useCallback, memo } from 'react'
import { motion } from 'framer-motion'
import { MessageBubble } from './MessageBubble'
import { Message } from '@/hooks/useRealtimeMessages'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface MessageListProps {
  messages: Message[]
  currentUserId: string
  loading?: boolean
  onEdit?: (messageId: string, newContent: string) => void
  onDelete?: (messageId: string) => void
  onReply?: (message: Message) => void
  onLoadMore?: () => void
  hasMore?: boolean
}

interface MessageGroup {
  messages: Message[]
  showAvatar: boolean
}

// Memoized message group component to prevent unnecessary re-renders
const MessageGroupComponent = ({
  group,
  currentUserId,
  onEdit,
  onDelete,
  onReply
}: {
  group: MessageGroup
  currentUserId: string
  onEdit?: (messageId: string, newContent: string) => void
  onDelete?: (messageId: string) => void
  onReply?: (message: Message) => void
}) => {
  return (
    <div className="space-y-1">
      {group.messages.map((message, messageIndex) => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwn={message.senderId === currentUserId}
          showAvatar={messageIndex === group.messages.length - 1 && group.showAvatar}
          onEdit={onEdit}
          onDelete={onDelete}
          onReply={onReply}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  )
}

// Memoize with custom comparison to prevent re-renders when messages haven't changed
const MessageGroup = memo(MessageGroupComponent, (prevProps, nextProps) => {
  // Only re-render if the group messages have changed
  if (prevProps.group.messages.length !== nextProps.group.messages.length) {
    return false
  }
  
  // Check if any message in the group has changed
  for (let i = 0; i < prevProps.group.messages.length; i++) {
    const prevMsg = prevProps.group.messages[i]
    const nextMsg = nextProps.group.messages[i]
    
    if (
      prevMsg.id !== nextMsg.id ||
      prevMsg.content !== nextMsg.content ||
      prevMsg.isRead !== nextMsg.isRead ||
      prevMsg.isEdited !== nextMsg.isEdited ||
      prevMsg._status !== nextMsg._status
    ) {
      return false
    }
  }
  
  return prevProps.currentUserId === nextProps.currentUserId
})

export function MessageList({
  messages,
  currentUserId,
  loading = false,
  onEdit,
  onDelete,
  onReply,
  onLoadMore,
  hasMore = false
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const previousMessageCount = useRef(messages.length)

  // Group consecutive messages from the same sender
  const groupedMessages = useMemo(() => {
    return messages.reduce((groups: MessageGroup[], message, index) => {
      const prevMessage = messages[index - 1]
      const isSameSender = prevMessage && prevMessage.senderId === message.senderId
      const isWithinTimeLimit = prevMessage && 
        new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() < 5 * 60 * 1000 // 5 minutes

      if (isSameSender && isWithinTimeLimit && groups.length > 0) {
        groups[groups.length - 1].messages.push(message)
      } else {
        groups.push({
          messages: [message],
          showAvatar: true
        })
      }

      return groups
    }, [])
  }, [messages])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldAutoScroll && messages.length > previousMessageCount.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    previousMessageCount.current = messages.length
  }, [messages.length, shouldAutoScroll])

  // Handle scroll events
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget
    const scrollOffset = target.scrollTop
    const scrollHeight = target.scrollHeight
    const clientHeight = target.clientHeight
    
    // Calculate if near bottom
    const isNearBottom = scrollHeight - scrollOffset - clientHeight < 100

    setShouldAutoScroll(isNearBottom)

    // Load more messages when scrolling to top
    if (scrollOffset < 100 && hasMore && !isLoadingMore && onLoadMore) {
      setIsLoadingMore(true)
      onLoadMore()
      setTimeout(() => setIsLoadingMore(false), 1000)
    }
  }, [hasMore, isLoadingMore, onLoadMore])

  // Scroll to bottom handler
  const scrollToBottom = useCallback(() => {
    setShouldAutoScroll(true)
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 relative"
      style={{ height: 'calc(100vh - 200px)' }}
    >
      {/* Load more indicator */}
      {isLoadingMore && (
        <div className="absolute top-0 left-0 right-0 flex justify-center py-4 z-10 bg-white/80">
          <LoadingSpinner size="sm" />
        </div>
      )}

      {/* Empty state */}
      {messages.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center h-full text-center"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có tin nhắn</h3>
          <p className="text-gray-500">Hãy bắt đầu cuộc trò chuyện!</p>
        </motion.div>
      )}

      {/* Message list with optimized rendering */}
      {messages.length > 0 && (
        <div 
          ref={containerRef}
          className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent px-4 space-y-4"
          onScroll={handleScroll}
          style={{ 
            willChange: shouldAutoScroll ? 'scroll-position' : 'auto',
            contain: 'layout style paint'
          }}
        >
          {groupedMessages.map((group, groupIndex) => (
            <MessageGroup
              key={`group-${groupIndex}-${group.messages[0]?.id}`}
              group={group}
              currentUserId={currentUserId}
              onEdit={onEdit}
              onDelete={onDelete}
              onReply={onReply}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Scroll to bottom button */}
      {!shouldAutoScroll && messages.length > 0 && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToBottom}
          className="fixed bottom-24 right-8 p-3 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors z-10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.button>
      )}
    </div>
  )
}
