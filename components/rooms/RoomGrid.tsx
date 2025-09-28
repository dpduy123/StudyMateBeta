'use client'

import { motion } from 'framer-motion'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { Room } from '@/hooks/useRooms'
import RoomCard from './RoomCard'

interface RoomGridProps {
  rooms: Room[]
  isLoading: boolean
  onJoinRoom: (roomId: string) => void
  onRoomDeleted?: () => void
}

export function RoomGrid({ rooms, isLoading, onJoinRoom, onRoomDeleted }: RoomGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              
              <div className="h-4 bg-gray-200 rounded mb-4 w-full"></div>
              <div className="h-4 bg-gray-200 rounded mb-4 w-2/3"></div>
              
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-5 w-5 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>

              <div className="flex items-center space-x-3 mb-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-1">
                    <div className="h-4 w-4 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-10"></div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-6 bg-gray-200 rounded-full w-16"></div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center py-16">
        <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900">Không tìm thấy phòng</h3>
        <p className="text-gray-600">Hãy thử từ khóa khác hoặc tạo phòng của riêng bạn.</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {rooms.map((room, index) => (
        <motion.div
          key={room.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <RoomCard room={room} onJoinRoom={onJoinRoom} onRoomDeleted={onRoomDeleted} />
        </motion.div>
      ))}
    </motion.div>
  )
}
