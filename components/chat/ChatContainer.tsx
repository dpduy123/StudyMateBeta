'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { MessageInput } from './MessageInput'
import { TypingIndicator } from './TypingIndicator'
import { useRealtimeMessages, Message } from '@/hooks/useRealtimeMessages'
import { useAuth } from '@/components/providers/Providers'

// Lazy load MessageList component (heavy due to virtual scrolling)
const MessageList = dynamic(
  () => import('./MessageList').then(mod => ({ default: mod.MessageList })),
  {
    loading: () => (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Đang tải tin nhắn...</div>
      </div>
    ),
    ssr: false
  }
)

interface ChatContainerProps {
  chatId: string
  chatType: 'private' | 'room'
  currentUserId: string
  title?: string
  className?: string
  onTypingStart?: () => void
  onTypingStop?: () => void
}

export function ChatContainer({
  chatId,
  chatType,
  currentUserId,
  title,
  className = '',
  onTypingStart,
  onTypingStop
}: ChatContainerProps) {
  const { user } = useAuth()
  const [replyTo, setReplyTo] = useState<Message | undefined>()

  const {
    messages,
    loading,
    error,
    sendMessage,
    editMessage,
    deleteMessage,
    sendTypingStart,
    sendTypingStop,
    typingUsers,
    addReaction
  } = useRealtimeMessages({
    chatId,
    chatType,
    userId: currentUserId
  })

  const handleSendMessage = async (content: string, type: 'TEXT' | 'FILE' = 'TEXT') => {
    // Pass replyToId as the third parameter
    await sendMessage(content, type, replyTo?.id)
    // Clear reply after sending
    if (replyTo) {
      setReplyTo(undefined)
    }
  }

  const handleEditMessage = async (messageId: string, newContent: string) => {
    await editMessage(messageId, newContent)
  }

  const handleDeleteMessage = async (messageId: string) => {
    await deleteMessage(messageId)
  }

  const handleReply = (message: Message) => {
    setReplyTo(message)
  }

  const handleCancelReply = () => {
    setReplyTo(undefined)
  }

  const handleReaction = async (messageId: string, emoji: string) => {
    if (addReaction && user) {
      // Get user info from profile or use email as fallback
      const firstName = user.user_metadata?.firstName || user.email?.split('@')[0] || 'User'
      const lastName = user.user_metadata?.lastName || ''

      await addReaction(messageId, emoji, {
        id: currentUserId,
        firstName,
        lastName
      })
    }
  }

  const handleTypingStart = useCallback(() => {
    sendTypingStart?.()
    onTypingStart?.()
  }, [sendTypingStart, onTypingStart])

  const handleTypingStop = useCallback(() => {
    sendTypingStop?.()
    onTypingStop?.()
  }, [sendTypingStop, onTypingStop])

  if (error) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Lỗi tải tin nhắn</h3>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Chat header */}
      {title && (
        <div className="px-4 py-3 border-b bg-white">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
      )}

      {/* Messages */}
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        loading={loading}
        onEdit={handleEditMessage}
        onDelete={handleDeleteMessage}
        onReply={handleReply}
        onReaction={handleReaction}
      />

      {/* Typing indicator */}
      {typingUsers && typingUsers.length > 0 && (
        <TypingIndicator
          userName={typingUsers[0].userName}
          isVisible={true}
        />
      )}

      {/* Message input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
        replyTo={replyTo}
        onCancelReply={handleCancelReply}
        disabled={loading}
      />
    </div>
  )
}