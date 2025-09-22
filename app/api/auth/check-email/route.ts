import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if email exists in Supabase Auth
    // Note: This is a workaround since Supabase doesn't provide a direct way to check email existence
    // We'll try to sign up with a dummy password and catch the error
    const { error } = await supabase.auth.signUp({
      email: email,
      password: 'dummy_password_for_check_only',
      options: {
        data: { check_only: true }
      }
    })

    // If error contains "already registered", email exists
    if (error && error.message.includes('already registered')) {
      return NextResponse.json({
        exists: true,
        message: 'Email đã được sử dụng'
      })
    }

    // If no error or different error, email is available
    return NextResponse.json({
      exists: false,
      message: 'Email có thể sử dụng'
    })

  } catch (error) {
    console.error('Error checking email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}