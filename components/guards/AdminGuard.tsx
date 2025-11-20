'use client'

import { useAuth } from '@/components/providers/Providers'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface AdminGuardProps {
  children: React.ReactNode
}

const ADMIN_EMAILS = [
  '23560004@gm.uit.edu.vn',
  '23520362@gm.uit.edu.vn'
]

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login')
        return
      }

      if (!ADMIN_EMAILS.includes(user.email || '')) {
        router.push('/dashboard')
        return
      }

      setIsAdmin(true)
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking admin permissions...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don&apos;t have admin permissions.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="btn-primary"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export function useIsAdmin() {
  const { user } = useAuth()
  return user ? ADMIN_EMAILS.includes(user.email || '') : false
}