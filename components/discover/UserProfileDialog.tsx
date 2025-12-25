'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  XMarkIcon,
  HeartIcon,
  PaperAirplaneIcon,
  MapPinIcon,
  AcademicCapIcon,
  ClockIcon,
  StarIcon,
  TrophyIcon,
  UserCircleIcon,
  SparklesIcon,
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

interface UserProfileDialogProps {
  user: User
  isOpen: boolean
  onClose: () => void
  onAction: (action: 'like' | 'pass' | 'message', userId: string) => void
  aiReasoning?: string
  matchScore?: number
}

export function UserProfileDialog({ user, isOpen, onClose, onAction, aiReasoning, matchScore }: UserProfileDialogProps) {
  const router = useRouter()

  const handleLike = () => {
    onAction('like', user.id)
  }

  const handlePass = () => {
    onAction('pass', user.id)
  }

  const handleMessage = () => {
    router.push(`/messages/new?userId=${user.id}`)
    onClose()
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                >
                  <XMarkIcon className="h-6 w-6 text-gray-600" />
                </button>

                {/* Scrollable Content */}
                <div className="max-h-[85vh] overflow-y-auto">
                  {/* Cover Photo */}
                  <div className="h-32 sm:h-48 bg-gradient-to-r from-primary-500 to-primary-600 relative">
                    <div className="absolute inset-0 bg-black/20"></div>
                  </div>

                  {/* Profile Content */}
                  <div className="relative px-6 pb-6">
                    {/* Avatar */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 mb-4">
                      <div className="relative mb-3 sm:mb-0">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white object-cover"
                          />
                        ) : (
                          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center">
                            <UserCircleIcon className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="sm:ml-6 flex-1 text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                              {user.firstName} {user.lastName}
                            </h1>
                            <div className="flex items-center justify-center sm:justify-start text-gray-600 mt-1">
                              <MapPinIcon className="h-4 w-4 mr-1" />
                              <span className="text-sm sm:text-base">{user.university}</span>
                            </div>
                          </div>
                          {user.subscriptionTier !== 'BASIC' && (
                            <div className="mt-2 sm:mt-0">
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                user.subscriptionTier === 'PREMIUM'
                                  ? 'bg-yellow-500 text-white'
                                  : 'bg-purple-500 text-white'
                              }`}>
                                {user.subscriptionTier}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                      <div className="text-center bg-gray-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-primary-600">{user.totalMatches}</div>
                        <div className="text-sm text-gray-600">Kết nối</div>
                      </div>
                      <div className="text-center bg-gray-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-green-600">{user.successfulMatches}</div>
                        <div className="text-sm text-gray-600">Thành công</div>
                      </div>
                      <div className="text-center bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-center text-2xl font-bold text-yellow-600">
                          {user.averageRating ? Number(user.averageRating).toFixed(1) : 'N/A'}
                          {user.averageRating && <StarIcon className="h-5 w-5 ml-1" />}
                        </div>
                        <div className="text-sm text-gray-600">Đánh giá</div>
                      </div>
                      <div className="text-center bg-gray-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-blue-600">{user.gpa || 'N/A'}</div>
                        <div className="text-sm text-gray-600">GPA</div>
                      </div>
                    </div>

                    {/* AI Match Analysis Section */}
                    {(matchScore !== undefined || aiReasoning) && (
                      <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                        <div className="flex items-center mb-3">
                          <SparklesIcon className="h-5 w-5 text-purple-600 mr-2" />
                          <h3 className="text-lg font-semibold text-gray-900">Phân tích AI</h3>
                        </div>

                        {matchScore !== undefined && (
                          <div className="flex items-center mb-3">
                            <div className={`
                              text-3xl font-bold
                              ${matchScore >= 80 ? 'text-green-600' :
                                matchScore >= 60 ? 'text-yellow-600' :
                                'text-orange-600'}
                            `}>
                              {matchScore}%
                            </div>
                            <div className="ml-2 text-gray-600">độ phù hợp</div>
                          </div>
                        )}

                        {aiReasoning && (
                          <div className="text-gray-700 leading-relaxed">
                            <span className="font-medium text-purple-700">Lý do: </span>
                            {aiReasoning}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bio */}
                    {user.bio && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Giới thiệu</h3>
                        <p className="text-gray-600 leading-relaxed">{user.bio}</p>
                      </div>
                    )}

                    {/* Academic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin học tập</h3>
                        <div className="space-y-3">
                          <div className="flex items-start">
                            <AcademicCapIcon className="h-5 w-5 text-primary-600 mr-3 mt-0.5" />
                            <div>
                              <div className="font-medium text-gray-900">{user.major}</div>
                              <div className="text-sm text-gray-600">Năm {user.year}</div>
                            </div>
                          </div>
                          {user.preferredStudyTime && user.preferredStudyTime.length > 0 && (
                            <div className="flex items-start">
                              <ClockIcon className="h-5 w-5 text-primary-600 mr-3 mt-0.5" />
                              <div>
                                <div className="font-medium text-gray-900">Thời gian học</div>
                                <div className="text-sm text-gray-600">{user.preferredStudyTime.join(', ')}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {user.languages && user.languages.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Ngôn ngữ</h3>
                          <div className="flex flex-wrap gap-2">
                            {user.languages.map((language, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                              >
                                {language}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Skills and Interests */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {user.interests && user.interests.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Sở thích</h3>
                          <div className="flex flex-wrap gap-2">
                            {user.interests.map((interest, index) => (
                              <span
                                key={index}
                                className="px-3 py-2 bg-primary-100 text-primary-700 rounded-xl text-sm font-medium"
                              >
                                {interest}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {user.skills && user.skills.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Kỹ năng</h3>
                          <div className="flex flex-wrap gap-2">
                            {user.skills.map((skill, index) => (
                              <span
                                key={index}
                                className="px-3 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Goals */}
                    {user.studyGoals && user.studyGoals.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Mục tiêu học tập</h3>
                        <div className="space-y-2">
                          {user.studyGoals.map((goal, index) => (
                            <div key={index} className="flex items-start">
                              <TrophyIcon className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />
                              <span className="text-gray-700">{goal}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Hành động</h3>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={handlePass}
                          className="flex-1 flex items-center justify-center space-x-2 py-3 px-6 border-2 border-red-300 text-red-600 hover:border-red-400 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <XMarkIcon className="h-5 w-5" />
                          <span className="font-medium">Bỏ qua</span>
                        </button>
                        <button
                          onClick={handleLike}
                          className="flex-1 flex items-center justify-center space-x-2 py-3 px-6 border-2 border-green-300 text-green-600 hover:border-green-400 hover:bg-green-50 rounded-xl transition-colors"
                        >
                          <HeartIcon className="h-5 w-5" />
                          <span className="font-medium">Ghép</span>
                        </button>
                        <button
                          onClick={handleMessage}
                          className="flex-1 flex items-center justify-center space-x-2 py-3 px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors"
                        >
                          <PaperAirplaneIcon className="h-5 w-5" />
                          <span className="font-medium">Nhắn tin</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
