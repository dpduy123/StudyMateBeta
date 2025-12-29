'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import useSWR, { mutate } from 'swr'
import AuthGuard from '@/components/guards/AuthGuard'
import { useAuth } from '@/components/providers/Providers'
import { BottomTabNavigation } from '@/components/ui/MobileNavigation'
import { DashboardHeader } from '@/components/ui/DashboardHeader'
import {
  PhotoIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  EllipsisHorizontalIcon,
  NewspaperIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'

interface Author {
  id: string
  firstName: string
  lastName: string
  avatar: string | null
  university: string
  major: string
}

interface Comment {
  id: string
  content: string
  createdAt: string
  author: Author
}

interface Post {
  id: string
  content: string
  imageUrl: string | null
  createdAt: string
  author: Author
  isLiked: boolean
  likesCount: number
  commentsCount: number
  comments: Comment[]
}

interface SuggestedUser {
  id: string
  firstName: string
  lastName: string
  avatar: string | null
  university: string
  major: string
  year: number
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

function PostCard({ post, onLike, onComment }: { post: Post; onLike: (postId: string) => void; onComment: (postId: string, content: string) => void }) {
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitComment = async () => {
    if (!commentText.trim() || isSubmitting) return
    setIsSubmitting(true)
    await onComment(post.id, commentText.trim())
    setCommentText('')
    setIsSubmitting(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
    >
      {/* Post Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              {post.author.avatar ? (
                <img
                  src={post.author.avatar}
                  alt={`${post.author.firstName} ${post.author.lastName}`}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {post.author.firstName[0]}{post.author.lastName[0]}
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {post.author.firstName} {post.author.lastName}
              </h3>
              <p className="text-sm text-gray-500">{post.author.major} - {post.author.university}</p>
              <p className="text-xs text-gray-400">{formatTimeAgo(post.createdAt)}</p>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Post Image */}
      {post.imageUrl && (
        <div className="relative w-full">
          <img
            src={post.imageUrl}
            alt="Post image"
            className="w-full object-cover max-h-[500px]"
          />
        </div>
      )}

      {/* Post Stats */}
      <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-500 border-t border-gray-100">
        <div className="flex items-center space-x-1">
          <HeartSolidIcon className="h-4 w-4 text-red-500" />
          <span>{post.likesCount} lượt thích</span>
        </div>
        <button
          onClick={() => setShowComments(!showComments)}
          className="hover:text-primary-600 hover:underline"
        >
          {post.commentsCount} bình luận
        </button>
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-2 flex items-center justify-around border-t border-gray-100">
        <button
          onClick={() => onLike(post.id)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
            post.isLiked ? 'text-red-500' : 'text-gray-600'
          }`}
        >
          {post.isLiked ? (
            <HeartSolidIcon className="h-5 w-5" />
          ) : (
            <HeartIcon className="h-5 w-5" />
          )}
          <span className="font-medium">Thích</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
        >
          <ChatBubbleLeftIcon className="h-5 w-5" />
          <span className="font-medium">Bình luận</span>
        </button>
        <button className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600">
          <ShareIcon className="h-5 w-5" />
          <span className="font-medium hidden sm:inline">Chia sẻ</span>
        </button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-100 overflow-hidden"
          >
            {/* Comment Input */}
            <div className="p-4 flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                U
              </div>
              <div className="flex-1 flex items-center space-x-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
                  placeholder="Viết bình luận..."
                  className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim() || isSubmitting}
                  className="p-2 text-primary-600 hover:bg-primary-50 rounded-full transition-colors disabled:opacity-50"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Comments List */}
            {post.comments.length > 0 && (
              <div className="px-4 pb-4 space-y-3">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex items-start space-x-3">
                    {comment.author.avatar ? (
                      <img
                        src={comment.author.avatar}
                        alt={`${comment.author.firstName} ${comment.author.lastName}`}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {comment.author.firstName[0]}{comment.author.lastName[0]}
                      </div>
                    )}
                    <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2">
                      <p className="font-semibold text-sm text-gray-900">
                        {comment.author.firstName} {comment.author.lastName}
                      </p>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(comment.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function CreatePostBox({ onPost, userAvatar }: { onPost: (content: string, imageUrl?: string) => void; userAvatar?: string }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return
    setIsSubmitting(true)
    await onPost(content.trim())
    setContent('')
    setIsExpanded(false)
    setIsSubmitting(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-start space-x-3">
        {userAvatar ? (
          <img
            src={userAvatar}
            alt="Your avatar"
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
            U
          </div>
        )}
        <div className="flex-1">
          {isExpanded ? (
            <div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Bạn đang nghĩ gì về học tập?"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                rows={4}
                autoFocus
              />
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
                    <PhotoIcon className="h-5 w-5" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
                    <VideoCameraIcon className="h-5 w-5" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
                    <DocumentTextIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setIsExpanded(false)
                      setContent('')
                    }}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!content.trim() || isSubmitting}
                    className="px-6 py-2 bg-primary-600 text-white rounded-full font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Đang đăng...' : 'Đăng'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsExpanded(true)}
              className="w-full text-left px-4 py-3 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
            >
              Bạn đang nghĩ gì về học tập?
            </button>
          )}
        </div>
      </div>

      {!isExpanded && (
        <div className="flex items-center justify-around mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          >
            <PhotoIcon className="h-5 w-5 text-green-500" />
            <span className="font-medium">Ảnh</span>
          </button>
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          >
            <VideoCameraIcon className="h-5 w-5 text-blue-500" />
            <span className="font-medium">Video</span>
          </button>
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          >
            <DocumentTextIcon className="h-5 w-5 text-orange-500" />
            <span className="font-medium">Bài viết</span>
          </button>
        </div>
      )}
    </div>
  )
}

function SuggestedUserCard({ user }: { user: SuggestedUser }) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      const response = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: user.id }),
      })
      if (response.ok) {
        setIsConnected(true)
      }
    } catch (error) {
      console.error('Error connecting:', error)
    }
    setIsConnecting(false)
  }

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center space-x-3">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={`${user.firstName} ${user.lastName}`}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-semibold">
            {user.firstName[0]}{user.lastName[0]}
          </div>
        )}
        <div>
          <h4 className="font-medium text-gray-900 text-sm">
            {user.firstName} {user.lastName}
          </h4>
          <p className="text-xs text-gray-500 truncate max-w-[120px]">{user.major}</p>
          <p className="text-xs text-gray-400">Năm {user.year}</p>
        </div>
      </div>
      <button
        onClick={handleConnect}
        disabled={isConnecting || isConnected}
        className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
          isConnected
            ? 'bg-gray-100 text-gray-500 cursor-default'
            : 'border border-primary-600 text-primary-600 hover:bg-primary-50'
        }`}
      >
        {isConnected ? 'Đã gửi' : isConnecting ? '...' : 'Kết nối'}
      </button>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()

  // Fetch posts
  const { data: postsData, error: postsError, mutate: mutatePosts } = useSWR<{ posts: Post[] }>(
    '/api/posts',
    fetcher
  )

  // Fetch suggested users
  const { data: suggestedData } = useSWR<{ users: SuggestedUser[] }>(
    '/api/posts/suggested-users',
    fetcher
  )

  // Fetch user profile
  const { data: profileData } = useSWR('/api/profile', fetcher)

  const handleCreatePost = useCallback(async (content: string, imageUrl?: string) => {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, imageUrl }),
      })

      if (response.ok) {
        const { post } = await response.json()
        // Optimistically update the posts list
        mutatePosts((current) => ({
          posts: [post, ...(current?.posts || [])],
        }), false)
      }
    } catch (error) {
      console.error('Error creating post:', error)
    }
  }, [mutatePosts])

  const handleLike = useCallback(async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
      })

      if (response.ok) {
        const { liked, likesCount } = await response.json()
        // Optimistically update the post
        mutatePosts((current) => ({
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
  }, [mutatePosts])

  const handleComment = useCallback(async (postId: string, content: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (response.ok) {
        const { comment, commentsCount } = await response.json()
        // Optimistically update the post
        mutatePosts((current) => ({
          posts: current?.posts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  commentsCount,
                  comments: [...post.comments, comment],
                }
              : post
          ) || [],
        }), false)
      }
    } catch (error) {
      console.error('Error commenting:', error)
    }
  }, [mutatePosts])

  const posts = postsData?.posts || []
  const suggestedUsers = suggestedData?.users || []
  const userAvatar = profileData?.avatar

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <DashboardHeader
          title="Bảng tin"
          description="Cập nhật từ cộng đồng học tập"
          icon={NewspaperIcon}
          currentPage="/dashboard"
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 mobile-safe-area">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Feed */}
            <div className="lg:col-span-8 space-y-4">
              {/* Create Post Box */}
              <CreatePostBox onPost={handleCreatePost} userAvatar={userAvatar} />

              {/* Posts Feed */}
              {postsError ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <p className="text-gray-500">Không thể tải bảng tin. Vui lòng thử lại.</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <NewspaperIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có bài viết nào</h3>
                  <p className="text-gray-500 mb-4">Hãy là người đầu tiên chia sẻ về trải nghiệm học tập của bạn!</p>
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={handleLike}
                    onComment={handleComment}
                  />
                ))
              )}
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-4 hidden lg:block">
              <div className="sticky top-6 space-y-4">
                {/* Suggested Connections */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Gợi ý kết nối</h3>
                    <Link href="/discover" className="text-sm text-primary-600 hover:underline">
                      Xem tất cả
                    </Link>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {suggestedUsers.length > 0 ? (
                      suggestedUsers.slice(0, 5).map((user) => (
                        <SuggestedUserCard key={user.id} user={user} />
                      ))
                    ) : (
                      <div className="py-4 text-center text-sm text-gray-500">
                        <UserPlusIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        Không có gợi ý mới
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Links */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Truy cập nhanh</h3>
                  <div className="space-y-2">
                    <Link
                      href="/discover"
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Khám phá bạn học
                    </Link>
                    <Link
                      href="/discover-b2c"
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Tìm kiếm AI
                    </Link>
                    <Link
                      href="/rooms"
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Phòng học nhóm
                    </Link>
                    <Link
                      href="/messages"
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Tin nhắn
                    </Link>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-xs text-gray-400 px-4">
                  <p>StudyMate - Kết nối học tập</p>
                  <p className="mt-1">2024 StudyMate. All rights reserved.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <BottomTabNavigation />
      </div>
    </AuthGuard>
  )
}
