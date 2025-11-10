'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/components/providers/Providers'

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkProfileStatus = async () => {
      // Skip check for public routes, auth routes, API routes, and onboarding page
      const publicRoutes = ['/', '/terms', '/privacy']
      const isPublicRoute = publicRoutes.includes(pathname)

      if (!user || isPublicRoute || pathname.startsWith('/auth') || pathname.startsWith('/api') || pathname.startsWith('/onboarding')) {
        setChecking(false)
        return
      }

      try {
        const response = await fetch('/api/user/check-profile-status')

        if (response.ok) {
          const { profileCompleted } = await response.json()

          // If profile not completed, redirect to onboarding
          if (!profileCompleted) {
            router.push('/onboarding')
            return
          }
        }
      } catch (error) {
        console.error('Error checking profile status:', error)
      } finally {
        setChecking(false)
      }
    }

    if (!loading) {
      checkProfileStatus()
    }
  }, [user, loading, pathname, router])

  // Only show loading for protected routes
  const publicRoutes = ['/', '/terms', '/privacy']
  const isPublicRoute = publicRoutes.includes(pathname)
  const isAuthRoute = pathname.startsWith('/auth')

  if ((loading || checking) && !isPublicRoute && !isAuthRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return <>{children}</>
}
