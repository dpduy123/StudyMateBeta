import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params

    // Create Supabase client to get the current user
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {
            // Not needed for GET request
          },
        },
      }
    )

    const {
      data: { user: currentUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        university: true,
        major: true,
        year: true,
        bio: true,
        lastActive: true,
        isProfilePublic: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if profile is public or if users have matched
    if (!user.isProfilePublic && userId !== currentUser.id) {
      // Check if users have matched
      const match = await prisma.match.findFirst({
        where: {
          OR: [
            { senderId: currentUser.id, receiverId: userId, status: 'ACCEPTED' },
            { senderId: userId, receiverId: currentUser.id, status: 'ACCEPTED' }
          ]
        }
      })

      if (!match) {
        return NextResponse.json({ 
          error: 'This profile is private and you have not matched with this user' 
        }, { status: 403 })
      }
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}