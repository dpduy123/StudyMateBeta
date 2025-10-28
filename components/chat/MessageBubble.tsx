'use client'

import { useState, memo } from 'react'
import {
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  ArrowUturnLeftIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  FaceSmileIcon
} from '@heroicons/react/24/outline'
import { Message } from '@/hooks/useRealtimeMessages'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ReactionPicker } from './ReactionPicker'
import { Avatar } from '@/components/ui/Avatar'
import { Timestamp } from '@/components/ui/Timestamp'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  showAvatar?: boolean
  onEdit?: (messageId: string, newContent: string) => void
  onDelete?: (messageId: string) => void
  onReply?: (message: Message) => void
  onRetry?: (operationId: string) => void
  onCancel?: (operationId: string) => void
  onReaction?: (messageId: string, emoji: string) => void
  currentUserId: string
}

// Custom comparison function for memo to prevent unnecessary re-renders
const arePropsEqual = (prevProps: MessageBubbleProps, nextProps: MessageBubbleProps) => {
  // Compare message properties that affect rendering
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.isRead === nextProps.message.isRead &&
    prevProps.message.isEdited === nextProps.message.isEdited &&
    prevProps.message._status === nextProps.message._status &&
    prevProps.message._optimistic === nextProps.message._optimistic &&
    JSON.stringify(prevProps.message.reactions) === JSON.stringify(nextProps.message.reactions) &&
    prevProps.isOwn === nextProps.isOwn &&
    prevProps.showAvatar === nextProps.showAvatar &&
    prevProps.currentUserId === nextProps.currentUserId
  )
}

