// Tool: Get User Profile

import { prisma } from '@/lib/prisma'

interface GetProfileArgs {
  userId: string
}

interface ProfileResult {
  id: string
  name: string
  university: string
  major: string
  year: number
  bio: string | null
  interests: string[]
  skills: string[]
  studyGoals: string[]
  preferredStudyTime: string[]
  languages: string[]
  totalMatches: number
  successfulMatches: number
  averageRating: number
  isOnline: boolean
}

export async function getUserProfile(
  args: Record<string, unknown>,
  currentUserId: string
): Promise<{ profile: ProfileResult | null; message: string }> {
  const userId = (args.userId as string) || ''

  console.log(`👤 [Chatbot Tool] Getting profile: ${userId}`)

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        university: true,
        major: true,
        year: true,
        bio: true,
        interests: true,
        skills: true,
        studyGoals: true,
        preferredStudyTime: true,
        languages: true,
        totalMatches: true,
        successfulMatches: true,
        averageRating: true,
        lastActive: true,
        isProfilePublic: true
      }
    })

    if (!user) {
      return {
        profile: null,
        message: 'Không tìm thấy người dùng này.'
      }
    }

    // Check if profile is public (unless viewing own profile)
    if (!user.isProfilePublic && user.id !== currentUserId) {
      return {
        profile: null,
        message: 'Profile này đã được ẩn.'
      }
    }

    const isOnline = user.lastActive > new Date(Date.now() - 5 * 60 * 1000) // 5 minutes

    const profile: ProfileResult = {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      university: user.university,
      major: user.major,
      year: user.year,
      bio: user.bio,
      interests: user.interests,
      skills: user.skills,
      studyGoals: user.studyGoals,
      preferredStudyTime: user.preferredStudyTime,
      languages: user.languages,
      totalMatches: user.totalMatches,
      successfulMatches: user.successfulMatches,
      averageRating: user.averageRating,
      isOnline
    }

    console.log(`✅ [Chatbot Tool] Profile retrieved: ${profile.name}`)

    return {
      profile,
      message: `Thông tin của ${profile.name}`
    }
  } catch (error) {
    console.error('❌ [Chatbot Tool] Get profile error:', error)
    throw new Error('Không thể lấy thông tin người dùng lúc này.')
  }
}
