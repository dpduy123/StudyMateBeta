'use client'

import { UserCircleIcon } from '@heroicons/react/24/outline'

interface ProfileErrorProps {
  onRetry: () => void
}

export function ProfileError({ onRetry }: ProfileErrorProps) {
  return (
    <div className="text-center py-12">
      <UserCircleIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy hồ sơ</h2>
      <p className="text-gray-600 mb-4">Có thể hồ sơ chưa được tạo hoặc có lỗi xảy ra</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
      >
        Thử lại
      </button>
    </div>
  )
}