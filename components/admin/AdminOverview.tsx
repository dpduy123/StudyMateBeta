'use client'

import { useState, useEffect } from 'react'
import {
  UsersIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  HeartIcon,
  ChartBarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalMatches: number
  totalMessages: number
  totalRooms: number
  activeRooms: number
  newUsersToday: number
  matchesToday: number
}

export function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      change: `+${stats?.newUsersToday || 0} today`,
      icon: UsersIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Active Users',
      value: stats?.activeUsers || 0,
      change: `${((stats?.activeUsers || 0) / (stats?.totalUsers || 1) * 100).toFixed(1)}% of total`,
      icon: ChartBarIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Total Matches',
      value: stats?.totalMatches || 0,
      change: `+${stats?.matchesToday || 0} today`,
      icon: HeartIcon,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100'
    },
    {
      title: 'Messages Sent',
      value: stats?.totalMessages || 0,
      change: 'All time',
      icon: ChatBubbleLeftRightIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Study Rooms',
      value: stats?.totalRooms || 0,
      change: `${stats?.activeRooms || 0} active`,
      icon: UserGroupIcon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      title: 'System Status',
      value: 'Online',
      change: 'All services running',
      icon: CalendarIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">System Overview</h2>
        <p className="text-gray-600">Monitor key metrics and system health</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.change}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
            <span>New user registered: minh.le@student.hust.edu.vn</span>
            <span className="ml-auto text-gray-400">2 minutes ago</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
            <span>New match created between users</span>
            <span className="ml-auto text-gray-400">5 minutes ago</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
            <span>Study room &quot;AI Research Group&quot; created</span>
            <span className="ml-auto text-gray-400">10 minutes ago</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => fetchStats()}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <div className="font-medium text-gray-900">Refresh Stats</div>
            <div className="text-sm text-gray-500">Update system metrics</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="font-medium text-gray-900">Export Data</div>
            <div className="text-sm text-gray-500">Download user analytics</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="font-medium text-gray-900">System Backup</div>
            <div className="text-sm text-gray-500">Create database backup</div>
          </button>
        </div>
      </div>
    </div>
  )
}