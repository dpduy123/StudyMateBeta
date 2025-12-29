import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'

// GET: Fetch posts for news feed
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor')
    const limit = parseInt(searchParams.get('limit') || '10')
    const userId = searchParams.get('userId')

    // Fetch posts with author info, likes count, comments count
    const posts = await prisma.post.findMany({
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      ...(userId && {
        where: { authorId: userId },
      }),
      orderBy: { createdAt: 'desc' },
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
        likes: {
          select: {
            userId: true,
          },
        },
        comments: {
          take: 3,
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    })

    let nextCursor: string | undefined = undefined
    if (posts.length > limit) {
      const nextItem = posts.pop()
      nextCursor = nextItem?.id
    }

    // Transform posts to include isLiked flag
    const transformedPosts = posts.map((post) => ({
      ...post,
      isLiked: post.likes.some((like) => like.userId === user.id),
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
    }))

    return NextResponse.json({
      posts: transformedPosts,
      nextCursor,
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Create a new post
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { content, imageUrl } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Nội dung không được để trống' }, { status: 400 })
    }

    if (content.length > 3000) {
      return NextResponse.json({ error: 'Nội dung quá dài (tối đa 3000 ký tự)' }, { status: 400 })
    }

    const post = await prisma.post.create({
      data: {
        authorId: user.id,
        content: content.trim(),
        imageUrl: imageUrl || null,
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
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    })

    return NextResponse.json({
      post: {
        ...post,
        isLiked: false,
        likesCount: 0,
        commentsCount: 0,
        likes: [],
        comments: [],
      },
    })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
