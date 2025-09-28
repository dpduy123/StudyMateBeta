import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'

const ADMIN_EMAILS = ['23560004@gm.uit.edu.vn']

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params

    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {
            // Not needed for PATCH request
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

    // Check admin permissions
    if (!ADMIN_EMAILS.includes(currentUser.email || '')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { status, subscriptionTier, isProfilePublic } = body

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(status && { status }),
        ...(subscriptionTier && { subscriptionTier }),
        ...(isProfilePublic !== undefined && { isProfilePublic })
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        subscriptionTier: true,
        isProfilePublic: true
      }
    })

    return NextResponse.json({ user: updatedUser })

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params

    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {
            // Not needed for DELETE request
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

    // Check admin permissions
    if (!ADMIN_EMAILS.includes(currentUser.email || '')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Prevent self-deletion
    if (userId === currentUser.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    // Delete user from database (this will cascade delete related records)
    await prisma.user.delete({
      where: { id: userId }
    })

    // Note: You might also want to delete the user from Supabase auth
    // This requires the service role key and admin API
    // const { error } = await supabase.auth.admin.deleteUser(userId)

    return NextResponse.json({ message: 'User deleted successfully' })

  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}