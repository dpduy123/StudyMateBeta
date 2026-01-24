'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/providers/Providers'
import { motion } from 'framer-motion'
import { useTranslation } from '@/lib/i18n/context'
import {
  Bars3Icon,
  XMarkIcon,
  AcademicCapIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, signOut, loading } = useAuth()
  const { t } = useTranslation()

  const navigation = [
    { name: t('landing.header.features'), href: '#features' },
    { name: t('landing.header.howItWorks'), href: '#how-it-works' },
    { name: t('landing.header.pricing'), href: '#pricing' },
    { name: t('landing.header.testimonials'), href: '#testimonials' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <AcademicCapIcon className="h-8 w-8 text-primary-500 group-hover:text-primary-600 transition-colors" />
                <div className="absolute -inset-1 bg-primary-500/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-xl font-bold text-gray-900">StudyMate</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-primary-600 font-medium transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Auth Actions */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin"></div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="hidden sm:inline-flex items-center space-x-2 text-gray-600 hover:text-primary-600 font-medium transition-colors"
                >
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/profile"
                  className="hidden sm:inline-flex items-center space-x-2 text-gray-600 hover:text-primary-600 font-medium transition-colors"
                >
                  <UserCircleIcon className="h-5 w-5" />
                  <span>{t('landing.header.profile')}</span>
                </Link>
                <button
                  onClick={signOut}
                  className="inline-flex items-center space-x-2 text-gray-600 hover:text-red-600 font-medium transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span className="hidden sm:inline">{t('landing.header.logout')}</span>
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="text-gray-600 hover:text-primary-600 font-medium transition-colors duration-200"
                >
                  {t('landing.header.login')}
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-primary"
                >
                  {t('landing.header.signup')}
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 py-4"
          >
            <div className="space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block text-gray-600 hover:text-primary-600 font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {user && (
                <>
                  <Link
                    href="/dashboard"
                    className="block text-gray-600 hover:text-primary-600 font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className="block text-gray-600 hover:text-primary-600 font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('landing.header.profile')}
                  </Link>
                </>
              )}
              {!user && (
                <>
                  <div className="border-t border-gray-200 pt-4 space-y-4">
                    <Link
                      href="/auth/login"
                      className="block text-gray-600 hover:text-primary-600 font-medium transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('landing.header.login')}
                    </Link>
                    <Link
                      href="/auth/register"
                      className="block w-full text-center btn-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('landing.header.signup')}
                    </Link>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </nav>
    </header>
  )
}