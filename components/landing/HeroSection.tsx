'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  SparklesIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'

export function HeroSection() {
  const stats = [
    { icon: UserGroupIcon, value: '10,000+', label: 'Sinh viên' },
    { icon: ChatBubbleLeftRightIcon, value: '50,000+', label: 'Kết nối' },
    { icon: TrophyIcon, value: '95%', label: 'Hài lòng' },
  ]

  return (
    <section className="flex relative pt-24 pb-8 sm:pt-20 lg:pt-24 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-accent-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-8"
          >
            <SparklesIcon className="h-4 w-4" />
            <span>AI-Powered Study Matching</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-responsive-2xl font-bold text-gray-900 mb-6 leading-tight"
          >
            Kết nối sinh viên,{' '}
            <span className="text-primary-600">học tập cùng nhau</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto max-w-3xl text-responsive-base text-gray-600 mb-10 leading-relaxed"
          >
            StudyMate là nền tảng kết nối sinh viên thông minh với AI matching,
            giúp bạn tìm được những người bạn học lý tưởng, tham gia các phòng thảo luận
            và xây dựng cộng đồng học tập năng động.
          </motion.p>
        </div>
      </div>
    </section>
  )
}