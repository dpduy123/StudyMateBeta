'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  AcademicCapIcon,
  UserIcon,
  BookOpenIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/components/providers/Providers'

const UNIVERSITIES = [
  'Đại học Bách Khoa Hà Nội',
  'Đại học Quốc gia Hà Nội',
  'Đại học Kinh tế Quốc dân',
  'Đại học Ngoại thương',
  'Đại học Công nghệ - ĐHQGHN',
  'Đại học Khoa học Tự nhiên - ĐHQGHN',
  'Đại học Khoa học Xã hội và Nhân văn - ĐHQGHN',
  'Đại học Y Hà Nội',
  'Học viện Ngân hàng',
  'Đại học Thương mại',
  'Khác'
]

const MAJORS = [
  'Công nghệ thông tin',
  'Kỹ thuật phần mềm',
  'Khoa học máy tính',
  'Kỹ thuật điện tử',
  'Kinh tế',
  'Quản trị kinh doanh',
  'Kế toán',
  'Tài chính - Ngân hàng',
  'Marketing',
  'Ngoại ngữ',
  'Luật',
  'Y khoa',
  'Dược',
  'Kiến trúc',
  'Xây dựng',
  'Khác'
]

const INTERESTS = [
  'Lập trình',
  'Toán học',
  'Vật lý',
  'Hóa học',
  'Sinh học',
  'Kinh tế',
  'Tài chính',
  'Marketing',
  'Thiết kế',
  'Ngoại ngữ',
  'Văn học',
  'Lịch sử',
  'Triết học',
  'Tâm lý học',
  'Khởi nghiệp'
]

const STUDY_TIMES = [
  { value: 'morning', label: 'Sáng (6h-12h)' },
  { value: 'afternoon', label: 'Chiều (12h-18h)' },
  { value: 'evening', label: 'Tối (18h-22h)' },
  { value: 'night', label: 'Đêm (22h-6h)' }
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    university: '',
    major: '',
    year: 1,
    interests: [] as string[],
    studyGoals: '',
    preferredStudyTime: [] as string[],
    bio: ''
  })

  useEffect(() => {
    // Check if user is authenticated
    if (!user && !loading) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const toggleStudyTime = (time: string) => {
    setFormData(prev => ({
      ...prev,
      preferredStudyTime: prev.preferredStudyTime.includes(time)
        ? prev.preferredStudyTime.filter(t => t !== time)
        : [...prev.preferredStudyTime, time]
    }))
  }

  const handleNext = () => {
    if (step === 1) {
      if (!formData.university || !formData.major || !formData.year) {
        setError('Vui lòng điền đầy đủ thông tin')
        return
      }
    } else if (step === 2) {
      if (formData.interests.length === 0) {
        setError('Vui lòng chọn ít nhất 1 sở thích')
        return
      }
    }
    setError('')
    setStep(step + 1)
  }

  const handleBack = () => {
    setError('')
    setStep(step - 1)
  }

  const handleSubmit = async () => {
    if (formData.preferredStudyTime.length === 0) {
      setError('Vui lòng chọn ít nhất 1 khung giờ học')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/user/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          university: formData.university,
          major: formData.major,
          year: formData.year,
          interests: formData.interests,
          studyGoals: formData.studyGoals.split(',').map(g => g.trim()).filter(Boolean),
          preferredStudyTime: formData.preferredStudyTime,
          bio: formData.bio
        })
      })

      if (!response.ok) {
        throw new Error('Không thể hoàn thành hồ sơ')
      }

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AcademicCapIcon className="h-8 w-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Thông tin học vấn
        </h2>
        <p className="text-gray-600">
          Cho chúng tôi biết về trường và ngành học của bạn
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Trường đại học
        </label>
        <select
          name="university"
          value={formData.university}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Chọn trường</option>
          {UNIVERSITIES.map(uni => (
            <option key={uni} value={uni}>{uni}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ngành học
        </label>
        <select
          name="major"
          value={formData.major}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Chọn ngành</option>
          {MAJORS.map(major => (
            <option key={major} value={major}>{major}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Năm học
        </label>
        <select
          name="year"
          value={formData.year}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value={1}>Năm 1</option>
          <option value={2}>Năm 2</option>
          <option value={3}>Năm 3</option>
          <option value={4}>Năm 4</option>
          <option value={5}>Năm 5+</option>
        </select>
      </div>
    </motion.div>
  )

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpenIcon className="h-8 w-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Sở thích học tập
        </h2>
        <p className="text-gray-600">
          Chọn các môn học hoặc lĩnh vực bạn quan tâm
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Chọn ít nhất 3 sở thích
        </label>
        <div className="grid grid-cols-2 gap-3">
          {INTERESTS.map(interest => (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`px-4 py-3 rounded-xl border-2 transition-all ${
                formData.interests.includes(interest)
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mục tiêu học tập (phân cách bằng dấu phẩy)
        </label>
        <textarea
          name="studyGoals"
          value={formData.studyGoals}
          onChange={handleInputChange}
          rows={3}
          placeholder="Ví dụ: Cải thiện điểm số, Chuẩn bị thi, Học thêm kỹ năng mới"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
    </motion.div>
  )

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ClockIcon className="h-8 w-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Thời gian học
        </h2>
        <p className="text-gray-600">
          Khi nào bạn thường học tập?
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Chọn khung giờ phù hợp
        </label>
        <div className="space-y-3">
          {STUDY_TIMES.map(time => (
            <button
              key={time.value}
              type="button"
              onClick={() => toggleStudyTime(time.value)}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all text-left ${
                formData.preferredStudyTime.includes(time.value)
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {time.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Giới thiệu bản thân (tùy chọn)
        </label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          rows={4}
          placeholder="Viết vài dòng về bản thân, sở thích, hoặc điều bạn muốn chia sẻ..."
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
    </motion.div>
  )

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Bước {step} / 3
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((step / 3) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex gap-4">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="flex-1 btn-secondary"
              >
                Quay lại
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={handleNext}
                className="flex-1 btn-primary flex items-center justify-center"
              >
                Tiếp tục
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 btn-primary flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Đang hoàn thành...
                  </>
                ) : (
                  <>
                    Hoàn thành
                    <CheckCircleIcon className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
