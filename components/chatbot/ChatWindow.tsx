'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  ArrowPathIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline'
import { ChatMessage } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'

interface Message {
  id: string
  role: 'USER' | 'ASSISTANT'
  content: string
  toolCalls?: unknown[]
  toolResults?: unknown[]
  createdAt?: Date
}

interface ChatWindowProps {
  threadId: string | null
  onClose: () => void
  onNewThread: () => void
  onSelectThread: (id: string) => void
}

export function ChatWindow({
  threadId,
  onClose,
  onNewThread,
  onSelectThread
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(threadId)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Load existing messages if threadId provided
  useEffect(() => {
    if (threadId) {
      loadThread(threadId)
    }
  }, [threadId])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`
    }
  }, [input])

  const loadThread = async (id: string) => {
    try {
      const response = await fetch(`/api/chat/${id}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
        setCurrentThreadId(id)
      }
    } catch (error) {
      console.error('Failed to load thread:', error)
    }
  }

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'USER',
      content: input.trim(),
      createdAt: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          threadId: currentThreadId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      let assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: 'ASSISTANT',
        content: '',
        createdAt: new Date()
      }

      // Add empty assistant message for streaming
      setMessages(prev => [...prev, assistantMessage])

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue

            try {
              const chunk = JSON.parse(data)

              if (chunk.type === 'text' && chunk.content) {
                assistantMessage = {
                  ...assistantMessage,
                  content: chunk.content
                }
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantMessage.id ? assistantMessage : m
                  )
                )
              } else if (chunk.type === 'error') {
                // Display friendly error message directly (already formatted)
                assistantMessage = {
                  ...assistantMessage,
                  content: chunk.error || 'Đã có lỗi xảy ra. Vui lòng thử lại.'
                }
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantMessage.id ? assistantMessage : m
                  )
                )
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Send message error:', error)
      setMessages(prev => [
        ...prev,
        {
          id: `error_${Date.now()}`,
          role: 'ASSISTANT',
          content: 'Xin lỗi, không thể gửi tin nhắn lúc này. Vui lòng thử lại.',
          createdAt: new Date()
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, currentThreadId])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleNewChat = () => {
    setMessages([])
    setCurrentThreadId(null)
    onNewThread()
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="flex items-center space-x-2">
          <SparklesIcon className="w-5 h-5" />
          <span className="font-semibold">StudyMate AI</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleNewChat}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            title="Cuộc trò chuyện mới"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <WelcomeMessage />
        ) : (
          messages.map(message => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}

        {isLoading && messages[messages.length - 1]?.role === 'USER' && (
          <TypingIndicator />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Hỏi gì đó..."
              className="w-full px-4 py-3 pr-12 bg-gray-100 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-colors text-sm"
              rows={1}
              disabled={isLoading}
              maxLength={2000}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 bottom-2 p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-400 text-center">
          Nhấn Enter để gửi, Shift+Enter để xuống dòng
        </p>
      </div>
    </div>
  )
}

function WelcomeMessage() {
  const suggestions = [
    'Tìm bạn học Machine Learning',
    'Cách học hiệu quả hơn?',
    'Tìm phòng học về algorithms'
  ]

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
        <ChatBubbleLeftIcon className="w-8 h-8 text-primary-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Xin chào! Tôi là StudyMate AI
      </h3>
      <p className="text-gray-500 text-sm mb-6">
        Tôi có thể giúp bạn tìm bạn học, đưa ra lời khuyên học tập, và nhiều hơn nữa.
      </p>

      <div className="space-y-2 w-full max-w-xs">
        <p className="text-xs text-gray-400 mb-2">Thử hỏi:</p>
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="w-full px-4 py-2 text-sm text-left text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            onClick={() => {
              // This will be handled by the parent
              const event = new CustomEvent('chatbot-suggestion', {
                detail: { suggestion }
              })
              window.dispatchEvent(event)
            }}
          >
            {suggestion}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
