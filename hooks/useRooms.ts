'use client'

import useSWR from 'swr'
import { useState, useMemo } from 'react'

const fetcher = async (url: string) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

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

export function useRooms(filters?: Partial<RoomFilters>) {
  // Build query parameters
  const params = new URLSearchParams()
  if (filters?.roomFilter && filters.roomFilter !== 'all') {
    // Map 'public' to the correct API parameter if needed
    const filterValue = filters.roomFilter === 'public' ? 'all' : filters.roomFilter
    params.append('filter', filterValue)
  }
  if (filters?.typeFilter) {
    params.append('type', filters.typeFilter)
  }

  const queryString = params.toString()
  const apiUrl = `/api/rooms${queryString ? `?${queryString}` : ''}`

  const { data, error, isLoading, mutate } = useSWR(
    apiUrl,
    fetcher,
    {
      // Cache for 2 minutes (rooms data changes more frequently)
      dedupingInterval: 2 * 60 * 1000,
      // Revalidate when window focuses
      revalidateOnFocus: true,
      // Revalidate when reconnects
      revalidateOnReconnect: true,
      // Retry on error
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  )

  return {
    rooms: data?.rooms || [],
    isLoading,
    error,
    refetch: mutate,
  }
}

// Hook for client-side search filtering
export function useFilteredRooms(rooms: Room[], searchQuery: string) {
  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) {
      return rooms
    }

    const query = searchQuery.toLowerCase()
    return rooms.filter(
      (room) =>
        room.name.toLowerCase().includes(query) ||
        room.topic.toLowerCase().includes(query) ||
        room.description.toLowerCase().includes(query) ||
        room.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        room.owner.name.toLowerCase().includes(query)
    )
  }, [rooms, searchQuery])

  return filteredRooms
}

// Hook for joining rooms
export function useJoinRoom() {
  const [isJoining, setIsJoining] = useState(false)

  const joinRoom = async (roomId: string) => {
    setIsJoining(true)
    try {
      const response = await fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Không thể tham gia phòng')
      }

      return await response.json()
    } catch (error) {
      throw error
    } finally {
      setIsJoining(false)
    }
  }

  return {
    joinRoom,
    isJoining,
  }
}