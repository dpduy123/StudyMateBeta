'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatWindow } from './ChatWindow'
import { ChatToggle } from './ChatToggle'

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [threadId, setThreadId] = useState<string | null>(null)

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  const handleNewThread = useCallback(() => {
    setThreadId(null)
  }, [])

  const handleSelectThread = useCallback((id: string) => {
    setThreadId(id)
  }, [])

  return (
    <>
      {/* Floating toggle button */}
      <ChatToggle isOpen={isOpen} onClick={toggleChat} />

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-4 z-50 w-[380px] h-[600px] max-h-[80vh] sm:w-[420px]"
          >
            <ChatWindow
              threadId={threadId}
              onClose={toggleChat}
              onNewThread={handleNewThread}
              onSelectThread={handleSelectThread}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
