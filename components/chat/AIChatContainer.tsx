'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/solid'
import { HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/outline'
import ReactMarkdown from 'react-markdown'
import { useTranslation } from '@/lib/i18n/context'

interface AIMessage {
  id: string
  role: 'USER' | 'ASSISTANT'
  content: string
  createdAt: Date
  isStreaming?: boolean
  feedback?: number
}

interface AIChatContainerProps {
  currentUserId: string
  threadId?: string
  className?: string
}

export function AIChatContainer({ currentUserId, threadId: initialThreadId, className = '' }: AIChatContainerProps) {
  const { locale, t, tArray } = useTranslation()

  // Get localized suggestions
  const suggestions = tArray('chatbot.suggestions')
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [threadId, setThreadId] = useState<string | null>(initialThreadId || null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Load chat history on mount
  useEffect(() => {
    if (threadId) {
      loadChatHistory()
    }
  }, [threadId])

  const loadChatHistory = async () => {
    if (!threadId) return

    setIsLoadingHistory(true)
    try {
      const response = await fetch(`/api/chat/${threadId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages.map((m: { id: string; role: string; content: string; createdAt: string; feedback?: number }) => ({
          id: m.id,
          role: m.role as 'USER' | 'ASSISTANT',
          content: m.content,
          createdAt: new Date(m.createdAt),
          feedback: m.feedback
        })))
      }
    } catch (error) {
      console.error('Failed to load chat history:', error)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSubmit = async (e?: React.FormEvent, suggestionText?: string) => {
    e?.preventDefault()

    const messageText = suggestionText || input.trim()
    if (!messageText || isLoading) return

    // Add user message immediately
    const userMessage: AIMessage = {
      id: `user_${Date.now()}`,
      role: 'USER',
      content: messageText,
      createdAt: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Add placeholder for AI response
    const aiMessageId = `ai_${Date.now()}`
    setMessages(prev => [...prev, {
      id: aiMessageId,
      role: 'ASSISTANT',
      content: '',
      createdAt: new Date(),
      isStreaming: true
    }])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          threadId,
          language: locale
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''
      let newThreadId = threadId

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))

                if (data.type === 'text') {
                  fullContent = data.content || ''
                  setMessages(prev => prev.map(m =>
                    m.id === aiMessageId
                      ? { ...m, content: fullContent }
                      : m
                  ))
                } else if (data.type === 'done') {
                  if (data.threadId) {
                    newThreadId = data.threadId
                    setThreadId(data.threadId)
                  }
                } else if (data.type === 'error') {
                  throw new Error(data.error)
                }
              } catch {
                // Skip invalid JSON lines
              }
            }
          }
        }
      }

      // Mark message as complete
      setMessages(prev => prev.map(m =>
        m.id === aiMessageId
          ? { ...m, isStreaming: false }
          : m
      ))

    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => prev.map(m =>
        m.id === aiMessageId
          ? { ...m, content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.', isStreaming: false }
          : m
      ))
    } finally {
      setIsLoading(false)
    }
  }

  const handleFeedback = async (messageId: string, feedback: 'up' | 'down') => {
    const feedbackValue = feedback === 'up' ? 5 : 2

    setMessages(prev => prev.map(m =>
      m.id === messageId
        ? { ...m, feedback: feedbackValue }
        : m
    ))

    // Send feedback to API (fire and forget)
    if (threadId) {
      fetch(`/api/chat/${threadId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          feedback: feedbackValue
        })
      }).catch(console.error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className={`flex flex-col h-full overflow-hidden ${className}`}>
      {/* Messages Area */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-gray-400">{t('chatbot.loadingHistory')}</div>
          </div>
        ) : messages.length === 0 ? (
          // Welcome message
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-primary-500 rounded-full flex items-center justify-center mb-4">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('chatbot.welcome')}
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm">
              {t('chatbot.welcomeDescription')}
            </p>

            {/* Suggestions */}
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSubmit(undefined, suggestion)}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Messages
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.role === 'USER' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'USER'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gradient-to-br from-purple-500 to-primary-500 text-white'
                }`}
              >
                {message.role === 'USER' ? (
                  <span className="text-xs font-semibold">Bạn</span>
                ) : (
                  <SparklesIcon className="w-4 h-4" />
                )}
              </div>

              {/* Message content */}
              <div className={`flex-1 max-w-[85%] ${message.role === 'USER' ? 'text-right' : ''}`}>
                <div
                  className={`inline-block px-4 py-2 rounded-2xl ${
                    message.role === 'USER'
                      ? 'bg-primary-500 text-white rounded-tr-sm'
                      : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                  }`}
                >
                  {message.role === 'USER' ? (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  ) : message.isStreaming && !message.content ? (
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
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
                {message.role === 'ASSISTANT' && message.content && !message.isStreaming && (
                  <div className="flex items-center space-x-1 mt-1">
                    <button
                      onClick={() => handleFeedback(message.id, 'up')}
                      className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                        message.feedback === 5 ? 'text-green-600' : 'text-gray-400'
                      }`}
                      title="Hữu ích"
                    >
                      <HandThumbUpIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleFeedback(message.id, 'down')}
                      className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                        message.feedback === 2 ? 'text-red-600' : 'text-gray-400'
                      }`}
                      title="Chưa hữu ích"
                    >
                      <HandThumbDownIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tin nhắn..."
              rows={1}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none max-h-32"
              style={{ minHeight: '48px' }}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-2 text-center">
          {t('chatbot.disclaimer')}
        </p>
      </div>
    </div>
  )
}
