'use client'

import { useState, useEffect } from 'react'
import AuthGuard from '@/components/guards/AuthGuard'
import { useAuth } from '@/components/providers/Providers'
import { BottomTabNavigation, FloatingActionButton } from '@/components/ui/MobileNavigation'
import { DashboardHeader } from '@/components/ui/DashboardHeader'
import { PageLoading } from '@/components/ui/LoadingSpinner'
import { motion } from 'framer-motion'
import {
  UserCircleIcon,
  PencilIcon,
  CameraIcon,
  AcademicCapIcon,
  MapPinIcon,
  CalendarIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  bio?: string
  university: string
  major: string
  year: number
  gpa?: number
  interests: string[]
  skills: string[]
  studyGoals: string[]
  preferredStudyTime: string[]
  languages: string[]
  totalMatches: number
  successfulMatches: number
  averageRating: number
  createdAt: string
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      // Mock data - replace with actual API call
      setProfile({
        id: user.id,
        firstName: 'Nguyễn',
        lastName: 'Văn A',
        email: user.email || '',
        avatar: undefined,
        bio: 'Sinh viên năm 3 chuyên ngành Khoa học máy tính. Đam mê AI và Machine Learning. Tìm bạn học để cùng nghiên cứu và phát triển dự án.',
        university: 'Đại học Bách Khoa TP.HCM',
        major: 'Khoa học máy tính',
        year: 3,
        gpa: 3.7,
        interests: ['Machine Learning', 'Web Development', 'Data Science', 'Algorithms'],
        skills: ['Python', 'JavaScript', 'React', 'TensorFlow'],
        studyGoals: ['Hoàn thành đồ án tốt nghiệp', 'Học Deep Learning', 'Tìm việc internship'],
        preferredStudyTime: ['Buổi tối', 'Cuối tuần'],
        languages: ['Tiếng Việt', 'English'],
        totalMatches: 24,
        successfulMatches: 18,
        averageRating: 4.5,
        createdAt: '2024-01-15'
      })
      setIsLoading(false)
    }
  }, [user])


  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Vui lòng đăng nhập</h2>
          <Link href="/auth/login" className="text-primary-600 hover:text-primary-500">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return <PageLoading />
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Không tìm thấy hồ sơ</h2>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Hồ sơ cá nhân"
        description="Thông tin và cài đặt tài khoản"
        icon={UserCircleIcon}
        currentPage="/profile"
        rightContent={
          <Link
            href="/profile/edit"
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            <PencilIcon className="h-4 w-4" />
            <span>Chỉnh sửa</span>
          </Link>
        }
      />

      <div className="py-8 mobile-safe-area">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8"
        >
          {/* Cover Photo */}
          <div className="h-48 bg-gradient-to-r from-primary-500 to-primary-600 relative">
            <div className="absolute inset-0 bg-black/20"></div>
            <button className="absolute top-4 right-4 p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors">
              <CameraIcon className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            {/* Avatar */}
            <div className="flex items-end -mt-16 mb-4">
              <div className="relative">
                {profile.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    className="w-32 h-32 rounded-full border-4 border-white object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center">
                    <UserCircleIcon className="w-20 h-20 text-gray-400" />
                  </div>
                )}
                <button className="absolute bottom-2 right-2 p-2 bg-primary-600 rounded-full hover:bg-primary-700 transition-colors">
                  <CameraIcon className="h-4 w-4 text-white" />
                </button>
              </div>
              <div className="ml-6 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {profile.firstName} {profile.lastName}
                    </h1>
                    <div className="flex items-center text-gray-600 mt-1">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {profile.university}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{profile.totalMatches}</div>
                <div className="text-sm text-gray-600">Kết nối</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{profile.successfulMatches}</div>
                <div className="text-sm text-gray-600">Thành công</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center text-2xl font-bold text-yellow-600">
                  {profile.averageRating}
                  <StarIcon className="h-5 w-5 ml-1" />
                </div>
                <div className="text-sm text-gray-600">Đánh giá</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{profile.gpa || 'N/A'}</div>
                <div className="text-sm text-gray-600">GPA</div>
              </div>
            </div>

            {/* Bio */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Giới thiệu</h3>
              <p className="text-gray-600 leading-relaxed">
                {profile.bio || 'Chưa có giới thiệu'}
              </p>
            </div>

            {/* Academic Info */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin học tập</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <AcademicCapIcon className="h-5 w-5 text-primary-600 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">{profile.major}</div>
                      <div className="text-sm text-gray-600">Năm {profile.year}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-primary-600 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">Thời gian học</div>
                      <div className="text-sm text-gray-600">{profile.preferredStudyTime.join(', ')}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Ngôn ngữ</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((language, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Interests & Skills */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Sở thích</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, index) => (
                <span
                  key={index}
                  className="px-3 py-2 bg-primary-100 text-primary-700 rounded-xl text-sm font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Kỹ năng</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Study Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Mục tiêu học tập</h3>
          <div className="space-y-3">
            {profile.studyGoals.map((goal, index) => (
              <div key={index} className="flex items-center">
                <TrophyIcon className="h-5 w-5 text-yellow-500 mr-3" />
                <span className="text-gray-700">{goal}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center space-x-4"
        >
          <Link
            href="/discover"
            className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            <HeartSolidIcon className="h-5 w-5" />
            <span>Tìm bạn học</span>
          </Link>
          <Link
            href="/messages"
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5" />
            <span>Tin nhắn</span>
          </Link>
        </motion.div>
      </div>

      {/* Mobile Navigation */}
      <BottomTabNavigation />
      <FloatingActionButton />
      </div>
      </div>
    </AuthGuard>
  )
}