'use client'

import { useState } from 'react'
import AuthGuard from '@/components/guards/AuthGuard'
import { useAuth } from '@/components/providers/Providers'
import { BottomTabNavigation, FloatingActionButton } from '@/components/ui/MobileNavigation'
import { DashboardHeader } from '@/components/ui/DashboardHeader'
import { ConversationsList } from '@/components/chat/ConversationsList'
import { ChatContainer } from '@/components/chat/ChatContainer'
import {
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  VideoCameraIcon,
  EllipsisVerticalIcon
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
    <AuthGuard>
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

      <div className="flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 mobile-safe-area">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-[calc(100vh-200px)] flex">
          {/* Conversation List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <ConversationsList
              currentUserId={user?.id || ''}
              onSelectConversation={setSelectedConversation}
              selectedConversationId={selectedConversation?.id}
            />
          </div>

          {/* Chat Window */}
          <div className="w-2/3 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      {selectedConversation.otherUser.avatar ? (
                        <img
                          src={selectedConversation.otherUser.avatar}
                          alt={`${selectedConversation.otherUser.firstName} ${selectedConversation.otherUser.lastName}`}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {selectedConversation.otherUser.firstName[0]}{selectedConversation.otherUser.lastName[0]}
                        </div>
                      )}
                      {isOnline(selectedConversation.otherUser.lastActive) && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {selectedConversation.otherUser.firstName} {selectedConversation.otherUser.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {isOnline(selectedConversation.otherUser.lastActive) ? 'Đang hoạt động' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-gray-500">
                    <button className="hover:text-primary-600"><PhoneIcon className="h-5 w-5" /></button>
                    <button className="hover:text-primary-600"><VideoCameraIcon className="h-5 w-5" /></button>
                    <button className="hover:text-primary-600"><EllipsisVerticalIcon className="h-5 w-5" /></button>
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
      <FloatingActionButton />
      </div>
    </AuthGuard>
  )
}
