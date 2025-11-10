import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      university,
      major,
      year,
      interests,
      studyGoals,
      preferredStudyTime,
      bio
    } = body

    // Validate required fields
    if (!university || !major || !year) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update user profile in database
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        university,
        major,
        year: parseInt(year),
        interests: interests || [],
        studyGoals: studyGoals || [],
        preferredStudyTime: preferredStudyTime || [],
        bio: bio || null,
        profileCompleted: true
      }
    })

    // Update Supabase user metadata to mark profile as completed
    await supabase.auth.updateUser({
      data: {
        profile_completed: true
      }
    })

    return NextResponse.json({
      success: true,
      user: updatedUser
    })
  } catch (error) {
    console.error('Error completing profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
