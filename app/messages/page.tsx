'use client'

import { useState } from 'react'
import AuthGuard from '@/components/guards/AuthGuard'
import { useAuth } from '@/components/providers/Providers'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { BottomTabNavigation, FloatingActionButton } from '@/components/ui/MobileNavigation'
import Link from 'next/link'
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  VideoCameraIcon,
  PhoneIcon,
  EllipsisVerticalIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  ChevronDownIcon,
  UserIcon
} from '@heroicons/react/24/outline'

export default function MessagesPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)
  // Mock data based on Prisma schema
  const conversations = [
    {
      id: 1,
      user: {
        name: 'Nguyễn Minh Anh',
        avatar: 'MA',
        isOnline: true
      },
      lastMessage: 'Tuyệt vời! Hẹn gặp bạn ở buổi học nhé.',
      timestamp: '5 phút trước',
      unreadCount: 2
    },
    {
      id: 2,
      user: {
        name: 'Trần Thị Hương',
        avatar: 'TH',
        isOnline: false
      },
      lastMessage: 'Bạn: Đã gửi file "marketing-plan.pdf"',
      timestamp: '1 giờ trước',
      unreadCount: 0
    },
    {
      id: 3,
      user: {
        name: 'Lê Văn Đức',
        avatar: 'LD',
        isOnline: true
      },
      lastMessage: 'Cảm ơn bạn đã giải thích, mình hiểu rồi.',
      timestamp: 'Hôm qua',
      unreadCount: 0
    }
  ]

  const [selectedConversation, setSelectedConversation] = useState(conversations[0])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showUserMenu && !target.closest('[data-user-menu]')) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showUserMenu])

  const messages = [
    { id: 1, sender: 'them', content: 'Chào bạn, mình là Minh Anh. Rất vui được match!', timestamp: '10:30 AM' },
    { id: 2, sender: 'me', content: 'Chào Minh Anh, mình cũng rất vui!', timestamp: '10:31 AM' },
    { id: 3, sender: 'them', content: 'Bạn sẵn sàng cho buổi học Data Structures chiều nay chứ?', timestamp: '10:31 AM' },
    { id: 4, sender: 'me', content: 'Mình sẵn sàng! Cần chuẩn bị gì đặc biệt không nhỉ?' , timestamp: '10:32 AM'},
    { id: 5, sender: 'them', content: 'Chỉ cần xem lại bài giảng và chuẩn bị vài câu hỏi thôi.', timestamp: '10:33 AM' },
    { id: 6, sender: 'me', content: 'Tuyệt vời! Hẹn gặp bạn ở buổi học nhé.', timestamp: '10:34 AM' }
  ]

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Tin nhắn</h1>
                <p className="text-gray-600">Các cuộc trò chuyện của bạn</p>
              </div>
              <div className="hidden md:flex md:items-center md:space-x-8 ml-10">
                <Link href="/dashboard" className="text-gray-600 hover:text-primary-600 font-medium">Dashboard</Link>
                <Link href="/discover" className="text-gray-600 hover:text-primary-600 font-medium">Khám phá</Link>
                <Link href="/rooms" className="text-gray-600 hover:text-primary-600 font-medium">Phòng học</Link>
                <Link href="/messages" className="text-gray-900 font-semibold">Tin nhắn</Link>
                <Link href="/achievements" className="text-gray-600 hover:text-primary-600 font-medium">Thành tích</Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative" data-user-menu>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {user?.email?.charAt(0).toUpperCase() || 'S'}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-gray-900">{user?.email?.split('@')[0] || 'Student'}</span>
                  <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* User Menu Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        router.push('/profile')
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <UserIcon className="h-4 w-4" />
                      <span>Hồ sơ cá nhân</span>
                    </button>
                    <hr className="my-1 border-gray-200" />
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        signOut()
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-[calc(100vh-200px)] flex">
          {/* Conversation List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm tin nhắn..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="flex-grow overflow-y-auto">
              {conversations.map((convo) => (
                <div
                  key={convo.id}
                  onClick={() => setSelectedConversation(convo)}
                  className={`p-4 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 ${
                    selectedConversation.id === convo.id ? 'bg-primary-50' : ''
                  }`}>
                  <div className="relative">
                    <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {convo.user.avatar}
                    </div>
                    {convo.user.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-gray-900 truncate">{convo.user.name}</p>
                      <p className="text-xs text-gray-500">{convo.timestamp}</p>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-sm text-gray-600 truncate">{convo.lastMessage}</p>
                      {convo.unreadCount > 0 && (
                        <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {convo.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="w-2/3 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {selectedConversation.user.avatar}
                      </div>
                      {selectedConversation.user.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{selectedConversation.user.name}</p>
                      <p className="text-sm text-gray-500">{selectedConversation.user.isOnline ? 'Đang hoạt động' : 'Offline'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-gray-500">
                    <button className="hover:text-primary-600"><PhoneIcon className="h-5 w-5" /></button>
                    <button className="hover:text-primary-600"><VideoCameraIcon className="h-5 w-5" /></button>
                    <button className="hover:text-primary-600"><EllipsisVerticalIcon className="h-5 w-5" /></button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-grow p-6 overflow-y-auto bg-gray-50">
                  <div className="space-y-6">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                          msg.sender === 'me'
                            ? 'bg-primary-600 text-white rounded-br-none'
                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                        }`}>
                          <p>{msg.content}</p>
                          <p className={`text-xs mt-2 ${
                            msg.sender === 'me' ? 'text-primary-200' : 'text-gray-500'
                          }`}>{msg.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Message Input */}
                <div className="p-4 bg-white border-t border-gray-200">
                  {isTyping && (
                    <div className="mb-3 text-sm text-gray-500 italic">
                      {selectedConversation.user.name} đang gõ...
                    </div>
                  )}
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    if (newMessage.trim()) {
                      // TODO: Send message logic
                      console.log('Sending:', newMessage)
                      setNewMessage('')
                    }
                  }}>
                    <div className="relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Nhập tin nhắn..."
                        className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <PaperAirplaneIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </form>
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
