'use client'

import { motion } from 'framer-motion'

export function ProfileSkeleton() {
  return (
    <>
      {/* Skeleton Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 animate-pulse"
      >
        {/* Cover Photo Skeleton */}
        <div className="h-48 bg-gray-200 relative">
          <div className="absolute top-4 right-4 w-10 h-10 bg-gray-300 rounded-lg"></div>
        </div>

        {/* Profile Info Skeleton */}
        <div className="relative px-6 pb-6">
          {/* Avatar Skeleton */}
          <div className="flex items-end -mt-16 mb-4">
            <div className="w-32 h-32 rounded-full bg-gray-300 border-4 border-white"></div>
            <div className="ml-6 flex-1">
              <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>

          {/* Quick Stats Skeleton */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
              </div>
            ))}
          </div>

          {/* Bio Skeleton */}
          <div className="mb-6">
            <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>

          {/* Academic Info Skeleton */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="h-5 bg-gray-200 rounded w-32 mb-3"></div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="h-5 w-5 bg-gray-200 rounded mr-3"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="h-5 bg-gray-200 rounded w-20 mb-3"></div>
              <div className="flex flex-wrap gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-6 bg-gray-200 rounded-full w-16"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Skeleton Interests & Skills */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {[...Array(2)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
            className="bg-white rounded-2xl shadow-xl p-6 animate-pulse"
          >
            <div className="h-6 bg-gray-200 rounded w-20 mb-4"></div>
            <div className="flex flex-wrap gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-200 rounded-xl w-20"></div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Skeleton Study Goals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-xl p-6 mb-8 animate-pulse"
      >
        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center">
              <div className="h-5 w-5 bg-gray-200 rounded mr-3"></div>
              <div className="h-4 bg-gray-200 rounded w-48"></div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Skeleton Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex justify-center space-x-4"
      >
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded-xl w-32 animate-pulse"></div>
        ))}
      </motion.div>
    </>
  )
}