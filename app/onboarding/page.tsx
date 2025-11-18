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
import { Step2Bio, Step3Goals, Step5Skills, Step6Languages } from './steps'
import { UNIVERSITIES, MAJORS, type University, type Major, getUniversityById, getMajorById } from '@/lib/data/universities'

const INTERESTS = [
  'Lập trình', 'Toán học', 'Vật lý', 'Hóa học', 'Sinh học',
  'Kinh tế', 'Tài chính', 'Marketing', 'Thiết kế', 'Ngoại ngữ',
  'Văn học', 'Lịch sử', 'Triết học', 'Tâm lý học', 'Khởi nghiệp',
  'Nghệ thuật', 'Âm nhạc', 'Thể thao'
]

const SKILLS = [
  'Microsoft Office', 'Photoshop', 'Video Editing', 'Public Speaking',
  'Writing', 'Research', 'Data Analysis', 'Project Management',
  'Teamwork', 'Leadership', 'Problem Solving', 'Critical Thinking'
]

const LANGUAGES = [
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文 (Chinese)' },
  { value: 'ja', label: '日本語 (Japanese)' },
  { value: 'ko', label: '한국어 (Korean)' },
  { value: 'fr', label: 'Français (French)' },
  { value: 'de', label: 'Deutsch (German)' },
  { value: 'es', label: 'Español (Spanish)' }
]

