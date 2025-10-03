
'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers/Providers'
import { BottomTabNavigation, FloatingActionButton } from '@/components/ui/MobileNavigation'
import { DashboardHeader } from '@/components/ui/DashboardHeader'
import { PageLoading } from '@/components/ui/LoadingSpinner'
import { CreateRoomDialog } from '@/components/rooms/CreateRoomDialog'
import { RoomList } from '@/components/rooms/RoomList'
import { PlusIcon, VideoCameraIcon } from '@heroicons/react/24/outline'
import { useRooms, useFilteredRooms, useJoinRoom, Room, RoomFilters } from '@/hooks/useRooms'

export default function RoomsPage() {
  const { user } = useAuth()
  const [filters, setFilters] = useState<RoomFilters>({
    search: '',
    roomFilter: 'all',
    typeFilter: ''
  })
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Use SWR hooks for data fetching
  const { rooms, isLoading, error, refetch } = useRooms({
    roomFilter: filters.roomFilter,
    typeFilter: filters.typeFilter
  })

  // Client-side search filtering
  const filteredRooms = useFilteredRooms(rooms, filters.search)

  // Join room hook
  const { joinRoom, isJoining } = useJoinRoom()

  // Handle join room
  const handleJoinRoom = async (roomId: string) => {
    try {
      await joinRoom(roomId)
      // Refresh rooms data after successful join
      refetch()
    } catch (error: any) {
      alert(error.message || 'Đã xảy ra lỗi khi tham gia phòng')
    }
  }


  if (error) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <VideoCameraIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Không thể tải phòng</h2>
            <p className="text-gray-600 mb-4">{error.message || 'Đã xảy ra lỗi'}</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
    )
  }

  return (
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader
        title="Phòng học"
        description="Tham gia và tạo phòng học nhóm"
        icon={VideoCameraIcon}
        currentPage="/rooms"

      />

      {/* Create Button */}
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8 py-2 mobile-safe-area flex justify-end">
          <button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="btn-primary flex items-center space-x-2 text-sm sm:text-base px-3 sm:px-4 py-2"
          >
            <PlusIcon className="h-4 sm:h-5 w-4 sm:w-5" />
            <span className="hidden sm:inline">Tạo phòng mới</span>
            <span className="sm:hidden">Tạo</span>
          </button> 
      </div>

      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8 py-2 mobile-safe-area">
        <RoomList 
          rooms={filteredRooms}
          isLoading={isLoading}
          filters={filters}
          onFiltersChange={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))}
          onJoinRoom={handleJoinRoom}
          onRoomDeleted={refetch}
        />
      </div>

      {/* Create Room Dialog */}
      <CreateRoomDialog 
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={refetch}
      />

      {/* Mobile Navigation */}
      <BottomTabNavigation />
      <FloatingActionButton />
      </div>
  )
}
