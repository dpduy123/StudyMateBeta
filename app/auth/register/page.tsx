'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  AcademicCapIcon,
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  ShieldCheckIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/components/providers/Providers'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: Form, 2: Email Verification

  const { signUp } = useAuth()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateEmail = (email: string) => {
    const eduPattern = /\.edu/
    return eduPattern.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validation
    if (!validateEmail(formData.email)) {
      setError('Vui lòng sử dụng email trường đại học (.edu)')
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      setIsLoading(false)
      return
    }

    try {
      await signUp(formData.email, formData.password, {
        full_name: formData.fullName
      })
      setStep(2)
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Có lỗi xảy ra khi đăng ký')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const securityFeatures = [
    'Xác thực email .edu bắt buộc',
    'Mã hóa thông tin cá nhân',
    'Kiểm duyệt hồ sơ tự động',
    'Báo cáo spam & lạm dụng'
  ]

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <EnvelopeIcon className="h-8 w-8 text-green-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Kiểm tra email của bạn
            </h2>

            <p className="text-gray-600 mb-6">
              Chúng tôi đã gửi link xác thực đến email{' '}
              <span className="font-medium text-gray-900">{formData.email}</span>
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Lưu ý:</strong> Link xác thực có hiệu lực trong 24 giờ.
                Kiểm tra cả thư mục spam nếu không thấy email.
              </p>
            </div>

            <div className="space-y-4">
              <Link
                href="/auth/login"
                className="w-full btn-primary"
              >
                Quay lại đăng nhập
              </Link>

              <button
                onClick={() => setStep(1)}
                className="w-full btn-secondary"
              >
                Đăng ký email khác
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center"
        >
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
              <AcademicCapIcon className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">StudyMate</span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900">
            Tạo tài khoản mới
          </h2>
          <p className="mt-2 text-gray-600">
            Kết nối với sinh viên và bắt đầu học tập cùng nhau
          </p>
        </motion.div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10"
        >
          {/* Trust Badge */}
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl">
              <ShieldCheckIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Chỉ dành cho sinh viên</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Nhập họ và tên"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email sinh viên (.edu)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="student@university.edu"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Chỉ email trường đại học (.edu) mới được chấp nhận
              </p>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Tối thiểu 6 ký tự"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Nhập lại mật khẩu"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Terms Agreement */}
            <div className="flex items-start space-x-3">
              <input
                id="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
              />
              <label htmlFor="terms" className="text-sm text-gray-700">
                Tôi đồng ý với{' '}
                <Link href="/terms" className="text-primary-600 hover:underline">
                  Điều khoản sử dụng
                </Link>{' '}
                và{' '}
                <Link href="/privacy" className="text-primary-600 hover:underline">
                  Chính sách bảo mật
                </Link>{' '}
                của StudyMate
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang tạo tài khoản...</span>
                </div>
              ) : (
                'Tạo tài khoản'
              )}
            </button>
          </form>

          {/* Security Features */}
          <div className="mt-6 bg-gray-50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <ShieldCheckIcon className="h-4 w-4 mr-2 text-green-600" />
              Bảo mật & An toàn
            </h3>
            <ul className="space-y-2">
              {securityFeatures.map((feature, index) => (
                <li key={index} className="flex items-center text-xs text-gray-600">
                  <CheckCircleIcon className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <span className="text-gray-600">Đã có tài khoản? </span>
            <Link
              href="/auth/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}