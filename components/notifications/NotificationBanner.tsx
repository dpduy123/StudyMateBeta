'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon, BellIcon } from '@heroicons/react/24/outline'
import { useNotifications } from '@/hooks/useNotifications'

interface NotificationBannerProps {
  userId: string
}

export function NotificationBanner({ userId }: NotificationBannerProps) {
  const { permission, isSupported, requestPermission } = useNotifications({ 
    userId,
    enabled: false 
  })
  const [isDismissed, setIsDismissed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Check if banner was previously dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('notification-banner-dismissed')
    if (dismissed === 'true') {
      setIsDismissed(true)
    }
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem('notification-banner-dismissed', 'true')
  }

  const handleEnable = async () => {
    setIsLoading(true)
    try {
      const granted = await requestPermission()
      if (granted) {
        setIsDismissed(true)
        localStorage.setItem('notification-banner-dismissed', 'true')
      }
    } catch (error) {
      console.error('Error enabling notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Don't show banner if:
  // - Not supported
  // - Already granted
  // - Denied (user explicitly blocked)
  // - Dismissed
  if (!isSupported || permission === 'granted' || permission === 'denied' || isDismissed) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <BellIcon className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">
              Bật thông báo để không bỏ lỡ tin nhắn quan trọng
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleEnable}
            disabled={isLoading}
            className="px-4 py-1.5 bg-white text-primary-600 text-sm font-medium rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Đang xử lý...' : 'Bật ngay'}
          </button>
          
          <button
            onClick={handleDismiss}
            className="p-1 text-white hover:bg-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white transition-colors"
            aria-label="Đóng"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
