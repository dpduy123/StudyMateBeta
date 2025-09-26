'use client'

import { useState } from 'react'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { useRealtimeMessages, Message } from '@/hooks/useRealtimeMessages'

interface ChatContainerProps {
  chatId: string
  chatType: 'private' | 'room'
  currentUserId: string
  title?: string
  className?: string
}

export function ChatContainer({ 
  chatId, 
  chatType, 
  currentUserId, 
  title,
  className = '' 
}: ChatContainerProps) {
  const [replyTo, setReplyTo] = useState<Message | undefined>()
  
  const {
    messages,
    loading,
    error,
    sendMessage,
    editMessage,
    deleteMessage
  } = useRealtimeMessages({
    chatId,
    chatType,
    userId: currentUserId
  })

  const handleSendMessage = async (content: string, type: 'TEXT' | 'FILE' = 'TEXT') => {
    await sendMessage(content, type)
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
      />

      {/* Message input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        replyTo={replyTo}
        onCancelReply={handleCancelReply}
        disabled={loading}
      />
    </div>
  )
}