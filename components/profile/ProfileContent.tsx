'use client'

import { UserProfile } from './types'
import { ProfileHeader } from './ProfileHeader'
import { ProfileSkills } from './ProfileSkills'
import { ProfileGoals } from './ProfileGoals'
import { ProfileActions } from './ProfileActions'
import { NotificationSettings } from '@/components/notifications/NotificationSettings'

interface ProfileContentProps {
  profile: UserProfile
  onEditClick: () => void
}

export function ProfileContent({ profile, onEditClick }: ProfileContentProps) {
  return (
    <>
      <ProfileHeader profile={profile} />
      <ProfileSkills profile={profile} />
      <ProfileGoals profile={profile} />
      
      {/* Notification Settings */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cài đặt thông báo</h3>
        <NotificationSettings userId={profile.id} />
      </div>
      
      <ProfileActions onEditClick={onEditClick} />
    </>
  )
}