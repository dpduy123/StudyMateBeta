'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AuthGuard from '@/components/guards/AuthGuard'
import { useAuth } from '@/components/providers/Providers'
import { DashboardHeader } from '@/components/ui/DashboardHeader'
import { BottomTabNavigation } from '@/components/ui/MobileNavigation'
import { UserProfileDialog } from '@/components/discover/UserProfileDialog'
import useSWR from 'swr'
import {
  BuildingOfficeIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  AcademicCapIcon,
  StarIcon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string | null
  university: string
  major: string
  year: number
  bio?: string | null
  interests?: string[]
  skills?: string[]
  languages?: string[]
  preferredStudyTime?: string[]
  studyGoals?: string[]
  totalMatches: number
  successfulMatches: number
  averageRating: number | null
  gpa: number | null
  status: string
  subscriptionTier: string
  isProfilePublic: boolean
  lastActive: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function B2CDiscoverPage() {
  const { user } = useAuth()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterUniversity, setFilterUniversity] = useState('all')
  const [filterMajor, setFilterMajor] = useState('all')
  const [filterMinGPA, setFilterMinGPA] = useState('')
  const [filterMinRating, setFilterMinRating] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Fetch all users for B2C partners
  const { data, error, isLoading, mutate } = useSWR<{ users: User[] }>(
    '/api/discover/b2c-users',
    fetcher
  )

  const users = data?.users || []

  // Filter users based on search and filters
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !searchQuery ||
      u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.major.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.bio?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesUniversity =
      filterUniversity === 'all' || u.university === filterUniversity

    const matchesMajor = filterMajor === 'all' || u.major === filterMajor

    const matchesGPA =
      !filterMinGPA || (u.gpa !== null && u.gpa >= parseFloat(filterMinGPA))

    const matchesRating =
      !filterMinRating ||
      (u.averageRating !== null && u.averageRating >= parseFloat(filterMinRating))

    return matchesSearch && matchesUniversity && matchesMajor && matchesGPA && matchesRating
  })

  // Get unique universities and majors for filters
  const universities = Array.from(new Set(users.map((u) => u.university))).sort()
  const majors = Array.from(new Set(users.map((u) => u.major))).sort()

  const handleCardClick = (user: User) => {
    setSelectedUser(user)
  }

  const handleCloseDialog = () => {
    setSelectedUser(null)
  }

  const handleAction = (action: 'like' | 'pass' | 'message', userId: string) => {
    console.log(`Action: ${action} for user: ${userId}`)
    // Close dialog after action
    setSelectedUser(null)
    // Optionally refresh the list or remove the user from view
    mutate()
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Đang tải danh sách người dùng...</h2>
          <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BuildingOfficeIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h2>
          <p className="text-gray-600 mb-6">Không thể tải danh sách người dùng. Vui lòng thử lại.</p>
          <button onClick={() => mutate()} className="btn-primary">
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader
          title="B2C Partner Discovery"
          description="Xem tất cả người dùng trên nền tảng"
          icon={BuildingOfficeIcon}
          currentPage="/discover-b2c"
        />

        <div className="py-4 sm:py-8 mobile-safe-area">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            {/* Search and Filter Bar */}
            <div className="mb-6 space-y-4">
              {/* Search Box */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, trường, ngành..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Filter Toggle */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <FunnelIcon className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Bộ lọc</span>
                  {(filterUniversity !== 'all' || filterMajor !== 'all' || filterMinGPA || filterMinRating) && (
                    <span className="bg-primary-500 text-white text-xs rounded-full px-2 py-0.5">
                      Active
                    </span>
                  )}
                </button>
                <div className="text-sm text-gray-600">
                  Tìm thấy <span className="font-semibold text-primary-600">{filteredUsers.length}</span> người dùng
                </div>
              </div>

              {/* Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white rounded-xl border border-gray-200 p-4 space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* University Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Trường đại học
                        </label>
                        <select
                          value={filterUniversity}
                          onChange={(e) => setFilterUniversity(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="all">Tất cả trường</option>
                          {universities.map((uni) => (
                            <option key={uni} value={uni}>
                              {uni}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Major Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Chuyên ngành
                        </label>
                        <select
                          value={filterMajor}
                          onChange={(e) => setFilterMajor(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="all">Tất cả ngành</option>
                          {majors.map((major) => (
                            <option key={major} value={major}>
                              {major}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Min GPA Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          GPA tối thiểu
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="4"
                          step="0.1"
                          placeholder="Ví dụ: 3.0"
                          value={filterMinGPA}
                          onChange={(e) => setFilterMinGPA(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>

                      {/* Min Rating Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Đánh giá tối thiểu
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="5"
                          step="0.1"
                          placeholder="Ví dụ: 4.0"
                          value={filterMinRating}
                          onChange={(e) => setFilterMinRating(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Clear Filters */}
                    {(filterUniversity !== 'all' || filterMajor !== 'all' || filterMinGPA || filterMinRating) && (
                      <button
                        onClick={() => {
                          setFilterUniversity('all')
                          setFilterMajor('all')
                          setFilterMinGPA('')
                          setFilterMinRating('')
                        }}
                        className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
                      >
                        <XMarkIcon className="h-4 w-4" />
                        <span>Xóa bộ lọc</span>
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Grid */}
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <UserGroupIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Không tìm thấy người dùng
                </h3>
                <p className="text-gray-600">Thử điều chỉnh bộ lọc hoặc tìm kiếm khác</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-20">
                {filteredUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => handleCardClick(user)}
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
                  >
                    {/* Card Header */}
                    <div className="h-24 bg-gradient-to-r from-primary-500 to-primary-600 relative">
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                      {/* Subscription Badge */}
                      {user.subscriptionTier !== 'BASIC' && (
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            user.subscriptionTier === 'PREMIUM'
                              ? 'bg-yellow-500 text-white'
                              : 'bg-purple-500 text-white'
                          }`}>
                            {user.subscriptionTier}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="relative px-4 -mt-12">
                      <div className="flex justify-center">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="w-24 h-24 rounded-full border-4 border-white object-cover"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center">
                            <UserCircleIcon className="w-16 h-16 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="px-4 pb-4 pt-2 text-center">
                      {/* Name */}
                      <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                        {user.firstName} {user.lastName}
                      </h3>

                      {/* University */}
                      <div className="flex items-center justify-center text-gray-600 mb-2">
                        <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="text-sm truncate">{user.university}</span>
                      </div>

                      {/* Major & Year */}
                      <div className="flex items-center justify-center text-gray-600 mb-3">
                        <AcademicCapIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="text-xs truncate">
                          {user.major} - Năm {user.year}
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="text-center">
                          <div className="text-sm font-bold text-primary-600">{user.totalMatches}</div>
                          <div className="text-xs text-gray-500">Matches</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center text-sm font-bold text-yellow-600">
                            {user.averageRating ? Number(user.averageRating).toFixed(1) : 'N/A'}
                            {user.averageRating && <StarIcon className="h-3 w-3 ml-0.5" />}
                          </div>
                          <div className="text-xs text-gray-500">Rating</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-bold text-blue-600">{user.gpa || 'N/A'}</div>
                          <div className="text-xs text-gray-500">GPA</div>
                        </div>
                      </div>

                      {/* Bio Preview */}
                      {user.bio && (
                        <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                          {user.bio}
                        </p>
                      )}

                      {/* View Profile Button */}
                      <button className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors group-hover:bg-primary-700">
                        Xem chi tiết
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Navigation */}
          <BottomTabNavigation />
        </div>

        {/* User Profile Dialog */}
        {selectedUser && (
          <UserProfileDialog
            user={selectedUser}
            isOpen={!!selectedUser}
            onClose={handleCloseDialog}
            onAction={handleAction}
          />
        )}
      </div>
    </AuthGuard>
  )
}
