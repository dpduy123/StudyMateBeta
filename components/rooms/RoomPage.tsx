'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/Providers'
import { VideoCameraIcon, UserGroupIcon, HashtagIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { Room } from './types'

interface RoomPageProps {
  roomId: string
}

export function RoomPage({ roomId }: RoomPageProps) {
  const { user } = useAuth()
  const [room, setRoom] = useState<Room | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRoom = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/rooms/${roomId}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setRoom(data.room)
      } catch (error) {
        console.error('Error fetching room:', error)
        setError('Không thể tải thông tin phòng')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRoom()
  }, [user, roomId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải phòng...</p>
        </div>
      </div>
    )
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <VideoCameraIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Không thể tải phòng</h2>
          <p className="text-gray-600 mb-4">{error || 'Phòng không tồn tại'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Room Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{room.name}</h1>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>bởi {room.owner.name}</span>
                  {room.isOwner && (
                    <span className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full text-xs font-medium">
                      Chủ phòng
                    </span>
                  )}
                </div>
                {room.isPrivate && (
                  <div className="flex items-center space-x-1 text-gray-500">
                    <LockClosedIcon className="h-4 w-4" />
                    <span className="text-xs font-medium">Riêng tư</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <UserGroupIcon className="h-5 w-5" />
                <span>{room.currentMembers} / {room.maxMembers}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <HashtagIcon className="h-5 w-5" />
                <span>{room.topic}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Room Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-96">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Chat</h3>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Chat functionality coming soon...</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Room Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin phòng</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Mô tả</p>
                  <p className="text-sm text-gray-900">{room.description}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Loại phòng</p>
                  <p className="text-sm text-gray-900">{room.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tính năng</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {room.allowVideo && (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                        Video
                      </span>
                    )}
                    {room.allowVoice && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                        Voice
                      </span>
                    )}
                    {room.allowText && (
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                        Text
                      </span>
                    )}
                    {room.allowScreenShare && (
                      <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs">
                        Screen Share
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Members */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thành viên</h3>
              <div className="space-y-2">
                {room.members?.map((member) => (
                  <div key={member.id} className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">
                        Tham gia {new Date(member.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
