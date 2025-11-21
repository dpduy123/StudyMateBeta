'use client'

import { CheckIcon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline'

interface MatchRequestCardProps {
  notification: {
    id: string
    message: string
    createdAt: string
    isRead: boolean
    relatedUserId?: string
    metadata?: {
      senderName?: string
      senderAvatar?: string
      senderUniversity?: string
    }
  }
  onAccept: () => void
  onReject: () => void
  onMarkRead: () => void
  onViewProfile?: () => void
  isLoading: boolean
}

export default function MatchRequestCard({
  notification,
  onAccept,
  onReject,
  onMarkRead,
  onViewProfile,
  isLoading
}: MatchRequestCardProps) {
  const handleAccept = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isLoading) {
      onAccept()
    }
  }

  const handleReject = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isLoading) {
      onReject()
    }
  }

  const handleCardClick = () => {
    if (onViewProfile && !isLoading) {
      onViewProfile()
    }
  }

  return (
    <div className="space-y-3">
      <div
        className="flex items-start space-x-3 cursor-pointer hover:bg-gray-100/50 -mx-2 px-2 py-1 rounded-lg transition-colors"
        onClick={handleCardClick}
      >
        {notification.metadata?.senderAvatar ? (
          <img
            src={notification.metadata.senderAvatar}
            alt={notification.metadata.senderName || 'User'}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
            <UserCircleIcon className="w-8 h-8 text-gray-400" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">
            {notification.metadata?.senderName || 'Someone'}
          </p>
          {notification.metadata?.senderUniversity && (
            <p className="text-xs text-gray-500 mt-0.5">
              {notification.metadata.senderUniversity}
            </p>
          )}
          <p className="text-sm text-gray-600 mt-1">
            muon ket noi voi ban
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {new Date(notification.createdAt).toLocaleString('vi-VN')}
          </p>
        </div>

        {!notification.isRead && (
          <div className="h-2 w-2 rounded-full bg-primary-600 flex-shrink-0"></div>
        )}
      </div>

      <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={handleAccept}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <CheckIcon className="h-4 w-4" />
          <span>{isLoading ? 'Dang xu ly...' : 'Chap nhan'}</span>
        </button>
        <button
          onClick={handleReject}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
        >
          <XMarkIcon className="h-4 w-4" />
          <span>Tu choi</span>
        </button>
      </div>
    </div>
  )
}
