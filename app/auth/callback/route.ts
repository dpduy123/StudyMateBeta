import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { handleAuthCallback } from '@/lib/supabase/auth-helpers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin
  const redirectTo = requestUrl.searchParams.get('redirect_to') ?? '/dashboard'

  if (code) {
    const supabase = createClient()

    try {
      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('Code exchange error:', error)
        return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
      }

      // Handle user profile creation/update
      const { session, error: callbackError } = await handleAuthCallback()

      if (callbackError) {
        console.error('Auth callback error:', callbackError)
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