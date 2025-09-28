'use client'

import { useState, useEffect } from 'react'
import AuthGuard from '@/components/guards/AuthGuard'
import { useAuth } from '@/components/providers/Providers'
import { BottomTabNavigation, FloatingActionButton } from '@/components/ui/MobileNavigation'
import { DashboardHeader } from '@/components/ui/DashboardHeader'
import { EditProfileDialog } from '@/components/profile/EditProfileDialog'
import { ProfileSkeleton } from '@/components/profile/ProfileSkeleton'
import { ProfileContent } from '@/components/profile/ProfileContent'
import { ProfileError } from '@/components/profile/ProfileError'
import { UserProfile } from '@/components/profile/types'
import { UserCircleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const fetchProfile = async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    try {
      // Add cache-busting parameter to force fresh data
      const response = await fetch(`/api/profile?t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Profile data from API:', data.profile)
      console.log('Avatar URL from profile:', data.profile?.avatar)
      setProfile(data.profile)
    } catch (error) {
      console.error('Error fetching profile:', error)
      // If profile doesn't exist, redirect to edit profile page
      if (error instanceof Error && error.message.includes('404')) {
        window.location.href = '/profile/edit'
        return
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [user])


  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Vui lòng đăng nhập</h2>
          <Link href="/auth/login" className="text-primary-600 hover:text-primary-500">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
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
            <ProfileError onRetry={() => window.location.reload()} />
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
        onSuccess={fetchProfile}
        currentProfile={profile}
      />

      {/* Mobile Navigation */}
      <BottomTabNavigation />
      <FloatingActionButton />
      </div>
      </div>
    </AuthGuard>
  )
}