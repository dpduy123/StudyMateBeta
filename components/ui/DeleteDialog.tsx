'use client'

import { ExclamationTriangleIcon, TrashIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

interface DeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  itemName: string
  isLoading?: boolean
  confirmText?: string
  cancelText?: string
}

export function DeleteDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title,
  description,
  itemName,
  isLoading = false,
  confirmText = "Xóa",
  cancelText = "Hủy"
}: DeleteDialogProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Dialog */}
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white rounded-2xl shadow-xl max-w-md w-full"
          >
            <div className="p-6">
              {/* Icon */}
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                {title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 text-center mb-6">
                {description}
                <br />
                <span className="text-red-600 font-medium">Hành động này không thể hoàn tác.</span>
              </p>

              {/* Item Name Highlight */}
              {itemName && (
                <div className="bg-gray-50 rounded-lg p-3 mb-6">
                  <p className="text-sm text-gray-700 text-center">
                    <span className="font-medium text-gray-900">&quot;{itemName}&quot;</span>
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang xóa...</span>
                    </>
                  ) : (
                    <>
                      <TrashIcon className="w-4 h-4" />
                      <span>{confirmText}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}
