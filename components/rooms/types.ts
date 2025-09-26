export interface Room {
  id: string
  name: string
  description: string
  type: string
  topic: string
  maxMembers: number
  isPrivate: boolean
  currentMembers: number
  owner: {
    id: string
    name: string
    avatar?: string
  }
  tags: string[]
  isMember: boolean
  isOwner: boolean
  allowVideo: boolean
  allowVoice: boolean
  allowText: boolean
  allowScreenShare: boolean
  createdAt: string
  lastActivity: string
  members?: {
    id: string
    name: string
    avatar?: string
    joinedAt: string
  }[]
}

export interface RoomFilters {
  search: string
  roomFilter: 'all' | 'public' | 'my-rooms' | 'joined'
  typeFilter: string
}

export interface RoomSearchProps {
  filter: string
  onFilterChange: (filter: string) => void
}

export interface RoomFilterTabsProps {
  roomFilter: 'all' | 'public' | 'my-rooms' | 'joined'
  onRoomFilterChange: (filter: 'all' | 'public' | 'my-rooms' | 'joined') => void
}

export interface RoomTypeFiltersProps {
  typeFilter: string
  onTypeFilterChange: (filter: string) => void
}

export interface RoomGridProps {
  rooms: Room[]
  isLoading: boolean
  onJoinRoom: (roomId: string) => void
  onRoomDeleted?: () => void
}

export interface RoomCardProps {
  room: Room
  onJoinRoom: (roomId: string) => void
  onRoomDeleted?: () => void
}
