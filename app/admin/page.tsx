'use client'

import { useState } from 'react'
import AdminGuard from '@/components/guards/AdminGuard'
import { AdminOverview } from '@/components/admin/AdminOverview'
import { UserManagement } from '@/components/admin/UserManagement'
import { DatabaseViewer } from '@/components/admin/DatabaseViewer'
import { FeatureManagement } from '@/components/admin/FeatureManagement'
import { SeedUsers } from '@/components/admin/SeedUsers'
import {
  HomeIcon,
  UsersIcon,
  CircleStackIcon,
  CogIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

type AdminTab = 'overview' | 'users' | 'database' | 'features' | 'seed'

const tabs = [
  { id: 'overview', name: 'Overview', icon: HomeIcon },
  { id: 'users', name: 'Users', icon: UsersIcon },
  { id: 'database', name: 'Database', icon: CircleStackIcon },
  { id: 'features', name: 'Features', icon: CogIcon },
  { id: 'seed', name: 'Seed Data', icon: PlusIcon },
] as const

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview />
      case 'users':
        return <UserManagement />
      case 'database':
        return <DatabaseViewer />
      case 'features':
        return <FeatureManagement />
      case 'seed':
        return <SeedUsers />
      default:
        return <AdminOverview />
    }
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <CogIcon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <h1 className="text-xl font-semibold text-gray-900">StudyMate Admin</h1>
                  <p className="text-sm text-gray-500">System Management Dashboard</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      isActive
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderTabContent()}
        </div>
      </div>
    </AdminGuard>
  )
}