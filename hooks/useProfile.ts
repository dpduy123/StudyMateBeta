'use client'

import useSWR from 'swr'
import { UserProfile } from '@/components/profile/types'

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

  const data = await response.json()

  // Transform API response to UserProfile format
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

  return profileData
}

export function useProfile() {
  const { data: profile, error, isLoading, mutate } = useSWR<UserProfile>(
    '/api/profile',
    fetcher,
    {
      // Cache for 10 minutes (profile data doesn't change frequently)
      dedupingInterval: 10 * 60 * 1000,
      // Don't revalidate on focus (profile is fairly static)
      revalidateOnFocus: false,
      // Revalidate when reconnects
      revalidateOnReconnect: true,
      // Retry on error
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  )

  // Helper functions for profile operations
  const updateProfile = async (updatedData: Partial<UserProfile>) => {
    if (profile) {
      // Optimistically update the cache
      mutate({ ...profile, ...updatedData }, false)
    }
  }

  const clearProfile = () => {
    mutate(undefined, false)
  }

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    clearProfile,
    refetch: mutate
  }
}