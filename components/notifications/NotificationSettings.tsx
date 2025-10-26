'use client'

import { useState, useEffect } from 'react'
import { BellIcon, BellSlashIcon } from '@heroicons/react/24/outline'
import { useNotifications } from '@/hooks/useNotifications'

interface NotificationSettingsProps {
  userId: string
}

export function NotificationSettings({ userId }: NotificationSettingsProps) {
  const { permission, isSupported, requestPermission } = useNotifications({ 
    userId,
    enabled: false // Don't listen to events in settings component
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleEnableNotifications = async () => {
    setIsLoading(true)
    try {
      const granted = await requestPermission()
      if (granted) {
        console.log('Notifications enabled')
      } else {
        console.log('Notification permission denied')
      }
    } catch (error) {
      console.error('Error enabling notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSupported) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-start gap-3">
          <BellSlashIcon className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              Thông báo không được hỗ trợ
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Trình duyệt của bạn không hỗ trợ thông báo push.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (permission === 'denied') {
    return (
      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
        <div className="flex items-start gap-3">
          <BellSlashIcon className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-900">
              Thông báo bị chặn
            </h3>
            <p className="text-sm text-red-700 mt-1">
              Bạn đã chặn thông báo. Vui lòng bật lại trong cài đặt trình duyệt.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (permission === 'granted') {
    return (
      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-start gap-3">
          <BellIcon className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-green-900">
              Thông báo đã bật
            </h3>
            <p className="text-sm text-green-700 mt-1">
              Bạn sẽ nhận được thông báo khi có tin nhắn mới.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-start gap-3">
        <BellIcon className="w-5 h-5 text-blue-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-900">
            Bật thông báo tin nhắn
          </h3>
          <p className="text-sm text-blue-700 mt-1">
            Nhận thông báo ngay khi có tin nhắn mới, ngay cả khi bạn không mở ứng dụng.
          </p>
          <button
            onClick={handleEnableNotifications}
            disabled={isLoading}
            className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Đang xử lý...' : 'Bật thông báo'}
          </button>
        </div>
      </div>
    </div>
  )
}
