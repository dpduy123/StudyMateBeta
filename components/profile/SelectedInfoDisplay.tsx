'use client'

import { University, Major, getUniversityById, getMajorById } from '@/lib/data/universities'
import { MapPinIcon, AcademicCapIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'

interface SelectedInfoDisplayProps {
  universityId?: string
  majorId?: string
  className?: string
}

export function SelectedInfoDisplay({ universityId, majorId, className = '' }: SelectedInfoDisplayProps) {
  const university = universityId ? getUniversityById(universityId) : null
  const major = majorId ? getMajorById(majorId) : null

  if (!university && !major) {
    return null
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* University Information */}
      {university && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                {university.name}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-blue-700">Tên viết tắt:</span>
                  <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-md">
                    {university.shortName}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-blue-600">{university.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-blue-700">Loại trường:</span>
                  <span className={`text-sm px-2 py-1 rounded-md ${
                    university.type === 'public' 
                      ? 'bg-green-100 text-green-700' 
                      : university.type === 'private'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {university.type === 'public' ? 'Công lập' : 
                     university.type === 'private' ? 'Tư thục' : 'Quốc tế'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Major Information */}
      {major && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <AcademicCapIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                {major.name}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-green-700">Danh mục:</span>
                  <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-md">
                    {major.category}
                  </span>
                </div>
                {major.description && (
                  <div className="flex items-start space-x-2">
                    <span className="text-sm font-medium text-green-700">Mô tả:</span>
                    <span className="text-sm text-green-600">{major.description}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
