'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/components/providers/Providers'
import { useProfile } from '@/hooks/useProfile'
import {
  ChevronDownIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  CogIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import { useIsAdmin } from '@/components/guards/AdminGuard'
import { useTranslation } from '@/lib/i18n/context'
import { Locale } from '@/lib/i18n'

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
  const { profile, isLoading: isLoadingProfile } = useProfile()
  const router = useRouter()
  const pathname = usePathname()
  const [showMenu, setShowMenu] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const isAdmin = useIsAdmin()
  const { locale, setLocale, t, locales, localeNames } = useTranslation()

  // Flag icons for each locale
  const flags: Record<Locale, string> = {
    en: '🇺🇸',
    vi: '🇻🇳',
  }

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

  // Auto-close dropdown when navigation completes
  useEffect(() => {
    if (navigatingTo && pathname === navigatingTo) {
      setShowMenu(false)
      setNavigatingTo(null)
      setLoadingPage?.(null)
    }
  }, [pathname, navigatingTo, setLoadingPage])

  // Auto-close dropdown when user changes (sign out completed)
  useEffect(() => {
    if (!user && isSigningOut) {
      setShowMenu(false)
      setIsSigningOut(false)
    }
  }, [user, isSigningOut])

  const avatarSize = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'
  const textSize = size === 'sm' ? 'text-sm' : 'text-sm'

  // Get display name and avatar - handle undefined/null values properly
  const hasValidProfileName = profile?.firstName && profile?.lastName
  const displayName = hasValidProfileName
    ? `${profile.firstName} ${profile.lastName}`
    : user?.email?.split('@')[0] || 'Student'

  const avatarInitials = hasValidProfileName
    ? `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || 'S'

  return (
    <div className="relative" data-user-menu>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-100 transition-colors"
      >
        {profile?.avatar ? (
          <img
            src={profile.avatar}
            alt={displayName}
            className={`${avatarSize} rounded-full object-cover border-2 border-primary-200`}
          />
        ) : (
          <div className={`${avatarSize} bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold ${size === 'sm' ? 'text-sm' : ''}`}>
            {avatarInitials}
          </div>
        )}
        {showUsername && (
          <span className={`hidden sm:inline ${textSize} font-medium text-gray-900 max-w-32 truncate`}>
            {displayName}
          </span>
        )}
        <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
      </button>

      {/* User Menu Dropdown */}
      {showMenu && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt={displayName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-primary-200"
                />
              ) : (
                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {avatarInitials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {displayName}
                </div>
                <div className="text-sm text-gray-600 truncate">
                  {user?.email}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setNavigatingTo(redirectTo)
              setLoadingPage?.(redirectTo)
              router.push(redirectTo)
            }}
            disabled={loadingPage === redirectTo}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingPage === redirectTo ? (
              <div className="w-4 h-4 border border-gray-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <UserIcon className="h-4 w-4" />
            )}
            <span>{redirectTo === '/dashboard' ? t('nav.dashboard') : t('nav.profile')}</span>
          </button>

          {/* B2C Discovery Link - For admins and B2C partners */}
          {isAdmin && (
            <button
              onClick={() => {
                setNavigatingTo('/discover-b2c')
                setLoadingPage?.('/discover-b2c')
                router.push('/discover-b2c')
              }}
              disabled={loadingPage === '/discover-b2c'}
              className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingPage === '/discover-b2c' ? (
                <div className="w-4 h-4 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <BuildingOfficeIcon className="h-4 w-4" />
              )}
              <span>B2C Discovery</span>
            </button>
          )}

          {/* Admin Panel Link */}
          {isAdmin && (
            <button
              onClick={() => {
                setNavigatingTo('/admin')
                setLoadingPage?.('/admin')
                router.push('/admin')
              }}
              disabled={loadingPage === '/admin'}
              className="w-full text-left px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingPage === '/admin' ? (
                <div className="w-4 h-4 border border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <CogIcon className="h-4 w-4" />
              )}
              <span>Admin Panel</span>
            </button>
          )}

          <hr className="my-1 border-gray-200" />

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <span className="text-base">{flags[locale]}</span>
                <span>{t('settings.language.title')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-500">{localeNames[locale]}</span>
                <ChevronDownIcon className={`h-3 w-3 text-gray-400 transition-transform ${showLanguageMenu ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {showLanguageMenu && (
              <div className="border-t border-gray-100 bg-gray-50">
                {locales.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      setLocale(loc)
                      setShowLanguageMenu(false)
                    }}
                    className={`w-full text-left px-6 py-2 text-sm flex items-center space-x-2 hover:bg-gray-100 ${
                      locale === loc ? 'text-primary-600 bg-primary-50 font-medium' : 'text-gray-700'
                    }`}
                  >
                    <span className="text-base">{flags[loc]}</span>
                    <span>{localeNames[loc]}</span>
                    {locale === loc && (
                      <svg className="w-4 h-4 text-primary-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <hr className="my-1 border-gray-200" />
          <button
            onClick={async () => {
              setIsSigningOut(true)
              await signOut()
              // Menu will auto-close when user state changes
            }}
            disabled={isSigningOut}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigningOut ? (
              <div className="w-4 h-4 border border-red-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
            )}
            <span>{isSigningOut ? t('nav.signingOut') : t('nav.signOut')}</span>
          </button>
        </div>
      )}
    </div>
  )
}