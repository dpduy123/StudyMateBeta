'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { UserDropdownMenu } from './UserDropdownMenu'

interface DashboardHeaderProps {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  currentPage: string
  rightContent?: React.ReactNode
  showNavigation?: boolean
}

export function DashboardHeader({
  title,
  description,
  icon: Icon,
  currentPage,
  rightContent,
  showNavigation = true
}: DashboardHeaderProps) {
  const router = useRouter()
  const [loadingPage, setLoadingPage] = useState<string | null>(null)

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Khám phá', href: '/discover' },
    { name: 'Phòng học', href: '/rooms' },
    { name: 'Tin nhắn', href: '/messages' },
    { name: 'Thành tích', href: '/achievements' }
  ]

  const handleNavigation = (href: string, e: React.MouseEvent) => {
    if (href === currentPage) return
    e.preventDefault()
    setLoadingPage(href)
    router.push(href)
  }

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-600">{description}</p>
            </div>
            {showNavigation && (
              <div className="hidden md:flex md:items-center md:space-x-8 ml-10">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleNavigation(item.href, e)}
                    className={`relative text-gray-600 hover:text-primary-600 font-medium transition-colors ${
                      currentPage === item.href ? 'text-gray-900 font-semibold' : ''
                    } ${
                      loadingPage === item.href ? 'opacity-70' : ''
                    }`}
                  >
                    {loadingPage === item.href ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 border border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>{item.name}</span>
                      </div>
                    ) : (
                      item.name
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {rightContent}
            <UserDropdownMenu loadingPage={loadingPage} setLoadingPage={setLoadingPage} />
          </div>
        </div>
      </div>
    </div>
  )
}