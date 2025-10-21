'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, UserCircleIcon, AcademicCapIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'

interface MatchedUser {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar: string | null
  university: string
  major: string
  year: number
  bio: string | null
  averageRating: number
  successfulMatches: number
}

interface Match {
  matchId: string
  matchedAt: string
  respondedAt: string | null
  status: string
  isSender: boolean
  user: MatchedUser
}

interface SuccessfulMatchesDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function SuccessfulMatchesDialog({ isOpen, onClose }: SuccessfulMatchesDialogProps) {
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchMatches()
    }
  }, [isOpen])

  const fetchMatches = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/profile/matches?status=ACCEPTED')

      if (!response.ok) {
        throw new Error('Failed to fetch matches')
      }

      const data = await response.json()
      setMatches(data.matches || [])
    } catch (err) {
      console.error('Error fetching matches:', err)
      setError('Không thể tải danh sách kết nối')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[80vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Kết nối thành công</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {matches.length} người đã kết nối với bạn
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-6 w-6 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-red-600">{error}</p>
                    <button
                      onClick={fetchMatches}
                      className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Thử lại
                    </button>
                  </div>
                ) : matches.length === 0 ? (
                  <div className="text-center py-12">
                    <UserCircleIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Bạn chưa có kết nối thành công nào</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {matches.map((match) => (
                      <motion.div
                        key={match.matchId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-start space-x-4">
                          {/* Avatar */}
                          {match.user.avatar ? (
                            <img
                              src={match.user.avatar}
                              alt={`${match.user.firstName} ${match.user.lastName}`}
                              className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                              <UserCircleIcon className="w-10 h-10 text-gray-400" />
                            </div>
                          )}

                          {/* User Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {match.user.firstName} {match.user.lastName}
                            </h3>

                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <BuildingOfficeIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                              <span className="truncate">{match.user.university}</span>
                            </div>

                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <AcademicCapIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                              <span className="truncate">{match.user.major} - Năm {match.user.year}</span>
                            </div>

                            {match.user.bio && (
                              <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                {match.user.bio}
                              </p>
                            )}

                            <div className="flex items-center space-x-4 mt-3">
                              <div className="text-xs text-gray-500">
                                Đánh giá: <span className="font-semibold text-yellow-600">{match.user.averageRating}⭐</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                Kết nối: <span className="font-semibold text-green-600">{match.user.successfulMatches}</span>
                              </div>
                            </div>

                            <div className="text-xs text-gray-400 mt-2">
                              Kết nối từ: {new Date(match.matchedAt).toLocaleDateString('vi-VN')}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
