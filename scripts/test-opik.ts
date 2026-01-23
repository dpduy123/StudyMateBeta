/**
 * Test script to verify Opik integration
 * Run with: npx tsx scripts/test-opik.ts
 */

import { getOpikClient, traceAICall, flushTraces } from '../lib/ai/opik'

async function testOpikConnection() {
  console.log('🧪 Testing Opik Integration...\n')

  // Test 1: Check if Opik client initializes
  console.log('1️⃣ Testing Opik client initialization...')
  const client = getOpikClient()

  if (!client) {
    console.log('❌ Opik client not initialized - check OPIK_API_KEY in .env')
    console.log('\nMake sure you have these in your .env file:')
    console.log('  OPIK_API_KEY=your_api_key')
    console.log('  OPIK_PROJECT_NAME=studymate-ai')
    console.log('  OPIK_ENVIRONMENT=development')
    return
  }

  console.log('✅ Opik client initialized successfully!\n')

  // Test 2: Test traceAICall wrapper
  console.log('2️⃣ Testing traceAICall wrapper...')

  try {
    const result = await traceAICall(
      'test_trace',
      {
        testInput: 'Hello from StudyMate',
        timestamp: new Date().toISOString(),
      },
      async () => {
        // Simulate AI processing
        await new Promise((resolve) => setTimeout(resolve, 100))
        return {
          success: true,
          message: 'Test trace completed successfully',
        }
      },
      {
        feature: 'opik_integration_test',
        environment: 'test',
      }
    )

    console.log('✅ traceAICall executed successfully!')
    console.log('   Result:', JSON.stringify(result, null, 2))
    console.log()
  } catch (error) {
    console.log('❌ traceAICall failed:', error)
    return
  }

  // Test 3: Test error handling in traces
  console.log('3️⃣ Testing error handling in traces...')

  try {
    await traceAICall(
      'test_error_trace',
      { testInput: 'This will fail' },
      async () => {
        throw new Error('Intentional test error')
      }
    )
  } catch (error) {
    console.log('✅ Error was caught and traced correctly!')
    console.log('   Error message:', (error as Error).message)
    console.log()
  }

  // Test 4: Flush traces
  console.log('4️⃣ Flushing traces to Opik...')
  await flushTraces()

  console.log('\n🎉 All Opik integration tests passed!')
  console.log('\n📊 Check your Opik dashboard at https://www.comet.com/opik to see the traces.')
  console.log(`   Project: ${process.env.OPIK_PROJECT_NAME || 'studymate-ai'}`)
}

// Run the test
testOpikConnection().catch(console.error)
