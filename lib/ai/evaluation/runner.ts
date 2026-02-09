import 'server-only'
import { getOpikClient, flushTraces, scoreTrace } from '../opik'
import { GeminiMatcher, UserProfile } from '../gemini-matcher'
import { matchingEvalDataset, b2cQueryEvalDataset, EvalTestCase } from './datasets'

/**
 * Evaluation Runner for AI Quality Testing
 *
 * Runs test datasets against the AI models and records results in Opik
 * for tracking quality over time.
 */

export interface EvalResult {
  testId: string
  testName: string
  passed: boolean
  score: number // 0-1
  details: string
  latencyMs: number
  timestamp: string
}

export interface EvalSummary {
  totalTests: number
  passed: number
  failed: number
  passRate: number
  avgScore: number
  avgLatencyMs: number
  results: EvalResult[]
  runId: string
  timestamp: string
}

// ─── Matching Evaluation ──────────────────────────────────────────

async function evaluateMatchingTest(testCase: EvalTestCase): Promise<EvalResult> {
  const startTime = Date.now()
  const opik = getOpikClient()

  const trace = opik?.trace({
    name: 'eval_matching_test',
    input: { testId: testCase.id, testName: testCase.name },
    metadata: {
      feature: 'evaluation',
      evalType: 'matching',
      tags: testCase.tags,
    },
  })

  try {
    const gemini = new GeminiMatcher()
    const { currentUser, candidate } = testCase.input as {
      currentUser: UserProfile
      candidate: UserProfile
    }

    const results = await gemini.sortCandidatesByCompatibility(currentUser, [candidate])
    const latencyMs = Date.now() - startTime

    const actualScore = results[0]?.score ?? 0
    const expected = testCase.expectedOutput as Record<string, unknown>

    // Check pass/fail conditions
    let passed = true
    let details = ''

    if (expected.minScore && actualScore < (expected.minScore as number)) {
      passed = false
      details += `Score ${actualScore} below min ${expected.minScore}. `
    }
    if (expected.maxScore && actualScore > (expected.maxScore as number)) {
      passed = false
      details += `Score ${actualScore} above max ${expected.maxScore}. `
    }
    if (passed) {
      details = `Score ${actualScore} within expected range. Reasoning: ${results[0]?.reasoning || 'N/A'}`
    }

    const normalizedScore = passed ? 1.0 : Math.max(0, 1 - Math.abs(actualScore - ((expected.minScore as number) || 70)) / 100)

    // Record in Opik
    trace?.update({
      output: { actualScore, passed, reasoning: results[0]?.reasoning },
      metadata: { latencyMs, status: passed ? 'passed' : 'failed' },
    })
    scoreTrace(trace!, 'eval_accuracy', normalizedScore, details)
    scoreTrace(trace!, 'eval_latency', Math.max(0, 1 - latencyMs / 10000), `${latencyMs}ms`)
    trace?.end()

    return {
      testId: testCase.id,
      testName: testCase.name,
      passed,
      score: normalizedScore,
      details,
      latencyMs,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    const latencyMs = Date.now() - startTime
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'

    trace?.update({
      output: { error: errorMsg },
      metadata: { latencyMs, status: 'error' },
    })
    scoreTrace(trace!, 'eval_accuracy', 0, `Error: ${errorMsg}`)
    trace?.end()

    return {
      testId: testCase.id,
      testName: testCase.name,
      passed: false,
      score: 0,
      details: `Error: ${errorMsg}`,
      latencyMs,
      timestamp: new Date().toISOString(),
    }
  }
}

// ─── Run All Evaluations ──────────────────────────────────────────

export async function runMatchingEvaluation(): Promise<EvalSummary> {
  const opik = getOpikClient()
  const runId = `eval-${Date.now()}`

  const trace = opik?.trace({
    name: 'eval_matching_suite',
    input: { testCount: matchingEvalDataset.length, runId },
    metadata: { feature: 'evaluation', evalType: 'matching_suite' },
  })

  const results: EvalResult[] = []

  for (const testCase of matchingEvalDataset) {
    const result = await evaluateMatchingTest(testCase)
    results.push(result)
  }

  const passed = results.filter(r => r.passed).length
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length
  const avgLatencyMs = results.reduce((sum, r) => sum + r.latencyMs, 0) / results.length

  const summary: EvalSummary = {
    totalTests: results.length,
    passed,
    failed: results.length - passed,
    passRate: passed / results.length,
    avgScore,
    avgLatencyMs,
    results,
    runId,
    timestamp: new Date().toISOString(),
  }

  trace?.update({
    output: {
      passRate: summary.passRate,
      avgScore,
      passed,
      failed: summary.failed,
    },
    metadata: {
      totalTests: results.length,
      avgLatencyMs,
    },
  })
  scoreTrace(trace!, 'suite_pass_rate', summary.passRate, `${passed}/${results.length} passed`)
  scoreTrace(trace!, 'suite_avg_quality', avgScore, `Average score: ${(avgScore * 100).toFixed(1)}%`)
  trace?.end()

  await flushTraces()

  return summary
}

export async function runB2CQueryEvaluation(): Promise<EvalSummary> {
  // B2C evaluation requires mock user data; return structure for now
  const runId = `eval-b2c-${Date.now()}`
  return {
    totalTests: b2cQueryEvalDataset.length,
    passed: 0,
    failed: 0,
    passRate: 0,
    avgScore: 0,
    avgLatencyMs: 0,
    results: [],
    runId,
    timestamp: new Date().toISOString(),
  }
}

export async function runFullEvaluation(): Promise<{
  matching: EvalSummary
  b2c: EvalSummary
  overall: { passRate: number; avgScore: number }
}> {
  const matching = await runMatchingEvaluation()
  const b2c = await runB2CQueryEvaluation()

  const totalTests = matching.totalTests + b2c.totalTests
  const totalPassed = matching.passed + b2c.passed
  const allScores = [...matching.results, ...b2c.results]

  return {
    matching,
    b2c,
    overall: {
      passRate: totalTests > 0 ? totalPassed / totalTests : 0,
      avgScore: allScores.length > 0
        ? allScores.reduce((sum, r) => sum + r.score, 0) / allScores.length
        : 0,
    },
  }
}
