'use client'

import { UserProfile } from './types'
import { ProfileHeader } from './ProfileHeader'
import { ProfileSkills } from './ProfileSkills'
import { ProfileGoals } from './ProfileGoals'
import { UserPosts } from './UserPosts'

interface ProfileContentProps {
  profile: UserProfile
  onEditClick: () => void
}

export function ProfileContent({ profile, onEditClick }: ProfileContentProps) {
  return (
    <>
      <ProfileHeader profile={profile} onEditClick={onEditClick} />
      <ProfileSkills profile={profile} />
      <ProfileGoals profile={profile} />

      {/* User Posts */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bài viết</h3>
        <UserPosts userId={profile.id} />
      </div>
    </>
  )
}