'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

interface DatabaseLogEntry {
  id: string
  timestamp: string
  operation: string
  model: string
  query: string
  params: any
  duration: number
  userId?: string
  ip?: string
  userAgent?: string
  success: boolean
  error?: string
  stack?: string
}

interface DatabaseMetrics {
  totalQueries: number
  averageDuration: number
  slowQueries: number
  errorCount: number
  queriesByModel: Record<string, number>
  queriesByOperation: Record<string, number>
}

interface QueryStats {
  mostQueriedModels: Array<{ model: string; count: number }>
  mostUsedOperations: Array<{ operation: string; count: number }>
  averageQueryDuration: number
  slowestQueries: Array<{ query: string; duration: number; timestamp: string }>
}

export function DatabaseMonitoring() {
  const [logs, setLogs] = useState<DatabaseLogEntry[]>([])
  const [metrics, setMetrics] = useState<DatabaseMetrics | null>(null)
  const [stats, setStats] = useState<QueryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'recent' | 'slow' | 'errors' | 'stats'>('recent')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    fetchMonitoringData()
  }, [activeTab])

  const fetchMonitoringData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/database-monitoring?type=${activeTab}&limit=100`)
      const data = await response.json()

      if (activeTab === 'stats') {
        setMetrics(data.metrics)
        setStats(data.stats)
      } else {
        setLogs(data.logs || [])
        setMetrics(data.metrics)
      }
    } catch (error) {
      console.error('Error fetching monitoring data:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearOldLogs = async () => {
    try {
      await fetch('/api/admin/database-monitoring?days=7', { method: 'DELETE' })
      fetchMonitoringData()
    } catch (error) {
      console.error('Error clearing logs:', error)
    }
  }

  const exportLogs = async () => {
    try {
      const response = await fetch('/api/admin/database-monitoring?type=export')
      const data = await response.json()
      
      const blob = new Blob([data.export], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `database-logs-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting logs:', error)
    }
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const filteredLogs = logs.filter(log => 
    log.model.toLowerCase().includes(filter.toLowerCase()) ||
    log.operation.toLowerCase().includes(filter.toLowerCase()) ||
    log.query.toLowerCase().includes(filter.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Database Monitoring</h2>
          <p className="text-gray-600">Monitor database queries and performance</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={exportLogs}
            className="btn-secondary inline-flex items-center"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={clearOldLogs}
            className="btn-secondary inline-flex items-center"
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Clear Old
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Queries</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalQueries}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold text-gray-900">{formatDuration(metrics.averageDuration)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Slow Queries</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.slowQueries}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Errors</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.errorCount}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'recent', label: 'Recent Queries', icon: EyeIcon },
            { id: 'slow', label: 'Slow Queries', icon: ClockIcon },
            { id: 'errors', label: 'Errors', icon: ExclamationTriangleIcon },
            { id: 'stats', label: 'Statistics', icon: ChartBarIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'stats' && stats ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Most Queried Models */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Queried Models</h3>
            <div className="space-y-3">
              {stats.mostQueriedModels.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{item.model}</span>
                  <span className="text-sm text-gray-500">{item.count} queries</span>
                </div>
              ))}
            </div>
          </div>

          {/* Most Used Operations */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Used Operations</h3>
            <div className="space-y-3">
              {stats.mostUsedOperations.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{item.operation}</span>
                  <span className="text-sm text-gray-500">{item.count} times</span>
                </div>
              ))}
            </div>
          </div>

          {/* Slowest Queries */}
          <div className="bg-white p-6 rounded-xl shadow-sm border lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Slowest Queries</h3>
            <div className="space-y-3">
              {stats.slowestQueries.map((query, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{query.query}</p>
                    <p className="text-xs text-gray-500">{formatTimestamp(query.timestamp)}</p>
                  </div>
                  <span className="text-sm font-bold text-red-600">{formatDuration(query.duration)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Search Filter */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search queries..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Operation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Model
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLogs.map((log) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.operation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.model}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`font-medium ${
                          log.duration > 1000 ? 'text-red-600' : 
                          log.duration > 500 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {formatDuration(log.duration)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          log.success 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {log.success ? 'Success' : 'Error'}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
