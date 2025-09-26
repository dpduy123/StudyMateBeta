'use client'

import { useEffect, useRef, useState } from 'react'
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
  const scrollRef = useRef<HTMLDivElement>(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldAutoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, shouldAutoScroll])

  // Check if user is near bottom to determine auto-scroll
  const handleScroll = () => {
    if (!scrollRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100

    setShouldAutoScroll(isNearBottom)

    // Load more messages when scrolling to top
    if (scrollTop < 100 && hasMore && !isLoadingMore && onLoadMore) {
      setIsLoadingMore(true)
      onLoadMore()
      setTimeout(() => setIsLoadingMore(false), 1000)
    }
  }

  // Group consecutive messages from the same sender
  const groupedMessages = messages.reduce((groups: Message[][], message, index) => {
    const prevMessage = messages[index - 1]
    const isSameSender = prevMessage && prevMessage.senderId === message.senderId
    const isWithinTimeLimit = prevMessage && 
      new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() < 5 * 60 * 1000 // 5 minutes

    if (isSameSender && isWithinTimeLimit) {
      groups[groups.length - 1].push(message)
    } else {
      groups.push([message])
    }

    return groups
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
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 space-y-4"
      style={{ maxHeight: 'calc(100vh - 200px)' }}
    >
      {/* Load more indicator */}
      {isLoadingMore && (
        <div className="flex justify-center py-4">
          <LoadingSpinner size="sm" />
        </div>
      )}

      {/* Empty state */}
      {messages.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-12 text-center"
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

      {/* Message groups */}
      {groupedMessages.map((messageGroup, groupIndex) => (
        <div key={`group-${groupIndex}`} className="space-y-1">
          {messageGroup.map((message, messageIndex) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === currentUserId}
              showAvatar={messageIndex === messageGroup.length - 1} // Show avatar only for last message in group
              onEdit={onEdit}
              onDelete={onDelete}
              onReply={onReply}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      ))}

      {/* Scroll to bottom button */}
      {!shouldAutoScroll && messages.length > 0 && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => {
            setShouldAutoScroll(true)
            if (scrollRef.current) {
              scrollRef.current.scrollTop = scrollRef.current.scrollHeight
            }
          }}
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