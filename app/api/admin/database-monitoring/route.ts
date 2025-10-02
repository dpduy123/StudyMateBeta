import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { DatabaseLogger } from '@/lib/monitoring/database-logger'

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client
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

    // Check if user is authenticated and is admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Add admin role check here
    // For now, allow any authenticated user to access monitoring

    const logger = DatabaseLogger.getInstance()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'recent'
    const limit = parseInt(searchParams.get('limit') || '100')
    const model = searchParams.get('model')
    const userId = searchParams.get('userId')
    const slowThreshold = parseInt(searchParams.get('slowThreshold') || '1000')

    let data: any = {}

    switch (type) {
      case 'recent':
        data = {
          logs: logger.getRecentLogs(limit),
          metrics: logger.getMetrics()
        }
        break

      case 'by-model':
        if (!model) {
          return NextResponse.json({ error: 'Model parameter required' }, { status: 400 })
        }
        data = {
          logs: logger.getLogsByModel(model, limit),
          metrics: logger.getMetrics()
        }
        break

      case 'slow-queries':
        data = {
          logs: logger.getSlowQueries(slowThreshold, limit),
          metrics: logger.getMetrics()
        }
        break

      case 'errors':
        data = {
          logs: logger.getErrorLogs(limit),
          metrics: logger.getMetrics()
        }
        break

      case 'by-user':
        if (!userId) {
          return NextResponse.json({ error: 'UserId parameter required' }, { status: 400 })
        }
        data = {
          logs: logger.getLogsByUser(userId, limit),
          metrics: logger.getMetrics()
        }
        break

      case 'stats':
        data = {
          metrics: logger.getMetrics(),
          stats: logger.getQueryStats()
        }
        break

      case 'export':
        data = {
          export: logger.exportLogs()
        }
        break

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Error fetching database monitoring data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Create Supabase client
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

    // Check if user is authenticated and is admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const logger = DatabaseLogger.getInstance()
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')

    // Clear old logs
    logger.clearOldLogs(days)

    return NextResponse.json({ 
      message: `Cleared logs older than ${days} days`,
      clearedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error clearing database logs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
