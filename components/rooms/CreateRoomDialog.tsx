'use client'

import { useState } from 'react'
import { FormDialog } from '@/components/ui/Dialog'
import {
  UserGroupIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  ComputerDesktopIcon,
  LockClosedIcon,
  SpeakerWaveIcon,
  XMarkIcon,
  HashtagIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface CreateRoomDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface CreateRoomForm {
  name: string
  description: string
  type: 'STUDY_GROUP' | 'DISCUSSION' | 'HELP_SESSION' | 'CASUAL'
  topic: string
  maxMembers: number
  isPrivate: boolean
  password: string
  allowVideo: boolean
  allowVoice: boolean
  allowText: boolean
  allowScreenShare: boolean
  tags: string[]
}

export function CreateRoomDialog({ isOpen, onClose, onSuccess }: CreateRoomDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [form, setForm] = useState<CreateRoomForm>({
    name: '',
    description: '',
    type: 'STUDY_GROUP',
    topic: '',
    maxMembers: 10,
    isPrivate: false,
    password: '',
    allowVideo: true,
    allowVoice: true,
    allowText: true,
    allowScreenShare: false,
    tags: []
  })

  const roomTypes = [
    { value: 'STUDY_GROUP', label: 'Nhóm học tập', description: 'Tập trung vào học nhóm và ôn tập' },
    { value: 'DISCUSSION', label: 'Thảo luận', description: 'Thảo luận về chủ đề cụ thể' },
    { value: 'HELP_SESSION', label: 'Hỗ trợ học tập', description: 'Giúp đỡ và giải đáp thắc mắc' },
    { value: 'CASUAL', label: 'Trò chuyện', description: 'Giao lưu thoải mái, không chính thức' }
  ]

  const predefinedTopics = [
    'Toán học', 'Vật lý', 'Hóa học', 'Sinh học',
    'Khoa học máy tính', 'Lập trình', 'AI/Machine Learning',
    'Kinh tế', 'Quản trị kinh doanh', 'Marketing',
    'Ngôn ngữ học', 'Tiếng Anh', 'Văn học',
    'Lịch sử', 'Địa lý', 'Triết học',
    'Kỹ thuật', 'Kiến trúc', 'Y học',
    'Luật', 'Tâm lý học', 'Giáo dục'
  ]

  const addTag = () => {
    if (newTag.trim() && !form.tags.includes(newTag.trim()) && form.tags.length < 5) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (index: number) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!form.name.trim()) {
      toast.error('Vui lòng nhập tên phòng')
      return
    }

    if (!form.topic.trim()) {
      toast.error('Vui lòng nhập chủ đề')
      return
    }

    if (form.isPrivate && !form.password.trim()) {
      toast.error('Vui lòng nhập mật khẩu cho phòng riêng tư')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create room')
      }

      const data = await response.json()
      toast.success('Tạo phòng thành công!')
      
      // Reset form
      setForm({
        name: '',
        description: '',
        type: 'STUDY_GROUP',
        topic: '',
        maxMembers: 10,
        isPrivate: false,
        password: '',
        allowVideo: true,
        allowVoice: true,
        allowText: true,
        allowScreenShare: false,
        tags: []
      })
      setNewTag('')

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error creating room:', error)
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo phòng')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo phòng học mới"
      description="Thiết lập phòng học nhóm của bạn"
      onSubmit={handleSubmit}
      submitText={isLoading ? "Đang tạo..." : "Tạo phòng"}
      cancelText="Hủy"
      isLoading={isLoading}
      size="lg"
    >
      {/* Basic Info */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên phòng *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Ví dụ: Luyện thi FE/UI"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mô tả
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Mô tả về phòng học, mục tiêu và nội dung..."
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại phòng *
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            >
              {roomTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              {roomTypes.find(t => t.value === form.type)?.description}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chủ đề *
            </label>
            <input
              type="text"
              list="topics"
              value={form.topic}
              onChange={(e) => setForm(prev => ({ ...prev, topic: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Chọn hoặc nhập chủ đề"
              required
            />
            <datalist id="topics">
              {predefinedTopics.map((topic) => (
                <option key={topic} value={topic} />
              ))}
            </datalist>
          </div>
        </div>
      </div>

      {/* Room Settings */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Cài đặt phòng</h3>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số thành viên tối đa
            </label>
            <select
              value={form.maxMembers}
              onChange={(e) => setForm(prev => ({ ...prev, maxMembers: parseInt(e.target.value) }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {[5, 10, 15, 20, 25, 30].map((num) => (
                <option key={num} value={num}>{num} người</option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={form.isPrivate}
                onChange={(e) => setForm(prev => ({ ...prev, isPrivate: e.target.checked }))}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <LockClosedIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900">Phòng riêng tư</span>
                </div>
                <p className="text-xs text-gray-500">Cần mật khẩu để tham gia</p>
              </div>
            </label>
          </div>
        </div>

        {form.isPrivate && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu phòng
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Nhập mật khẩu..."
              required={form.isPrivate}
            />
          </div>
        )}

        {/* Features */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Tính năng được phép</h4>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={form.allowVideo}
                onChange={(e) => setForm(prev => ({ ...prev, allowVideo: e.target.checked }))}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <div className="flex items-center space-x-2">
                <VideoCameraIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-900">Video</span>
              </div>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={form.allowVoice}
                onChange={(e) => setForm(prev => ({ ...prev, allowVoice: e.target.checked }))}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <div className="flex items-center space-x-2">
                <SpeakerWaveIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-900">Voice</span>
              </div>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={form.allowText}
                onChange={(e) => setForm(prev => ({ ...prev, allowText: e.target.checked }))}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <div className="flex items-center space-x-2">
                <ChatBubbleLeftRightIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-900">Chat</span>
              </div>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={form.allowScreenShare}
                onChange={(e) => setForm(prev => ({ ...prev, allowScreenShare: e.target.checked }))}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <div className="flex items-center space-x-2">
                <ComputerDesktopIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-900">Chia sẻ màn hình</span>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Premium</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags (tối đa 5)
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {form.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
            >
              <HashtagIcon className="h-3 w-3 mr-1" />
              {tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="ml-2 text-primary-600 hover:text-primary-800"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Thêm tag..."
            disabled={form.tags.length >= 5}
          />
          <button
            type="button"
            onClick={addTag}
            disabled={!newTag.trim() || form.tags.length >= 5}
            className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Thêm
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Tags giúp người khác dễ tìm thấy phòng của bạn
        </p>
      </div>
    </FormDialog>
  )
}