'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers/Providers'
import { BottomTabNavigation, FloatingActionButton } from '@/components/ui/MobileNavigation'
import { DashboardHeader } from '@/components/ui/DashboardHeader'
import { ConversationsList } from '@/components/chat/ConversationsList'
import { ChatContainer } from '@/components/chat/ChatContainer'
import {
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  VideoCameraIcon,
  EllipsisVerticalIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

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
  const [selectedConversation, setSelectedConversation] = useState<SelectedConversation | null>(null)

  const isOnline = (lastActive?: string) => {
    if (!lastActive) return false
    return new Date(lastActive) > new Date(Date.now() - 15 * 60 * 1000)
  }

  return (

      <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0">
        <DashboardHeader
          title="Tin nhắn"
          description="Các cuộc trò chuyện của bạn"
          icon={ChatBubbleLeftRightIcon}
          currentPage="/messages"
        />
      </div>

      <div className="flex-grow mx-auto max-w-7xl w-full px-3 sm:px-4 lg:px-8 py-4 sm:py-8 mobile-safe-area">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 h-[calc(100vh-120px)] sm:h-[calc(100vh-200px)] flex flex-col sm:flex-row">
          {/* Conversation List - Full width on mobile when no conversation selected */}
          <div className={`${selectedConversation ? 'hidden sm:flex' : 'flex'} sm:w-1/3 border-r border-gray-200 flex-col w-full`}>
            <ConversationsList
              currentUserId={user?.id || ''}
              onSelectConversation={setSelectedConversation}
              selectedConversationId={selectedConversation?.id}
            />
          </div>

          {/* Chat Window - Full width on mobile when conversation selected */}
          <div className={`${selectedConversation ? 'flex' : 'hidden sm:flex'} sm:w-2/3 flex-col w-full`}>
            {selectedConversation ? (
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
                        />
                      ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {selectedConversation.otherUser.firstName[0]}{selectedConversation.otherUser.lastName[0]}
                        </div>
                      )}
                      {isOnline(selectedConversation.otherUser.lastActive) && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">
                        {selectedConversation.otherUser.firstName} {selectedConversation.otherUser.lastName}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {isOnline(selectedConversation.otherUser.lastActive) ? 'Đang hoạt động' : 'Offline'}
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
                <div className="flex-1">
                  <ChatContainer
                    chatId={selectedConversation.otherUser.id}
                    chatType="private"
                    currentUserId={user?.id || ''}
                    className="h-full"
                  />
                </div>
              </>
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
      {!selectedConversation && <FloatingActionButton />}
      </div>

  )
}
