'use client'

import { motion } from 'framer-motion'
import {
  UserIcon,
  SparklesIcon,
  HandThumbUpIcon,
  HandThumbDownIcon
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

interface Message {
  id: string
  role: 'USER' | 'ASSISTANT'
  content: string
  toolCalls?: unknown[]
  toolResults?: unknown[]
  feedback?: number
  createdAt?: Date
}

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(
    message.feedback ? (message.feedback >= 4 ? 'up' : 'down') : null
  )

  const isUser = message.role === 'USER'

  const handleFeedback = async (type: 'up' | 'down') => {
    if (feedback === type) return
    setFeedback(type)

    // TODO: Send feedback to API
    // await fetch(`/api/chat/feedback`, {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     messageId: message.id,
    //     feedback: type === 'up' ? 5 : 2
    //   })
    // })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-primary-500 text-white'
            : 'bg-gradient-to-br from-purple-500 to-primary-500 text-white'
        }`}
      >
        {isUser ? (
          <UserIcon className="w-4 h-4" />
        ) : (
          <SparklesIcon className="w-4 h-4" />
        )}
      </div>

      {/* Message content */}
      <div className={`flex-1 max-w-[85%] ${isUser ? 'text-right' : ''}`}>
        <div
          className={`inline-block px-4 py-2 rounded-2xl ${
            isUser
              ? 'bg-primary-500 text-white rounded-tr-sm'
              : 'bg-gray-100 text-gray-800 rounded-tl-sm'
          }`}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="text-sm prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline"
                    >
                      {children}
                    </a>
                  ),
                  code: ({ children }) => (
                    <code className="px-1 py-0.5 bg-gray-200 rounded text-xs">
                      {children}
                    </code>
                  )
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Feedback buttons for assistant messages */}
        {!isUser && message.content && (
          <div className="flex items-center space-x-1 mt-1">
            <button
              onClick={() => handleFeedback('up')}
              className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                feedback === 'up' ? 'text-green-600' : 'text-gray-400'
              }`}
              title="Helpful"
            >
              <HandThumbUpIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleFeedback('down')}
              className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                feedback === 'down' ? 'text-red-600' : 'text-gray-400'
              }`}
              title="Not helpful"
            >
              <HandThumbDownIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
