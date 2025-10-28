'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ReactionPickerProps {
  isOpen: boolean
  onClose: () => void
  onReactionSelect: (emoji: string) => void
  position?: 'top' | 'bottom'
  messageId: string
}

const COMMON_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏']

export function ReactionPicker({
  isOpen,
  onClose,
  onReactionSelect,
  position = 'top',
  messageId
}: ReactionPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null)

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen, onClose])

  // Close picker on ESC key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isOpen, onClose])

  const handleReactionClick = (emoji: string) => {
    onReactionSelect(emoji)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={pickerRef}
          initial={{ opacity: 0, scale: 0.8, y: position === 'top' ? 10 : -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: position === 'top' ? 10 : -10 }}
          transition={{ duration: 0.15 }}
          className={`absolute ${
            position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          } left-0 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex gap-1`}
          role="dialog"
          aria-label="Chọn biểu cảm"
        >
          {COMMON_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReactionClick(emoji)}
              className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 instant-feedback hardware-accelerated"
              title={`Thả cảm xúc ${emoji}`}
              aria-label={`Thả cảm xúc ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
