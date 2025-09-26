'use client'

import { RoomFilterTabsProps } from './types'

const filterOptions: { key: 'all' | 'public' | 'my-rooms' | 'joined', label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'public', label: 'Công khai' },
  { key: 'my-rooms', label: 'Phòng của tôi' },
  { key: 'joined', label: 'Đã tham gia' }
]

export function RoomFilterTabs({ roomFilter, onRoomFilterChange }: RoomFilterTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filterOptions.map((filterOption) => (
        <button
          key={filterOption.key}
          onClick={() => onRoomFilterChange(filterOption.key)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            roomFilter === filterOption.key
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {filterOption.label}
        </button>
      ))}
    </div>
  )
}
