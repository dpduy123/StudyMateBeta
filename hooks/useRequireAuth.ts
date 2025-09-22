'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/Providers'

interface UseRequireAuthOptions {
  redirectTo?: string
  redirectIfAuthenticated?: boolean
}

export function useRequireAuth({
  redirectTo = '/auth/login',
  redirectIfAuthenticated = false
}: UseRequireAuthOptions = {}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return // Wait for auth to load

    if (redirectIfAuthenticated && user) {
      // Redirect authenticated users away (useful for auth pages)
      router.push('/dashboard')
      return
    }

    if (!redirectIfAuthenticated && !user) {
      // Redirect unauthenticated users to login
      const currentPath = window.location.pathname
      const redirectUrl = redirectTo + (currentPath !== '/' ? `?redirectTo=${currentPath}` : '')
      router.push(redirectUrl)
      return
    }
  }, [user, loading, router, redirectTo, redirectIfAuthenticated])

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isUnauthenticated: !loading && !user
  }
}