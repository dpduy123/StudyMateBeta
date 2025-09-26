'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import AuthGuard from '@/components/guards/AuthGuard'
import { useAuth } from '@/components/providers/Providers'
import { ChatContainer } from '@/components/chat/ChatContainer'
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
  
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOtherUser = async () => {
      if (!user || !otherUserId) {
        setLoading(false)
        return
      }

      try {
        // Fetch other user's profile
        const response = await fetch(`/api/users/${otherUserId}`)
        
        if (!response.ok) {
          throw new Error('User not found')
        }

        const data = await response.json()
        setOtherUser(data.user)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user')
      } finally {
        setLoading(false)
      }
    }

    fetchOtherUser()
  }, [user, otherUserId])

  const isOnline = otherUser?.lastActive && 
    new Date(otherUser.lastActive) > new Date(Date.now() - 15 * 60 * 1000)

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
            
            <div className="relative">
              {otherUser.avatar ? (
                <img
                  src={otherUser.avatar}
                  alt={`${otherUser.firstName} ${otherUser.lastName}`}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {otherUser.firstName[0]}{otherUser.lastName[0]}
                </div>
              )}
              {isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            
            <div>
              <p className="font-semibold text-gray-900">
                {otherUser.firstName} {otherUser.lastName}
              </p>
              <p className="text-sm text-gray-500">
                {isOnline ? 'Đang hoạt động' : 'Offline'} 
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