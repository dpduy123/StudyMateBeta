import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createUserProfile, getUserProfile } from '@/lib/auth/user-creation'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { fullName, university, major, year } = body

    // Parse full name
    const nameParts = fullName?.split(' ') || ['', '']
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    // Check if user already exists
    const { user: existingUser } = await getUserProfile(user.id)

    if (existingUser) {
      return NextResponse.json(
        { message: 'User profile already exists', user: existingUser },
        { status: 409 }
      )
    }

    // Create user profile in our database
    const { user: createdUser, error } = await createUserProfile({
      id: user.id,
      email: user.email!,
      firstName,
      lastName,
      university: university || '',
      major: major || '',
      year: year || 1,
    })

    if (error) {
      console.error('Error creating user profile:', error)
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: createdUser,
    })
  } catch (error) {
    console.error('Unexpected error in create-profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}