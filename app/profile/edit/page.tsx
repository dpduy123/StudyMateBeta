'use client'

import { useState, useEffect, useRef } from 'react'
import AuthGuard from '@/components/guards/AuthGuard'
import { useAuth } from '@/components/providers/Providers'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  UserCircleIcon,
  CameraIcon,
  XMarkIcon,
  PlusIcon,
  AcademicCapIcon,
  MapPinIcon,
  ClockIcon,
  BookOpenIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface EditProfileForm {
  firstName: string
  lastName: string
  bio: string
  university: string
  major: string
  year: number
  gpa: number | null
  interests: string[]
  skills: string[]
  studyGoals: string[]
  preferredStudyTime: string[]
  languages: string[]
  avatar?: string
}

export default function EditProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [newInterest, setNewInterest] = useState('')
  const [newSkill, setNewSkill] = useState('')
  const [newGoal, setNewGoal] = useState('')
  const [newLanguage, setNewLanguage] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avtImage, setavtImage] = useState<File | null>(null)
  const [form, setForm] = useState<EditProfileForm>({
    firstName: '',
    lastName: '',
    bio: '',
    university: '',
    major: '',
    year: 1,
    gpa: null,
    interests: [],
    skills: [],
    studyGoals: [],
    preferredStudyTime: [],
    languages: [],
    avatar: undefined
  })

  const studyTimeOptions = [
    'Sáng sớm', 'Buổi sáng', 'Buổi trưa', 'Buổi chiều',
    'Buổi tối', 'Đêm muộn', 'Cuối tuần', 'Ngày thường'
  ]

  const universities = [
    'Đại học Công nghệ Thông tin - ĐHQG TP.HCM',
  'Đại học Khoa học Tự nhiên - ĐHQG TP.HCM',
  'Đại học Khoa học Xã hội và Nhân văn - ĐHQG TP.HCM',
  'Đại học Bách Khoa TP.HCM',
  'Đại học Tài Chính Marketing',
  'Đại học FPT',
  'Đại học Bách Khoa Hà Nội',
  'Đại học Ngoại thương',
  'Đại học Y Hà Nội',
  'Học viện Ngân hàng',
  'Đại học Kinh tế TP.HCM',
  'Đại học Y Dược TP.HCM',
  'Đại học Nông Lâm TP.HCM',
  'Đại học Công nghệ - ĐHQGHN',
  'Đại học Khoa học Tự nhiên - ĐHQGHN',
  'Đại học Khoa học Xã hội và Nhân văn - ĐHQGHN',
  'Khác'
  ]

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      try {
        const response = await fetch('/api/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          const profile = data.profile
          setForm({
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            bio: profile.bio || '',
            university: profile.university || '',
            major: profile.major || '',
            year: profile.year || 1,
            gpa: profile.gpa || null,
            interests: profile.interests || [],
            skills: profile.skills || [],
            studyGoals: profile.studyGoals || [],
            preferredStudyTime: profile.preferredStudyTime || [],
            languages: profile.languages || [],
            avatar: profile.avatar || undefined
          })
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }

    fetchProfile()
  }, [user])

  const handleImageUpload = async (file: File) => {
    if (!user) return null

    setIsUploading(true)
    try {
      // Create FormData to send file
      const formData = new FormData()
      formData.append('file', file)

      // Upload via API endpoint
      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      console.log('Upload successful, URL:', data.url)
      return data.url
    } catch (error) {
      console.error('Error uploading image:', error)
      if (error instanceof Error) {
        toast.error(`Lỗi tải lên ảnh: ${error.message}`)
      } else {
        toast.error('Lỗi khi tải lên ảnh')
      }
      return null
    } finally {
      setIsUploading(false)
    }
  }


  const handleCameraClick = () => {
    fileInputRef.current?.click()
  }

  const handleDisplayImage = () => {
    // Priority order:
    // 1. If user just selected a new file, show preview of that file
    // 2. If no new file but has existing avatar URL, show that
    // 3. Otherwise show default icon

    if (avtImage) {
      // Show preview of newly selected file
      return URL.createObjectURL(avtImage)
    } else if (form.avatar) {
      // Show existing avatar from database
      return form.avatar
    }
    // Return null to show default UserCircleIcon
    return null
  }

  const handleAvtChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh')
      return
    }

    // Validate file size (33MB max)
    if (file.size > 33 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 33MB')
      return
    }

    // Set the image file to state
    setavtImage(file)

    // Upload and save avatar
    const avatarUrl = await handleImageUpload(file)
    if (avatarUrl) {
      // Update form state
      setForm(prev => ({
        ...prev,
        avatar: avatarUrl
      }))

      // Automatically save avatar URL to database
      try {
        const response = await fetch('/api/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...form,
            avatar: avatarUrl
          }),
        })

        if (response.ok) {
          console.log('Avatar saved to database successfully')
          toast.success('Ảnh đại diện đã được cập nhật!')
        } else {
          console.error('Failed to save avatar to database:', response.status)
          toast.error('Tải lên thành công nhưng không thể lưu vào hồ sơ')
        }
      } catch (error) {
        console.error('Error saving avatar to profile:', error)
        toast.error('Tải lên thành công nhưng không thể lưu vào hồ sơ')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      await response.json()
      toast.success('Cập nhật hồ sơ thành công!')
      router.push('/profile')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Có lỗi xảy ra khi cập nhật hồ sơ')
    } finally {
      setIsLoading(false)
    }
  }

  const addToArray = (arrayName: keyof EditProfileForm, value: string, setValue: (val: string) => void) => {
    const currentArray = form[arrayName]
    if (value.trim() && Array.isArray(currentArray) && !currentArray.includes(value.trim())) {
      setForm(prev => ({
        ...prev,
        [arrayName]: [...(prev[arrayName] as string[]), value.trim()]
      }))
      setValue('')
    }
  }

  const removeFromArray = (arrayName: keyof EditProfileForm, index: number) => {
    setForm(prev => ({
      ...prev,
      [arrayName]: (prev[arrayName] as string[]).filter((_, i) => i !== index)
    }))
  }

  const toggleStudyTime = (time: string) => {
    setForm(prev => ({
      ...prev,
      preferredStudyTime: prev.preferredStudyTime.includes(time)
        ? prev.preferredStudyTime.filter(t => t !== time)
        : [...prev.preferredStudyTime, time]
    }))
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Vui lòng đăng nhập</h2>
          <Link href="/auth/login" className="text-primary-600 hover:text-primary-500">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8"
        >
          <div className="px-6 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa hồ sơ</h1>
              <Link
                href="/profile"
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </Link>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Avatar Section */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                {handleDisplayImage() ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={handleDisplayImage()!}
                    alt="Avatar preview"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                    <UserCircleIcon className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleCameraClick}
                  disabled={isUploading}
                  className="absolute bottom-0 right-0 p-1.5 bg-primary-600 rounded-full hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <CameraIcon className="h-4 w-4 text-white" />
                  )}
                </button>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Ảnh đại diện</h3>
                <p className="text-sm text-gray-600">
                  {isUploading ? 'Đang tải lên...' : 'Tải lên ảnh đại diện của bạn (Tối đa 33MB)'}
                </p>
              </div>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvtChange}
                className="hidden"
              />
            </div>

            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ
                </label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên
                </label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giới thiệu bản thân
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Kể về bản thân, sở thích học tập và mục tiêu của bạn..."
              />
            </div>

            {/* Academic Info */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <AcademicCapIcon className="h-5 w-5 text-primary-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Thông tin học tập</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trường đại học
                  </label>
                  <select
                    value={form.university}
                    onChange={(e) => setForm(prev => ({ ...prev, university: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">Chọn trường</option>
                    {universities.map((uni) => (
                      <option key={uni} value={uni}>{uni}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chuyên ngành
                  </label>
                  <input
                    type="text"
                    value={form.major}
                    onChange={(e) => setForm(prev => ({ ...prev, major: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                    placeholder="Ví dụ: Khoa học máy tính"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Năm học
                  </label>
                  <select
                    value={form.year}
                    onChange={(e) => setForm(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    {[1, 2, 3, 4, 5].map((year) => (
                      <option key={year} value={year}>Năm {year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GPA (tùy chọn)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="4"
                    value={form.gpa || ''}
                    onChange={(e) => setForm(prev => ({ ...prev, gpa: e.target.value ? parseFloat(e.target.value) : null }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="3.5"
                  />
                </div>
              </div>
            </div>

            {/* Study Time Preferences */}
            <div>
              <div className="flex items-center mb-4">
                <ClockIcon className="h-5 w-5 text-primary-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Thời gian học yêu thích</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {studyTimeOptions.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => toggleStudyTime(time)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      form.preferredStudyTime.includes(time)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div>
              <div className="flex items-center mb-4">
                <BookOpenIcon className="h-5 w-5 text-primary-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Sở thích học tập</h3>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {form.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => removeFromArray('interests', index)}
                      className="ml-2 text-primary-600 hover:text-primary-800"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('interests', newInterest, setNewInterest))}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Thêm sở thích..."
                />
                <button
                  type="button"
                  onClick={() => addToArray('interests', newInterest, setNewInterest)}
                  className="p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Skills */}
            <div>
              <div className="flex items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Kỹ năng</h3>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {form.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeFromArray('skills', index)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('skills', newSkill, setNewSkill))}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Thêm kỹ năng..."
                />
                <button
                  type="button"
                  onClick={() => addToArray('skills', newSkill, setNewSkill)}
                  className="p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Study Goals */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Mục tiêu học tập</h3>
              <div className="space-y-2 mb-3">
                {form.studyGoals.map((goal, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-xl"
                  >
                    <span className="text-yellow-800">{goal}</span>
                    <button
                      type="button"
                      onClick={() => removeFromArray('studyGoals', index)}
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('studyGoals', newGoal, setNewGoal))}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Thêm mục tiêu..."
                />
                <button
                  type="button"
                  onClick={() => addToArray('studyGoals', newGoal, setNewGoal)}
                  className="p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Languages */}
            <div>
              <div className="flex items-center mb-4">
                <GlobeAltIcon className="h-5 w-5 text-primary-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Ngôn ngữ</h3>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {form.languages.map((language, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {language}
                    <button
                      type="button"
                      onClick={() => removeFromArray('languages', index)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('languages', newLanguage, setNewLanguage))}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Thêm ngôn ngữ..."
                />
                <button
                  type="button"
                  onClick={() => addToArray('languages', newLanguage, setNewLanguage)}
                  className="p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                href="/profile"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Hủy
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang lưu...</span>
                  </div>
                ) : (
                  'Lưu thay đổi'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
      </div>
    </AuthGuard>
  )
}