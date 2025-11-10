import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin
  const redirectTo = requestUrl.searchParams.get('redirect_to') ?? null

  if (code) {
    const supabase = await createClient()

    try {
      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('Code exchange error:', error)
        return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
      }

      // Get the session after code exchange
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session?.user) {
        console.error('Session error:', sessionError)
        return NextResponse.redirect(`${origin}/auth/login?error=session_failed`)
      }

      // Try to create user profile (will only create if doesn't exist)
      let isNewUser = false
      try {
        // Import prisma directly since we're in a route handler (not edge runtime)
        const prisma = (await import('@/lib/prisma')).default
        
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { id: session.user.id }
        })

        if (!existingUser) {
          // Create new user profile
          await prisma.user.create({
            data: {
              id: session.user.id,
              email: session.user.email!,
              firstName: session.user.user_metadata?.full_name?.split(' ')[0] || '',
              lastName: session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
              university: '',
              major: '',
              year: 1,
              profileCompleted: false,
            }
          })
          isNewUser = true
          console.log('✅ Created new user profile:', session.user.email)
        } else {
          console.log('ℹ️ User profile already exists:', session.user.email)
        }
      } catch (error) {
        console.error('Error creating user profile:', error)
        // Don't fail the login, just log the error
      }

      // Update user metadata to mark profile as incomplete for new users
      if (isNewUser) {
        await supabase.auth.updateUser({
          data: {
            profile_completed: false
          }
        })
      }

      // Successful authentication
      // If new user, redirect to onboarding, otherwise to requested page or dashboard
      if (isNewUser) {
        return NextResponse.redirect(`${origin}/onboarding`)
      }
      return NextResponse.redirect(`${origin}${redirectTo || '/dashboard'}`)
    } catch (error) {
      console.error('Unexpected error in auth callback:', error)
      return NextResponse.redirect(`${origin}/auth/login?error=unexpected_error`)
    }
  }

  // No code present, redirect to login
  return NextResponse.redirect(`${origin}/auth/login?error=no_code`)
}