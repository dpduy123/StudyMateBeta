'use client'

import { useState, useEffect, useCallback } from 'react'
import { UserProfile } from '@/components/profile/types'
import { useAuth } from '@/components/providers/Providers'

export function useProfile() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      const profileData: UserProfile = {
        id: data.profile.id,
        firstName: data.profile.firstName,
        lastName: data.profile.lastName,
        email: data.profile.email,
        avatar: data.profile.avatar,
        bio: data.profile.bio,
        university: data.profile.university,
        major: data.profile.major,
        year: data.profile.year,
        gpa: data.profile.gpa,
        interests: data.profile.interests || [],
        skills: data.profile.skills || [],
        studyGoals: data.profile.studyGoals || [],
        preferredStudyTime: data.profile.preferredStudyTime || [],
        languages: data.profile.languages || [],
        totalMatches: data.profile.totalMatches || 0,
        successfulMatches: data.profile.successfulMatches || 0,
        averageRating: data.profile.averageRating || 0,
        createdAt: data.profile.createdAt,
      }

      setProfile(profileData)
    } catch (err) {
      console.error('Profile fetch error:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch profile'))
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Fetch profile when auth is complete and user exists
  useEffect(() => {
    if (!authLoading) {
      fetchProfile()
    }
  }, [authLoading, fetchProfile])

  const updateProfile = useCallback((updatedData: Partial<UserProfile>) => {
    if (profile) {
      setProfile({ ...profile, ...updatedData })
    }
  }, [profile])

  const clearProfile = useCallback(() => {
    setProfile(null)
  }, [])

  return {
    profile,
    isLoading: authLoading || isLoading,
    error,
    updateProfile,
    clearProfile,
    refetch: fetchProfile,
  }
}
