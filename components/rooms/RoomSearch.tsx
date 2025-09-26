'use client'

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { RoomSearchProps } from './types'

export function RoomSearch({ filter, onFilterChange }: RoomSearchProps) {
  return (
    <div className="relative flex-grow">
      <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input
        type="text"
        placeholder="Tìm kiếm phòng, chủ đề, hoặc tag..."
        value={filter}
        onChange={(e) => onFilterChange(e.target.value)}
        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
    </div>
  )
}
