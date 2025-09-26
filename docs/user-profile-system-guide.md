# 👤 Complete User Profile System Guide

Comprehensive guide for implementing a full-featured user profile system in a Next.js + Supabase + Prisma application.

## 🎯 Overview

This system provides:
- **Complete User Profiles** - Personal info, academic details, preferences
- **Avatar Upload & Display** - Profile picture management with secure storage
- **Real-time Data** - Dynamic profile updates with instant UI refresh
- **Secure Authentication** - Supabase Auth integration
- **Database Management** - Prisma ORM with PostgreSQL
- **Responsive UI** - Modern interface that works on all devices

## 🏗️ Architecture

### **Tech Stack**
- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma
- **Authentication**: Supabase Auth  
- **Storage**: Supabase Storage (for avatars)
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **Animations**: Framer Motion
- **Notifications**: React Hot Toast

### **System Components**
```
User Profile System/
├── Database Schema (Prisma)
├── API Layer (Next.js API Routes)
├── Frontend Pages (React Components)
├── Storage System (Supabase Storage)
└── Authentication (Supabase Auth)
```

## 🗄️ Database Setup

### **Step 1: Prisma Schema Configuration**

Create your Prisma schema with the User model:

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  output   = "../lib/generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("SUPABASE_CONNECTION_STRING")
}

model User {
  id                String       @id @default(cuid())
  email             String       @unique
  emailVerified     DateTime?
  username          String?      @unique
  firstName         String
  lastName          String
  avatar            String?      // Avatar URL
  bio               String?
  university        String
  major             String
  year              Int
  gpa               Float?
  
  // Academic Profile Arrays
  interests         String[]     // Study interests
  skills            String[]     // Skills and competencies  
  studyGoals        String[]     // Academic goals
  preferredStudyTime String[]    // Preferred study times
  languages         String[]     // Languages spoken
  
  // Profile Settings
  isProfilePublic   Boolean      @default(true)
  allowMessages     Boolean      @default(true)
  allowCalls        Boolean      @default(true)
  
  // Metrics for matching system
  responseRate      Float        @default(0.0)
  averageRating     Float        @default(0.0)
  totalMatches      Int          @default(0)
  successfulMatches Int          @default(0)
  
  // Timestamps
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt
  lastActive        DateTime     @default(now())
  
  @@map("users")
}
```

### **Step 2: Environment Variables**

Create `.env` file with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
SUPABASE_SECRET_KEY=your_supabase_service_role_key

# Database Connection
SUPABASE_CONNECTION_STRING="postgresql://postgres:[password]@[host]:5432/[database]"
```

### **Step 3: Prisma Setup**

```bash
# Install dependencies
npm install prisma @prisma/client
npm install @types/uuid uuid

# Initialize Prisma
npx prisma init

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

## 🔧 Backend Implementation

### **Step 1: Prisma Client Setup**

Create `/lib/prisma.ts`:

```typescript
import { PrismaClient } from '@/lib/generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### **Step 2: Profile API Endpoints**

