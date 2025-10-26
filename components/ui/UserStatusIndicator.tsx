'use client'

import { useUserStatus, UserStatus } from '@/hooks/useUserStatus'
import { formatDistanceToNow } from 'date-fns'

interface UserStatusIndicatorProps {
  userId: string
  showLabel?: boolean
  showLastActive?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * Component to display a user's online/offline status indicator
 */
export function UserStatusIndicator({
  userId,
  showLabel = false,
  showLastActive = false,
  size = 'md',
  className = ''
}: UserStatusIndicatorProps) {
  const { status, isLoading } = useUserStatus({ userId })

  if (isLoading || !status) {
    return null
  }

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500'
  }

  const statusLabels = {
    online: 'Online',
    offline: 'Offline',
    away: 'Away'
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div
          className={`${sizeClasses[size]} ${statusColors[status.status]} rounded-full`}
          title={statusLabels[status.status]}
        />
        {status.status === 'online' && (
          <div
            className={`absolute inset-0 ${statusColors[status.status]} rounded-full animate-ping opacity-75`}
          />
        )}
      </div>
      
      {showLabel && (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {statusLabels[status.status]}
        </span>
      )}
      
      {showLastActive && status.status === 'offline' && (
        <span className="text-xs text-gray-500 dark:text-gray-500">
          Last active {formatDistanceToNow(status.lastActive, { addSuffix: true })}
        </span>
      )}
    </div>
  )
}

/**
 * Component to display user status with avatar
 */
export function UserStatusAvatar({
  userId,
  avatarUrl,
  name,
  size = 'md'
}: {
  userId: string
  avatarUrl?: string
  name: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const { status } = useUserStatus({ userId })

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  const indicatorSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500'
  }

  return (
    <div className="relative inline-block">
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200`}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      
      {status && (
        <div
          className={`absolute bottom-0 right-0 ${indicatorSizeClasses[size]} ${
            statusColors[status.status]
          } rounded-full border-2 border-white dark:border-gray-900`}
        />
      )}
    </div>
  )
}

/**
 * Utility function to format last active time
 */
export function formatLastActive(lastActive: Date): string {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`
  
  return formatDistanceToNow(lastActive, { addSuffix: true })
}
