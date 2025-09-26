
'use client'

import { useState, useEffect } from 'react'
import AuthGuard from '@/components/guards/AuthGuard'
import { useAuth } from '@/components/providers/Providers'
import { BottomTabNavigation, FloatingActionButton } from '@/components/ui/MobileNavigation'
import { DashboardHeader } from '@/components/ui/DashboardHeader'
import { PageLoading } from '@/components/ui/LoadingSpinner'
import { CreateRoomDialog } from '@/components/rooms/CreateRoomDialog'
import { RoomList } from '@/components/rooms/RoomList'
import { PlusIcon, VideoCameraIcon } from '@heroicons/react/24/outline'
import { Room, RoomFilters } from '@/components/rooms/types'

export default function RoomsPage() {
  const { user } = useAuth()
  const [rooms, setRooms] = useState<Room[]>([])
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([])
  const [filters, setFilters] = useState<RoomFilters>({
    search: '',
    roomFilter: 'all',
    typeFilter: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Fetch rooms from API
  const fetchRooms = async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    try {
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.roomFilter !== 'all') params.append('filter', filters.roomFilter)
      if (filters.typeFilter) params.append('type', filters.typeFilter)

      const response = await fetch(`/api/rooms?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setRooms(data.rooms)
      setFilteredRooms(data.rooms)
    } catch (error) {
      console.error('Error fetching rooms:', error)
      setError('Không thể tải danh sách phòng')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch rooms on component mount and when filters change
  useEffect(() => {
    fetchRooms()
  }, [user, filters.roomFilter, filters.typeFilter])

  // Client-side search filter
  useEffect(() => {
    if (!filters.search.trim()) {
      setFilteredRooms(rooms)
    } else {
      const filtered = rooms.filter(
        (room) =>
          room.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          room.topic.toLowerCase().includes(filters.search.toLowerCase()) ||
          room.description.toLowerCase().includes(filters.search.toLowerCase()) ||
          room.tags.some((tag) => tag.toLowerCase().includes(filters.search.toLowerCase())) ||
          room.owner.name.toLowerCase().includes(filters.search.toLowerCase())
      )
      setFilteredRooms(filtered)
    }
  }, [filters.search, rooms])

  // Handle join room
  const handleJoinRoom = async (roomId: string) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        // Refresh rooms data
        fetchRooms()
      } else {
        const error = await response.json()
        alert(error.error || 'Không thể tham gia phòng')
      }
    } catch (error) {
      console.error('Error joining room:', error)
      alert('Có lỗi xảy ra khi tham gia phòng')
    }
  }

  if (isLoading) {
    return <PageLoading />
  }

  if (error) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <VideoCameraIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Không thể tải phòng</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader
        title="Phòng học"
        description="Tham gia và tạo phòng học nhóm"
        icon={VideoCameraIcon}
        currentPage="/rooms"

      />

      {/* Create Button */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2 mobile-safe-area flex justify-end">
          <button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Tạo phòng mới</span>
          </button> 
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2 mobile-safe-area">
        <RoomList 
          rooms={filteredRooms}
          isLoading={isLoading}
          filters={filters}
          onFiltersChange={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))}
          onJoinRoom={handleJoinRoom}
          onRoomDeleted={fetchRooms}
        />
      </div>

      {/* Create Room Dialog */}
      <CreateRoomDialog 
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={fetchRooms}
      />

      {/* Mobile Navigation */}
      <BottomTabNavigation />
      <FloatingActionButton />
      </div>
    </AuthGuard>
  )
}
