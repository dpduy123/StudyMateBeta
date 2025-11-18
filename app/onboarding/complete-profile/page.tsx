'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/Providers'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  AcademicCapIcon,
  BookOpenIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface OnboardingForm {
  university: string
  major: string
  year: number
  interests: string[]
  skills: string[]
  preferredStudyTime: string[]
}

export default function CompleteProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [checkingProfile, setCheckingProfile] = useState(true)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<OnboardingForm>({
    university: '',
    major: '',
    year: 1,
    interests: [],
    skills: [],
    preferredStudyTime: []
  })

  // Check if profile is already complete
  useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
        router.push('/auth/login')
        return
      }

      try {
        const response = await fetch('/api/profile')
        if (response.ok) {
          const data = await response.json()
          const profile = data.profile

          // Check if university and major are filled (required fields)
          if (profile.university && profile.major) {
            // Profile already complete, redirect to dashboard
            router.push('/dashboard')
            return
          }
        }
      } catch (error) {
        console.error('Error checking profile:', error)
      } finally {
        setCheckingProfile(false)
      }
    }

    checkProfile()
  }, [user, router])

  const universities = [
    'Đại học Bách Khoa TP.HCM',
    'Đại học Quốc gia TP.HCM',
    'Đại học Kinh tế TP.HCM',
    'Đại học Công nghệ Thông tin',
    'Đại học Y Dược TP.HCM',
    'Đại học Nông Lâm TP.HCM',
    'Đại học Khoa học Tự nhiên',
    'Đại học Sư phạm TP.HCM',
    'Đại học Tôn Đức Thắng',
    'Đại học Hoa Sen'
  ]

  const majors = [
    'Khoa học Máy tính',
    'Công nghệ Thông tin',
    'Kỹ thuật Phần mềm',
    'Khoa học Dữ liệu',
    'Trí tuệ Nhân tạo',
    'An toàn Thông tin',
    'Kỹ thuật Điện tử',
    'Kỹ thuật Cơ khí',
    'Kỹ thuật Hóa học',
    'Kinh tế',
    'Quản trị Kinh doanh',
    'Marketing',
    'Kế toán',
    'Tài chính - Ngân hàng',
    'Y khoa',
    'Dược học',
    'Kiến trúc',
    'Luật',
    'Ngôn ngữ Anh',
    'Khác'
  ]

  const interestOptions = [
    'Coding', 'Machine Learning', 'AI', 'Data Science',
    'Web Development', 'Mobile Development', 'Game Development',
    'Marketing', 'Business', 'Finance', 'Startup',
    'Reading', 'Writing', 'Music', 'Art',
    'Sports', 'Gaming', 'Travel', 'Photography'
  ]

  const skillOptions = [
    'Python', 'JavaScript', 'Java', 'C++', 'React', 'Node.js',
    'Data Analysis', 'Machine Learning', 'SQL', 'MongoDB',
    'Photoshop', 'Illustrator', 'Video Editing',
    'Communication', 'Leadership', 'Teamwork',
    'Excel', 'PowerPoint', 'Research', 'Writing'
  ]

  const studyTimeOptions = [
    'Sáng sớm (6:00-8:00)',
    'Buổi sáng (8:00-12:00)',
    'Buổi trưa (12:00-14:00)',
    'Buổi chiều (14:00-18:00)',
    'Buổi tối (18:00-22:00)',
    'Đêm muộn (22:00-24:00)',
    'Cuối tuần',
    'Ngày thường'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!form.university) {
      toast.error('Vui lòng chọn trường đại học')
      return
    }

    if (!form.major) {
      toast.error('Vui lòng chọn ngành học')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      toast.success('Hoàn thành profile thành công!')

      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard')
      }, 500)

    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item)
    }
    return [...array, item]
  }

  if (checkingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center">
              <SparklesIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chào mừng đến với StudyMate! 🎉
          </h1>
          <p className="text-gray-600">
            Hãy hoàn thành profile để chúng tôi tìm được những người bạn học phù hợp nhất cho bạn
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= s ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > s ? <CheckCircleIcon className="h-6 w-6" /> : s}
                </div>
                {s < 2 && (
                  <div className={`w-16 h-1 ${step > s ? 'bg-primary-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Basic Info (Required) */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <AcademicCapIcon className="h-6 w-6 text-primary-600" />
                  <h2 className="text-xl font-bold text-gray-900">Thông tin học tập</h2>
                  <span className="text-sm text-red-600">*Bắt buộc</span>
                </div>

                {/* University */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trường đại học <span className="text-red-600">*</span>
                  </label>
                  <select
                    required
                    value={form.university}
                    onChange={(e) => setForm({ ...form, university: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Chọn trường đại học</option>
                    {universities.map((uni) => (
                      <option key={uni} value={uni}>{uni}</option>
                    ))}
                  </select>
                </div>

                {/* Major */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngành học <span className="text-red-600">*</span>
                  </label>
                  <select
                    required
                    value={form.major}
                    onChange={(e) => setForm({ ...form, major: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Chọn ngành học</option>
                    {majors.map((major) => (
                      <option key={major} value={major}>{major}</option>
                    ))}
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Năm học hiện tại
                  </label>
                  <select
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {[1, 2, 3, 4, 5].map((year) => (
                      <option key={year} value={year}>Năm {year}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!form.university || !form.major) {
                      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
                      return
                    }
                    setStep(2)
                  }}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <span>Tiếp theo</span>
                  <ArrowRightIcon className="h-5 w-5" />
                </button>
              </motion.div>
            )}

            {/* Step 2: Additional Info (Optional) */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <BookOpenIcon className="h-6 w-6 text-primary-600" />
                  <h2 className="text-xl font-bold text-gray-900">Sở thích & Kỹ năng</h2>
                  <span className="text-sm text-gray-500">(Tùy chọn - giúp matching tốt hơn)</span>
                </div>

                {/* Interests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Sở thích của bạn
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {interestOptions.map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => setForm({
                          ...form,
                          interests: toggleArrayItem(form.interests, interest)
                        })}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                          form.interests.includes(interest)
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Kỹ năng của bạn
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {skillOptions.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => setForm({
                          ...form,
                          skills: toggleArrayItem(form.skills, skill)
                        })}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                          form.skills.includes(skill)
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Study Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Thời gian học ưa thích
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {studyTimeOptions.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setForm({
                          ...form,
                          preferredStudyTime: toggleArrayItem(form.preferredStudyTime, time)
                        })}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                          form.preferredStudyTime.includes(time)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 btn-secondary"
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 btn-primary"
                  >
                    {isLoading ? 'Đang lưu...' : 'Hoàn thành'}
                  </button>
                </div>

                <p className="text-sm text-gray-500 text-center">
                  Bạn có thể cập nhật thông tin này sau trong phần Cài đặt
                </p>
              </motion.div>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  )
}
