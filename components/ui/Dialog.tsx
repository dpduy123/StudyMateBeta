'use client'

import { Fragment, ReactNode, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true
}: DialogProps) {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    full: 'max-w-7xl'
  }

  // Handle escape key and hide mobile navigation
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
      // Add class to hide mobile navigation
      document.body.classList.add('dialog-open')
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
      // Remove class to show mobile navigation
      document.body.classList.remove('dialog-open')
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/25 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Dialog container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`relative w-full ${sizeClasses[size]} transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all`}
          onClick={(e) => e.stopPropagation()}
        >
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between px-6 py-6 border-b border-gray-200">
              <div>
                {title && (
                  <h2 className="text-2xl font-bold text-gray-900">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-gray-600 mt-1">
                    {description}
                  </p>
                )}
              </div>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              )}
            </div>
          )}
          
          <div className={title || showCloseButton ? 'p-6' : 'p-0'}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

// Specialized dialog components for common use cases
interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'primary' | 'danger' | 'success'
  isLoading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  confirmVariant = 'primary',
  isLoading = false
}: ConfirmDialogProps) {
  const confirmClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white'
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
    >
      <div className="space-y-4">
        <p className="text-gray-600">{message}</p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-xl font-medium disabled:opacity-50 transition-colors ${confirmClasses[confirmVariant]}`}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Đang xử lý...</span>
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Dialog>
  )
}

// Form dialog wrapper
interface FormDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  onSubmit: (e: React.FormEvent) => void
  children: ReactNode
  submitText?: string
  cancelText?: string
  isLoading?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export function FormDialog({
  isOpen,
  onClose,
  title,
  description,
  onSubmit,
  children,
  submitText = 'Lưu',
  cancelText = 'Hủy',
  isLoading = false,
  size = 'md'
}: FormDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size={size}
    >
      <form onSubmit={onSubmit} className="space-y-8">
        {children}
        
        {/* Submit Buttons - matching the original styling */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Đang lưu...</span>
              </>
            ) : (
              <span>{submitText}</span>
            )}
          </button>
        </div>
      </form>
    </Dialog>
  )
}