import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'

// GET: Get comments for a post
export async function GET(
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
    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor')
    const limit = parseInt(searchParams.get('limit') || '20')

    const comments = await prisma.postComment.findMany({
      where: { postId },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            university: true,
            major: true,
          },
        },
      },
    })

    let nextCursor: string | undefined = undefined
    if (comments.length > limit) {
      const nextItem = comments.pop()
      nextCursor = nextItem?.id
    }

    return NextResponse.json({
      comments,
      nextCursor,
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Create a new comment
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
    const body = await request.json()
    const { content } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Nội dung bình luận không được để trống' }, { status: 400 })
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: 'Bình luận quá dài (tối đa 1000 ký tự)' }, { status: 400 })
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json({ error: 'Bài viết không tồn tại' }, { status: 404 })
    }

    const comment = await prisma.postComment.create({
      data: {
        postId,
        authorId: user.id,
        content: content.trim(),
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            university: true,
            major: true,
          },
        },
      },
    })

    const commentsCount = await prisma.postComment.count({
      where: { postId },
    })

    return NextResponse.json({
      comment,
      commentsCount,
    })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
