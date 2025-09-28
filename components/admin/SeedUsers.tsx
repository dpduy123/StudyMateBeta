'use client'

import { useState } from 'react'
import {
  PlusIcon,
  TrashIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

interface SeedResponse {
  message: string
  users?: any[]
  total?: number
}

export function SeedUsers() {
  const [isSeeding, setIsSeeding] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [seedResult, setSeedResult] = useState<SeedResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSeedUsers = async () => {
    setIsSeeding(true)
    setError(null)
    setSeedResult(null)

    try {
      const response = await fetch('/api/seed/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok) {
        setSeedResult(data)
      } else {
        setError(data.error || 'Failed to seed users')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setIsSeeding(false)
    }
  }

  const handleDeleteSeedUsers = async () => {
    if (!confirm('Are you sure you want to delete all seed users? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      const response = await fetch('/api/seed/users', {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        setSeedResult(data)
      } else {
        setError(data.error || 'Failed to delete seed users')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setIsDeleting(false)
    }
  }

  const sampleUsers = [
    { name: 'Minh Lê', university: 'Đại học Bách khoa Hà Nội', major: 'Computer Science' },
    { name: 'Hương Trần', university: 'Đại học Kinh tế Quốc dân', major: 'Marketing' },
    { name: 'Đức Nguyễn', university: 'Đại học Bách khoa Hà Nội', major: 'Software Engineering' },
    { name: 'Linh Phạm', university: 'Đại học Quốc gia Hà Nội', major: 'Data Science' },
    { name: 'Nam Hoàng', university: 'Đại học Kinh tế Quốc dân', major: 'Business Administration' },
    { name: 'Anh Vũ', university: 'Đại học Bách khoa TP.HCM', major: 'Electrical Engineering' },
    { name: 'Thảo Lê', university: 'Đại học Kinh tế TP.HCM', major: 'Finance' },
    { name: 'Quân Trần', university: 'Đại học Bách khoa Hà Nội', major: 'Mechanical Engineering' },
    { name: 'Yến Nguyễn', university: 'Đại học Quốc gia Hà Nội', major: 'Psychology' },
    { name: 'Long Phan', university: 'Đại học Khoa học Tự nhiên TP.HCM', major: 'Mathematics' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Seed Data Management</h2>
        <p className="text-gray-600">Create sample users for testing AI matching system</p>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-start">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
          <div>
            <h3 className="font-medium text-yellow-800">Development Tool</h3>
            <p className="text-sm text-yellow-700 mt-1">
              This feature is for development and testing purposes only.
              Use it to populate your database with sample users to test the AI matching algorithm.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleSeedUsers}
            disabled={isSeeding}
            className="flex items-center justify-center space-x-2 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSeeding ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <PlusIcon className="h-5 w-5" />
            )}
            <span>{isSeeding ? 'Creating Users...' : 'Create 10 Sample Users'}</span>
          </button>

          <button
            onClick={handleDeleteSeedUsers}
            disabled={isDeleting}
            className="flex items-center justify-center space-x-2 p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isDeleting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <TrashIcon className="h-5 w-5" />
            )}
            <span>{isDeleting ? 'Deleting Users...' : 'Delete All Seed Users'}</span>
          </button>
        </div>
      </div>

      {/* Results */}
      {seedResult && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start space-x-3">
            <CheckCircleIcon className="h-6 w-6 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-gray-900">Operation Successful</h3>
              <p className="text-sm text-gray-600 mt-1">{seedResult.message}</p>
              {seedResult.users && (
                <div className="mt-3">
                  <p className="text-sm text-gray-500">
                    Created {seedResult.users.length} out of {seedResult.total} users
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
          <div className="flex items-start space-x-3">
            <XCircleIcon className="h-6 w-6 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900">Operation Failed</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Preview Users */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <UserGroupIcon className="h-5 w-5 mr-2" />
          Sample Users Preview
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          These are the sample users that will be created when you run the seed operation:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sampleUsers.map((user, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-medium text-sm">
                    {user.name.split(' ').map(n => n.charAt(0)).join('')}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{user.name}</h4>
                  <p className="text-sm text-gray-600">{user.university}</p>
                  <p className="text-sm text-gray-500">{user.major}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">What this will do:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Create 10 users in Supabase Auth with temp passwords</li>
            <li>• Create corresponding user profiles in the database</li>
            <li>• Populate realistic interests, skills, and study goals</li>
            <li>• Set random match/rating statistics for testing</li>
            <li>• All users will have public profiles for AI matching</li>
          </ul>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900">Testing AI Matching</h4>
            <p className="text-sm text-gray-600">
              After creating sample users, go to the Discover page to test the AI matching algorithm.
              The system will compare your profile with the sample users and show compatibility scores.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Login Credentials</h4>
            <p className="text-sm text-gray-600">
              All sample users are created with the temporary password: <code className="bg-gray-100 px-2 py-1 rounded">TempPassword123!</code>
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Cleanup</h4>
            <p className="text-sm text-gray-600">
              Use the &quot;Delete All Seed Users&quot; button to remove all sample users when you&apos;re done testing.
              Note: This only deletes database records, Supabase auth users need manual cleanup.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}