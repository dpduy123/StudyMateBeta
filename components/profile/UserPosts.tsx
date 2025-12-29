'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  NewspaperIcon,
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'

interface Post {
  id: string
  content: string
  imageUrl: string | null
  createdAt: string
  isLiked: boolean
  likesCount: number
  commentsCount: number
}

interface UserPostsProps {
  userId: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Vừa xong'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`
  return `${Math.floor(diffInSeconds / 2592000)} tháng trước`
}

function PostCard({ post, onLike }: { post: Post; onLike: (postId: string) => void }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {/* Post Content */}
      <p className="text-gray-800 whitespace-pre-wrap mb-3">{post.content}</p>

      {/* Post Image */}
      {post.imageUrl && (
        <div className="relative w-full mb-3 rounded-lg overflow-hidden">
          <img
            src={post.imageUrl}
            alt="Post image"
            className="w-full object-cover max-h-[300px]"
          />
        </div>
      )}

      {/* Post Stats & Actions */}
      <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onLike(post.id)}
            className={`flex items-center space-x-1 hover:text-red-500 transition-colors ${
              post.isLiked ? 'text-red-500' : ''
            }`}
          >
            {post.isLiked ? (
              <HeartSolidIcon className="h-5 w-5" />
            ) : (
              <HeartIcon className="h-5 w-5" />
            )}
            <span>{post.likesCount}</span>
          </button>
          <div className="flex items-center space-x-1">
            <ChatBubbleLeftIcon className="h-5 w-5" />
            <span>{post.commentsCount}</span>
          </div>
        </div>
        <span className="text-xs">{formatTimeAgo(post.createdAt)}</span>
      </div>
    </div>
  )
}

export function UserPosts({ userId }: UserPostsProps) {
  const { data, error, mutate } = useSWR<{ posts: Post[] }>(
    `/api/posts?userId=${userId}`,
    fetcher
  )

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
      })

      if (response.ok) {
        const { liked, likesCount } = await response.json()
        mutate((current) => ({
          posts: current?.posts.map((post) =>
            post.id === postId
              ? { ...post, isLiked: liked, likesCount }
              : post
          ) || [],
        }), false)
      }
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const posts = data?.posts || []

  if (error) {
    return (
      <div className="text-center py-8 text-gray-500">
        Không thể tải bài viết
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
        <NewspaperIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Chưa có bài viết nào</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onLike={handleLike} />
      ))}
    </motion.div>
  )
}
