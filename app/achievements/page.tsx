'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  TrophyIcon,
  SparklesIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'
import { CheckBadgeIcon } from '@heroicons/react/24/solid'

export default function AchievementsPage() {
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

  return (
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
            <div className="text-right">
              <p className="text-sm text-gray-600">Tổng điểm</p>
              <p className="text-2xl font-bold text-primary-600">{totalPoints} pts</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Badges Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
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

        {/* Achievements Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Tiến độ thành tích</h2>
          <div className="space-y-4">
            {userAchievements.map((userAchievement, index) => (
              <motion.div
                key={userAchievement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
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
      </div>
    </div>
  )
}
