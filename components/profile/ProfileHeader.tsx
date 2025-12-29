'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserProfile } from './types'
import { getUniversityById, getMajorById } from '@/lib/data/universities'
import {
  UserCircleIcon,
  PencilIcon,
  AcademicCapIcon,
  MapPinIcon,
  CalendarIcon,
  StarIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import { SuccessfulMatchesDialog } from './SuccessfulMatchesDialog'

interface ProfileHeaderProps {
  profile: UserProfile
  onEditClick: () => void
}

export function ProfileHeader({ profile, onEditClick }: ProfileHeaderProps) {
  const [isMatchesDialogOpen, setIsMatchesDialogOpen] = useState(false)

  // Use university and major info from API if available, otherwise fallback to lookup
  const university = profile.universityInfo || getUniversityById(profile.university)
  const major = profile.majorInfo || getMajorById(profile.major)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8"
    >
      {/* Cover Photo */}
      <div className="h-48 bg-gradient-to-r from-primary-500 to-primary-600 relative">
        <div className="absolute inset-0 bg-black/20"></div>
        <button
          onClick={onEditClick}
          className="absolute top-4 right-4 p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors"
          title="Chỉnh sửa hồ sơ"
        >
          <PencilIcon className="h-5 w-5 text-white" />
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
                  {university ? university.name : profile.university}
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
          <button
            onClick={() => setIsMatchesDialogOpen(true)}
            className="text-center hover:bg-gray-50 rounded-lg transition-colors p-2"
          >
            <div className="text-2xl font-bold text-green-600">{profile.successfulMatches}</div>
            <div className="text-sm text-gray-600">Thành công</div>
          </button>
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
            <div className="space-y-4">
              {/* University Info */}
              {university && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <BuildingOfficeIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-blue-900">{university.name}</div>
                      <div className="text-sm text-blue-600 mt-1">
                        {university.shortName} • {university.location}
                      </div>
                      <div className="text-xs text-blue-500 mt-1">
                        {university.type === 'public' ? 'Công lập' : 
                         university.type === 'private' ? 'Tư thục' : 'Quốc tế'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Major Info */}
              {major && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <AcademicCapIcon className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-green-900">{major.name}</div>
                      <div className="text-sm text-green-600 mt-1">
                        {major.category}
                      </div>
                      {major.description && (
                        <div className="text-xs text-green-500 mt-1">
                          {major.description}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Year Info */}
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-primary-600 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">Năm học</div>
                  <div className="text-sm text-gray-600">Năm {profile.year}</div>
                </div>
              </div>

              {/* Study Time */}
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-primary-600 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">Thời gian học ưa thích</div>
                  <div className="text-sm text-gray-600">{profile.preferredStudyTime?.join(', ') || 'Chưa cập nhật'}</div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Ngôn ngữ</h3>
            <div className="flex flex-wrap gap-2">
              {profile.languages?.length ? (
                profile.languages.map((language, index) => (
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

      {/* Successful Matches Dialog */}
      <SuccessfulMatchesDialog
        isOpen={isMatchesDialogOpen}
        onClose={() => setIsMatchesDialogOpen(false)}
      />
    </motion.div>
  )
}