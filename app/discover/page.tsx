'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  HeartIcon,
  XMarkIcon,
  StarIcon,
  MapPinIcon,
  AcademicCapIcon,
  ClockIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  BoltIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'

export default function DiscoverPage() {
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    subjects: [],
    studyTime: 'any',
    location: 'any',
    level: 'any'
  })

  // Mock data - in real app this would come from AI matching API
  const potentialMatches = [
    {
      id: 1,
      name: 'Nguyễn Minh Anh',
      age: 20,
      university: 'Đại học Bách khoa Hà Nội',
      major: 'Khoa học Máy tính',
      year: 'Năm 3',
      avatar: 'MA',
      matchScore: 95,
      distance: '2.1 km',
      subjects: ['Data Structures', 'Algorithms', 'Machine Learning'],
      studyTime: 'Tối (7-10 PM)',
      bio: 'Đam mê AI và Machine Learning. Tìm bạn cùng nghiên cứu và làm project. Có kinh nghiệm làm intern tại startup công nghệ.',
      interests: ['Coding', 'Research', 'Tech Events'],
      achievements: ['Top 10 Hackathon 2024', 'GPA 3.8+'],
      isOnline: true,
      studyGroups: 3,
      rating: 4.9
    },
    {
      id: 2,
      name: 'Trần Thị Hương',
      age: 19,
      university: 'Đại học Kinh tế Quốc dân',
      major: 'Marketing',
      year: 'Năm 2',
      avatar: 'TH',
      matchScore: 88,
      distance: '3.5 km',
      subjects: ['Digital Marketing', 'Consumer Behavior', 'Statistics'],
      studyTime: 'Chiều (2-5 PM)',
      bio: 'Yêu thích marketing và social media. Mong muốn tìm bạn cùng làm case study và thảo luận về các chiến lược marketing hiện đại.',
      interests: ['Social Media', 'Case Studies', 'Branding'],
      achievements: ['Marketing Competition Winner', 'Social Media 10K+'],
      isOnline: false,
      studyGroups: 2,
      rating: 4.7
    },
    {
      id: 3,
      name: 'Lê Văn Đức',
      age: 22,
      university: 'Đại học Công nghệ',
      major: 'Software Engineering',
      year: 'Năm 4',
      avatar: 'LD',
      matchScore: 92,
      distance: '1.8 km',
      subjects: ['Software Design', 'System Architecture', 'DevOps'],
      studyTime: 'Sáng (8-11 AM)',
      bio: 'Senior developer với 2 năm kinh nghiệm. Sẵn sàng mentor và học hỏi lẫn nhau về software development và best practices.',
      interests: ['Open Source', 'System Design', 'Mentoring'],
      achievements: ['Google Summer of Code', 'Tech Lead Intern'],
      isOnline: true,
      studyGroups: 5,
      rating: 4.8
    }
  ]

  const currentMatch = potentialMatches[currentCardIndex]

  const handleLike = () => {
    console.log('Liked:', currentMatch.name)
    nextCard()
  }

  const handlePass = () => {
    console.log('Passed:', currentMatch.name)
    nextCard()
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Khám phá</h1>
                <p className="text-gray-600">Tìm bạn học phù hợp với AI</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
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
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Bộ lọc</h3>

                {/* Subjects */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Môn học</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {subjectOptions.map((subject) => (
                      <label key={subject} className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{subject}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Study Time */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Thời gian học</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="any">Bất kỳ</option>
                    <option value="morning">Sáng (6-12)</option>
                    <option value="afternoon">Chiều (12-18)</option>
                    <option value="evening">Tối (18-22)</option>
                    <option value="night">Đêm (22-6)</option>
                  </select>
                </div>

                {/* Distance */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Khoảng cách</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="any">Bất kỳ</option>
                    <option value="1km">Dưới 1km</option>
                    <option value="5km">Dưới 5km</option>
                    <option value="10km">Dưới 10km</option>
                    <option value="20km">Dưới 20km</option>
                  </select>
                </div>

                <button className="w-full btn-primary">
                  Áp dụng bộ lọc
                </button>
              </div>
            </motion.div>
          )}

          {/* Main Content */}
          <div className={`${showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                {/* Match Score Banner */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 text-center"
                >
                  <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-6 py-3 rounded-full">
                    <BoltIcon className="h-5 w-5" />
                    <span className="font-bold">{currentMatch.matchScore}% Match</span>
                  </div>
                </motion.div>

                {/* Profile Card */}
                <motion.div
                  key={currentMatch.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden"
                >
                  {/* Avatar Section */}
                  <div className="relative h-64 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-primary-600 text-4xl font-bold">
                      {currentMatch.avatar}
                    </div>
                    {currentMatch.isOnline && (
                      <div className="absolute top-4 right-4 flex items-center space-x-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span>Online</span>
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                      <MapPinIcon className="h-4 w-4 inline mr-1" />
                      {currentMatch.distance}
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="p-6">
                    {/* Basic Info */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-bold text-gray-900">
                          {currentMatch.name}, {currentMatch.age}
                        </h2>
                        <div className="flex items-center space-x-1">
                          <StarIcon className="h-4 w-4 text-yellow-400" />
                          <span className="text-sm font-medium text-gray-700">{currentMatch.rating}</span>
                        </div>
                      </div>
                      <p className="text-gray-600">{currentMatch.university}</p>
                      <p className="text-sm text-gray-500">{currentMatch.major} • {currentMatch.year}</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-xl">
                        <UserGroupIcon className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                        <div className="text-lg font-bold text-gray-900">{currentMatch.studyGroups}</div>
                        <div className="text-xs text-gray-600">Study Groups</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-xl">
                        <ClockIcon className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                        <div className="text-sm font-medium text-gray-900">{currentMatch.studyTime}</div>
                        <div className="text-xs text-gray-600">Thời gian học</div>
                      </div>
                    </div>

                    {/* Subjects */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {currentMatch.subjects.map((subject, index) => (
                          <span
                            key={index}
                            className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="mb-4">
                      <p className="text-gray-700 leading-relaxed">{currentMatch.bio}</p>
                    </div>

                    {/* Interests */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Sở thích</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentMatch.interests.map((interest, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Achievements */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Thành tích</h4>
                      <div className="space-y-1">
                        {currentMatch.achievements.map((achievement, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                            <span className="text-sm text-gray-700">{achievement}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-4">
                      <button
                        onClick={handlePass}
                        className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 border-2 border-gray-300 rounded-xl hover:border-gray-400 transition-colors"
                      >
                        <XMarkIcon className="h-5 w-5 text-gray-600" />
                        <span className="font-medium text-gray-700">Pass</span>
                      </button>
                      <button
                        onClick={handleLike}
                        className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors"
                      >
                        <HeartIcon className="h-5 w-5" />
                        <span className="font-medium">Like</span>
                      </button>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-4 flex space-x-2">
                      <button className="flex-1 flex items-center justify-center space-x-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                        <EyeIcon className="h-4 w-4 text-gray-600" />
                        <span className="text-sm text-gray-700">Xem chi tiết</span>
                      </button>
                      <button className="flex-1 flex items-center justify-center space-x-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                        <ChatBubbleLeftRightIcon className="h-4 w-4 text-gray-600" />
                        <span className="text-sm text-gray-700">Nhắn tin trước</span>
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Keyboard Shortcuts */}
                <div className="mt-6 text-center text-sm text-gray-500">
                  Phím tắt: ← (Pass) • → (Like) • ↑ (Chi tiết)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}