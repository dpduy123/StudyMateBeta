'use client'

import { motion } from 'framer-motion'
import { UserProfile } from './types'

interface ProfileSkillsProps {
  profile: UserProfile
}

export function ProfileSkills({ profile }: ProfileSkillsProps) {
  return (
    <div className="grid md:grid-cols-2 gap-8 mb-8">
      {/* Interests */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-xl p-6"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Sở thích</h3>
        <div className="flex flex-wrap gap-2">
          {profile.interests?.length ? (
            profile.interests.map((interest, index) => (
              <span
                key={index}
                className="px-3 py-2 bg-primary-100 text-primary-700 rounded-xl text-sm font-medium"
              >
                {interest}
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-500">Chưa cập nhật</span>
          )}
        </div>
      </motion.div>

      {/* Skills */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-xl p-6"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Kỹ năng</h3>
        <div className="flex flex-wrap gap-2">
          {profile.skills?.length ? (
            profile.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-medium"
              >
                {skill}
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-500">Chưa cập nhật</span>
          )}
        </div>
      </motion.div>
    </div>
  )
}