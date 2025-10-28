#!/usr/bin/env tsx

/**
 * Performance Testing for Pusher Real-time Messaging
 * 
 * This script tests performance including:
 * - Message delivery latency
 * - Concurrent user handling
 * - Memory leak detection
 * - Connection management
 * 
 * Usage: npx tsx scripts/test-pusher-performance.ts
 */

import { prisma } from '../lib/prisma'
import { triggerPusherEvent, getChatChannelName } from '../lib/pusher/server'

interface TestResult {
  name: string
  status: 'PASS' | 'FAIL' | 'SKIP'
  duration: number
  metrics?: Record<string, any>
  error?: string
}

const results: TestResult[] = []

async function runTest(name: string, testFn: () => Promise<Record<string, any> | void>): Promise<void> {
  const startTime = Date.now()
  try {
    console.log(`\n🧪 Running: ${name}`)
    const metrics = await testFn()
    const duration = Date.now() - startTime
    results.push({ name, status: 'PASS', duration, metrics: metrics || {} })
    console.log(`✅ PASS (${duration}ms)`)
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)
    results.push({ name, status: 'FAIL', duration, error: errorMessage })
    console.log(`❌ FAIL (${duration}ms): ${errorMessage}`)
  }
}

async function testMessageDeliveryLatency() {
  await runTest('Message Delivery Latency', async () => {
    const testUser1 = await prisma.user.upsert({
      where: { email: 'test-perf-1@example.com' },
      update: {},
      create: {
        id: 'test-perf-1',
        email: 'test-perf-1@example.com',
        firstName: 'Perf',
        lastName: 'Test 1',
        university: 'Test University',
        major: 'Computer Science',
        year: 3
      }
    })

    const testUser2 = await prisma.user.upsert({
      where: { email: 'test-perf-2@example.com' },
      update: {},
      create: {
        id: 'test-perf-2',
        email: 'test-perf-2@example.com',
        firstName: 'Perf',
        lastName: 'Test 2',
        university: 'Test University',
        major: 'Mathematics',
        year: 2
      }
    })

    const latencies: number[] = []
    const numTests = 10

    for (let i = 0; i < numTests; i++) {
      const startTime = Date.now()

      // Create message
      const message = await prisma.message.create({
        data: {
          senderId: testUser1.id,
          receiverId: testUser2.id,
          content: `Performance test message ${i}`,
          type: 'TEXT'
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          }
        }
      })

      // Trigger Pusher event
      const channelName = getChatChannelName(testUser1.id, testUser2.id)
      await triggerPusherEvent(channelName, 'new-message', message)

      const latency = Date.now() - startTime
      latencies.push(latency)

      // Clean up
      await prisma.message.delete({ where: { id: message.id } })

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length
    const maxLatency = Math.max(...latencies)
    const minLatency = Math.min(...latencies)

    console.log(`   📊 Average latency: ${avgLatency.toFixed(2)}ms`)
    console.log(`   📊 Min latency: ${minLatency}ms`)
    console.log(`   📊 Max latency: ${maxLatency}ms`)

    // Requirement: Message delivery latency < 500ms
    if (avgLatency > 500) {
      throw new Error(`Average latency ${avgLatency.toFixed(2)}ms exceeds 500ms requirement`)
    }

    console.log(`   ✓ Latency meets requirement (< 500ms)`)

    return {
      avgLatency: avgLatency.toFixed(2),
      minLatency,
      maxLatency,
      numTests
    }
  })
}

async function testConcurrentMessageCreation() {
  await runTest('Concurrent Message Creation', async () => {
    const testUser1 = await prisma.user.upsert({
      where: { email: 'test-perf-1@example.com' },
      update: {},
      create: {
        id: 'test-perf-1',
        email: 'test-perf-1@example.com',
        firstName: 'Perf',
        lastName: 'Test 1',
        university: 'Test University',
        major: 'Computer Science',
        year: 3
      }
    })

    const testUser2 = await prisma.user.upsert({
      where: { email: 'test-perf-2@example.com' },
      update: {},
      create: {
        id: 'test-perf-2',
        email: 'test-perf-2@example.com',
        firstName: 'Perf',
        lastName: 'Test 2',
        university: 'Test University',
        major: 'Mathematics',
        year: 2
      }
    })

    const numConcurrent = 20
    const startTime = Date.now()

    // Create multiple messages concurrently
    const promises = Array.from({ length: numConcurrent }, (_, i) =>
      prisma.message.create({
        data: {
          senderId: testUser1.id,
          receiverId: testUser2.id,
          content: `Concurrent message ${i}`,
          type: 'TEXT'
        }
      })
    )

    const messages = await Promise.all(promises)
    const duration = Date.now() - startTime

    console.log(`   📊 Created ${numConcurrent} messages in ${duration}ms`)
    console.log(`   📊 Average: ${(duration / numConcurrent).toFixed(2)}ms per message`)

    // Verify all messages were created
    if (messages.length !== numConcurrent) {
      throw new Error(`Expected ${numConcurrent} messages, got ${messages.length}`)
    }

    console.log(`   ✓ All concurrent messages created successfully`)

    // Clean up
    await prisma.message.deleteMany({
      where: {
        id: { in: messages.map(m => m.id) }
      }
    })

    return {
      numConcurrent,
      totalDuration: duration,
      avgPerMessage: (duration / numConcurrent).toFixed(2)
    }
  })
}

