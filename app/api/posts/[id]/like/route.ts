import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'

// POST: Toggle like on a post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {},
        },
      }
    )

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: postId } = await params

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json({ error: 'Bài viết không tồn tại' }, { status: 404 })
    }

    // Check if already liked
    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: user.id,
        },
      },
    })

    if (existingLike) {
      // Unlike
      await prisma.postLike.delete({
        where: { id: existingLike.id },
      })

      const likesCount = await prisma.postLike.count({
        where: { postId },
      })

      return NextResponse.json({
        liked: false,
        likesCount,
      })
    } else {
      // Like
      await prisma.postLike.create({
        data: {
          postId,
          userId: user.id,
        },
      })

      const likesCount = await prisma.postLike.count({
        where: { postId },
      })

      return NextResponse.json({
        liked: true,
        likesCount,
      })
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
