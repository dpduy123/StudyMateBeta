'use client'

import { motion } from 'framer-motion'
import { UserProfile } from './types'
import { TrophyIcon } from '@heroicons/react/24/outline'

interface ProfileGoalsProps {
  profile: UserProfile
}

export function ProfileGoals({ profile }: ProfileGoalsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-2xl shadow-xl p-6 mb-8"
    >
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Mục tiêu học tập</h3>
      <div className="space-y-3">
        {profile.studyGoals.map((goal, index) => (
          <div key={index} className="flex items-center">
            <TrophyIcon className="h-5 w-5 text-yellow-500 mr-3" />
            <span className="text-gray-700">{goal}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}