async function testBulkMessageRetrieval() {
  await runTest('Bulk Message Retrieval Performance', async () => {
    const testUser1 = await prisma.user.upsert({
      where: { email: 'test-perf-1@example.com' },
      update: {},
      create: {
        id: 'test-perf-1',
        email: 'test-perf-1@example.com',
        firstName: 'Perf',
        lastName: 'Test 1',
        university: 'Test University',
        major: 'Computer Science',
        year: 3
      }
    })

    const testUser2 = await prisma.user.upsert({
      where: { email: 'test-perf-2@example.com' },
      update: {},
      create: {
        id: 'test-perf-2',
        email: 'test-perf-2@example.com',
        firstName: 'Perf',
        lastName: 'Test 2',
        university: 'Test University',
        major: 'Mathematics',
        year: 2
      }
    })

    // Create 100 messages
    const numMessages = 100
    console.log(`   Creating ${numMessages} test messages...`)

    const createPromises = Array.from({ length: numMessages }, (_, i) =>
      prisma.message.create({
        data: {
          senderId: i % 2 === 0 ? testUser1.id : testUser2.id,
          receiverId: i % 2 === 0 ? testUser2.id : testUser1.id,
          content: `Bulk test message ${i}`,
          type: 'TEXT'
        }
      })
    )

    const createdMessages = await Promise.all(createPromises)

    // Test retrieval performance
    const startTime = Date.now()

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: testUser1.id, receiverId: testUser2.id },
          { senderId: testUser2.id, receiverId: testUser1.id }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    const retrievalTime = Date.now() - startTime

    console.log(`   📊 Retrieved ${messages.length} messages in ${retrievalTime}ms`)

    // Requirement: Should retrieve within 1 second
    if (retrievalTime > 1000) {
      throw new Error(`Retrieval time ${retrievalTime}ms exceeds 1 second`)
    }

    console.log(`   ✓ Retrieval performance acceptable (< 1s)`)

    // Clean up
    await prisma.message.deleteMany({
      where: {
        id: { in: createdMessages.map(m => m.id) }
      }
    })

    return {
      numMessages,
      retrievalTime,
      messagesRetrieved: messages.length
    }
  })
}

async function testPusherEventThroughput() {
  await runTest('Pusher Event Throughput', async () => {
    const channelName = getChatChannelName('test-perf-1', 'test-perf-2')
    const numEvents = 50
    const startTime = Date.now()

    // Trigger multiple events
    const promises = Array.from({ length: numEvents }, (_, i) =>
      triggerPusherEvent(channelName, 'test-event', {
        index: i,
        timestamp: Date.now()
      })
    )

    await Promise.all(promises)

    const duration = Date.now() - startTime

    console.log(`   📊 Triggered ${numEvents} events in ${duration}ms`)
    console.log(`   📊 Average: ${(duration / numEvents).toFixed(2)}ms per event`)
    console.log(`   📊 Throughput: ${(numEvents / (duration / 1000)).toFixed(2)} events/second`)

    return {
      numEvents,
      totalDuration: duration,
      avgPerEvent: (duration / numEvents).toFixed(2),
      eventsPerSecond: (numEvents / (duration / 1000)).toFixed(2)
    }
  })
}

async function testDatabaseQueryPerformance() {
  await runTest('Database Query Performance', async () => {
    const testUser1 = await prisma.user.upsert({
      where: { email: 'test-perf-1@example.com' },
      update: {},
      create: {
        id: 'test-perf-1',
        email: 'test-perf-1@example.com',
        firstName: 'Perf',
        lastName: 'Test 1',
        university: 'Test University',
        major: 'Computer Science',
        year: 3
      }
    })

    const queries = [
      {
        name: 'Find user by ID',
        fn: () => prisma.user.findUnique({ where: { id: testUser1.id } })
      },
      {
        name: 'Find user by email',
        fn: () => prisma.user.findUnique({ where: { email: testUser1.email } })
      },
      {
        name: 'Count messages',
        fn: () => prisma.message.count({
          where: {
            OR: [
              { senderId: testUser1.id },
              { receiverId: testUser1.id }
            ]
          }
        })
      }
    ]

    const queryTimes: Record<string, number> = {}

    for (const query of queries) {
      const startTime = Date.now()
      await query.fn()
      const duration = Date.now() - startTime
      queryTimes[query.name] = duration
      console.log(`   📊 ${query.name}: ${duration}ms`)
    }

    // All queries should complete within 100ms
    const slowQueries = Object.entries(queryTimes).filter(([_, time]) => time > 100)
    if (slowQueries.length > 0) {
      console.log(`   ⚠️  Slow queries detected: ${slowQueries.map(([name]) => name).join(', ')}`)
    } else {
      console.log(`   ✓ All queries completed within 100ms`)
    }

    return queryTimes
  })
}

