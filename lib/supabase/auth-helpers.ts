import { createClient } from '@/lib/supabase/server'
import { createUserProfile, type CreateUserData } from '@/lib/auth/user-creation'

export async function handleAuthCallback() {
  const supabase = createClient()

  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Auth callback error:', error)
      return { session: null, error }
    }

    if (session?.user) {
      // Check if user profile exists in our database
      const { user: existingUser } = await getUserProfile(session.user.id)

      if (!existingUser) {
        // Create user profile if it doesn't exist
        const userData: CreateUserData = {
          id: session.user.id,
          email: session.user.email!,
          firstName: session.user.user_metadata?.full_name?.split(' ')[0] || '',
          lastName: session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
          university: session.user.user_metadata?.university || '',
          major: session.user.user_metadata?.major || '',
          year: session.user.user_metadata?.year || 1,
        }

        const { user: newUser, error: createError } = await createUserProfile(userData)

        if (createError) {
          console.error('Error creating user profile:', createError)
          return { session, error: createError }
        }

        console.log('Created new user profile:', newUser?.id)
      }
    }

    return { session, error: null }
  } catch (error) {
    console.error('Unexpected error in auth callback:', error)
    return { session: null, error }
  }
}

// This function should be called when users complete their registration
export async function handleRegistrationComplete(userId: string, profileData: {
  university: string
  major: string
  year: number
  interests?: string[]
  skills?: string[]
}) {
  const supabase = createClient()

  try {
    // Update Supabase user metadata
    const { error: metadataError } = await supabase.auth.updateUser({
      data: {
        university: profileData.university,
        major: profileData.major,
        year: profileData.year,
        profile_completed: true,
      }
    })

    if (metadataError) {
      console.error('Error updating user metadata:', metadataError)
    }

    // Update our database
    const { user, error } = await updateUserProfile(userId, {
      university: profileData.university,
      major: profileData.major,
      year: profileData.year,
      interests: profileData.interests || [],
      skills: profileData.skills || [],
    })

    return { user, error }
  } catch (error) {
    console.error('Error completing registration:', error)
    return { user: null, error }
  }
}

// Import these functions from user-creation.ts
import { getUserProfile, updateUserProfile } from '@/lib/auth/user-creation'