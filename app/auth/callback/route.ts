import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin
  const redirectTo = requestUrl.searchParams.get('redirect_to') ?? '/dashboard'

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
      try {
        const response = await fetch(`${origin}/api/auth/create-profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            fullName: session.user.user_metadata?.full_name || '',
            university: '',
            major: '',
            year: 1,
          }),
        })

        if (!response.ok && response.status !== 409) { // 409 = user already exists
          console.error('Failed to create user profile:', await response.text())
        }
      } catch (error) {
        console.error('Error creating user profile:', error)
        // Don't fail the login, just log the error
      }

      // Successful authentication
      return NextResponse.redirect(`${origin}${redirectTo}`)
    } catch (error) {
      console.error('Unexpected error in auth callback:', error)
      return NextResponse.redirect(`${origin}/auth/login?error=unexpected_error`)
    }
  }

  // No code present, redirect to login
  return NextResponse.redirect(`${origin}/auth/login?error=no_code`)
}