import { createClient } from '@/lib/supabase/client'

export async function checkEmailExists(email: string): Promise<{
  exists: boolean
  error?: string
}> {
  try {
    const supabase = createClient()

    // Try to trigger password reset for the email
    // If email doesn't exist, Supabase will return an error
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/auth/reset-password',
    })

    if (error) {
      // If error is "Email not confirmed", user exists but not verified
      if (error.message.includes('Email not confirmed') ||
          error.message.includes('not confirmed')) {
        return { exists: true }
      }

      // If error is "User not found" or similar, email doesn't exist
      if (error.message.includes('User not found') ||
          error.message.includes('not found') ||
          error.message.includes('Invalid email')) {
        return { exists: false }
      }

      // Other errors might indicate the email exists
      return { exists: true }
    }

    // No error means email exists and reset was sent
    return { exists: true }
  } catch (error) {
    console.error('Error checking email:', error)
    return { exists: false, error: 'Unable to check email' }
  }
}

export async function validateEmailAvailability(email: string): Promise<{
  available: boolean
  message: string
}> {
  const { exists, error } = await checkEmailExists(email)

  if (error) {
    return {
      available: true, // Allow signup if we can't check
      message: 'Không thể kiểm tra email, tiếp tục đăng ký'
    }
  }

  if (exists) {
    return {
      available: false,
      message: 'Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.'
    }
  }

  return {
    available: true,
    message: 'Email có thể sử dụng'
  }
}