'use client'

import { motion } from 'framer-motion'
import { UserProfile } from './types'
import {
  UserCircleIcon,
  CameraIcon,
  AcademicCapIcon,
  MapPinIcon,
  CalendarIcon,
  StarIcon
} from '@heroicons/react/24/outline'

interface ProfileHeaderProps {
  profile: UserProfile
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
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
                onLoad={() => console.log('Avatar image loaded successfully:', profile.avatar)}
                onError={(e) => {
                  console.error('Avatar image failed to load:', profile.avatar)
                  console.error('Image error event:', e)
                }}
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
  )
}