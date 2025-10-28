'use client'

/**
 * Performance Dashboard View Component
 * Displays real-time performance metrics and alerts
 */

import { useEffect, useState } from 'react'
import { performanceDashboard } from '@/lib/monitoring/PerformanceDashboard'
import type { DashboardMetrics, PerformanceAlert } from '@/lib/monitoring/PerformanceDashboard'

export function PerformanceDashboardView() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return

    // Update metrics every 5 seconds
    const updateMetrics = () => {
      setMetrics(performanceDashboard.getDashboardMetrics())
      setAlerts(performanceDashboard.getAlerts().slice(-5))
    }

    updateMetrics()
    const interval = setInterval(updateMetrics, 5000)

    return () => clearInterval(interval)
  }, [])

  // Only render in development
  if (process.env.NODE_ENV !== 'development') return null
  if (!metrics) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
      >
        {isVisible ? 'Hide' : 'Show'} Performance
      </button>

      {/* Dashboard Panel */}
      {isVisible && (
        <div className="mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-96 max-h-[600px] overflow-y-auto">
          <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
            Performance Dashboard
          </h3>

          {/* Web Vitals */}
          <div className="mb-4">
            <h4 className="font-semibold text-sm mb-2 text-gray-700 dark:text-gray-300">
              Web Vitals
            </h4>
            <div className="space-y-1 text-xs">
              {metrics.webVitals.LCP && (
                <MetricRow
                  label="LCP"
                  value={`${metrics.webVitals.LCP.toFixed(0)}ms`}
                  status={metrics.webVitals.LCP < 2500 ? 'good' : 'poor'}
                />
              )}
              {metrics.webVitals.FID && (
                <MetricRow
                  label="FID"
                  value={`${metrics.webVitals.FID.toFixed(0)}ms`}
                  status={metrics.webVitals.FID < 100 ? 'good' : 'poor'}
                />
              )}
              {metrics.webVitals.CLS && (
                <MetricRow
                  label="CLS"
                  value={metrics.webVitals.CLS.toFixed(3)}
                  status={metrics.webVitals.CLS < 0.1 ? 'good' : 'poor'}
                />
              )}
              {metrics.webVitals.FCP && (
                <MetricRow
                  label="FCP"
                  value={`${metrics.webVitals.FCP.toFixed(0)}ms`}
                  status={metrics.webVitals.FCP < 1800 ? 'good' : 'poor'}
                />
              )}
              {metrics.webVitals.TTFB && (
                <MetricRow
                  label="TTFB"
                  value={`${metrics.webVitals.TTFB.toFixed(0)}ms`}
                  status={metrics.webVitals.TTFB < 800 ? 'good' : 'poor'}
                />
              )}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="mb-4">
            <h4 className="font-semibold text-sm mb-2 text-gray-700 dark:text-gray-300">
              Messaging Performance
            </h4>
            <div className="space-y-1 text-xs">
              <MetricRow
                label="Click Latency"
                value={`${metrics.performance.averageClickLatency.toFixed(1)}ms`}
                status={metrics.performance.averageClickLatency < 100 ? 'good' : 'poor'}
              />
              <MetricRow
                label="Render Time"
                value={`${metrics.performance.averageMessageRenderTime.toFixed(1)}ms`}
                status={metrics.performance.averageMessageRenderTime < 200 ? 'good' : 'poor'}
              />
              <MetricRow
                label="Cache Hit Rate"
                value={`${(metrics.performance.cacheHitRate * 100).toFixed(1)}%`}
                status={metrics.performance.cacheHitRate > 0.7 ? 'good' : 'poor'}
              />
              <MetricRow
                label="Cache Requests"
                value={metrics.performance.totalCacheRequests.toString()}
                status="neutral"
              />
            </div>
          </div>

          {/* Analytics */}
          <div className="mb-4">
            <h4 className="font-semibold text-sm mb-2 text-gray-700 dark:text-gray-300">
              User Analytics
            </h4>
            <div className="space-y-1 text-xs">
              <MetricRow
                label="Conversations Opened"
                value={metrics.analytics.conversationsOpened.toString()}
                status="neutral"
              />
              <MetricRow
                label="Messages Sent"
                value={metrics.analytics.messagesSent.toString()}
                status="neutral"
              />
              <MetricRow
                label="Prefetches"
                value={metrics.analytics.prefetchesTriggered.toString()}
                status="neutral"
              />
              <MetricRow
                label="Errors"
                value={metrics.analytics.errorsOccurred.toString()}
                status={metrics.analytics.errorsOccurred === 0 ? 'good' : 'poor'}
              />
            </div>
          </div>

          {/* API Metrics */}
          <div className="mb-4">
            <h4 className="font-semibold text-sm mb-2 text-gray-700 dark:text-gray-300">
              API Performance
            </h4>
            <div className="space-y-1 text-xs">
              <MetricRow
                label="Avg Response Time"
                value={`${metrics.apiMetrics.averageResponseTime.toFixed(0)}ms`}
                status={metrics.apiMetrics.averageResponseTime < 1000 ? 'good' : 'poor'}
              />
              <MetricRow
                label="Total Calls"
                value={metrics.apiMetrics.totalCalls.toString()}
                status="neutral"
              />
              <MetricRow
                label="Error Rate"
                value={`${(metrics.apiMetrics.errorRate * 100).toFixed(1)}%`}
                status={metrics.apiMetrics.errorRate < 0.05 ? 'good' : 'poor'}
              />
            </div>
          </div>

          {/* Recent Alerts */}
          {alerts.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2 text-gray-700 dark:text-gray-300">
                Recent Alerts
              </h4>
              <div className="space-y-2">
                {alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded text-xs ${
                      alert.type === 'critical'
                        ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                    }`}
                  >
                    <div className="font-semibold">{alert.metric}</div>
                    <div className="text-xs opacity-80">{alert.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function MetricRow({
  label,
  value,
  status
}: {
  label: string
  value: string
  status: 'good' | 'poor' | 'neutral'
}) {
  const statusColor =
    status === 'good'
      ? 'text-green-600 dark:text-green-400'
      : status === 'poor'
      ? 'text-red-600 dark:text-red-400'
      : 'text-gray-600 dark:text-gray-400'

  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-600 dark:text-gray-400">{label}:</span>
      <span className={`font-mono ${statusColor}`}>{value}</span>
    </div>
  )
}