Create `/app/api/profile/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'

// GET - Fetch user profile
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {},
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch complete profile
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        bio: true,
        university: true,
        major: true,
        year: true,
        gpa: true,
        interests: true,
        skills: true,
        studyGoals: true,
        preferredStudyTime: true,
        languages: true,
        totalMatches: true,
        successfulMatches: true,
        averageRating: true,
        createdAt: true,
      },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {},
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request data
    const body = await request.json()
    const {
      firstName,
      lastName,
      bio,
      university,
      major,
      year,
      gpa,
      interests,
      skills,
      studyGoals,
      preferredStudyTime,
      languages,
      avatar,
    } = body

    // Update profile in database
    const updatedProfile = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName,
        lastName,
        bio,
        avatar,
        university,
        major,
        year: parseInt(year),
        gpa: gpa ? parseFloat(gpa) : null,
        interests: interests || [],
        skills: skills || [],
        studyGoals: studyGoals || [],
        preferredStudyTime: preferredStudyTime || [],
        languages: languages || [],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        bio: true,
        university: true,
        major: true,
        year: true,
        gpa: true,
        interests: true,
        skills: true,
        studyGoals: true,
        preferredStudyTime: true,
        languages: true,
        totalMatches: true,
        successfulMatches: true,
        averageRating: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ profile: updatedProfile })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### **Step 3: Avatar Upload API**

Create `/app/api/upload/avatar/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  try {
    // Create auth client
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll() {},
        },
      }
    )

    // Create admin client for storage operations
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    )

    // Authenticate user
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Process file upload
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    if (file.size > 33 * 1024 * 1024) { // 33MB limit
      return NextResponse.json({ error: 'File size must be less than 33MB' }, { status: 400 })
    }

    // Create file path: userId/avatar.ext
    const fileExt = file.name.split('.').pop()
    const fileName = `avatar.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer()

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabaseAdmin.storage
      .from('Avatar')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true, // Overwrite existing file
      })

    if (uploadError) {
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('Avatar')
      .getPublicUrl(filePath)

    return NextResponse.json({ 
      success: true,
      url: urlData.publicUrl,
      path: data.path
    })

  } catch (error) {
    console.error('Unexpected error in avatar upload:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

## 🎨 Frontend Implementation

### **Step 1: Profile Display Page**

Create `/app/profile/page.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import AuthGuard from '@/components/guards/AuthGuard'
import { useAuth } from '@/components/providers/Providers'
import { motion } from 'framer-motion'
import {
  UserCircleIcon,
  PencilIcon,
  AcademicCapIcon,
  MapPinIcon,
  CalendarIcon,
  StarIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  bio?: string
  university: string
  major: string
  year: number
  gpa?: number
  interests: string[]
  skills: string[]
  studyGoals: string[]
  preferredStudyTime: string[]
  languages: string[]
  totalMatches: number
  successfulMatches: number
  averageRating: number
  createdAt: string
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfile = async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/profile?t=${Date.now()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setProfile(data.profile)
    } catch (error) {
      console.error('Error fetching profile:', error)
      if (error instanceof Error && error.message.includes('404')) {
        window.location.href = '/profile/edit'
        return
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [user])

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

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Không tìm thấy hồ sơ</h2>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8"
            >
              {/* Cover Photo */}
              <div className="h-48 bg-gradient-to-r from-primary-500 to-primary-600 relative">
                <div className="absolute inset-0 bg-black/20"></div>
                <Link
                  href="/profile/edit"
                  className="absolute top-4 right-4 px-4 py-2 bg-white/20 rounded-xl backdrop-blur-sm hover:bg-white/30 transition-colors text-white"
                >
                  <PencilIcon className="h-4 w-4 inline mr-2" />
                  Chỉnh sửa
                </Link>
              </div>

              {/* Profile Info */}
              <div className="relative px-6 pb-6">
                {/* Avatar */}
                <div className="flex items-end -mt-16 mb-4">
                  <div className="relative">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={`${profile.firstName} ${profile.lastName}`}
                        className="w-32 h-32 rounded-full border-4 border-white object-cover"
                        onError={(e) => {
                          console.error('Avatar loading error:', e)
                        }}
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center">
                        <UserCircleIcon className="w-20 h-20 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="ml-6 flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {profile.firstName} {profile.lastName}
                    </h1>
                    <div className="flex items-center text-gray-600 mt-1">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {profile.university}
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">{profile.totalMatches}</div>
                    <div className="text-sm text-gray-600">Kết nối</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{profile.successfulMatches}</div>
                    <div className="text-sm text-gray-600">Thành công</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center text-2xl font-bold text-yellow-600">
                      {profile.averageRating}
                      <StarIcon className="h-5 w-5 ml-1" />
                    </div>
                    <div className="text-sm text-gray-600">Đánh giá</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{profile.gpa || 'N/A'}</div>
                    <div className="text-sm text-gray-600">GPA</div>
                  </div>
                </div>

                {/* Bio */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Giới thiệu</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {profile.bio || 'Chưa có giới thiệu'}
                  </p>
                </div>

                {/* Academic Info */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin học tập</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <AcademicCapIcon className="h-5 w-5 text-primary-600 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">{profile.major}</div>
                          <div className="text-sm text-gray-600">Năm {profile.year}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <CalendarIcon className="h-5 w-5 text-primary-600 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">Thời gian học</div>
                          <div className="text-sm text-gray-600">{profile.preferredStudyTime.join(', ')}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Ngôn ngữ</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.languages.map((language, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Interests & Skills */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-xl p-6"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Sở thích</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-2 bg-primary-100 text-primary-700 rounded-xl text-sm font-medium"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-xl p-6"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Kỹ năng</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Study Goals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-6 mb-8"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Mục tiêu học tập</h3>
              <div className="space-y-3">
                {profile.studyGoals.map((goal, index) => (
                  <div key={index} className="flex items-center">
                    <TrophyIcon className="h-5 w-5 text-yellow-500 mr-3" />
                    <span className="text-gray-700">{goal}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
```

### **Step 2: Profile Edit Page**

Create `/app/profile/edit/page.tsx` with form handling:

```typescript
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
    'Đại học Bách Khoa TP.HCM',
    'Đại học Quốc gia TP.HCM',
    'Đại học Kinh tế TP.HCM',
    'Đại học Công nghệ Thông tin',
    'Đại học Y Dược TP.HCM',
    'Đại học Nông Lâm TP.HCM',
    'Đại học Khoa học Tự nhiên',
    'Đại học Sư phạm TP.HCM'
  ]

  // Fetch existing profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      try {
        const response = await fetch('/api/profile', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
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

  // Avatar upload function
  const handleImageUpload = async (file: File) => {
    if (!user) return null

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      return data.url
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Lỗi khi tải lên ảnh')
      return null
    } finally {
      setIsUploading(false)
    }
  }

  // Display function for avatar
  const handleDisplayImage = () => {
    if (avtImage) {
      return URL.createObjectURL(avtImage)
    } else if (form.avatar) {
      return form.avatar
    }
    return null
  }

  // Avatar change handler
  const handleAvtChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh')
      return
    }

    if (file.size > 33 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 33MB')
      return
    }

    // Set preview
    setavtImage(file)

    // Upload and auto-save
    const avatarUrl = await handleImageUpload(file)
    if (avatarUrl) {
      setForm(prev => ({ ...prev, avatar: avatarUrl }))
      
      try {
        const response = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, avatar: avatarUrl }),
        })

        if (response.ok) {
          toast.success('Ảnh đại diện đã được cập nhật!')
        } else {
          toast.error('Tải lên thành công nhưng không thể lưu vào hồ sơ')
        }
      } catch (error) {
        toast.error('Tải lên thành công nhưng không thể lưu vào hồ sơ')
      }
    }
  }

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      toast.success('Cập nhật hồ sơ thành công!')
      router.push('/profile')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Có lỗi xảy ra khi cập nhật hồ sơ')
    } finally {
      setIsLoading(false)
    }
  }

  // Array management functions
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
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="absolute bottom-0 right-0 p-1.5 bg-primary-600 rounded-full hover:bg-primary-700 transition-colors disabled:opacity-50"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Họ</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => setForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tên</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Giới thiệu bản thân</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trường đại học</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chuyên ngành</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Năm học</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">GPA (tùy chọn)</label>
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
                <h3 className="text-lg font-medium text-gray-900 mb-4">Kỹ năng</h3>
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
```

## 🔒 Supabase Storage Setup

### **Step 1: Create Storage Bucket**

1. Go to Supabase Dashboard → **Storage**
2. Click **New Bucket**
3. Name: `Avatar`
4. Enable **Public bucket** 
5. Set file size limit: `35MB`
6. Allowed MIME types: `image/jpeg,image/png,image/gif,image/webp`

### **Step 2: Configure RLS Policies**

Go to Storage → Policies → Avatar bucket and create these policies:

#### **Policy 1: Public Read Access**
```sql
-- Name: "Public can view avatars"
-- Action: SELECT
-- Definition:
bucket_id = 'Avatar'
```

#### **Policy 2: User Upload Permission**
```sql
-- Name: "Users can upload own avatars"
-- Action: INSERT
-- Definition:
bucket_id = 'Avatar' AND (storage.foldername(name))[1] = auth.uid()::text
```

#### **Policy 3: User Update Permission**
```sql
-- Name: "Users can update own avatars"
-- Action: UPDATE
-- Definition:
bucket_id = 'Avatar' AND (storage.foldername(name))[1] = auth.uid()::text
```

#### **Policy 4: User Delete Permission**
```sql
-- Name: "Users can delete own avatars"
-- Action: DELETE
-- Definition:
bucket_id = 'Avatar' AND (storage.foldername(name))[1] = auth.uid()::text
```

## 🚀 Features Included

### **Core Profile Features**
✅ **Complete User Profiles** - Personal info, academic details, bio  
✅ **Avatar Upload & Display** - Secure image management  
✅ **Dynamic Arrays** - Interests, skills, goals, languages, study times  
✅ **Form Validation** - Client-side and server-side validation  
✅ **Auto-Save** - Avatar uploads save automatically  
✅ **Real-time Updates** - UI updates instantly with new data  

### **Security Features**
✅ **Secure Authentication** - Supabase Auth integration  
✅ **User-specific Storage** - Only access own avatar folder  
✅ **File Validation** - Type and size checking  
✅ **Secure API Endpoints** - Protected with auth middleware  

### **UI/UX Features**
✅ **Responsive Design** - Works on all devices  
✅ **Smooth Animations** - Framer Motion animations  
✅ **Loading States** - Visual feedback during operations  
✅ **Error Handling** - Graceful error management  
✅ **Toast Notifications** - User feedback for actions  

## 📝 Implementation Checklist

### **Database Setup**
- [ ] Configure Prisma schema with User model
- [ ] Set up environment variables
- [ ] Run `npx prisma generate` and `npx prisma db push`
- [ ] Test database connection

### **Storage Setup**
- [ ] Create Avatar bucket in Supabase Storage
- [ ] Configure RLS policies for secure access
- [ ] Test file upload permissions
- [ ] Verify public read access

### **Backend Implementation**
- [ ] Create Prisma client configuration
- [ ] Implement profile API endpoints (GET, PUT)
- [ ] Create avatar upload API endpoint
- [ ] Test API endpoints with authentication

### **Frontend Implementation**
- [ ] Build profile display page
- [ ] Create profile edit form
- [ ] Implement avatar upload functionality
- [ ] Add form validation and error handling
- [ ] Test user experience flow

### **Testing & Validation**
- [ ] Test complete profile creation flow
- [ ] Verify avatar upload and display
- [ ] Test form validation (client + server)
- [ ] Check responsive design on mobile
- [ ] Validate security permissions
- [ ] Test error scenarios

## 🔧 Troubleshooting

### **Profile Not Loading**
1. Check authentication status
2. Verify API endpoint responses
3. Check database connection
4. Review browser console for errors

### **Avatar Upload Fails**
1. Verify Supabase Storage bucket exists and is public
2. Check RLS policies are configured correctly
3. Validate environment variables
4. Test file size and type restrictions

### **Form Validation Issues**
1. Check TypeScript types match database schema
2. Verify required field validations
3. Test array field operations
4. Review error handling logic

### **Permission Denied Errors**
1. Ensure user is authenticated
2. Check Supabase RLS policies
3. Verify service role key is correct
4. Test folder-based permissions

This comprehensive system provides a complete user profile management solution with secure avatar upload, dynamic form handling, and modern UI/UX! 🎉