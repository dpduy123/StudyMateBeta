'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  PencilIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'

interface ProfileActionsProps {
  onEditClick: () => void
}

export function ProfileActions({ onEditClick }: ProfileActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="flex justify-center space-x-2 sm:space-x-4"
    >
      <button
        onClick={onEditClick}
        className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-2 sm:py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
      >
        <PencilIcon className="h-4 sm:h-5 w-4 sm:w-5 flex-shrink-0" />
        <span className="text-xs sm:text-base whitespace-nowrap">Chỉnh sửa hồ sơ</span>
      </button>
      <Link
        href="/discover"
        className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-2 sm:py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
      >
        <HeartSolidIcon className="h-4 sm:h-5 w-4 sm:w-5 flex-shrink-0" />
        <span className="text-xs sm:text-base whitespace-nowrap">Tìm bạn học</span>
      </Link>
      <Link
        href="/messages"
        className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
      >
        <ChatBubbleLeftRightIcon className="h-4 sm:h-5 w-4 sm:w-5 flex-shrink-0" />
        <span className="text-xs sm:text-base whitespace-nowrap">Tin nhắn</span>
      </Link>
    </motion.div>
  )
}