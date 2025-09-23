'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/Providers'
import {
  ChevronDownIcon,
  UserIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

interface UserDropdownMenuProps {
  showUsername?: boolean
  size?: 'sm' | 'md'
  redirectTo?: string // Where to redirect when clicking profile (default: '/profile')
  loadingPage?: string | null
  setLoadingPage?: (page: string | null) => void
}

export function UserDropdownMenu({
  showUsername = true,
  size = 'md',
  redirectTo = '/profile',
  loadingPage,
  setLoadingPage
}: UserDropdownMenuProps) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showMenu && !target.closest('[data-user-menu]')) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showMenu])

  const avatarSize = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'
  const textSize = size === 'sm' ? 'text-sm' : 'text-sm'

  return (
    <div className="relative" data-user-menu>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-100 transition-colors"
      >
        <div className={`${avatarSize} bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold ${size === 'sm' ? 'text-sm' : ''}`}>
          {user?.email?.charAt(0).toUpperCase() || 'S'}
        </div>
        {showUsername && (
          <span className={`hidden sm:inline ${textSize} font-medium text-gray-900`}>
            {user?.email?.split('@')[0] || 'Student'}
          </span>
        )}
        <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
      </button>

      {/* User Menu Dropdown */}
      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
          <button
            onClick={() => {
              setLoadingPage?.(redirectTo)
              router.push(redirectTo)
              // Đóng menu sau khi navigate thành công
              setTimeout(() => setShowMenu(false), 200)
            }}
            disabled={loadingPage === redirectTo}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingPage === redirectTo ? (
              <div className="w-4 h-4 border border-gray-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <UserIcon className="h-4 w-4" />
            )}
            <span>{redirectTo === '/dashboard' ? 'Dashboard' : 'Hồ sơ cá nhân'}</span>
          </button>
          <hr className="my-1 border-gray-200" />
          <button
            onClick={async () => {
              setIsSigningOut(true)
              try {
                await signOut()
              } finally {
                setIsSigningOut(false)
                setShowMenu(false)
              }
            }}
            disabled={isSigningOut}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigningOut ? (
              <div className="w-4 h-4 border border-red-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
            )}
            <span>{isSigningOut ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
          </button>
        </div>
      )}
    </div>
  )
}