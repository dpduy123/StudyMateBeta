'use client'

import { RoomFilters as RoomFiltersType } from '@/hooks/useRooms'
import { RoomSearch } from './RoomSearch'
import { RoomFilterTabs } from './RoomFilterTabs'
import { RoomTypeFilters } from './RoomTypeFilters'

interface RoomFiltersProps {
  filters: RoomFiltersType
  onFiltersChange: (filters: Partial<RoomFiltersType>) => void
}

export function RoomFilters({ filters, onFiltersChange }: RoomFiltersProps) {
  return (
    <div className="mb-4 sm:mb-8 space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <RoomSearch 
          filter={filters.search} 
          onFilterChange={(search) => onFiltersChange({ search })} 
        />
      </div>

      <RoomFilterTabs 
        roomFilter={filters.roomFilter} 
        onRoomFilterChange={(roomFilter) => onFiltersChange({ roomFilter })} 
      />

      <RoomTypeFilters 
        typeFilter={filters.typeFilter} 
        onTypeFilterChange={(typeFilter) => onFiltersChange({ typeFilter })} 
      />
    </div>
  )
}
