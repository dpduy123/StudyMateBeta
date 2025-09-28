'use client'

import { UserProfile } from './types'
import { ProfileHeader } from './ProfileHeader'
import { ProfileSkills } from './ProfileSkills'
import { ProfileGoals } from './ProfileGoals'
import { ProfileActions } from './ProfileActions'

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
      <ProfileActions onEditClick={onEditClick} />
    </>
  )
}