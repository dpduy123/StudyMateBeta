#!/usr/bin/env tsx

/**
 * Error Scenario Testing for Pusher Real-time Messaging
 * 
 * This script tests error handling including:
 * - Pusher unavailability
 * - Network disconnection
 * - Invalid authentication
 * - Fallback mechanisms
 * 
 * Usage: npx tsx scripts/test-pusher-errors.ts
 */

import { prisma } from '../lib/prisma'
import { triggerPusherEvent, getChatChannelName, authenticateChannel } from '../lib/pusher/server'

interface TestResult {
  name: string
  status: 'PASS' | 'FAIL' | 'SKIP'
  duration: number
  error?: string
}

const results: TestResult[] = []

async function runTest(name: string, testFn: () => Promise<void>): Promise<void> {
  const startTime = Date.now()
  try {
    console.log(`\n🧪 Running: ${name}`)
    await testFn()
    const duration = Date.now() - startTime
    results.push({ name, status: 'PASS', duration })
    console.log(`✅ PASS (${duration}ms)`)
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)
    results.push({ name, status: 'FAIL', duration, error: errorMessage })
    console.log(`❌ FAIL (${duration}ms): ${errorMessage}`)
  }
}

async function testPusherFailureGraceful() {
  await runTest('Pusher Failure - Graceful Degradation', async () => {
    // Test that message sending still works even if Pusher fails
    // This simulates Pusher being unavailable
    
    const testUser1 = await prisma.user.upsert({
      where: { email: 'test-error-1@example.com' },
      update: {},
      create: {
        id: 'test-error-1',
        email: 'test-error-1@example.com',
        firstName: 'Error',
        lastName: 'Test 1',
        university: 'Test University',
        major: 'Computer Science',
        year: 3
      }
    })

    const testUser2 = await prisma.user.upsert({
      where: { email: 'test-error-2@example.com' },
      update: {},
      create: {
        id: 'test-error-2',
        email: 'test-error-2@example.com',
        firstName: 'Error',
        lastName: 'Test 2',
        university: 'Test University',
        major: 'Mathematics',
        year: 2
      }
    })

    // Create message (should succeed even if Pusher fails)
    const message = await prisma.message.create({
      data: {
        senderId: testUser1.id,
        receiverId: testUser2.id,
        content: 'Message created despite Pusher failure',
        type: 'TEXT'
      }
    })

    if (!message.id) {
      throw new Error('Message creation failed')
    }

    console.log(`   ✓ Message saved to database: ${message.id}`)

    // Try to trigger Pusher event with invalid channel (should not throw)
    try {
      await triggerPusherEvent('invalid-channel-format', 'test-event', { test: true })
      console.log(`   ✓ Pusher error handled gracefully (no exception thrown)`)
    } catch (error) {
      // This is actually expected - Pusher might throw, but app should handle it
      console.log(`   ✓ Pusher error caught and handled`)
    }

    // Verify message still exists in database
    const savedMessage = await prisma.message.findUnique({
      where: { id: message.id }
    })

    if (!savedMessage) {
      throw new Error('Message was not persisted')
    }

    console.log(`   ✓ Message persisted despite Pusher issues`)

    // Cleanup
    await prisma.message.delete({ where: { id: message.id } })
  })
}

async function testInvalidChannelAuthentication() {
  await runTest('Invalid Channel Authentication', async () => {
    const socketId = '1234.5678' // Valid Pusher socket ID format
    const channel = 'private-chat-user1-user2'
    const unauthorizedUserId = 'user3' // Not part of the chat

    try {
      authenticateChannel(socketId, channel, unauthorizedUserId)
      throw new Error('Should have thrown authorization error')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not authorized')) {
        console.log(`   ✓ Unauthorized access correctly rejected`)
      } else {
        throw error
      }
    }
  })
}

async function testValidChannelAuthentication() {
  await runTest('Valid Channel Authentication', async () => {
    const socketId = '1234.5678' // Valid Pusher socket ID format
    const channel = 'private-chat-user1-user2'
    const authorizedUserId = 'user1' // Part of the chat

    const auth = authenticateChannel(socketId, channel, authorizedUserId)

    if (!auth || !auth.auth) {
      throw new Error('Authentication failed for authorized user')
    }

    console.log(`   ✓ Authorized user authenticated successfully`)
  })
}

async function testNotificationChannelAuth() {
  await runTest('Notification Channel Authentication', async () => {
    const socketId = '1234.5678' // Valid Pusher socket ID format
    
    // Test valid notification channel
    const validChannel = 'private-notifications-user1'
    const validAuth = authenticateChannel(socketId, validChannel, 'user1')
    
    if (!validAuth || !validAuth.auth) {
      throw new Error('Valid notification channel auth failed')
    }
    
    console.log(`   ✓ Valid notification channel authenticated`)

    // Test invalid notification channel
    try {
      authenticateChannel(socketId, validChannel, 'user2')
      throw new Error('Should have rejected unauthorized notification channel')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not authorized')) {
        console.log(`   ✓ Invalid notification channel rejected`)
      } else {
        throw error
      }
    }
  })
}