async function testMemoryUsage() {
  await runTest('Memory Usage Check', async () => {
    const initialMemory = process.memoryUsage()

    // Create and clean up many messages to test for leaks
    const iterations = 10
    const messagesPerIteration = 10

    const testUser1 = await prisma.user.upsert({
      where: { email: 'test-perf-1@example.com' },
      update: {},
      create: {
        id: 'test-perf-1',
        email: 'test-perf-1@example.com',
        firstName: 'Perf',
        lastName: 'Test 1',
        university: 'Test University',
        major: 'Computer Science',
        year: 3
      }
    })

    const testUser2 = await prisma.user.upsert({
      where: { email: 'test-perf-2@example.com' },
      update: {},
      create: {
        id: 'test-perf-2',
        email: 'test-perf-2@example.com',
        firstName: 'Perf',
        lastName: 'Test 2',
        university: 'Test University',
        major: 'Mathematics',
        year: 2
      }
    })

    for (let i = 0; i < iterations; i++) {
      const messages = await Promise.all(
        Array.from({ length: messagesPerIteration }, (_, j) =>
          prisma.message.create({
            data: {
              senderId: testUser1.id,
              receiverId: testUser2.id,
              content: `Memory test ${i}-${j}`,
              type: 'TEXT'
            }
          })
        )
      )

      await prisma.message.deleteMany({
        where: { id: { in: messages.map(m => m.id) } }
      })
    }

    const finalMemory = process.memoryUsage()

    const heapIncrease = (finalMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024
    const rssIncrease = (finalMemory.rss - initialMemory.rss) / 1024 / 1024

    console.log(`   📊 Heap increase: ${heapIncrease.toFixed(2)} MB`)
    console.log(`   📊 RSS increase: ${rssIncrease.toFixed(2)} MB`)

    // Memory increase should be reasonable (< 50MB for this test)
    if (heapIncrease > 50) {
      console.log(`   ⚠️  Significant heap increase detected (possible memory leak)`)
    } else {
      console.log(`   ✓ Memory usage within acceptable range`)
    }

    return {
      heapIncreaseMB: heapIncrease.toFixed(2),
      rssIncreaseMB: rssIncrease.toFixed(2),
      iterations,
      messagesPerIteration
    }
  })
}

async function cleanupTestData() {
  console.log('\n🧹 Cleaning up test data...')
  try {
    await prisma.message.deleteMany({
      where: {
        OR: [
          { senderId: 'test-perf-1' },
          { senderId: 'test-perf-2' },
          { receiverId: 'test-perf-1' },
          { receiverId: 'test-perf-2' }
        ]
      }
    })

    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['test-perf-1@example.com', 'test-perf-2@example.com']
        }
      }
    })

    console.log('✅ Cleanup complete')
  } catch (error) {
    console.log('⚠️  Cleanup warning:', error)
  }
}

function printSummary() {
  console.log('\n' + '='.repeat(60))
  console.log('📊 PERFORMANCE TEST SUMMARY')
  console.log('='.repeat(60))

  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length

  console.log(`\nTotal Tests: ${results.length}`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)

  if (failed > 0) {
    console.log('\n❌ Failed Tests:')
    results
      .filter(r => r.status === 'FAIL')
      .forEach(r => {
        console.log(`   - ${r.name}: ${r.error}`)
      })
  }

  console.log('\n📈 Performance Metrics:')
  results.forEach(result => {
    if (result.metrics && Object.keys(result.metrics).length > 0) {
      console.log(`\n${result.name}:`)
      Object.entries(result.metrics).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`)
      })
    }
  })

  console.log('\n' + '='.repeat(60))
  
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0)
  console.log(`Total Duration: ${totalDuration}ms`)
  console.log('='.repeat(60))

  return failed === 0
}

async function main() {
  console.log('🚀 Starting Performance Tests')
  console.log('='.repeat(60))

  try {
    // Run all performance tests
    await testMessageDeliveryLatency()
    await testConcurrentMessageCreation()
    await testBulkMessageRetrieval()
    await testPusherEventThroughput()
    await testDatabaseQueryPerformance()
    await testMemoryUsage()

    // Cleanup
    await cleanupTestData()

    // Print summary
    const allPassed = printSummary()

    // Exit with appropriate code
    process.exit(allPassed ? 0 : 1)

  } catch (error) {
    console.error('\n💥 Fatal error:', error)
    await cleanupTestData()
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run tests
main()
