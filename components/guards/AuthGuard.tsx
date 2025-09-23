'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/Providers'
import { PageLoading } from '@/components/ui/LoadingSpinner'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

export default function AuthGuard({
  children,
  fallback = null,
  redirectTo = '/auth/login'
}: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      // Store the current path for redirect after login
      const currentPath = window.location.pathname
      const redirectUrl = redirectTo + (currentPath !== '/' ? `?redirectTo=${currentPath}` : '')
      router.push(redirectUrl)
    }
  }, [user, loading, router, redirectTo])

  // Show loading state
  if (loading) {
    return <PageLoading />
  }

  // Show fallback or nothing if not authenticated
  if (!user) {
    return fallback ? <>{fallback}</> : null
  }

  // User is authenticated, render children
  return <>{children}</>
}