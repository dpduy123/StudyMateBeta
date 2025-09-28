'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import AuthGuard from '@/components/guards/AuthGuard'
import { useAuth } from '@/components/providers/Providers'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { BottomTabNavigation, FloatingActionButton } from '@/components/ui/MobileNavigation'
import { DashboardHeader } from '@/components/ui/DashboardHeader'
import {
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  HeartIcon,
  XMarkIcon,
  StarIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  BoltIcon,
  PaperAirplaneIcon,
  UserCircleIcon,
  AcademicCapIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline'

export default function DiscoverPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  // Mock data - in real app this would come from AI matching API
  const potentialMatches = [
    {
      id: 1,
      firstName: 'Minh',
      lastName: 'Anh',
      age: 20,
      university: 'Đại học Bách khoa Hà Nội',
      major: 'Khoa học Máy tính',
      year: 3,
      avatar: null,
      matchScore: 95,
      distance: '2.1 km',
      bio: 'Đam mê AI và Machine Learning. Tìm bạn cùng nghiên cứu và làm project. Có kinh nghiệm làm intern tại startup công nghệ. Mong muốn tìm được những người bạn cùng chí hướng để cùng nhau phát triển trong lĩnh vực công nghệ.',
      interests: ['Coding', 'Research', 'Tech Events', 'Gaming', 'Anime'],
      skills: ['Python', 'JavaScript', 'React', 'Node.js', 'Machine Learning', 'Data Science'],
      languages: ['Tiếng Việt', 'English', 'Japanese'],
      preferredStudyTime: ['Tối (19:00-22:00)', 'Cuối tuần'],
      goals: ['Trở thành AI Engineer', 'Tham gia các dự án open source', 'Học thêm về Deep Learning'],
      totalMatches: 45,
      successfulMatches: 32,
      averageRating: 4.9,
      gpa: 3.8,
      isOnline: true,
      studyGroups: 3
    },
    {
      id: 2,
      firstName: 'Thị',
      lastName: 'Hương',
      age: 19,
      university: 'Đại học Kinh tế Quốc dân',
      major: 'Marketing',
      year: 2,
      avatar: null,
      matchScore: 88,
      distance: '3.5 km',
      bio: 'Yêu thích marketing và social media. Mong muốn tìm bạn cùng làm case study và thảo luận về các chiến lược marketing hiện đại. Luôn cập nhật xu hướng mới và sáng tạo trong các chiến dịch marketing.',
      interests: ['Social Media', 'Photography', 'K-pop', 'Travel', 'Fashion'],
      skills: ['Digital Marketing', 'Content Creation', 'Social Media', 'Analytics', 'Photoshop', 'Canva'],
      languages: ['Tiếng Việt', 'English', 'Korean'],
      preferredStudyTime: ['Chiều (14:00-17:00)', 'Tối (19:00-21:00)'],
      goals: ['Trở thành Digital Marketing Manager', 'Khởi nghiệp với startup riêng', 'Học thêm về UX/UI Design'],
      totalMatches: 38,
      successfulMatches: 25,
      averageRating: 4.7,
      gpa: 3.6,
      isOnline: false,
      studyGroups: 2
    },
    {
      id: 3,
      firstName: 'Văn',
      lastName: 'Đức',
      age: 22,
      university: 'Đại học Công nghệ',
      major: 'Software Engineering',
      year: 4,
      avatar: null,
      matchScore: 92,
      distance: '1.8 km',
      bio: 'Senior developer với 2 năm kinh nghiệm. Sẵn sàng mentor và học hỏi lẫn nhau về software development và best practices. Đam mê với clean code và system architecture.',
      interests: ['Open Source', 'System Design', 'Mentoring', 'Reading', 'Coffee'],
      skills: ['Java', 'Spring Boot', 'Docker', 'Kubernetes', 'AWS', 'System Design'],
      languages: ['Tiếng Việt', 'English'],
      preferredStudyTime: ['Sáng (8:00-11:00)', 'Chiều (14:00-16:00)'],
      goals: ['Trở thành Solution Architect', 'Contribute cho open source projects', 'Học thêm về Cloud Computing'],
      totalMatches: 52,
      successfulMatches: 41,
      averageRating: 4.8,
      gpa: 3.9,
      isOnline: true,
      studyGroups: 5
    }
  ]

  const currentMatch = potentialMatches[currentCardIndex]

  const handleLike = () => {
    console.log('Liked:', `${currentMatch.firstName} ${currentMatch.lastName}`)
    nextCard()
  }

  const handlePass = () => {
    console.log('Passed:', `${currentMatch.firstName} ${currentMatch.lastName}`)
    nextCard()
  }

  const handleDirectMessage = () => {
    console.log('Direct message to:', `${currentMatch.firstName} ${currentMatch.lastName}`)
    // Navigate to message page or open chat
    router.push(`/messages/new?userId=${currentMatch.id}`)
  }

  const nextCard = () => {
    if (currentCardIndex < potentialMatches.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
    } else {
      // Show end screen or load more matches
      setCurrentCardIndex(0)
    }
  }

  const subjectOptions = [
    'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'Marketing', 'Business', 'Economics', 'Literature', 'History',
    'English', 'Data Science', 'Engineering', 'Medicine', 'Law'
  ]

  if (!currentMatch) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <SparklesIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không còn matches nào!</h2>
          <p className="text-gray-600 mb-6">Hãy thử lại sau hoặc điều chỉnh bộ lọc</p>
          <button
            onClick={() => setCurrentCardIndex(0)}
            className="btn-primary"
          >
            Tìm kiếm lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Khám phá"
        description="Tìm bạn học phù hợp với AI"
        icon={SparklesIcon}
        currentPage="/discover"
        rightContent={
          <>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
              <span>Bộ lọc</span>
            </button>
            <div className="text-sm text-gray-600">
              {currentCardIndex + 1} / {potentialMatches.length}
            </div>
          </>
        }
      />

      <div className="py-8 mobile-safe-area">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Match Score Banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-6 py-3 rounded-full">
              <BoltIcon className="h-5 w-5" />
              <span className="font-bold">{currentMatch.matchScore}% Match với bạn</span>
            </div>
          </motion.div>

          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8"
          >
            {/* Cover Photo */}
            <div className="h-48 bg-gradient-to-r from-primary-500 to-primary-600 relative">
              <div className="absolute inset-0 bg-black/20"></div>
            </div>

            {/* Profile Info */}
            <div className="relative px-6 pb-6">
              {/* Avatar */}
              <div className="flex items-end -mt-16 mb-4">
                <div className="relative">
                  {currentMatch.avatar ? (
                    <img
                      src={currentMatch.avatar}
                      alt={`${currentMatch.firstName} ${currentMatch.lastName}`}
                      className="w-32 h-32 rounded-full border-4 border-white object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center">
                      <UserCircleIcon className="w-20 h-20 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="ml-6 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {currentMatch.firstName} {currentMatch.lastName}
                      </h1>
                      <div className="flex items-center text-gray-600 mt-1">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        {currentMatch.university}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">{currentMatch.totalMatches}</div>
                  <div className="text-sm text-gray-600">Kết nối</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{currentMatch.successfulMatches}</div>
                  <div className="text-sm text-gray-600">Thành công</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center text-2xl font-bold text-yellow-600">
                    {currentMatch.averageRating}
                    <StarIcon className="h-5 w-5 ml-1" />
                  </div>
                  <div className="text-sm text-gray-600">Đánh giá</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{currentMatch.gpa || 'N/A'}</div>
                  <div className="text-sm text-gray-600">GPA</div>
                </div>
              </div>

              {/* Bio */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Giới thiệu</h3>
                <p className="text-gray-600 leading-relaxed">
                  {currentMatch.bio || 'Chưa có giới thiệu'}
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
                        <div className="font-medium text-gray-900">{currentMatch.major}</div>
                        <div className="text-sm text-gray-600">Năm {currentMatch.year}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 text-primary-600 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900">Thời gian học</div>
                        <div className="text-sm text-gray-600">{currentMatch.preferredStudyTime?.join(', ') || 'Chưa cập nhật'}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Ngôn ngữ</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentMatch.languages?.length ? (
                      currentMatch.languages.map((language, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                        >
                          {language}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">Chưa cập nhật</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Skills and Interests Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Interests */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Sở thích</h3>
              <div className="flex flex-wrap gap-2">
                {currentMatch.interests?.length ? (
                  currentMatch.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-2 bg-primary-100 text-primary-700 rounded-xl text-sm font-medium"
                    >
                      {interest}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">Chưa cập nhật</span>
                )}
              </div>
            </motion.div>

            {/* Skills */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Kỹ năng</h3>
              <div className="flex flex-wrap gap-2">
                {currentMatch.skills?.length ? (
                  currentMatch.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">Chưa cập nhật</span>
                )}
              </div>
            </motion.div>
          </div>

          {/* Goals Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-6 mb-8"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Mục tiêu học tập</h3>
            <div className="space-y-3">
              {currentMatch.goals?.length ? (
                currentMatch.goals.map((goal, index) => (
                  <div key={index} className="flex items-center">
                    <TrophyIcon className="h-5 w-5 text-yellow-500 mr-3" />
                    <span className="text-gray-700">{goal}</span>
                  </div>
                ))
              ) : (
                <div className="flex items-center">
                  <TrophyIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-500">Chưa thiết lập mục tiêu</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Actions Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Hành động</h2>
            <div className="flex space-x-3">
              <button
                onClick={handlePass}
                className="flex-1 flex items-center justify-center space-x-2 py-4 px-6 border-2 border-red-300 text-red-600 hover:border-red-400 hover:bg-red-50 rounded-xl transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
                <span className="font-medium">Pass</span>
              </button>
              <button
                onClick={handleLike}
                className="flex-1 flex items-center justify-center space-x-2 py-4 px-6 border-2 border-green-300 text-green-600 hover:border-green-400 hover:bg-green-50 rounded-xl transition-colors"
              >
                <HeartIcon className="h-5 w-5" />
                <span className="font-medium">Like</span>
              </button>
              <button
                onClick={handleDirectMessage}
                className="flex-1 flex items-center justify-center space-x-2 py-4 px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
                <span className="font-medium">Nhắn tin trực tiếp</span>
              </button>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="mt-4 text-center text-sm text-gray-500">
              Phím tắt: ← (Pass) • → (Like) • ↑ (Nhắn tin)
            </div>
          </motion.div>
        </div>

        {/* Mobile Navigation */}
        <BottomTabNavigation />
        <FloatingActionButton />
      </div>
    </div>
  )
}