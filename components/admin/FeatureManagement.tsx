'use client'

import { useState } from 'react'
import {
  CogIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  SparklesIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface AppFeature {
  id: string
  name: string
  description: string
  category: 'core' | 'premium' | 'experimental'
  status: 'active' | 'inactive' | 'maintenance'
  usage: {
    totalUsers: number
    activeUsers: number
    dailyUsage: number
  }
  icon: any
}

export function FeatureManagement() {
  const [features, setFeatures] = useState<AppFeature[]>([
    {
      id: 'ai-matching',
      name: 'AI Student Matching',
      description: 'Advanced AI algorithm for finding compatible study partners',
      category: 'core',
      status: 'active',
      usage: { totalUsers: 1250, activeUsers: 890, dailyUsage: 450 },
      icon: SparklesIcon
    },
    {
      id: 'private-messaging',
      name: 'Private Messaging',
      description: 'Direct messaging between matched users',
      category: 'core',
      status: 'active',
      usage: { totalUsers: 1100, activeUsers: 750, dailyUsage: 2100 },
      icon: ChatBubbleLeftRightIcon
    },
    {
      id: 'study-rooms',
      name: 'Study Rooms',
      description: 'Virtual study rooms with video/voice chat',
      category: 'core',
      status: 'active',
      usage: { totalUsers: 800, activeUsers: 320, dailyUsage: 150 },
      icon: UserGroupIcon
    },
    {
      id: 'profile-matching',
      name: 'Profile Matching',
      description: 'Swipe-based profile discovery and matching',
      category: 'core',
      status: 'active',
      usage: { totalUsers: 1200, activeUsers: 850, dailyUsage: 1200 },
      icon: HeartIcon
    },
    {
      id: 'analytics-dashboard',
      name: 'User Analytics',
      description: 'Detailed analytics and insights for users',
      category: 'premium',
      status: 'active',
      usage: { totalUsers: 300, activeUsers: 180, dailyUsage: 80 },
      icon: ChartBarIcon
    },
    {
      id: 'ai-study-recommendations',
      name: 'AI Study Recommendations',
      description: 'Personalized study material and schedule suggestions',
      category: 'experimental',
      status: 'inactive',
      usage: { totalUsers: 50, activeUsers: 20, dailyUsage: 15 },
      icon: SparklesIcon
    }
  ])

  const toggleFeatureStatus = (featureId: string) => {
    setFeatures(prev => prev.map(feature =>
      feature.id === featureId
        ? {
            ...feature,
            status: feature.status === 'active' ? 'inactive' : 'active'
          }
        : feature
    ))
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'core': return 'text-blue-600 bg-blue-100'
      case 'premium': return 'text-purple-600 bg-purple-100'
      case 'experimental': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'inactive': return 'text-red-600 bg-red-100'
      case 'maintenance': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircleIcon
      case 'inactive': return XCircleIcon
      case 'maintenance': return ExclamationTriangleIcon
      default: return InformationCircleIcon
    }
  }

  const coreFeatures = features.filter(f => f.category === 'core')
  const premiumFeatures = features.filter(f => f.category === 'premium')
  const experimentalFeatures = features.filter(f => f.category === 'experimental')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Feature Management</h2>
        <p className="text-gray-600">Control and monitor all application features</p>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">99.9%</div>
            <div className="text-sm text-green-600">Uptime</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">2.3s</div>
            <div className="text-sm text-blue-600">Avg Response</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">1,250</div>
            <div className="text-sm text-purple-600">Active Users</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">0</div>
            <div className="text-sm text-orange-600">Errors/Hour</div>
          </div>
        </div>
      </div>

      {/* Core Features */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CogIcon className="h-5 w-5 mr-2 text-blue-600" />
          Core Features
        </h3>
        <div className="space-y-4">
          {coreFeatures.map((feature) => {
            const StatusIcon = getStatusIcon(feature.status)
            return (
              <div key={feature.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <feature.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{feature.name}</h4>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(feature.category)}`}>
                          {feature.category.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(feature.status)}`}>
                          {feature.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right text-sm">
                      <div className="text-gray-900 font-medium">{feature.usage.activeUsers} active</div>
                      <div className="text-gray-500">{feature.usage.dailyUsage} daily uses</div>
                    </div>
                    <button
                      onClick={() => toggleFeatureStatus(feature.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        feature.status === 'active'
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                    >
                      <StatusIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Premium Features */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CogIcon className="h-5 w-5 mr-2 text-purple-600" />
          Premium Features
        </h3>
        <div className="space-y-4">
          {premiumFeatures.map((feature) => {
            const StatusIcon = getStatusIcon(feature.status)
            return (
              <div key={feature.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <feature.icon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{feature.name}</h4>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(feature.category)}`}>
                          {feature.category.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(feature.status)}`}>
                          {feature.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right text-sm">
                      <div className="text-gray-900 font-medium">{feature.usage.activeUsers} active</div>
                      <div className="text-gray-500">{feature.usage.dailyUsage} daily uses</div>
                    </div>
                    <button
                      onClick={() => toggleFeatureStatus(feature.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        feature.status === 'active'
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                    >
                      <StatusIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Experimental Features */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-orange-600" />
          Experimental Features
        </h3>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-orange-600 mr-2" />
            <p className="text-sm text-orange-800">
              These features are in development and may not be stable. Use with caution.
            </p>
          </div>
        </div>
        <div className="space-y-4">
          {experimentalFeatures.map((feature) => {
            const StatusIcon = getStatusIcon(feature.status)
            return (
              <div key={feature.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <feature.icon className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{feature.name}</h4>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(feature.category)}`}>
                          {feature.category.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(feature.status)}`}>
                          {feature.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right text-sm">
                      <div className="text-gray-900 font-medium">{feature.usage.activeUsers} active</div>
                      <div className="text-gray-500">{feature.usage.dailyUsage} daily uses</div>
                    </div>
                    <button
                      onClick={() => toggleFeatureStatus(feature.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        feature.status === 'active'
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                    >
                      <StatusIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}