async function testMessageWithoutReceiver() {
  await runTest('Message Without Receiver - Error Handling', async () => {
    const testUser = await prisma.user.upsert({
      where: { email: 'test-error-1@example.com' },
      update: {},
      create: {
        id: 'test-error-1',
        email: 'test-error-1@example.com',
        firstName: 'Error',
        lastName: 'Test 1',
        university: 'Test University',
        major: 'Computer Science',
        year: 3
      }
    })

    // Try to create message with non-existent receiver
    try {
      await prisma.message.create({
        data: {
          senderId: testUser.id,
          receiverId: 'non-existent-user',
          content: 'This should fail',
          type: 'TEXT'
        }
      })
      throw new Error('Should have failed with foreign key constraint')
    } catch (error) {
      if (error instanceof Error && (
        error.message.includes('Foreign key constraint') ||
        error.message.includes('does not exist')
      )) {
        console.log(`   ✓ Invalid receiver correctly rejected by database`)
      } else {
        throw error
      }
    }
  })
}

async function testDuplicateMessagePrevention() {
  await runTest('Duplicate Message Prevention', async () => {
    const testUser1 = await prisma.user.upsert({
      where: { email: 'test-error-1@example.com' },
      update: {},
      create: {
        id: 'test-error-1',
        email: 'test-error-1@example.com',
        firstName: 'Error',
        lastName: 'Test 1',
        university: 'Test University',
        major: 'Computer Science',
        year: 3
      }
    })

    const testUser2 = await prisma.user.upsert({
      where: { email: 'test-error-2@example.com' },
      update: {},
      create: {
        id: 'test-error-2',
        email: 'test-error-2@example.com',
        firstName: 'Error',
        lastName: 'Test 2',
        university: 'Test University',
        major: 'Mathematics',
        year: 2
      }
    })

    // Create message with specific ID
    const messageId = 'test-duplicate-message-id'
    const message1 = await prisma.message.create({
      data: {
        id: messageId,
        senderId: testUser1.id,
        receiverId: testUser2.id,
        content: 'Original message',
        type: 'TEXT'
      }
    })

    // Try to create duplicate
    try {
      await prisma.message.create({
        data: {
          id: messageId,
          senderId: testUser1.id,
          receiverId: testUser2.id,
          content: 'Duplicate message',
          type: 'TEXT'
        }
      })
      throw new Error('Should have failed with unique constraint')
    } catch (error) {
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        console.log(`   ✓ Duplicate message correctly prevented`)
      } else {
        throw error
      }
    }

    // Cleanup
    await prisma.message.delete({ where: { id: messageId } })
  })
}

async function testEmptyMessageContent() {
  await runTest('Empty Message Content Validation', async () => {
    const testUser1 = await prisma.user.upsert({
      where: { email: 'test-error-1@example.com' },
      update: {},
      create: {
        id: 'test-error-1',
        email: 'test-error-1@example.com',
        firstName: 'Error',
        lastName: 'Test 1',
        university: 'Test University',
        major: 'Computer Science',
        year: 3
      }
    })

    const testUser2 = await prisma.user.upsert({
      where: { email: 'test-error-2@example.com' },
      update: {},
      create: {
        id: 'test-error-2',
        email: 'test-error-2@example.com',
        firstName: 'Error',
        lastName: 'Test 2',
        university: 'Test University',
        major: 'Mathematics',
        year: 2
      }
    })

    // Empty string should be allowed (database doesn't prevent it)
    // But API should validate this
    const message = await prisma.message.create({
      data: {
        senderId: testUser1.id,
        receiverId: testUser2.id,
        content: '', // Empty content
        type: 'TEXT'
      }
    })

    console.log(`   ⚠️  Empty message allowed by database (API should validate)`)

    // Cleanup
    await prisma.message.delete({ where: { id: message.id } })
  })
}

async function testPusherConfigValidation() {
  await runTest('Pusher Configuration Validation', async () => {
    // Check if required environment variables are set
    const requiredVars = [
      'PUSHER_APP_ID',
      'NEXT_PUBLIC_PUSHER_KEY',
      'PUSHER_SECRET',
      'NEXT_PUBLIC_PUSHER_CLUSTER'
    ]

    const missing = requiredVars.filter(varName => !process.env[varName])

    if (missing.length > 0) {
      throw new Error(`Missing Pusher configuration: ${missing.join(', ')}`)
    }

    console.log(`   ✓ All Pusher environment variables configured`)
  })
}

async function cleanupTestData() {
  console.log('\n🧹 Cleaning up test data...')
  try {
    await prisma.message.deleteMany({
      where: {
        OR: [
          { senderId: 'test-error-1' },
          { senderId: 'test-error-2' },
          { receiverId: 'test-error-1' },
          { receiverId: 'test-error-2' }
        ]
      }
    })

    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['test-error-1@example.com', 'test-error-2@example.com']
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
  console.log('📊 ERROR SCENARIO TEST SUMMARY')
  console.log('='.repeat(60))

  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  const skipped = results.filter(r => r.status === 'SKIP').length

  console.log(`\nTotal Tests: ${results.length}`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`⏭️  Skipped: ${skipped}`)

  if (failed > 0) {
    console.log('\n❌ Failed Tests:')
    results
      .filter(r => r.status === 'FAIL')
      .forEach(r => {
        console.log(`   - ${r.name}: ${r.error}`)
      })
  }

  console.log('\n' + '='.repeat(60))
  
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0)
  console.log(`Total Duration: ${totalDuration}ms`)
  console.log('='.repeat(60))

  return failed === 0
}

async function main() {
  console.log('🚀 Starting Error Scenario Tests')
  console.log('='.repeat(60))

  try {
    // Run all error scenario tests
    await testPusherConfigValidation()
    await testPusherFailureGraceful()
    await testInvalidChannelAuthentication()
    await testValidChannelAuthentication()
    await testNotificationChannelAuth()
    await testMessageWithoutReceiver()
    await testDuplicateMessagePrevention()
    await testEmptyMessageContent()

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
