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
  TrophyIcon,
  SparklesIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  StarIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  ChevronDownIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { CheckBadgeIcon } from '@heroicons/react/24/solid'

export default function AchievementsPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('badges')
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Mock data based on Prisma schema
  const userBadges = [
    {
      id: 'b1',
      badge: {
        name: 'Network Pro',
        description: 'Kết nối với hơn 10 bạn học',
        icon: UserGroupIcon,
        type: 'NETWORK_PRO'
      },
      earnedAt: new Date('2025-09-20T10:00:00Z')
    },
    {
      id: 'b2',
      badge: {
        name: 'Chat Master',
        description: 'Gửi hơn 100 tin nhắn',
        icon: ChatBubbleLeftRightIcon,
        type: 'CHAT_MASTER'
      },
      earnedAt: new Date('2025-09-18T15:30:00Z')
    },
    {
      id: 'b3',
      badge: {
        name: 'Early Adopter',
        description: 'Tham gia trong tháng đầu tiên ra mắt',
        icon: SparklesIcon,
        type: 'EARLY_ADOPTER'
      },
      earnedAt: new Date('2025-09-05T09:00:00Z')
    }
  ]

  const userAchievements = [
    {
      id: 'a1',
      achievement: {
        name: 'Social Butterfly',
        description: 'Tham gia 5 phòng học nhóm khác nhau',
        category: 'SOCIAL',
        points: 50
      },
      progress: 1.0, // Completed
      completedAt: new Date('2025-09-19T18:00:00Z')
    },
    {
      id: 'a2',
      achievement: {
        name: 'Academic Excellence',
        description: 'Hoàn thành 10 giờ học tập trung',
        category: 'ACADEMIC',
        points: 100
      },
      progress: 0.7, // 70% complete
      completedAt: null
    },
    {
      id: 'a3',
      achievement: {
        name: 'Community Leader',
        description: 'Tạo và quản lý một phòng học trong 1 tháng',
        category: 'LEADERSHIP',
        points: 150
      },
      progress: 0.25, // 25% complete
      completedAt: null
    }
  ]

  const totalPoints = userAchievements
    .filter((a) => a.completedAt)
    .reduce((sum, a) => sum + a.achievement.points, 0)

  // Mock leaderboard data
  const leaderboard = [
    { rank: 1, name: 'Nguyễn Văn A', points: 1250, badges: 8, avatar: 'NA' },
    { rank: 2, name: 'Trần Thị B', points: 980, badges: 6, avatar: 'TB' },
    { rank: 3, name: 'Lê Minh C', points: 850, badges: 5, avatar: 'LC' },
    { rank: 4, name: 'Phạm Hương D', points: 720, badges: 4, avatar: 'PD' },
    { rank: 5, name: 'Hoàng Anh E', points: 650, badges: 4, avatar: 'HE' },
    { rank: 6, name: 'Bạn', points: totalPoints, badges: userBadges.length, avatar: 'ME', isCurrentUser: true }
  ].sort((a, b) => b.points - a.points).map((user, index) => ({ ...user, rank: index + 1 }))

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

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
                <TrophyIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Thành tích</h1>
                <p className="text-gray-600">Badges và điểm thưởng của bạn</p>
              </div>
              <div className="hidden md:flex md:items-center md:space-x-8 ml-10">
                <Link href="/dashboard" className="text-gray-600 hover:text-primary-600 font-medium">Dashboard</Link>
                <Link href="/discover" className="text-gray-600 hover:text-primary-600 font-medium">Khám phá</Link>
                <Link href="/rooms" className="text-gray-600 hover:text-primary-600 font-medium">Phòng học</Link>
                <Link href="/messages" className="text-gray-600 hover:text-primary-600 font-medium">Tin nhắn</Link>
                <Link href="/achievements" className="text-gray-900 font-semibold">Thành tích</Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Tổng điểm</p>
                <p className="text-2xl font-bold text-primary-600">{totalPoints} pts</p>
              </div>
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
        {/* Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1">
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => setActiveTab('badges')}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === 'badges'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <TrophyIcon className="h-4 w-4" />
                  <span>Badges</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('achievements')}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === 'achievements'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <StarIcon className="h-4 w-4" />
                  <span>Thành tích</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === 'leaderboard'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <TrophyIcon className="h-4 w-4" />
                  <span>Bảng xếp hạng</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Badges Section */}
        {activeTab === 'badges' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Badges đã đạt được</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {userBadges.map((userBadge, index) => (
                <motion.div
                  key={userBadge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center"
                >
                  <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full mx-auto flex items-center justify-center mb-4">
                    <userBadge.badge.icon className="h-10 w-10" />
                  </div>
                  <h3 className="font-bold text-gray-900">{userBadge.badge.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{userBadge.badge.description}</p>
                  <p className="text-xs text-gray-500">
                    Đạt được vào {userBadge.earnedAt.toLocaleDateString()}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Achievements Section */}
        {activeTab === 'achievements' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tiến độ thành tích</h2>
            <div className="space-y-4">
              {userAchievements.map((userAchievement, index) => (
                <motion.div
                  key={userAchievement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-6"
                >
                  <div className="flex-shrink-0">
                    {userAchievement.completedAt ? (
                      <CheckBadgeIcon className="h-12 w-12 text-green-500" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <AcademicCapIcon className="h-6 w-6 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-bold text-gray-900">{userAchievement.achievement.name}</h3>
                      <p className="font-semibold text-primary-600">{userAchievement.achievement.points} pts</p>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{userAchievement.achievement.description}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-primary-600 h-2.5 rounded-full"
                        style={{ width: `${userAchievement.progress * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-right text-sm text-gray-500 mt-1">
                      {Math.round(userAchievement.progress * 100)}%
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Leaderboard Section */}
        {activeTab === 'leaderboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Bảng xếp hạng</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Top Học Viên</h3>
                  <p className="text-sm text-gray-600">Cập nhật theo thời gian thực</p>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {leaderboard.map((user, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`px-6 py-4 flex items-center space-x-4 ${
                      user.isCurrentUser ? 'bg-primary-50 border-l-4 border-primary-500' : ''
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {user.rank <= 3 ? (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          user.rank === 1 ? 'bg-yellow-100 text-yellow-600' :
                          user.rank === 2 ? 'bg-gray-100 text-gray-600' :
                          'bg-orange-100 text-orange-600'
                        }`}>
                          <TrophyIcon className="h-5 w-5" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-gray-600">#{user.rank}</span>
                        </div>
                      )}
                    </div>
                    <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.avatar}
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-semibold text-gray-900">
                        {user.name}
                        {user.isCurrentUser && (
                          <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                            Bạn
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-600">{user.badges} badges</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary-600">{user.points}</p>
                      <p className="text-xs text-gray-500">điểm</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Mobile Navigation */}
      <BottomTabNavigation />
      <FloatingActionButton />
      </div>
    </AuthGuard>
  )
}
