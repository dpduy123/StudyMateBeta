import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check profile completion status from database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        profileCompleted: true,
        university: true,
        major: true,
        year: true
      }
    })

    // Profile is completed if:
    // 1. User exists in database with profileCompleted = true
    // 2. OR has required fields filled (university, major, year)
    const profileCompleted = dbUser?.profileCompleted ||
      (dbUser?.university && dbUser?.major && dbUser?.year) ||
      user.user_metadata?.profile_completed === true

    return NextResponse.json({
      profileCompleted: !!profileCompleted,
      hasProfile: !!dbUser
    })
  } catch (error) {
    console.error('Error checking profile status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
