'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/Providers'
import { UserProfile } from '@/components/profile/types'

let globalProfile: UserProfile | null = null
let globalLoadingState = false
let globalError: string | null = null

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(globalProfile)
  const [isLoading, setIsLoading] = useState(globalLoadingState)
  const [error, setError] = useState<string | null>(globalError)

  const fetchProfile = async (force = false) => {
    // If we already have profile and not forcing refresh, don't fetch
    if (globalProfile && !force) {
      setProfile(globalProfile)
      setIsLoading(false)
      return globalProfile
    }

    if (globalLoadingState) return null

    globalLoadingState = true
    setIsLoading(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
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
          createdAt: data.profile.createdAt
        }

        // Update global cache
        globalProfile = profileData
        globalError = null

        // Update local state
        setProfile(profileData)
        setError(null)

        return profileData
      } else {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profile'

      globalError = errorMessage
      setError(errorMessage)

      return null
    } finally {
      globalLoadingState = false
      setIsLoading(false)
    }
  }

  const clearProfile = () => {
    globalProfile = null
    globalError = null
    setProfile(null)
    setError(null)
  }

  const updateProfile = (updatedData: Partial<UserProfile>) => {
    if (globalProfile) {
      globalProfile = { ...globalProfile, ...updatedData }
      setProfile(globalProfile)
    }
  }

  // Fetch profile when component mounts and we don't have cached data
  useEffect(() => {
    if (!globalProfile && !globalLoadingState) {
      fetchProfile()
    } else if (globalProfile) {
      // We have cached data, use it immediately
      setProfile(globalProfile)
      setIsLoading(false)
      setError(globalError)
    }
  }, [])

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    clearProfile,
    updateProfile,
    refetch: () => fetchProfile(true)
  }
}