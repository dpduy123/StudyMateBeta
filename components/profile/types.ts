import { University, Major } from '@/lib/data/universities'

export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  bio?: string
  university: string
  major: string
  year: number
  gpa?: number
  interests: string[]
  skills: string[]
  studyGoals: string[]
  preferredStudyTime: string[]
  languages: string[]
  totalMatches: number
  successfulMatches: number
  averageRating: number
  createdAt: string
  // Additional info from API
  universityInfo?: University
  majorInfo?: Major
}

export interface EditProfileFormData {
  firstName: string
  lastName: string
  bio: string
  university: string
  major: string
  year: number
  gpa: string
  interests: string[]
  skills: string[]
  studyGoals: string[]
  preferredStudyTime: string[]
  languages: string[]
}