'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PaperAirplaneIcon,
  PhotoIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { Message } from '@/hooks/useRealtimeMessages'

interface MessageInputProps {
  onSendMessage: (content: string, type?: 'TEXT' | 'FILE') => Promise<void>
  placeholder?: string
  disabled?: boolean
  replyTo?: Message
  onCancelReply?: () => void
}

export function MessageInput({ 
  onSendMessage, 
  placeholder = 'Nhập tin nhắn...', 
  disabled = false,
  replyTo,
  onCancelReply
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [message])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmedMessage = message.trim()
    if (!trimmedMessage || isSubmitting || disabled) return

    setIsSubmitting(true)
    try {
      await onSendMessage(trimmedMessage)
      setMessage('')
      if (onCancelReply) onCancelReply()
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="border-t bg-white p-4">
      {/* Reply preview */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 p-3 bg-gray-50 rounded-lg border-l-4 border-primary-500"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  Trả lời {replyTo.sender.firstName} {replyTo.sender.lastName}
                </div>
                <div className="text-sm text-gray-600 mt-1 truncate">
                  {replyTo.content}
                </div>
              </div>
              {onCancelReply && (
                <button
                  onClick={onCancelReply}
                  className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message input form */}
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div className="flex-1">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled || isSubmitting}
              rows={1}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed max-h-32"
              style={{ minHeight: '48px' }}
            />
            
            {/* File upload button */}
            <button
              type="button"
              disabled={disabled || isSubmitting}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <PhotoIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={!message.trim() || isSubmitting || disabled}
          className="p-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <PaperAirplaneIcon className="w-5 h-5" />
          )}
        </button>
      </form>
    </div>
  )
}