const STUDY_TIMES = [
  { value: 'morning', label: 'Sáng (6h-12h)', icon: '🌅' },
  { value: 'afternoon', label: 'Chiều (12h-18h)', icon: '☀️' },
  { value: 'evening', label: 'Tối (18h-22h)', icon: '🌆' },
  { value: 'night', label: 'Đêm (22h-6h)', icon: '🌙' }
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Search states for searchable selects
  const [universitySearch, setUniversitySearch] = useState('')
  const [majorSearch, setMajorSearch] = useState('')
  const [showUniversityDropdown, setShowUniversityDropdown] = useState(false)
  const [showMajorDropdown, setShowMajorDropdown] = useState(false)

  const [formData, setFormData] = useState({
    // Step 1: Academic
    university: '',
    major: '',
    year: 1,
    // Step 2: Bio
    bio: '',
    // Step 3: Goals
    studyGoals: '',
    // Step 4: Interests
    interests: [] as string[],
    // Step 5: Skills
    skills: [] as string[],
    // Step 6: Languages
    languages: [] as string[],
    // Step 7: Study Time
    preferredStudyTime: [] as string[]
  })

  useEffect(() => {
    if (!user && !loading) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.searchable-select')) {
        setShowUniversityDropdown(false)
        setShowMajorDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
  }

  const toggleLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
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

  // Filter universities based on search
  const filteredUniversities = UNIVERSITIES.filter(uni =>
    uni.name.toLowerCase().includes(universitySearch.toLowerCase()) ||
    uni.shortName.toLowerCase().includes(universitySearch.toLowerCase()) ||
    uni.location.toLowerCase().includes(universitySearch.toLowerCase())
  )

  // Filter majors based on search
  const filteredMajors = MAJORS.filter(major =>
    major.name.toLowerCase().includes(majorSearch.toLowerCase()) ||
    major.category.toLowerCase().includes(majorSearch.toLowerCase())
  )

  // Select university from dropdown
  const selectUniversity = (uni: University) => {
    setFormData(prev => ({ ...prev, university: uni.id }))
    setUniversitySearch('')
    setShowUniversityDropdown(false)
  }

  // Select major from dropdown
  const selectMajor = (major: Major) => {
    setFormData(prev => ({ ...prev, major: major.id }))
    setMajorSearch('')
    setShowMajorDropdown(false)
  }

  const handleNext = () => {
    // Step 1: Academic - required
    if (step === 1) {
      if (!formData.university || !formData.major || !formData.year) {
        setError('Vui lòng điền đầy đủ thông tin học vấn')
        return
      }
    }
    // Step 2: Bio - optional, no validation
    // Step 3: Goals - optional, no validation
    // Step 4: Interests - required
    else if (step === 4) {
      if (formData.interests.length === 0) {
        setError('Vui lòng chọn ít nhất 1 sở thích')
        return
      }
    }
    // Step 5: Skills - optional
    // Step 6: Languages - optional
    // Step 7: Study Time - required
    else if (step === 7) {
      if (formData.preferredStudyTime.length === 0) {
        setError('Vui lòng chọn ít nhất 1 khung giờ học')
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
    // Final validation
    if (formData.preferredStudyTime.length === 0) {
      setError('Vui lòng chọn ít nhất 1 khung giờ học')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      console.log('Submitting onboarding data:', {
        university: formData.university,
        major: formData.major,
        year: formData.year
      })

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
          skills: formData.skills,
          languages: formData.languages,
          studyGoals: formData.studyGoals.split(',').map(g => g.trim()).filter(Boolean),
          preferredStudyTime: formData.preferredStudyTime,
          bio: formData.bio
        })
      })

      const result = await response.json()
      console.log('API response:', result)

      if (!response.ok) {
        throw new Error(result.error || 'Không thể hoàn thành hồ sơ')
      }

      console.log('Profile completed successfully, redirecting to dashboard...')

      // Force a hard reload to ensure middleware picks up the updated profile status
      window.location.href = '/dashboard'
    } catch (err) {
      console.error('Error completing profile:', err)
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        {/* Progress Section */}
        <div className="mb-8 bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">
              Bước {step} / 7
            </span>
            <span className="text-sm font-medium text-primary-600">
              {Math.round((step / 7) * 100)}% hoàn thành
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(step / 7) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full shadow-sm"
            />
          </div>

          {/* Step indicators */}
          <div className="grid grid-cols-7 gap-2 mt-6">
            {[
              { num: 1, label: 'Học vấn', icon: '🎓' },
              { num: 2, label: 'Giới thiệu', icon: '👋' },
              { num: 3, label: 'Mục tiêu', icon: '🎯' },
              { num: 4, label: 'Sở thích', icon: '📚' },
              { num: 5, label: 'Kỹ năng', icon: '💡' },
              { num: 6, label: 'Ngôn ngữ', icon: '🌍' },
              { num: 7, label: 'Thời gian', icon: '⏰' }
            ].map((s) => (
              <div key={s.num} className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all ${s.num < step ? 'bg-primary-600 text-white' :
                  s.num === step ? 'bg-primary-600 text-white ring-4 ring-primary-100 scale-110' :
                    'bg-gray-200 text-gray-400'
                  }`}>
                  {s.num < step ? '✓' : s.icon}
                </div>
                <span className={`text-[10px] mt-1 font-medium text-center ${s.num === step ? 'text-primary-600' : 'text-gray-400'
                  }`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10">
          {/* Step 1: Academic Info */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                >
                  <AcademicCapIcon className="h-8 w-8 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Thông tin học vấn
                </h2>
                <p className="text-gray-600">
                  Cho chúng tôi biết về trường và ngành học của bạn
                </p>
              </div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative searchable-select">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trường đại học
                  {formData.university && (
                    <span className="ml-2 text-xs text-primary-600 font-normal">✓ Đã chọn: {getUniversityById(formData.university)?.name}</span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={universitySearch}
                    onChange={(e) => {
                      setUniversitySearch(e.target.value)
                      setShowUniversityDropdown(true)
                    }}
                    onFocus={() => setShowUniversityDropdown(true)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    placeholder={formData.university ? getUniversityById(formData.university)?.name : "Tìm kiếm trường đại học..."}
                  />
                  {showUniversityDropdown && filteredUniversities.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {filteredUniversities.map((uni) => (
                        <button
                          key={uni.id}
                          type="button"
                          onClick={() => selectUniversity(uni)}
                          className="w-full px-4 py-3 text-left hover:bg-primary-50 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <div className={formData.university === uni.id ? 'text-primary-600' : 'text-gray-700'}>
                            <span className={formData.university === uni.id ? 'font-medium' : ''}>
                              {uni.name}
                            </span>
                            <span className="block text-xs text-gray-500 mt-0.5">
                              {uni.shortName} • {uni.location}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative searchable-select">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngành học
                  {formData.major && (
                    <span className="ml-2 text-xs text-primary-600 font-normal">✓ Đã chọn: {getMajorById(formData.major)?.name}</span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={majorSearch}
                    onChange={(e) => {
                      setMajorSearch(e.target.value)
                      setShowMajorDropdown(true)
                    }}
                    onFocus={() => setShowMajorDropdown(true)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    placeholder={formData.major ? getMajorById(formData.major)?.name : "Tìm kiếm ngành học..."}
                  />
                  {showMajorDropdown && filteredMajors.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {filteredMajors.map((major) => (
                        <button
                          key={major.id}
                          type="button"
                          onClick={() => selectMajor(major)}
                          className="w-full px-4 py-3 text-left hover:bg-primary-50 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <div className={formData.major === major.id ? 'text-primary-600' : 'text-gray-700'}>
                            <span className={formData.major === major.id ? 'font-medium' : ''}>
                              {major.name}
                            </span>
                            <span className="block text-xs text-gray-500 mt-0.5">
                              {major.category}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Năm học</label>
                <div className="grid grid-cols-5 gap-3">
                  {[1, 2, 3, 4, 5].map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, year }))}
                      className={`py-3 rounded-xl border-2 transition-all font-semibold text-sm ${formData.year === year
                        ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-md scale-105'
                        : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                        }`}
                    >
                      {year === 5 ? '5+' : year}
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Step 2: Bio/Introduction */}
          {step === 2 && (
            <Step2Bio formData={formData} handleInputChange={handleInputChange} />
          )}

          {/* Step 3: Study Goals */}
          {step === 3 && (
            <Step3Goals formData={formData} handleInputChange={handleInputChange} />
          )}

          {/* Step 4: Interests */}
          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                >
                  <BookOpenIcon className="h-8 w-8 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Sở thích học tập
                </h2>
                <p className="text-gray-600">
                  Chọn các môn học hoặc lĩnh vực bạn quan tâm
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">Sở thích của bạn</label>
                  <span className="text-xs text-primary-600 font-medium">{formData.interests.length} đã chọn</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {INTERESTS.map((interest, index) => (
                    <motion.button
                      key={interest}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-3 rounded-xl border-2 transition-all font-medium text-sm ${formData.interests.includes(interest)
                        ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-md scale-105'
                        : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                        }`}
                    >
                      {interest}
                    </motion.button>
                  ))}
                </div>
              </div>


            </motion.div>
          )}

          {/* Step 5: Skills */}
          {step === 5 && (
            <Step5Skills formData={formData} toggleSkill={toggleSkill} SKILLS={SKILLS} />
          )}

          {/* Step 6: Languages */}
          {step === 6 && (
            <Step6Languages formData={formData} toggleLanguage={toggleLanguage} LANGUAGES={LANGUAGES} />
          )}

          {/* Step 7: Study Time & Final */}
          {step === 7 && (

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                >
                  <ClockIcon className="h-8 w-8 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Thời gian học
                </h2>
                <p className="text-gray-600">
                  Khi nào bạn thường học tập?
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">Khung giờ học</label>
                  <span className="text-xs text-purple-600 font-medium">{formData.preferredStudyTime.length} đã chọn</span>
                </div>
                <div className="space-y-3">
                  {STUDY_TIMES.map((time, index) => (
                    <motion.button
                      key={time.value}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      type="button"
                      onClick={() => toggleStudyTime(time.value)}
                      className={`w-full px-5 py-4 rounded-xl border-2 transition-all text-left flex items-center gap-3 font-medium ${formData.preferredStudyTime.includes(time.value)
                        ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-md'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                        }`}
                    >
                      <span className="text-2xl">{time.icon}</span>
                      <span>{time.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>


            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl"
            >
              <p className="text-sm">{error}</p>
            </motion.div>
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
            {step < 7 ? (
              <button
                onClick={handleNext}
                className="flex-1 btn-primary flex items-center justify-center group"
              >
                Tiếp tục
                <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
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
