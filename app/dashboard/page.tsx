'use client'

import { motion } from 'framer-motion'
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

export default function DashboardPage() {
  // Mock data - in real app this would come from API/database
  const userStats = {
    matches: 12,
    studySessions: 45,
    hoursStudied: 127,
    badges: 8
  }

  const recentMatches = [
    {
      id: 1,
      name: 'Nguyễn Minh Anh',
      university: 'Đại học Bách khoa HN',
      subject: 'Data Structures',
      avatar: 'MA',
      matchScore: 95,
      isOnline: true
    },
    {
      id: 2,
      name: 'Trần Thị Hương',
      university: 'Đại học Kinh tế QD',
      subject: 'Marketing',
      avatar: 'TH',
      matchScore: 88,
      isOnline: false
    },
    {
      id: 3,
      name: 'Lê Văn Đức',
      university: 'Đại học Công nghệ',
      subject: 'Software Engineering',
      avatar: 'LD',
      matchScore: 92,
      isOnline: true
    }
  ]

  const upcomingEvents = [
    {
      id: 1,
      title: 'Study Group: Algorithms',
      time: '2:00 PM',
      participants: 4,
      type: 'study'
    },
    {
      id: 2,
      title: 'Marketing Workshop',
      time: '7:00 PM',
      participants: 12,
      type: 'workshop'
    }
  ]

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
                <AcademicCapIcon className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Chào mừng trở lại, Student!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <BellIcon className="h-6 w-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                S
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
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
                    className={`p-4 rounded-xl transition-all duration-200 hover:scale-105 ${getColorClasses(action.color)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <action.icon className="h-6 w-6 flex-shrink-0 mt-1" />
                      <div className="text-left">
                        <h3 className="font-semibold">{action.title}</h3>
                        <p className="text-sm opacity-80 mt-1">{action.description}</p>
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
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{event.title}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <ClockIcon className="h-4 w-4" />
                        <span>{event.time}</span>
                        <span>•</span>
                        <span>{event.participants} người</span>
                      </div>
                    </div>
                  </div>
                ))}
                <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-colors">
                  <PlusIcon className="h-5 w-5 mx-auto" />
                </button>
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
              {recentMatches.map((match, index) => (
                <div key={index} className="card p-4 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {match.avatar}
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
              ))}
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
              {[
                {
                  icon: TrophyIcon,
                  iconColor: 'text-yellow-600',
                  iconBg: 'bg-yellow-100',
                  title: 'Đạt badge "Study Streak"',
                  description: 'Học liên tục 7 ngày',
                  time: '2 giờ trước'
                },
                {
                  icon: UserGroupIcon,
                  iconColor: 'text-blue-600',
                  iconBg: 'bg-blue-100',
                  title: 'Match với Nguyễn Minh Anh',
                  description: 'Độ tương thích 95%',
                  time: '1 ngày trước'
                },
                {
                  icon: FireIcon,
                  iconColor: 'text-red-600',
                  iconBg: 'bg-red-100',
                  title: 'Hoàn thành study session',
                  description: 'Data Structures - 2 tiếng',
                  time: '2 ngày trước'
                }
              ].map((activity, index) => (
                <div key={index} className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className={`w-10 h-10 ${activity.iconBg} rounded-xl flex items-center justify-center`}>
                    <activity.icon className={`h-5 w-5 ${activity.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{activity.title}</h3>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}