'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface Conversation {
  id: string
  otherUser: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
    lastActive?: string
  }
  lastMessage?: {
    id: string
    content: string
    createdAt: string
    senderId: string
  }
  unreadCount: number
  lastActivity: string
}

interface ConversationsListProps {
  currentUserId: string
  onSelectConversation?: (conversation: Conversation) => void
  selectedConversationId?: string
}

export function ConversationsList({ 
  currentUserId, 
  onSelectConversation, 
  selectedConversationId 
}: ConversationsListProps) {
  // Hardcoded mock conversations
  const mockConversations: Conversation[] = [
    {
      id: "conv-1",
      otherUser: {
        id: "user-1",
        firstName: "Nguyễn Văn",
        lastName: "Minh",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        lastActive: new Date(Date.now() - 5 * 60 * 1000).toISOString() // 5 minutes ago (online)
      },
      lastMessage: {
        id: "msg-1",
        content: "Chào bạn! Mình có thể tham gia nhóm học Toán Cao Cấp không?",
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
        senderId: "user-1"
      },
      unreadCount: 2,
      lastActivity: new Date(Date.now() - 10 * 60 * 1000).toISOString()
    },
    {
      id: "conv-2",
      otherUser: {
        id: "user-2",
        firstName: "Trần Thị",
        lastName: "Hoa",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b589?w=100&h=100&fit=crop&crop=face",
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago (offline)
      },
      lastMessage: {
        id: "msg-2", 
        content: "Cảm ơn bạn đã chia sẻ tài liệu! Rất hữu ích 😊",
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        senderId: "user-2"
      },
      unreadCount: 0,
      lastActivity: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "conv-3",
      otherUser: {
        id: "user-3", 
        firstName: "Lê Văn",
        lastName: "Đức",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        lastActive: new Date(Date.now() - 10 * 60 * 1000).toISOString() // 10 minutes ago (online)
      },
      lastMessage: {
        id: "msg-3",
        content: "Bạn có thể gọi video call để cùng làm bài tập không?",
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        senderId: currentUserId
      },
      unreadCount: 1,
      lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    },
    {
      id: "conv-4",
      otherUser: {
        id: "user-4",
        firstName: "Phạm Thị",
        lastName: "Mai",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
        lastActive: new Date(Date.now() - 8 * 60 * 1000).toISOString() // 8 minutes ago (online)
      },
      lastMessage: {
        id: "msg-4",
        content: "Phòng học lúc 19h tối nay nhé! Đừng quên mang sách",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        senderId: "user-4"
      },
      unreadCount: 0,
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "conv-5",
      otherUser: {
        id: "user-5",
        firstName: "Hoàng Văn",
        lastName: "Nam", 
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
        lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago (offline)
      },
      lastMessage: {
        id: "msg-5",
        content: "Tài liệu ôn thi được rồi, cảm ơn bạn nhiều!",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        senderId: currentUserId
      },
      unreadCount: 0,
      lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "conv-6",
      otherUser: {
        id: "user-6",
        firstName: "Vũ Thị",
        lastName: "Lan",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
        lastActive: new Date(Date.now() - 3 * 60 * 1000).toISOString() // 3 minutes ago (online)
      },
      lastMessage: {
        id: "msg-6",
        content: "Buổi thuyết trình mai rất quan trọng, chúng ta cùng chuẩn bị kỹ nhé!",
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        senderId: "user-6"
      },
      unreadCount: 3,
      lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    }
  ]

  const [conversations, setConversations] = useState<Conversation[]>(mockConversations)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Using mock data, no need to fetch from API
    setLoading(false)
  }, [])

  const handleConversationClick = (conversation: Conversation) => {
    if (onSelectConversation) {
      onSelectConversation(conversation)
    } else {
      router.push(`/messages/${conversation.otherUser.id}`)
    }
  }

  const filteredConversations = conversations.filter(conversation =>
    `${conversation.otherUser.firstName} ${conversation.otherUser.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  )

  const isOnline = (lastActive?: string) => {
    if (!lastActive) return false
    return new Date(lastActive) > new Date(Date.now() - 15 * 60 * 1000)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>Lỗi tải cuộc trò chuyện</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-primary-600 hover:text-primary-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm cuộc trò chuyện..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có cuộc trò chuyện</h3>
            <p className="text-gray-500">Hãy kết nối với bạn học để bắt đầu trò chuyện!</p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => handleConversationClick(conversation)}
              className={`p-4 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 transition-colors border-l-4 ${
                selectedConversationId === conversation.id 
                  ? 'bg-primary-50 border-l-primary-500' 
                  : 'border-l-transparent hover:border-l-gray-200'
              }`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {conversation.otherUser.avatar ? (
                  <img
                    src={conversation.otherUser.avatar}
                    alt={`${conversation.otherUser.firstName} ${conversation.otherUser.lastName}`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {conversation.otherUser.firstName[0]}{conversation.otherUser.lastName[0]}
                  </div>
                )}
                {isOnline(conversation.otherUser.lastActive) && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-gray-900 truncate">
                    {conversation.otherUser.firstName} {conversation.otherUser.lastName}
                  </p>
                  <p className="text-xs text-gray-500 flex-shrink-0 ml-2">
                    {conversation.lastMessage 
                      ? formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { 
                          addSuffix: true, 
                          locale: vi 
                        })
                      : formatDistanceToNow(new Date(conversation.lastActivity), { 
                          addSuffix: true, 
                          locale: vi 
                        })
                    }
                  </p>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-gray-600 truncate">
                    {conversation.lastMessage ? (
                      <>
                        {conversation.lastMessage.senderId === currentUserId && (
                          <span className="text-gray-500">Bạn: </span>
                        )}
                        {conversation.lastMessage.content}
                      </>
                    ) : (
                      <span className="text-gray-400 italic">Chưa có tin nhắn</span>
                    )}
                  </p>
                  {conversation.unreadCount > 0 && (
                    <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ml-2">
                      {conversation.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}