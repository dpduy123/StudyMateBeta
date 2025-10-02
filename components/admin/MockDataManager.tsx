'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CircleStackIcon,
  TrashIcon,
  PlusIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

interface DataCounts {
  users: number
  matches: number
  messages: number
  rooms: number
  badges: number
  achievements: number
  ratings: number
}

export function MockDataManager() {
  const [dataCounts, setDataCounts] = useState<DataCounts | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)

  useEffect(() => {
    fetchDataCounts()
  }, [])

  const fetchDataCounts = async () => {
    try {
      const response = await fetch('/api/seed/matching-data')
      const data = await response.json()
      setDataCounts(data.currentData)
    } catch (error) {
      console.error('Error fetching data counts:', error)
    }
  }

  const createMockData = async (clearFirst: boolean = false) => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/seed/matching-data?action=create&clear=${clearFirst}`, {
        method: 'POST'
      })
      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: data.message })
        await fetchDataCounts()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create mock data' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' })
    } finally {
      setLoading(false)
    }
  }

  const clearMockData = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/seed/matching-data?action=clear', {
        method: 'POST'
      })
      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: data.message })
        await fetchDataCounts()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to clear mock data' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' })
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setLoading(true)
    await fetchDataCounts()
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mock Data Manager</h2>
          <p className="text-gray-600">Manage mock data for testing matching system</p>
        </div>
        <button
          onClick={refreshData}
          disabled={loading}
          className="btn-secondary inline-flex items-center"
        >
          <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
            message.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
            'bg-blue-50 border border-blue-200 text-blue-800'
          }`}
        >
          <div className="flex items-center">
            {message.type === 'success' && <CheckCircleIcon className="h-5 w-5 mr-2" />}
            {message.type === 'error' && <ExclamationTriangleIcon className="h-5 w-5 mr-2" />}
            {message.type === 'info' && <ChartBarIcon className="h-5 w-5 mr-2" />}
            {message.text}
          </div>
        </motion.div>
      )}

      {/* Current Data Counts */}
      {dataCounts && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Data</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{dataCounts.users}</div>
              <div className="text-sm text-gray-600">Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{dataCounts.matches}</div>
              <div className="text-sm text-gray-600">Matches</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{dataCounts.messages}</div>
              <div className="text-sm text-gray-600">Messages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{dataCounts.rooms}</div>
              <div className="text-sm text-gray-600">Rooms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{dataCounts.badges}</div>
              <div className="text-sm text-gray-600">Badges</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{dataCounts.achievements}</div>
              <div className="text-sm text-gray-600">Achievements</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">{dataCounts.ratings}</div>
              <div className="text-sm text-gray-600">Ratings</div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Mock Data */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-4">
            <CircleStackIcon className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Create Mock Data</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Generate comprehensive mock data for testing the matching system including users, matches, messages, and more.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => createMockData(false)}
              disabled={loading}
              className="btn-primary w-full inline-flex items-center justify-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              {loading ? 'Creating...' : 'Create Mock Data'}
            </button>
            <button
              onClick={() => createMockData(true)}
              disabled={loading}
              className="btn-secondary w-full inline-flex items-center justify-center"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              {loading ? 'Recreating...' : 'Clear & Create New'}
            </button>
          </div>
        </div>

        {/* Clear Mock Data */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-4">
            <TrashIcon className="h-6 w-6 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Clear Mock Data</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Remove all mock data from the database. This action cannot be undone.
          </p>
          <button
            onClick={clearMockData}
            disabled={loading}
            className="btn-danger w-full inline-flex items-center justify-center"
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            {loading ? 'Clearing...' : 'Clear All Mock Data'}
          </button>
        </div>
      </div>

      {/* Mock Data Details */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mock Data Details</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Users (10 profiles)</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Diverse academic backgrounds (CS, Data Science, AI, Cybersecurity)</li>
              <li>• Different universities (HCMUS, HCMUTE, HCMUI)</li>
              <li>• Various skill levels and interests</li>
              <li>• Realistic profiles with bios and study goals</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Matches (10 connections)</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Mix of PENDING, ACCEPTED, and REJECTED statuses</li>
              <li>• Realistic match messages</li>
              <li>• Cross-university connections</li>
              <li>• Mentor-mentee relationships</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Messages (6 conversations)</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Natural conversation flows</li>
              <li>• Study-related discussions</li>
              <li>• Collaboration invitations</li>
              <li>• Realistic timestamps</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Additional Data</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 4 Study rooms with different topics</li>
              <li>• 5 Achievement badges</li>
              <li>• 4 Achievement categories</li>
              <li>• 4 User ratings with comments</li>
              <li>• 50 User activities</li>
              <li>• Daily metrics for analytics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
