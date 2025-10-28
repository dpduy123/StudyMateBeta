'use client'

import { useEffect } from 'react'
import { useAuth } from './Providers'
import { useUserPresence } from '@/hooks/useUserPresence'

/**
 * Provider component that manages user presence
 * Should be placed high in the component tree (e.g., in layout)
 */
export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  
  // Initialize user presence when user is logged in
  const { isOnline, error } = useUserPresence()

  useEffect(() => {
    if (user && isOnline) {
      console.log('✅ User presence initialized')
    }
    if (error) {
      console.error('❌ Presence error:', error)
    }
  }, [user, isOnline, error])

  return <>{children}</>
}
