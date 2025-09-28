'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import AuthGuard from '@/components/guards/AuthGuard'
import { useAuth } from '@/components/providers/Providers'
import { useRouter } from 'next/navigation'
import { BottomTabNavigation, FloatingActionButton } from '@/components/ui/MobileNavigation'
import { DashboardHeader } from '@/components/ui/DashboardHeader'
import {
  SparklesIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  TrophyIcon,
  AcademicCapIcon,
  VideoCameraIcon,
  BellIcon,
  CalendarDaysIcon,
  ClockIcon,
  ArrowRightIcon,
  PlusIcon,
  FireIcon
} from '@heroicons/react/24/outline'
import {
  StarIcon
} from '@heroicons/react/24/solid'

interface DashboardData {
  profile: {
    name: string
    avatar?: string
    university: string
    major: string
  }
  userStats: {
    matches: number
    studySessions: number
    hoursStudied: number
    badges: number
  }
  recentMatches: {
    id: string
    userId: string
    name: string
    university: string
    subject: string
    avatar?: string
    matchScore: number
    isOnline: boolean
    matchedAt: string
  }[]
  upcomingEvents: {
    id: string
    title: string
    time: string
    participants: number
    type: string
    topic?: string
    isOwner?: boolean
    maxMembers?: number
    roomType?: string
    description?: string
  }[]
  recentActivity: {
    id: string
    icon: string
    iconColor: string
    iconBg: string
    title: string
    description: string
    time: string
  }[]
}

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [clickedAction, setClickedAction] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch real dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/dashboard', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setDashboardData(data)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setError('Không thể tải dữ liệu dashboard')
        // Fallback to mock data if API fails
        setDashboardData({
          profile: {
            name: user?.email?.split('@')[0] || 'Student',
            university: 'Đại học',
            major: 'Ngành học',
          },
          userStats: {
            matches: 0,
            studySessions: 0,
            hoursStudied: 0,
            badges: 0
          },
          recentMatches: [],
          upcomingEvents: [],
          recentActivity: []
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Get data with fallback
  const userStats = dashboardData?.userStats || {
    matches: 0,
    studySessions: 0, 
    hoursStudied: 0,
    badges: 0
  }

  const recentMatches = dashboardData?.recentMatches || []
  const upcomingEvents = dashboardData?.upcomingEvents || []

  const quickActions = [
    {
      title: 'Tìm bạn học',
      description: 'AI matching với sinh viên phù hợp',
      icon: SparklesIcon,
      color: 'primary',
      href: '/discover'
    },
    {
      title: 'Tham gia phòng học',
      description: 'Vào phòng học nhóm đang hoạt động',
      icon: VideoCameraIcon,
      color: 'accent',
      href: '/rooms'
    },
    {
      title: 'Tin nhắn',
      description: 'Chat với bạn đã kết nối',
      icon: ChatBubbleLeftRightIcon,
      color: 'green',
      href: '/messages'
    },
    {
      title: 'Thành tích',
      description: 'Xem badges và ranking',
      icon: TrophyIcon,
      color: 'yellow',
      href: '/achievements'
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      primary: 'bg-primary-100 text-primary-600 hover:bg-primary-200',
      accent: 'bg-accent-100 text-accent-600 hover:bg-accent-200',
      green: 'bg-green-100 text-green-600 hover:bg-green-200',
      yellow: 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
    }
    return colors[color as keyof typeof colors] || colors.primary
  }

  const handleActionClick = (href: string, title: string) => {
    setClickedAction(title)
    setTimeout(() => {
      router.push(href)
    }, 100) // Short delay to show loading feedback
  }



  if (error) {
    return (
      
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <TrophyIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Không thể tải dashboard</h2>
            <p className="text-gray-600 mb-4">{error}</p>
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
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader
        title="Dashboard"
        description={`Chào mừng trở lại, ${dashboardData?.profile.name || user?.email?.split('@')[0] || 'Student'}!`}
        icon={AcademicCapIcon}
        currentPage="/dashboard"
        rightContent={
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <BellIcon className="h-6 w-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        }
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 mobile-safe-area">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {[
            { label: 'Matches', value: userStats.matches, icon: UserGroupIcon, color: 'text-blue-600', bg: 'bg-blue-100' },
            { label: 'Study Sessions', value: userStats.studySessions, icon: AcademicCapIcon, color: 'text-green-600', bg: 'bg-green-100' },
            { label: 'Giờ học', value: userStats.hoursStudied, icon: ClockIcon, color: 'text-purple-600', bg: 'bg-purple-100' },
            { label: 'Badges', value: userStats.badges, icon: TrophyIcon, color: 'text-yellow-600', bg: 'bg-yellow-100' }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Thao tác nhanh</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleActionClick(action.href, action.title)}
                    disabled={clickedAction === action.title}
                    className={`p-4 rounded-xl transition-all duration-200 hover:scale-105 ${getColorClasses(action.color)} cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100`}
                  >
                    <div className="flex items-start space-x-3">
                      {clickedAction === action.title ? (
                        <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0 mt-1" />
                      ) : (
                        <action.icon className="h-6 w-6 flex-shrink-0 mt-1" />
                      )}
                      <div className="text-left">
                        <h3 className="font-semibold">{action.title}</h3>
                        <p className="text-sm opacity-80 mt-1">
                          {clickedAction === action.title ? 'Đang chuyển hướng...' : action.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Upcoming Events */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Sự kiện sắp tới</h2>
                <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.slice(0, 3).map((event, index) => (
                    <div key={event.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className={`w-2 h-2 rounded-full ${event.type === 'study' ? 'bg-primary-500' : event.type === 'help' ? 'bg-green-500' : event.type === 'discussion' ? 'bg-blue-500' : 'bg-gray-500'}`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 truncate">{event.title}</h3>
                          {event.isOwner && (
                            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">Chủ phòng</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                          <ClockIcon className="h-4 w-4" />
                          <span>{event.time}</span>
                          <span>•</span>
                          <span>{event.participants}/{event.maxMembers || 10} người</span>
                          {event.topic && (
                            <>
                              <span>•</span>
                              <span className="text-primary-600 font-medium">{event.topic}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <CalendarDaysIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Chưa có sự kiện nào</p>
                  </div>
                )}
                <Link 
                  href="/rooms" 
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Tạo phòng học mới</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Matches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8"
        >
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Matches gần đây</h2>
              <button className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1">
                <span>Xem tất cả</span>
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentMatches.length > 0 ? (
                recentMatches.map((match, index) => (
                  <div key={match.id} className="card p-4 hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          {match.avatar ? (
                            <img
                              src={match.avatar}
                              alt={match.name}
                              className="w-12 h-12 rounded-full object-cover"
                              onError={(e) => {
                                // Fallback to initials if image fails
                                const target = e.target as HTMLImageElement
                                const initials = match.name.split(' ').map(n => n[0]).join('').toUpperCase()
                                target.style.display = 'none'
                                target.nextElementSibling!.textContent = initials
                              }}
                            />
                          ) : null}
                          <div className={`w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold ${match.avatar ? 'hidden' : ''}`}>
                            {match.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                          {match.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{match.name}</h3>
                          <p className="text-sm text-gray-600">{match.university}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <StarIcon className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-700">{match.matchScore}%</span>
                      </div>
                    </div>
                    <div className="mb-4">
                      <span className="inline-block bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs font-medium">
                        {match.subject}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex-1 btn-primary text-sm py-2">
                        Nhắn tin
                      </button>
                      <button className="flex-1 btn-secondary text-sm py-2">
                        Xem hồ sơ
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="md:col-span-3 text-center py-8">
                  <UserGroupIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có matches nào</h3>
                  <p className="text-gray-600 mb-4">Hãy bắt đầu tìm bạn học để kết nối!</p>
                  <Link
                    href="/discover"
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
                  >
                    <SparklesIcon className="h-4 w-4 mr-2" />
                    Tìm bạn học ngay
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8"
        >
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Hoạt động gần đây</h2>
            <div className="space-y-4">
              {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 ? (
                dashboardData.recentActivity.map((activity, index) => {
                  // Map icon names to actual icon components
                  const IconComponent = {
                    TrophyIcon,
                    UserGroupIcon,
                    FireIcon
                  }[activity.icon] || TrophyIcon

                  return (
                    <div key={activity.id} className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                      <div className={`w-10 h-10 ${activity.iconBg} rounded-xl flex items-center justify-center`}>
                        <IconComponent className={`h-5 w-5 ${activity.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{activity.title}</h3>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8">
                  <ClockIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có hoạt động nào</h3>
                  <p className="text-gray-600">Các hoạt động của bạn sẽ xuất hiện ở đây</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mobile Navigation */}
      <BottomTabNavigation />
      <FloatingActionButton />
      </div>
    </AuthGuard>
  )
}