'use client'

import { RoomFilters } from './RoomFilters'
import { RoomGrid } from './RoomGrid'
import { Room, RoomFilters as RoomFiltersType } from './types'

interface RoomListProps {
  rooms: Room[]
  isLoading: boolean
  filters: RoomFiltersType
  onFiltersChange: (filters: Partial<RoomFiltersType>) => void
  onJoinRoom: (roomId: string) => void
  onRoomDeleted?: () => void
}

export function RoomList({ 
  rooms, 
  isLoading, 
  filters, 
  onFiltersChange, 
  onJoinRoom,
  onRoomDeleted
}: RoomListProps) {
  return (
    <div>
      <RoomFilters 
        filters={filters} 
        onFiltersChange={onFiltersChange} 
      />
      
      <RoomGrid 
        rooms={rooms} 
        isLoading={isLoading} 
        onJoinRoom={onJoinRoom}
        onRoomDeleted={onRoomDeleted}
      />
    </div>
  )
}
