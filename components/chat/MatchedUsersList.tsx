'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { 
  HeartIcon, 
  ChatBubbleLeftRightIcon,
  AcademicCapIcon 
} from '@heroicons/react/24/outline'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface MatchedUser {
  matchId: string
  matchedAt: string
  otherUser: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
    university?: string
    major?: string
    lastActive?: string
    isOnline: boolean
  }
}

interface MatchedUsersListProps {
  onSelectUser?: (userId: string) => void
}

export function MatchedUsersList({ onSelectUser }: MatchedUsersListProps) {
  const [matches, setMatches] = useState<MatchedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/matches/accepted')
        
        if (!response.ok) {
          throw new Error('Failed to fetch matches')
        }

        const data = await response.json()
        setMatches(data.matches || [])
      } catch (err) {
        console.error('Error fetching matches:', err)
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [])

  const handleUserClick = (userId: string) => {
    if (onSelectUser) {
      onSelectUser(userId)
    } else {
      router.push(`/messages/${userId}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 mb-2">⚠️</div>
        <p className="text-gray-600">{error}</p>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="text-center p-8">
        <HeartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có kết nối nào</h3>
        <p className="text-gray-500 mb-4">Hãy khám phá và kết nối với bạn học mới!</p>
        <button
          onClick={() => router.push('/discover')}
          className="btn-primary"
        >
          Khám phá ngay
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="px-4 py-2 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Bạn đã kết nối ({matches.length})
        </h3>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {matches.map((match) => (
          <div
            key={match.matchId}
            onClick={() => handleUserClick(match.otherUser.id)}
            className="p-4 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {match.otherUser.avatar ? (
                <img
                  src={match.otherUser.avatar}
                  alt={`${match.otherUser.firstName} ${match.otherUser.lastName}`}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {match.otherUser.firstName[0]}{match.otherUser.lastName[0]}
                </div>
              )}
              {match.otherUser.isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900 truncate">
                    {match.otherUser.firstName} {match.otherUser.lastName}
                  </p>
                  {match.otherUser.university && (
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <AcademicCapIcon className="h-3 w-3 mr-1" />
                      <span className="truncate">{match.otherUser.major} • {match.otherUser.university}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end ml-2">
                  <div className="flex items-center text-xs text-gray-400">
                    <HeartIcon className="h-3 w-3 mr-1" />
                    <span>
                      {formatDistanceToNow(new Date(match.matchedAt), { 
                        addSuffix: true, 
                        locale: vi 
                      })}
                    </span>
                  </div>
                  <button className="mt-1 p-1 text-primary-600 hover:text-primary-700 transition-colors">
                    <ChatBubbleLeftRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}