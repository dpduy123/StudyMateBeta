import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export interface CreateUserData {
  id: string
  email: string
  firstName: string
  lastName: string
  university?: string
  major?: string
  year?: number
}

export async function createUserProfile(userData: CreateUserData) {
  try {
    const user = await prisma.user.create({
      data: {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        university: userData.university || '',
        major: userData.major || '',
        year: userData.year || 1,
        emailVerified: new Date(),
      },
    })

    return { user, error: null }
  } catch (error) {
    console.error('Error creating user profile:', error)
    return { user: null, error }
  }
}

export async function getUserProfile(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userBadges: {
          include: {
            badge: true,
          },
        },
        achievements: {
          include: {
            achievement: true,
          },
        },
      },
    })

    return { user, error: null }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return { user: null, error }
  }
}

export async function updateUserProfile(userId: string, data: Partial<CreateUserData>) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    })

    return { user, error: null }
  } catch (error) {
    console.error('Error updating user profile:', error)
    return { user: null, error }
  }
}