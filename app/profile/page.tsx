'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers/Providers'
import { useProfile } from '@/hooks/useProfile'
import { BottomTabNavigation } from '@/components/ui/MobileNavigation'
import { DashboardHeader } from '@/components/ui/DashboardHeader'
import { EditProfileDialog } from '@/components/profile/EditProfileDialog'
import { ProfileSkeleton } from '@/components/profile/ProfileSkeleton'
import { ProfileContent } from '@/components/profile/ProfileContent'
import { ProfileError } from '@/components/profile/ProfileError'
import { UserProfile } from '@/components/profile/types'
import { UserCircleIcon } from '@heroicons/react/24/outline'

export default function ProfilePage() {
  const { user } = useAuth()
  const { profile, isLoading, refetch } = useProfile()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)


  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Hồ sơ cá nhân"
        description="Thông tin và cài đặt tài khoản"
        icon={UserCircleIcon}
        currentPage="/profile"
      />

      <div className="py-8 mobile-safe-area">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <ProfileSkeleton />
          ) : !profile ? (
            <ProfileError onRetry={refetch} />
          ) : (
            <ProfileContent
              profile={profile}
              onEditClick={() => setIsEditDialogOpen(true)}
            />
          )}
        </div>

        {/* Edit Profile Dialog */}
        <EditProfileDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSuccess={refetch}
          currentProfile={profile}
        />

        {/* Mobile Navigation */}
        <BottomTabNavigation />
      </div>
    </div>
  )
}