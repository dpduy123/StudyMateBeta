import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('Auth error in complete-profile:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('User authenticated:', user.id)

    const body = await request.json()
    const {
      university,
      major,
      year,
      interests,
      skills,
      languages,
      studyGoals,
      preferredStudyTime,
      bio
    } = body

    console.log('Received data:', { university, major, year })

    // Validate required fields
    if (!university || !major || !year) {
      console.error('Missing required fields:', { university, major, year })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Upsert user profile in database (create if doesn't exist, update if exists)
    console.log('Upserting user profile for:', user.id)
    const updatedUser = await prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.email!,
        firstName: user.user_metadata?.firstName || user.email?.split('@')[0] || 'User',
        lastName: user.user_metadata?.lastName || '',
        university,
        major,
        year: parseInt(year),
        interests: interests || [],
        skills: skills || [],
        languages: languages || [],
        studyGoals: studyGoals || [],
        preferredStudyTime: preferredStudyTime || [],
        bio: bio || null,
        profileCompleted: true
      },
      update: {
        university,
        major,
        year: parseInt(year),
        interests: interests || [],
        skills: skills || [],
        languages: languages || [],
        studyGoals: studyGoals || [],
        preferredStudyTime: preferredStudyTime || [],
        bio: bio || null,
        profileCompleted: true
      }
    })

    console.log('User profile updated successfully:', updatedUser.id)

    // Update Supabase user metadata to mark profile as completed
    console.log('Updating Supabase user metadata...')
    const { error: metadataError } = await supabase.auth.updateUser({
      data: {
        profile_completed: true
      }
    })

    if (metadataError) {
      console.error('Error updating Supabase metadata:', metadataError)
    } else {
      console.log('Supabase metadata updated successfully')
    }

    return NextResponse.json({
      success: true,
      user: updatedUser
    })
  } catch (error) {
    console.error('Error completing profile:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
