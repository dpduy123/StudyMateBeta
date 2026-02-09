import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { runMatchingEvaluation, runFullEvaluation } from '@/lib/ai/evaluation/runner'
import { getAllDatasets } from '@/lib/ai/evaluation/datasets'

const ADMIN_EMAILS = [
  'loanb2111414@student.ctu.edu.vn',
  'dpduy@gmail.com',
]

async function isAdmin(request: NextRequest): Promise<boolean> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll() {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  return !!user && ADMIN_EMAILS.includes(user.email || '')
}

/**
 * GET /api/admin/ai-evaluation
 * Get evaluation datasets and last run results
 */
export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const datasets = getAllDatasets()

  return NextResponse.json({
    datasets: {
      matching: {
        count: datasets.matching.length,
        tests: datasets.matching.map(t => ({
          id: t.id,
          name: t.name,
          description: t.description,
          tags: t.tags,
        })),
      },
      b2c: {
        count: datasets.b2c.length,
        tests: datasets.b2c.map(t => ({
          id: t.id,
          name: t.name,
          description: t.description,
          tags: t.tags,
        })),
      },
    },
  })
}

/**
 * POST /api/admin/ai-evaluation
 * Run evaluation suite
 */
export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const suite = body.suite || 'matching'

  try {
    if (suite === 'full') {
      const results = await runFullEvaluation()
      return NextResponse.json(results)
    }

    const results = await runMatchingEvaluation()
    return NextResponse.json(results)
  } catch (error) {
    console.error('Evaluation error:', error)
    return NextResponse.json(
      { error: 'Evaluation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
