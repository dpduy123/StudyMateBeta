'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePusher } from './usePusher'
import { useRouter } from 'next/navigation'

interface NotificationData {
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  messageId: string
  chatId: string
  timestamp: string
}

interface UseNotificationsOptions {
  userId: string
  enabled?: boolean
}

export function useNotifications({ userId, enabled = true }: UseNotificationsOptions) {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)
  const router = useRouter()

  // Check if notifications are supported
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true)
      setPermission(Notification.permission)
    }
  }, [])

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      console.warn('Browser notifications are not supported')
      return false
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result === 'granted'
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return false
    }
  }, [isSupported])

  // Show a browser notification
  const showNotification = useCallback((data: NotificationData) => {
    if (!isSupported || permission !== 'granted') {
      return
    }

    try {
      const notification = new Notification(data.senderName, {
        body: data.content,
        icon: data.senderAvatar || '/logo.svg',
        badge: '/logo.svg',
        tag: `message-${data.messageId}`,
        requireInteraction: false,
        data: {
          chatId: data.chatId,
          messageId: data.messageId,
          senderId: data.senderId
        }
      })

      // Handle notification click
      notification.onclick = (event) => {
        event.preventDefault()
        window.focus()
        router.push(`/messages?chat=${data.chatId}`)
        notification.close()
      }

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close()
      }, 5000)
    } catch (error) {
      console.error('Error showing notification:', error)
    }
  }, [isSupported, permission, router])

  // Listen for notification events via Pusher
  usePusher({
    channelName: `private-notifications-${userId}`,
    enabled: enabled && isSupported && permission === 'granted',
    events: {
      'message-notification': (data: NotificationData) => {
        // Only show notification if user is not on the messages page
        // or if the page is not focused
        if (document.hidden || !document.hasFocus()) {
          showNotification(data)
        }
      }
    }
  })

  return {
    permission,
    isSupported,
    requestPermission,
    showNotification
  }
}
