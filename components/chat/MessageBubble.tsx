'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  ArrowUturnLeftIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { Message } from '@/hooks/useRealtimeMessages'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  showAvatar?: boolean
  onEdit?: (messageId: string, newContent: string) => void
  onDelete?: (messageId: string) => void
  onReply?: (message: Message) => void
  currentUserId: string
}

export function MessageBubble({ 
  message, 
  isOwn, 
  showAvatar = true, 
  onEdit, 
  onDelete, 
  onReply,
  currentUserId 
}: MessageBubbleProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleEdit = async () => {
    if (!onEdit || editContent === message.content) {
      setIsEditing(false)
      return
    }

    setIsSubmitting(true)
    try {
      await onEdit(message.id, editContent)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to edit message:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelEdit = () => {
    setEditContent(message.content)
    setIsEditing(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleEdit()
    }
    if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 group ${isOwn ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      {showAvatar && (
        <div className="flex-shrink-0">
          {message.sender.avatar ? (
            <img
              src={message.sender.avatar}
              alt={`${message.sender.firstName} ${message.sender.lastName}`}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium">
              {message.sender.firstName[0]}{message.sender.lastName[0]}
            </div>
          )}
        </div>
      )}

      <div className={`flex flex-col max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Sender name and time */}
        {!isOwn && (
          <div className="text-xs text-gray-600 mb-1 px-1">
            {message.sender.firstName} {message.sender.lastName}
          </div>
        )}

        {/* Reply reference */}
        {message.replyTo && (
          <div className={`text-xs p-2 mb-1 rounded-lg border-l-2 bg-gray-50 ${isOwn ? 'border-primary-300' : 'border-gray-300'}`}>
            <div className="font-medium text-gray-700">
              {message.replyTo.sender.firstName} {message.replyTo.sender.lastName}
            </div>
            <div className="text-gray-600 truncate">
              {message.replyTo.content}
            </div>
          </div>
        )}

        {/* Message bubble */}
        <div className="relative group">
          <div
            className={`px-4 py-2 rounded-2xl relative ${
              isOwn
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            {/* Message content */}
            {isEditing ? (
              <div className="min-w-48">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="w-full p-2 text-sm bg-white text-gray-900 rounded border resize-none"
                  rows={Math.max(1, editContent.split('\n').length)}
                  autoFocus
                  disabled={isSubmitting}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSubmitting}
                    className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleEdit}
                    disabled={isSubmitting || editContent.trim() === ''}
                    className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50"
                  >
                    <CheckIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>
                {message.isEdited && (
                  <span className="text-xs opacity-70 ml-2">(đã chỉnh sửa)</span>
                )}
              </>
            )}

            {/* Message actions menu */}
            {!isEditing && (
              <div className="absolute -top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1 rounded-full bg-white shadow-sm border text-gray-500 hover:text-gray-700"
                  >
                    <EllipsisVerticalIcon className="w-4 h-4" />
                  </button>

                  {showMenu && (
                    <div className="absolute right-0 top-6 mt-1 py-1 bg-white rounded-lg shadow-lg border z-10 min-w-32">
                      {onReply && (
                        <button
                          onClick={() => {
                            onReply(message)
                            setShowMenu(false)
                          }}
                          className="w-full px-3 py-1 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <ArrowUturnLeftIcon className="w-4 h-4" />
                          Trả lời
                        </button>
                      )}
                      {isOwn && onEdit && (
                        <button
                          onClick={() => {
                            setIsEditing(true)
                            setShowMenu(false)
                          }}
                          className="w-full px-3 py-1 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <PencilIcon className="w-4 h-4" />
                          Chỉnh sửa
                        </button>
                      )}
                      {(isOwn || message.roomId) && onDelete && (
                        <button
                          onClick={() => {
                            if (confirm('Bạn có chắc muốn xóa tin nhắn này?')) {
                              onDelete(message.id)
                            }
                            setShowMenu(false)
                          }}
                          className="w-full px-3 py-1 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <TrashIcon className="w-4 h-4" />
                          Xóa
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Message time and read status */}
          <div className={`text-xs text-gray-500 mt-1 px-1 flex items-center gap-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span>{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true, locale: vi })}</span>
            {isOwn && message.receiverId && (
              <span className={`ml-1 ${message.isRead ? 'text-primary-600' : 'text-gray-400'}`}>
                {message.isRead ? '✓✓' : '✓'}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}