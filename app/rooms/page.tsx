
'use client'

import { useState } from 'react'
import AuthGuard from '@/components/guards/AuthGuard'
import { useAuth } from '@/components/providers/Providers'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { BottomTabNavigation, FloatingActionButton } from '@/components/ui/MobileNavigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  UserGroupIcon,
  VideoCameraIcon,
  HashtagIcon,
  LockClosedIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  ChevronDownIcon,
  UserIcon
} from '@heroicons/react/24/outline'

export default function RoomsPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)
  // Mock data based on Prisma schema
  const mockRooms = [
    {
      id: 'room1',
      name: 'Luyện thi FE/UI',
      description: 'Cùng nhau giải đề, review portfolio và chia sẻ kinh nghiệm phỏng vấn.',
      type: 'STUDY_GROUP',
      topic: 'Frontend Development',
      maxMembers: 10,
      isPrivate: false,
      currentMembers: 7,
      owner: { name: 'Trần Anh Tuấn' },
      tags: ['React', 'Next.js', 'UI/UX']
    },
    {
      id: 'room2',
      name: 'Data Science Beginners',
      description: 'Nhóm cho người mới bắt đầu, học từ cơ bản đến nâng cao.',
      type: 'HELP_SESSION',
      topic: 'Data Science',
      maxMembers: 15,
      isPrivate: false,
      currentMembers: 12,
      owner: { name: 'Nguyễn Thị Mai' },
      tags: ['Python', 'Pandas', 'NumPy']
    },
    {
      id: 'room3',
      name: 'Marketing Elites - Case Study',
      description: 'Phân tích case study marketing thực tế từ các brand lớn.',
      type: 'DISCUSSION',
      topic: 'Marketing',
      maxMembers: 8,
      isPrivate: true,
      currentMembers: 5,
      owner: { name: 'Lê Minh' },
      tags: ['Branding', 'Strategy']
    },
    {
      id: 'room4',
      name: 'Casual English Chat',
      description: 'Luyện nói tiếng Anh tự nhiên, không áp lực.',
      type: 'CASUAL',
      topic: 'English',
      maxMembers: 20,
      isPrivate: false,
      currentMembers: 18,
      owner: { name: 'David Smith' },
      tags: ['Speaking', 'Conversation']
    }
  ]

  const [rooms, setRooms] = useState(mockRooms)
  const [filter, setFilter] = useState('')

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

  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(filter.toLowerCase()) ||
      room.topic.toLowerCase().includes(filter.toLowerCase()) ||
      room.tags.some((tag) => tag.toLowerCase().includes(filter.toLowerCase()))
  )

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-accent-500 rounded-xl flex items-center justify-center">
                <VideoCameraIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Phòng học</h1>
                <p className="text-gray-600">Tham gia và tạo phòng học nhóm</p>
              </div>
              <div className="hidden md:flex md:items-center md:space-x-8 ml-10">
                <Link href="/dashboard" className="text-gray-600 hover:text-primary-600 font-medium">Dashboard</Link>
                <Link href="/discover" className="text-gray-600 hover:text-primary-600 font-medium">Khám phá</Link>
                <Link href="/rooms" className="text-gray-900 font-semibold">Phòng học</Link>
                <Link href="/messages" className="text-gray-600 hover:text-primary-600 font-medium">Tin nhắn</Link>
                <Link href="/achievements" className="text-gray-600 hover:text-primary-600 font-medium">Thành tích</Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/rooms/create" className="btn-primary flex items-center space-x-2">
                <PlusIcon className="h-5 w-5" />
                <span>Tạo phòng mới</span>
              </Link>
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

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm phòng, chủ đề, hoặc tag..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
              <span>Bộ lọc</span>
            </button>
          </div>
        </div>

        {/* Rooms Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredRooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
            >
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-bold text-gray-900">{room.name}</h2>
                  {room.isPrivate && (
                    <div className="flex items-center space-x-1 text-gray-500">
                      <LockClosedIcon className="h-4 w-4" />
                      <span className="text-xs font-medium">Private</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 mb-4 text-sm">{room.description}</p>
                <div className="flex items-center space-x-2 mb-4">
                  <HashtagIcon className="h-5 w-5 text-primary-600" />
                  <span className="font-medium text-primary-700">{room.topic}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {room.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <UserGroupIcon className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {room.currentMembers} / {room.maxMembers}
                    </span>
                  </div>
                  <button className="btn-secondary text-sm py-2 px-4">
                    Tham gia
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredRooms.length === 0 && (
          <div className="text-center py-16">
            <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">Không tìm thấy phòng</h3>
            <p className="text-gray-600">Hãy thử từ khóa khác hoặc tạo phòng của riêng bạn.</p>
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      <BottomTabNavigation />
      <FloatingActionButton />
      </div>
    </AuthGuard>
  )
}
