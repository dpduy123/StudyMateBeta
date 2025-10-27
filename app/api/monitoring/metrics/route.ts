/**
 * API endpoint for retrieving performance metrics
 * GET /api/monitoring/metrics
 */

import { NextRequest, NextResponse } from 'next/server'
import { performanceDashboard } from '@/lib/monitoring/PerformanceDashboard'

export async function GET(request: NextRequest) {
  try {
    // Only allow in development or with proper authentication
    if (process.env.NODE_ENV === 'production') {
      // In production, require authentication
      const authHeader = request.headers.get('authorization')
      const apiKey = process.env.MONITORING_API_KEY

      if (!authHeader || !apiKey || authHeader !== `Bearer ${apiKey}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    const dashboard = performanceDashboard.exportDashboard()

    return NextResponse.json({
      success: true,
      data: dashboard,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Error fetching monitoring metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Only allow in development or with proper authentication
    if (process.env.NODE_ENV === 'production') {
      const authHeader = request.headers.get('authorization')
      const apiKey = process.env.MONITORING_API_KEY

      if (!authHeader || !apiKey || authHeader !== `Bearer ${apiKey}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    const body = await request.json()
    const { action } = body

    if (action === 'clear_alerts') {
      performanceDashboard.clearAlerts()
      return NextResponse.json({ success: true, message: 'Alerts cleared' })
    }

    if (action === 'update_thresholds') {
      const { thresholds } = body
      performanceDashboard.updateThresholds(thresholds)
      return NextResponse.json({ success: true, message: 'Thresholds updated' })
    }

    if (action === 'generate_report') {
      const report = performanceDashboard.generateReport()
      return NextResponse.json({ success: true, data: report })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error processing monitoring action:', error)
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    )
  }
}
