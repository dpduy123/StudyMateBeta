'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/components/providers/Providers'

export interface RoomMember {
  id: string
  userId: string
  name: string
  email: string
  avatar?: string
  university: string
  major: string
  joinedAt: string
  isMuted: boolean
  isOwner: boolean
}

export interface RoomMembersState {
  members: RoomMember[]
  totalMembers: number
  maxMembers: number
  isLoading: boolean
  error: string | null
}

export function useRoomMembers(roomId: string) {
  const { user } = useAuth()
  const [state, setState] = useState<RoomMembersState>({
    members: [],
    totalMembers: 0,
    maxMembers: 0,
    isLoading: true,
    error: null
  })

  // Fetch room members
  const fetchMembers = useCallback(async () => {
    if (!roomId || !user) return

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch(`/api/rooms/${roomId}/members`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch members')
      }

      const data = await response.json()
      setState(prev => ({
        ...prev,
        members: data.members,
        totalMembers: data.totalMembers,
        maxMembers: data.maxMembers,
        isLoading: false
      }))
    } catch (error) {
      console.error('Error fetching room members:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch members',
        isLoading: false
      }))
    }
  }, [roomId, user])

  // Join room
  const joinRoom = useCallback(async (password?: string) => {
    if (!roomId || !user) return { success: false, error: 'Missing requirements' }

    try {
      const response = await fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password })
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to join room' }
      }

      // Refresh members list
      await fetchMembers()
      return { success: true }
    } catch (error) {
      console.error('Error joining room:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to join room' 
      }
    }
  }, [roomId, user, fetchMembers])

  // Leave room
  const leaveRoom = useCallback(async () => {
    if (!roomId || !user) return { success: false, error: 'Missing requirements' }

    try {
      const response = await fetch(`/api/rooms/${roomId}/join`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to leave room' }
      }

      return { success: true }
    } catch (error) {
      console.error('Error leaving room:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to leave room' 
      }
    }
  }, [roomId, user])

  // Manage member (mute, kick, ban) - only for room owners
  const manageMember = useCallback(async (
    targetUserId: string, 
    action: 'mute' | 'unmute' | 'kick' | 'ban'
  ) => {
    if (!roomId || !user) return { success: false, error: 'Missing requirements' }

    try {
      const response = await fetch(`/api/rooms/${roomId}/members`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetUserId, action })
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || `Failed to ${action} member` }
      }

      // Refresh members list
      await fetchMembers()
      return { success: true }
    } catch (error) {
      console.error(`Error ${action}ing member:`, error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : `Failed to ${action} member` 
      }
    }
  }, [roomId, user, fetchMembers])

  // Check if current user is room owner
  const isOwner = useCallback(() => {
    if (!user) return false
    return state.members.some(member => member.userId === user.id && member.isOwner)
  }, [user, state.members])

  // Check if current user is member
  const isMember = useCallback(() => {
    if (!user) return false
    return state.members.some(member => member.userId === user.id)
  }, [user, state.members])

  // Get current user's member info
  const getCurrentMember = useCallback(() => {
    if (!user) return null
    return state.members.find(member => member.userId === user.id) || null
  }, [user, state.members])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  return {
    ...state,
    fetchMembers,
    joinRoom,
    leaveRoom,
    manageMember,
    isOwner: isOwner(),
    isMember: isMember(),
    currentMember: getCurrentMember(),
    refresh: fetchMembers
  }
}