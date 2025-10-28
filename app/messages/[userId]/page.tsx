'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import AuthGuard from '@/components/guards/AuthGuard'
import { useAuth } from '@/components/providers/Providers'
import { ChatContainer } from '@/components/chat/ChatContainer'
import { UserStatusAvatar, formatLastActive } from '@/components/ui/UserStatusIndicator'
import { useUserStatus } from '@/hooks/useUserStatus'
import { 
  ArrowLeftIcon, 
  PhoneIcon, 
  VideoCameraIcon, 
  EllipsisVerticalIcon 
} from '@heroicons/react/24/outline'

interface OtherUser {
  id: string
  firstName: string
  lastName: string
  avatar?: string
  university?: string
  major?: string
  lastActive?: string
}

export default function PrivateChatPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const otherUserId = params.userId as string
  
  // Mock user data based on userId
  const mockUsers: { [key: string]: OtherUser } = {
    "user-1": {
      id: "user-1",
      firstName: "Nguyễn Văn",
      lastName: "Minh",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      university: "Đại học Bách Khoa Hà Nội",
      major: "Khoa học Máy tính",
      lastActive: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    },
    "user-2": {
      id: "user-2", 
      firstName: "Trần Thị",
      lastName: "Hoa",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b589?w=100&h=100&fit=crop&crop=face",
      university: "Đại học Quốc gia Hà Nội",
      major: "Toán học",
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    "user-3": {
      id: "user-3",
      firstName: "Lê Văn", 
      lastName: "Đức",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      university: "Đại học Bách Khoa Hà Nội",
      major: "Kỹ thuật Điện tử",
      lastActive: new Date(Date.now() - 10 * 60 * 1000).toISOString()
    },
    "user-4": {
      id: "user-4",
      firstName: "Phạm Thị",
      lastName: "Mai",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face", 
      university: "Đại học Kinh tế Quốc dân",
      major: "Quản trị Kinh doanh",
      lastActive: new Date(Date.now() - 8 * 60 * 1000).toISOString()
    },
    "user-5": {
      id: "user-5",
      firstName: "Hoàng Văn",
      lastName: "Nam",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
      university: "Đại học Sư phạm Hà Nội",
      major: "Ngôn ngữ Anh",
      lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    "user-6": {
      id: "user-6",
      firstName: "Vũ Thị",
      lastName: "Lan",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
      university: "Đại học Y Hà Nội",
      major: "Y khoa",
      lastActive: new Date(Date.now() - 3 * 60 * 1000).toISOString()
    }
  }
  
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use real-time user status
  const { status: userStatus } = useUserStatus({ userId: otherUserId })

  useEffect(() => {
    // Using mock data
    if (!user || !otherUserId) {
      setLoading(false)
      return
    }

    // Get mock user or create default one
    const mockUser = mockUsers[otherUserId] || {
      id: otherUserId,
      firstName: "Người dùng",
      lastName: "StudyMate",
      university: "Đại học StudyMate",
      major: "Chưa xác định",
      lastActive: new Date(Date.now() - 60 * 60 * 1000).toISOString()
    }

    setOtherUser(mockUser)
    setLoading(false)
  }, [user, otherUserId])

  const isOnline = userStatus?.status === 'online'

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải cuộc trò chuyện...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (error || !otherUser) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 mb-4 text-4xl">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Không thể tải cuộc trò chuyện</h2>
            <p className="text-gray-600 mb-4">{error || 'Người dùng không tồn tại'}</p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
            >
              Quay lại
            </button>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            
            <UserStatusAvatar
              userId={otherUserId}
              avatarUrl={otherUser.avatar}
              name={`${otherUser.firstName} ${otherUser.lastName}`}
              size="md"
            />
            
            <div>
              <p className="font-semibold text-gray-900">
                {otherUser.firstName} {otherUser.lastName}
              </p>
              <p className="text-sm text-gray-500">
                {isOnline ? 'Đang hoạt động' : userStatus?.lastActive ? formatLastActive(userStatus.lastActive) : 'Offline'} 
                {otherUser.university && ` • ${otherUser.university}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-gray-500">
            <button className="p-2 hover:bg-gray-100 rounded-full hover:text-primary-600 transition-colors">
              <PhoneIcon className="h-5 w-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full hover:text-primary-600 transition-colors">
              <VideoCameraIcon className="h-5 w-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full hover:text-primary-600 transition-colors">
              <EllipsisVerticalIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 bg-white">
          <ChatContainer
            chatId={otherUserId}
            chatType="private"
            currentUserId={user?.id || ''}
            className="h-[calc(100vh-80px)]"
          />
        </div>
      </div>
    </AuthGuard>
  )
}