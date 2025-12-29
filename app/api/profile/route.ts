import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { getUniversityById, getMajorById } from '@/lib/data/universities'

export async function GET() {
  try {
    // Create Supabase client to get the current user
    const supabase = await createClient()

    // Get current user from Supabase
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch user profile from database
    const profile = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        bio: true,
        university: true,
        major: true,
        year: true,
        gpa: true,
        interests: true,
        skills: true,
        studyGoals: true,
        preferredStudyTime: true,
        languages: true,
        totalMatches: true,
        successfulMatches: true,
        averageRating: true,
        createdAt: true,
      },
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Get full university and major information
    const universityInfo = profile.university ? getUniversityById(profile.university) : null
    const majorInfo = profile.major ? getMajorById(profile.major) : null

    // Return profile with full university and major details
    const profileWithDetails = {
      ...profile,
      universityInfo,
      majorInfo
    }

    return NextResponse.json({ profile: profileWithDetails })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Create Supabase client to get the current user
    const supabase = await createClient()

    // Get current user from Supabase
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      firstName,
      lastName,
      bio,
      university,
      major,
      year,
      gpa,
      interests,
      skills,
      studyGoals,
      preferredStudyTime,
      languages,
      avatar,
    } = body

    console.log('Updating profile with avatar:', avatar)

    // Update user profile in database
    const updatedProfile = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        firstName,
        lastName,
        bio,
        avatar,
        university,
        major,
        year: parseInt(year),
        gpa: gpa ? parseFloat(gpa) : null,
        interests: interests || [],
        skills: skills || [],
        studyGoals: studyGoals || [],
        preferredStudyTime: preferredStudyTime || [],
        languages: languages || [],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        bio: true,
        university: true,
        major: true,
        year: true,
        gpa: true,
        interests: true,
        skills: true,
        studyGoals: true,
        preferredStudyTime: true,
        languages: true,
        totalMatches: true,
        successfulMatches: true,
        averageRating: true,
        createdAt: true,
      },
    })

    console.log('Profile updated successfully, avatar field:', updatedProfile.avatar)
    return NextResponse.json({ profile: updatedProfile })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}