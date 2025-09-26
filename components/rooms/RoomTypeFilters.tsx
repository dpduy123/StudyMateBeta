'use client'

import { RoomTypeFiltersProps } from './types'

const roomTypes = [
  { key: 'STUDY_GROUP', label: 'Học nhóm', color: 'bg-blue-100 text-blue-700' },
  { key: 'HELP_SESSION', label: 'Hỗ trợ', color: 'bg-green-100 text-green-700' },
  { key: 'DISCUSSION', label: 'Thảo luận', color: 'bg-purple-100 text-purple-700' },
  { key: 'CASUAL', label: 'Thoải mái', color: 'bg-yellow-100 text-yellow-700' }
]

export function RoomTypeFilters({ typeFilter, onTypeFilterChange }: RoomTypeFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onTypeFilterChange('')}
        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
          typeFilter === ''
            ? 'bg-primary-100 text-primary-700'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        Tất cả loại
      </button>
      {roomTypes.map((type) => (
        <button
          key={type.key}
          onClick={() => onTypeFilterChange(type.key)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            typeFilter === type.key ? type.color : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {type.label}
        </button>
      ))}
    </div>
  )
}