function MessageBubbleComponent({
  message,
  isOwn,
  showAvatar = true,
  onEdit,
  onDelete,
  onReply,
  onRetry,
  onCancel,
  onReaction,
  currentUserId
}: MessageBubbleProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [hoveredReaction, setHoveredReaction] = useState<string | null>(null)
  
  // Check message status
  const messageStatus = message._status || 'confirmed'
  const isPending = messageStatus === 'pending'
  const isFailed = messageStatus === 'failed'

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

  const handleReactionSelect = (emoji: string) => {
    if (onReaction) {
      onReaction(message.id, emoji)
    }
  }

  const handleReactionClick = (emoji: string) => {
    if (onReaction) {
      onReaction(message.id, emoji)
    }
  }

  // Get users who reacted with a specific emoji
  const getUsersForReaction = (emoji: string) => {
    const reaction = message.reactions?.find(r => r.emoji === emoji)
    return reaction?.users || []
  }

  // Check if current user reacted with a specific emoji
  const hasUserReacted = (emoji: string) => {
    const users = getUsersForReaction(emoji)
    return users.some(u => u.id === currentUserId)
  }

  return (
    <div
      className={`flex gap-3 group message-fade-in hardware-accelerated ${isOwn ? 'flex-row-reverse' : ''} ${
        isPending ? 'optimistic-pending' : ''
      } ${
        isFailed ? 'optimistic-error' : ''
      }`}
    >
      {/* Avatar */}
      {showAvatar && (
        <div className="flex-shrink-0">
          <Avatar
            src={message.sender.avatar}
            alt={`${message.sender.firstName} ${message.sender.lastName}`}
            firstName={message.sender.firstName}
            lastName={message.sender.lastName}
            size="sm"
          />
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
              isFailed
                ? 'bg-red-50 text-red-900 border border-red-200'
                : isPending
                ? isOwn
                  ? 'bg-primary-400 text-white opacity-70'
                  : 'bg-gray-100 text-gray-900 opacity-70'
                : isOwn
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
                    className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 button-press hardware-accelerated"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleEdit}
                    disabled={isSubmitting || editContent.trim() === ''}
                    className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50 button-press hardware-accelerated"
                  >
                    <CheckIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* File/Image message */}
                {message.type === 'FILE' && message.fileUrl && (
                  <div className="mb-2">
                    {/* Check if it's an image */}
                    {message.fileName && /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(message.fileName) ? (
                      <img
                        src={message.fileUrl}
                        alt={message.fileName}
                        className="max-w-xs rounded-lg"
                        loading="lazy"
                        decoding="async"
                        style={{ maxHeight: '300px', objectFit: 'contain' }}
                      />
                    ) : (
                      <a
                        href={message.fileUrl}
                        download={message.fileName}
                        className="flex items-center gap-2 p-2 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <div className="text-left">
                          <div className="text-sm font-medium">{message.fileName}</div>
                          {message.fileSize && (
                            <div className="text-xs opacity-70">
                              {(message.fileSize / 1024).toFixed(1)} KB
                            </div>
                          )}
                        </div>
                      </a>
                    )}
                  </div>
                )}
                
                {/* Text content */}
                {message.content && (
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                )}
                {message.isEdited && (
                  <span className="text-xs opacity-70 ml-2">(đã chỉnh sửa)</span>
                )}
              </>
            )}

            {/* Message actions - Quick actions + menu */}
            {!isEditing && (
              <div className={`absolute -top-2 ${isOwn ? 'left-2' : 'right-2'} opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1`}>
                {/* Quick reply button - always visible on hover */}
                {onReply && (
                  <button
                    onClick={() => onReply(message)}
                    className="p-1 rounded-full bg-white shadow-sm border text-gray-500 hover:text-gray-700 hover:bg-gray-50 button-press hardware-accelerated smooth-color"
                    title="Trả lời"
                    aria-label="Trả lời tin nhắn"
                  >
                    <ArrowUturnLeftIcon className="w-4 h-4" />
                  </button>
                )}

                {/* Reaction button */}
                {onReaction && (
                  <div className="relative">
                    <button
                      onClick={() => setShowReactionPicker(!showReactionPicker)}
                      className="p-1 rounded-full bg-white shadow-sm border text-gray-500 hover:text-gray-700 hover:bg-gray-50 button-press hardware-accelerated smooth-color"
                      title="Thả cảm xúc"
                      aria-label="Thả cảm xúc"
                    >
                      <FaceSmileIcon className="w-4 h-4" />
                    </button>
                    <ReactionPicker
                      isOpen={showReactionPicker}
                      onClose={() => setShowReactionPicker(false)}
                      onReactionSelect={handleReactionSelect}
                      position="top"
                      messageId={message.id}
                    />
                  </div>
                )}
                
                {/* More actions menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1 rounded-full bg-white shadow-sm border text-gray-500 hover:text-gray-700 button-press hardware-accelerated smooth-color"
                    title="Thêm hành động"
                    aria-label="Thêm hành động"
                  >
                    <EllipsisVerticalIcon className="w-4 h-4" />
                  </button>

                  {showMenu && (
                    <div className={`absolute ${isOwn ? 'left-0' : 'right-0'} top-6 mt-1 py-1 bg-white rounded-lg shadow-lg border z-10 min-w-32 message-fade-in hardware-accelerated`}>
                      {isOwn && onEdit && (
                        <button
                          onClick={() => {
                            setIsEditing(true)
                            setShowMenu(false)
                          }}
                          className="w-full px-3 py-1 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 instant-feedback hardware-accelerated smooth-color"
                        >
                          <PencilIcon className="w-4 h-4" />
                          Chỉnh sửa
                        </button>
                      )}
                      {(isOwn || message.roomId) && onDelete && (
                        <button
                          onClick={() => {
                            setShowDeleteDialog(true)
                            setShowMenu(false)
                          }}
                          className="w-full px-3 py-1 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 instant-feedback hardware-accelerated smooth-color"
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

          {/* Reactions display */}
          {message.reactions && message.reactions.length > 0 && (
            <div className={`flex flex-wrap gap-1 mt-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
              {message.reactions.map((reaction) => {
                const users = reaction.users || []
                const hasReacted = hasUserReacted(reaction.emoji)
                const userNames = users.map(u => `${u.firstName} ${u.lastName}`).join(', ')
                
                return (
                  <button
                    key={reaction.emoji}
                    onClick={() => handleReactionClick(reaction.emoji)}
                    onMouseEnter={() => setHoveredReaction(reaction.emoji)}
                    onMouseLeave={() => setHoveredReaction(null)}
                    className={`relative px-2 py-1 rounded-full text-sm flex items-center gap-1 instant-feedback hardware-accelerated smooth-color ${
                      hasReacted
                        ? 'bg-primary-100 border border-primary-300 hover:bg-primary-200'
                        : 'bg-gray-100 border border-gray-200 hover:bg-gray-200'
                    }`}
                    title={userNames}
                    aria-label={`Phản ứng ${reaction.emoji} - ${reaction.count} người`}
                  >
                    <span>{reaction.emoji}</span>
                    <span className={`text-xs ${hasReacted ? 'text-primary-700 font-medium' : 'text-gray-600'}`}>
                      {reaction.count}
                    </span>
                    
                    {/* Tooltip showing who reacted */}
                    {hoveredReaction === reaction.emoji && users.length > 0 && (
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50">
                        {userNames}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* Message time and read status */}
          <div className={`text-xs text-gray-500 mt-1 px-1 flex items-center gap-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <Timestamp date={message.createdAt} />
            
            {/* Status indicators for own messages */}
            {isOwn && (
              <>
                {/* Pending status - sending spinner */}
                {isPending && (
                  <span className="ml-1 text-gray-400 animate-spin">
                    <ArrowPathIcon className="w-3 h-3" />
                  </span>
                )}
                
                {/* Failed status - error icon with retry */}
                {isFailed && (
                  <div className="ml-1 flex items-center gap-1">
                    <ExclamationCircleIcon className="w-3 h-3 text-red-500" />
                    {onRetry && message._operationId && (
                      <button
                        onClick={() => onRetry(message._operationId!)}
                        className="text-red-500 hover:text-red-700 underline text-xs"
                        title="Thử lại"
                      >
                        Thử lại
                      </button>
                    )}
                    {onCancel && message._operationId && (
                      <button
                        onClick={() => onCancel(message._operationId!)}
                        className="text-gray-500 hover:text-gray-700 underline text-xs ml-1"
                        title="Hủy"
                      >
                        Hủy
                      </button>
                    )}
                  </div>
                )}
                
                {/* Confirmed status - read receipts */}
                {!isPending && !isFailed && message.receiverId && (
                  <span className={`ml-1 ${message.isRead ? 'text-primary-600' : 'text-gray-400'}`}>
                    {message.isRead ? '✓✓' : '✓'}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => onDelete && onDelete(message.id)}
        title="Xóa tin nhắn"
        message="Bạn có chắc chắn muốn xóa tin nhắn này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
      />
    </div>
  )
}

// Export memoized component with custom comparison
export const MessageBubble = memo(MessageBubbleComponent, arePropsEqual)