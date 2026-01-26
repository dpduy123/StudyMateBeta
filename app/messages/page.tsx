'use client'

import { useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useAuth } from '@/components/providers/Providers'
import { useTranslation } from '@/lib/i18n/context'
import { BottomTabNavigation } from '@/components/ui/MobileNavigation'
import { DashboardHeader } from '@/components/ui/DashboardHeader'
import { useNotifications } from '@/hooks/useNotifications'
import { useOtherUserPresence } from '@/hooks/useOtherUserPresence'
import { formatLastActiveForHeader } from '@/lib/utils/formatLastActive'
import { AI_CHATBOT_ID } from '@/components/chat/ConversationsList'
import {
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  VideoCameraIcon,
  EllipsisVerticalIcon,
  ArrowLeftIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

// Lazy load heavy chat components
const ConversationsList = dynamic(
  () => import('@/components/chat/ConversationsList').then(mod => ({ default: mod.ConversationsList })),
  {
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-gray-400">Đang tải...</div>
      </div>
    ),
    ssr: false
  }
)

const ChatContainer = dynamic(
  () => import('@/components/chat/ChatContainer').then(mod => ({ default: mod.ChatContainer })),
  {
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-gray-400">Đang tải tin nhắn...</div>
      </div>
    ),
    ssr: false
  }
)

const NotificationBanner = dynamic(
  () => import('@/components/notifications/NotificationBanner').then(mod => ({ default: mod.NotificationBanner })),
  {
    loading: () => null,
    ssr: false
  }
)

const AIChatContainer = dynamic(
  () => import('@/components/chat/AIChatContainer').then(mod => ({ default: mod.AIChatContainer })),
  {
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-gray-400">Đang tải AI...</div>
      </div>
    ),
    ssr: false
  }
)

interface SelectedConversation {
  id: string
  otherUser: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
    lastActive?: string
  }
}

export default function MessagesPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [selectedConversation, setSelectedConversation] = useState<SelectedConversation | null>(null)

  // Enable notifications for this user
  useNotifications({
    userId: user?.id || '',
    enabled: !!user?.id
  })

  // Track presence of selected user using Pusher
  const { isOnline: isOtherUserOnline } = useOtherUserPresence(selectedConversation?.otherUser.id)

  // Get status text based on online status and last active
  const getStatusText = () => {
    if (!selectedConversation) return ''
    
    return formatLastActiveForHeader(
      selectedConversation.otherUser.lastActive,
      isOtherUserOnline
    )
  }



  return (

    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Notification Banner */}
      {user?.id && <NotificationBanner userId={user.id} />}

      {/* Header */}
      <div className="flex-shrink-0">
        <DashboardHeader
          title={t('headers.messages.title')}
          description={t('headers.messages.description')}
          icon={ChatBubbleLeftRightIcon}
          currentPage="/messages"
        />
      </div>

      <div className="flex-grow mx-auto max-w-7xl w-full px-3 sm:px-4 lg:px-8 py-4 sm:py-8 mobile-safe-area">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 h-[calc(100vh-120px)] sm:h-[calc(100vh-200px)] flex flex-col sm:flex-row">
          {/* Sidebar - Full width on mobile when no conversation selected */}
          <div className={`${selectedConversation ? 'hidden sm:flex' : 'flex'} sm:w-1/3 border-r border-gray-200 flex-col w-full`}>
            {/* Conversations List - Shows all matched users */}
            <ConversationsList
              currentUserId={user?.id || ''}
              onSelectConversation={setSelectedConversation}
              selectedConversationId={selectedConversation?.id}
            />
          </div>

          {/* Chat Window - Full width on mobile when conversation selected */}
          <div className={`${selectedConversation ? 'flex' : 'hidden sm:flex'} sm:w-2/3 flex-col w-full`}>
            {selectedConversation ? (
              selectedConversation.id === AI_CHATBOT_ID ? (
                // AI Chat Interface
                <>
                  {/* AI Chat Header */}
                  <div className="p-3 sm:p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-purple-50 to-primary-50">
                    <div className="flex items-center space-x-3">
                      {/* Back button for mobile */}
                      <button
                        onClick={() => setSelectedConversation(null)}
                        className="sm:hidden p-1 hover:bg-white/50 rounded-lg transition-colors"
                      >
                        <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
                      </button>
                      <div className="relative">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-primary-500 rounded-full flex items-center justify-center">
                          <Image
                            src="/logo.svg"
                            alt="StudyMate AI"
                            width={24}
                            height={24}
                            className="w-5 h-5 sm:w-6 sm:h-6"
                          />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 border-2 border-white rounded-full" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-gray-900 text-sm sm:text-base">
                            StudyMate AI
                          </p>
                          <SparklesIcon className="w-4 h-4 text-purple-500" />
                        </div>
                        <p className="text-xs sm:text-sm text-green-600 font-medium">
                          Luôn sẵn sàng hỗ trợ
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-purple-600 font-medium bg-purple-100 px-2.5 py-1 rounded-full">
                      AI Assistant
                    </span>
                  </div>

                  {/* AI Chat Container */}
                  <div className="flex-1 overflow-hidden min-h-0">
                    <AIChatContainer
                      currentUserId={user?.id || ''}
                      className="h-full"
                    />
                  </div>
                </>
              ) : (
                // Regular User Chat Interface
                <>
                  {/* Chat Header */}
                  <div className="p-3 sm:p-4 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      {/* Back button for mobile */}
                      <button
                        onClick={() => setSelectedConversation(null)}
                        className="sm:hidden p-1 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
                      </button>
                      <div className="relative">
                        {selectedConversation.otherUser.avatar ? (
                          <img
                            src={selectedConversation.otherUser.avatar}
                            alt={`${selectedConversation.otherUser.firstName} ${selectedConversation.otherUser.lastName}`}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {selectedConversation.otherUser.firstName[0]}{selectedConversation.otherUser.lastName[0]}
                          </div>
                        )}
                        {isOtherUserOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">
                          {selectedConversation.otherUser.firstName} {selectedConversation.otherUser.lastName}
                        </p>
                        <p className={`text-xs sm:text-sm ${isOtherUserOnline ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                          {getStatusText()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4 text-gray-500">
                      <button className="hover:text-primary-600 p-1"><PhoneIcon className="h-4 sm:h-5 w-4 sm:w-5" /></button>
                      <button className="hover:text-primary-600 p-1"><VideoCameraIcon className="h-4 sm:h-5 w-4 sm:w-5" /></button>
                      <button className="hover:text-primary-600 p-1"><EllipsisVerticalIcon className="h-4 sm:h-5 w-4 sm:w-5" /></button>
                    </div>
                  </div>

                  {/* Chat Container */}
                  <div className="flex-1 overflow-hidden min-h-0">
                    <ChatContainer
                      chatId={selectedConversation.otherUser.id}
                      chatType="private"
                      currentUserId={user?.id || ''}
                      className="h-full"
                    />
                  </div>
                </>
              )
            ) : (
              <div className="flex-grow flex items-center justify-center text-center">
                <div>
                  <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-gray-800">Chọn một cuộc trò chuyện</h2>
                  <p className="text-gray-500">Bắt đầu nhắn tin với bạn học của bạn.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <BottomTabNavigation />
    </div>

  )
}
