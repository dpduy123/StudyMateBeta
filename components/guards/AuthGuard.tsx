'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/Providers'

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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra xác thực...</p>
        </div>
      </div>
    )
  }

  // Show fallback or nothing if not authenticated
  if (!user) {
    return fallback ? <>{fallback}</> : null
  }

  // User is authenticated, render children
  return <>{children}</>
}