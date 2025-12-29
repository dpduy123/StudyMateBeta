'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HomeIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  TrophyIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeSolidIcon,
  MagnifyingGlassIcon as MagnifyingGlassSolidIcon,
  SparklesIcon as SparklesSolidIcon,
  VideoCameraIcon as VideoCameraSolidIcon,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightSolidIcon,
  TrophyIcon as TrophySolidIcon,
  UserIcon as UserSolidIcon
} from '@heroicons/react/24/solid'

// Items for bottom tab (5 items)
const bottomTabItems = [
  {
    name: 'Bảng tin',
    href: '/dashboard',
    icon: HomeIcon,
    activeIcon: HomeSolidIcon
  },
  {
    name: 'Khám phá',
    href: '/discover',
    icon: MagnifyingGlassIcon,
    activeIcon: MagnifyingGlassSolidIcon
  },
  {
    name: 'Tìm kiếm',
    href: '/discover-b2c',
    icon: SparklesIcon,
    activeIcon: SparklesSolidIcon
  },
  {
    name: 'Tin nhắn',
    href: '/messages',
    icon: ChatBubbleLeftRightIcon,
    activeIcon: ChatBubbleLeftRightSolidIcon
  },
  {
    name: 'Hồ sơ',
    href: '/profile',
    icon: UserIcon,
    activeIcon: UserSolidIcon
  }
]

// All items for slide-out menu
const navItems = [
  {
    name: 'Bảng tin',
    href: '/dashboard',
    icon: HomeIcon,
    activeIcon: HomeSolidIcon
  },
  {
    name: 'Khám phá',
    href: '/discover',
    icon: MagnifyingGlassIcon,
    activeIcon: MagnifyingGlassSolidIcon
  },
  {
    name: 'Tìm kiếm',
    href: '/discover-b2c',
    icon: SparklesIcon,
    activeIcon: SparklesSolidIcon
  },
  {
    name: 'Phòng học',
    href: '/rooms',
    icon: VideoCameraIcon,
    activeIcon: VideoCameraSolidIcon
  },
  {
    name: 'Tin nhắn',
    href: '/messages',
    icon: ChatBubbleLeftRightIcon,
    activeIcon: ChatBubbleLeftRightSolidIcon
  },
  {
    name: 'Thành tích',
    href: '/achievements',
    icon: TrophyIcon,
    activeIcon: TrophySolidIcon
  },
  {
    name: 'Hồ sơ',
    href: '/profile',
    icon: UserIcon,
    activeIcon: UserSolidIcon
  }
]

// Bottom Tab Navigation for Mobile
export function BottomTabNavigation() {
  const pathname = usePathname()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const checkDialogState = () => {
      setIsDialogOpen(document.body.classList.contains('dialog-open'))
    }

    // Check initial state
    checkDialogState()

    // Create observer for body class changes
    const observer = new MutationObserver(checkDialogState)
    observer.observe(document.body, { 
      attributes: true, 
      attributeFilter: ['class'] 
    })

    return () => observer.disconnect()
  }, [])

  // Hide navigation when dialog is open
  if (isDialogOpen) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden">
      <div className="grid grid-cols-5 gap-1">
        {bottomTabItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = isActive ? item.activeIcon : item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-1 text-xs transition-colors ${
                isActive
                  ? 'text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-6 w-6 mb-1" />
              <span className="truncate">{item.name}</span>
              {isActive && (
                <motion.div
                  layoutId="bottomTabIndicator"
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary-600 rounded-full"
                />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// Slide-out Mobile Menu
export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Slide-out Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl md:hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <nav className="p-6">
              <div className="space-y-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = isActive ? item.activeIcon : item.icon

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-primary-50 text-primary-700 font-semibold'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Floating Action Button for Quick Actions
export function FloatingActionButton() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const pathname = usePathname()

  const actions = [
    { name: 'Tạo phòng', href: '/rooms/create', icon: VideoCameraIcon, color: 'bg-blue-500' },
    { name: 'Tìm bạn học', href: '/discover', icon: MagnifyingGlassIcon, color: 'bg-green-500' },
    { name: 'Tin nhắn mới', href: '/messages', icon: ChatBubbleLeftRightIcon, color: 'bg-purple-500' }
  ]

  useEffect(() => {
    const checkDialogState = () => {
      setIsDialogOpen(document.body.classList.contains('dialog-open'))
    }

    // Check initial state
    checkDialogState()

    // Create observer for body class changes
    const observer = new MutationObserver(checkDialogState)
    observer.observe(document.body, { 
      attributes: true, 
      attributeFilter: ['class'] 
    })

    return () => observer.disconnect()
  }, [])

  // Hide FloatingActionButton when user is in room pages or dialog is open
  const shouldHide = pathname?.startsWith('/rooms/') || isDialogOpen

  if (shouldHide) {
    return null
  }

  return (
    <div className="fixed bottom-20 right-4 z-40 md:hidden">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-16 right-0 space-y-3"
          >
            {actions.map((action, index) => (
              <motion.div
                key={action.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={action.href}
                  onClick={() => setIsExpanded(false)}
                  className={`flex items-center justify-center w-12 h-12 ${action.color} text-white rounded-full shadow-lg hover:scale-110 transition-transform`}
                >
                  <action.icon className="h-6 w-6" />
                </Link>
                <div className="absolute right-14 top-1/2 transform -translate-y-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {action.name}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-700 transition-colors"
        animate={{ rotate: isExpanded ? 45 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </motion.button>
    </div>
  )
}