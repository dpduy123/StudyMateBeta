'use client'

import { motion } from 'framer-motion'
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { SparklesIcon } from '@heroicons/react/24/solid'

interface ChatToggleProps {
  isOpen: boolean
  onClick: () => void
}

export function ChatToggle({ isOpen, onClick }: ChatToggleProps) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center group"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isOpen ? 'Close chat' : 'Open StudyMate AI'}
    >
      <AnimatedIcon isOpen={isOpen} />

      {/* Sparkle indicator when closed */}
      {!isOpen && (
        <motion.div
          className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
        >
          <SparklesIcon className="w-3 h-3 text-yellow-800" />
        </motion.div>
      )}

      {/* Tooltip */}
      {!isOpen && (
        <div className="absolute right-full mr-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          StudyMate AI
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-gray-900 rotate-45" />
        </div>
      )}
    </motion.button>
  )
}

function AnimatedIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <motion.div
      initial={false}
      animate={{ rotate: isOpen ? 180 : 0 }}
      transition={{ duration: 0.3 }}
    >
      {isOpen ? (
        <XMarkIcon className="w-6 h-6" />
      ) : (
        <ChatBubbleLeftRightIcon className="w-6 h-6" />
      )}
    </motion.div>
  )
}
