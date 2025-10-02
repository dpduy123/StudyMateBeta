'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/components/providers/Providers'
import { useProfile } from '@/hooks/useProfile'
import { UserProfile, EditProfileFormData } from './types'
import { SearchableDropdown, DropdownOption } from '@/components/ui/SearchableDropdown'
import { UNIVERSITIES, MAJORS, University, Major } from '@/lib/data/universities'
import {
  XMarkIcon,
  CameraIcon,
  UserIcon,
  AcademicCapIcon,
  MapPinIcon,
  GlobeAltIcon,
  StarIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface EditProfileDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  currentProfile?: UserProfile | null
}

export function EditProfileDialog({
  isOpen,
  onClose,
  onSuccess,
  currentProfile
}: EditProfileDialogProps) {
  const { user } = useAuth()
  const { updateProfile } = useProfile()
  const [isLoading, setIsLoading] = useState(false)
  const [avatar, setAvatar] = useState('')
  const [formData, setFormData] = useState<EditProfileFormData>({
    firstName: '',
    lastName: '',
    bio: '',
    university: '',
    major: '',
    year: 1,
    gpa: '',
    interests: [],
    skills: [],
    studyGoals: [],
    preferredStudyTime: [],
    languages: []
  })

  // Convert data for dropdowns
  const universityOptions: DropdownOption[] = UNIVERSITIES.map(uni => ({
    id: uni.id,
    name: uni.name,
    description: uni.shortName,
    location: uni.location,
    category: uni.type === 'public' ? 'Công lập' : uni.type === 'private' ? 'Tư thục' : 'Quốc tế'
  }))

  const majorOptions: DropdownOption[] = MAJORS.map(major => ({
    id: major.id,
    name: major.name,
    description: major.description,
    category: major.category
  }))

  // Populate form data when dialog opens
  useEffect(() => {
    if (isOpen && currentProfile) {
      setFormData({
        firstName: currentProfile.firstName || '',
        lastName: currentProfile.lastName || '',
        bio: currentProfile.bio || '',
        university: currentProfile.university || '',
        major: currentProfile.major || '',
        year: currentProfile.year || 1,
        gpa: currentProfile.gpa?.toString() || '',
        interests: currentProfile.interests || [],
        skills: currentProfile.skills || [],
        studyGoals: currentProfile.studyGoals || [],
        preferredStudyTime: currentProfile.preferredStudyTime || [],
        languages: currentProfile.languages || []
      })
      setAvatar(currentProfile.avatar || '')
    }
  }, [isOpen, currentProfile])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addArrayItem = (field: string, value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field as keyof typeof prev] as string[]), value.trim()]
      }))
    }
  }

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).filter((_, i) => i !== index)
    }))
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setAvatar(data.url)
        toast.success('Avatar đã được tải lên!')
      } else {
        toast.error('Không thể tải lên avatar')
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('Có lỗi xảy ra khi tải lên avatar')
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
        body: JSON.stringify({
          ...formData,
          avatar,
        }),
      })

      if (response.ok) {
        const updatedData = await response.json()

        // Update global cache with complete data
        updateProfile({
          firstName: formData.firstName,
          lastName: formData.lastName,
          bio: formData.bio,
          avatar: avatar,
          university: formData.university,
          major: formData.major,
          year: formData.year,
          gpa: formData.gpa ? parseFloat(formData.gpa) : undefined,
          interests: formData.interests,
          skills: formData.skills,
          studyGoals: formData.studyGoals,
          preferredStudyTime: formData.preferredStudyTime,
          languages: formData.languages
        })

        toast.success('Hồ sơ đã được cập nhật!')
        onSuccess()
        onClose()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Không thể cập nhật hồ sơ')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Dialog */}
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Chỉnh sửa hồ sơ</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="p-6 space-y-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="Avatar"
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white shadow-lg flex items-center justify-center">
                        <UserIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 p-2 bg-primary-600 rounded-full hover:bg-primary-700 transition-colors cursor-pointer">
                      <CameraIcon className="h-4 w-4 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="input-field"
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
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={3}
                    className="input-field resize-none"
                    placeholder="Chia sẻ về bản thân, sở thích và mục tiêu học tập..."
                  />
                </div>

                {/* Academic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPinIcon className="h-4 w-4 inline mr-1" />
                      Trường đại học
                    </label>
                    <SearchableDropdown
                      options={universityOptions}
                      value={formData.university}
                      onChange={(value) => handleInputChange('university', value)}
                      placeholder="Chọn trường đại học..."
                      searchPlaceholder="Tìm kiếm trường..."
                      className="w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <AcademicCapIcon className="h-4 w-4 inline mr-1" />
                      Ngành học
                    </label>
                    <SearchableDropdown
                      options={majorOptions}
                      value={formData.major}
                      onChange={(value) => handleInputChange('major', value)}
                      placeholder="Chọn ngành học..."
                      searchPlaceholder="Tìm kiếm ngành..."
                      className="w-full"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Năm học
                    </label>
                    <select
                      value={formData.year}
                      onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                      className="input-field"
                    >
                      <option value={1}>Năm 1</option>
                      <option value={2}>Năm 2</option>
                      <option value={3}>Năm 3</option>
                      <option value={4}>Năm 4</option>
                      <option value={5}>Năm 5+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <StarIcon className="h-4 w-4 inline mr-1" />
                      GPA (tùy chọn)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                      value={formData.gpa}
                      onChange={(e) => handleInputChange('gpa', e.target.value)}
                      className="input-field"
                      placeholder="3.5"
                    />
                  </div>
                </div>

                {/* Arrays - Interests, Skills, etc. */}
                {[
                  { field: 'interests', label: 'Sở thích', placeholder: 'Thêm sở thích...' },
                  { field: 'skills', label: 'Kỹ năng', placeholder: 'Thêm kỹ năng...' },
                  { field: 'studyGoals', label: 'Mục tiêu học tập', placeholder: 'Thêm mục tiêu...' },
                  { field: 'preferredStudyTime', label: 'Thời gian học ưa thích', placeholder: 'VD: Sáng, Chiều...' },
                  { field: 'languages', label: 'Ngôn ngữ', placeholder: 'Thêm ngôn ngữ...' }
                ].map(({ field, label, placeholder }) => (
                  <ArrayField
                    key={field}
                    field={field}
                    label={label}
                    placeholder={placeholder}
                    values={formData[field as keyof typeof formData] as string[]}
                    onAdd={(value) => addArrayItem(field, value)}
                    onRemove={(index) => removeArrayItem(field, index)}
                  />
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary"
                  disabled={isLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isLoading}
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
    </AnimatePresence>
  )
}

// Component for array fields (interests, skills, etc.)
function ArrayField({
  field,
  label,
  placeholder,
  values,
  onAdd,
  onRemove
}: {
  field: string
  label: string
  placeholder: string
  values: string[]
  onAdd: (value: string) => void
  onRemove: (index: number) => void
}) {
  const [inputValue, setInputValue] = useState('')

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue)
      setInputValue('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {/* Display current values */}
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {values.map((value, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-700"
            >
              {value}
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="ml-1 p-0.5 rounded-full hover:bg-primary-200 transition-colors"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Add new value */}
      <div className="flex space-x-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="input-field flex-1"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}