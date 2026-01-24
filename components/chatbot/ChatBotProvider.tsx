'use client'

import { useAuth } from '@/components/providers/Providers'
import { ChatBot } from './ChatBot'

/**
 * ChatBotProvider - Only renders the chatbot for authenticated users
 * Add this component to your layout to enable the chatbot
 */
export function ChatBotProvider() {
  const { user, loading } = useAuth()

  // Don't show chatbot while loading or if not authenticated
  if (loading || !user) {
    return null
  }

  return <ChatBot />
}
