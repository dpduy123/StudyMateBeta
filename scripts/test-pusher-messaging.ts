#!/usr/bin/env tsx

/**
 * Automated Test Script for Pusher Real-time Messaging
 * 
 * This script tests core messaging functionality including:
 * - Message sending and receiving
 * - Database persistence
 * - Pusher event triggering
 * 
 * Usage: npx tsx scripts/test-pusher-messaging.ts
 */

import { prisma } from '../lib/prisma'
import { triggerPusherEvent, getChatChannelName } from '../lib/pusher/server'

interface TestResult {
  name: string
  status: 'PASS' | 'FAIL' | 'SKIP'
  duration: number
  error?: string
}

const results: TestResult[] = []

// Helper to create test user data
const createTestUserData = (id: string, num: number) => ({
  id,
  email: `test-user-${num}@example.com`,
  firstName: 'Test',
  lastName: `User ${num}`,
  university: 'Test University',
  major: num === 1 ? 'Computer Science' : 'Mathematics',
  year: num
})

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

async function testDatabaseConnection() {
  await runTest('Database Connection', async () => {
    const result = await prisma.$queryRaw`SELECT 1 as test`
    if (!result) throw new Error('Database query failed')
  })
}

async function testMessageCreation() {
  await runTest('Message Creation', async () => {
    // Create test users if they don't exist
    const testUser1 = await prisma.user.upsert({
      where: { email: 'test-user-1@example.com' },
      update: {},
      create: createTestUserData('test-user-1', 1)
    })

    const testUser2 = await prisma.user.upsert({
      where: { email: 'test-user-2@example.com' },
      update: {},
      create: createTestUserData('test-user-2', 2)
    })

    // Create a test message
    const message = await prisma.message.create({
      data: {
        senderId: testUser1.id,
        receiverId: testUser2.id,
        content: `Test message created at ${new Date().toISOString()}`,
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

    if (!message.id) throw new Error('Message creation failed')
    console.log(`   Created message: ${message.id}`)

    // Clean up
    await prisma.message.delete({ where: { id: message.id } })
  })
}

async function testMessageRetrieval() {
  await runTest('Message Retrieval', async () => {
    // Create test users
    const testUser1 = await prisma.user.upsert({
      where: { email: 'test-user-1@example.com' },
      update: {},
      create: createTestUserData('test-user-1', 1)
    })

    const testUser2 = await prisma.user.upsert({
      where: { email: 'test-user-2@example.com' },
      update: {},
      create: createTestUserData('test-user-2', 2)
    })

    // Create test messages
    const message1 = await prisma.message.create({
      data: {
        senderId: testUser1.id,
        receiverId: testUser2.id,
        content: 'Test message 1',
        type: 'TEXT'
      }
    })

    const message2 = await prisma.message.create({
      data: {
        senderId: testUser2.id,
        receiverId: testUser1.id,
        content: 'Test message 2',
        type: 'TEXT'
      }
    })

    // Retrieve messages
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
      orderBy: { createdAt: 'asc' }
    })

    if (messages.length < 2) {
      throw new Error(`Expected at least 2 messages, got ${messages.length}`)
    }

    console.log(`   Retrieved ${messages.length} messages`)

    // Clean up
    await prisma.message.deleteMany({
      where: {
        id: { in: [message1.id, message2.id] }
      }
    })
  })
}

async function testMessageOrdering() {
  await runTest('Message Chronological Ordering', async () => {
    const testUser1 = await prisma.user.upsert({
      where: { email: 'test-user-1@example.com' },
      update: {},
      create: createTestUserData('test-user-1', 1)
    })

    const testUser2 = await prisma.user.upsert({
      where: { email: 'test-user-2@example.com' },
      update: {},
      create: createTestUserData('test-user-2', 2)
    })

    // Create messages with slight delays
    const messageIds: string[] = []
    for (let i = 1; i <= 3; i++) {
      const message = await prisma.message.create({
        data: {
          senderId: testUser1.id,
          receiverId: testUser2.id,
          content: `Message ${i}`,
          type: 'TEXT'
        }
      })
      messageIds.push(message.id)
      await new Promise(resolve => setTimeout(resolve, 10))
    }

    // Retrieve and verify order
    const messages = await prisma.message.findMany({
      where: { id: { in: messageIds } },
      orderBy: { createdAt: 'asc' }
    })

    for (let i = 0; i < messages.length; i++) {
      if (messages[i].content !== `Message ${i + 1}`) {
        throw new Error(`Message order incorrect: expected "Message ${i + 1}", got "${messages[i].content}"`)
      }
    }

    console.log(`   ✓ Messages are in correct chronological order`)

    // Clean up
    await prisma.message.deleteMany({
      where: { id: { in: messageIds } }
    })
  })
}

async function testReadReceipts() {
  await runTest('Read Receipt Functionality', async () => {
    const testUser1 = await prisma.user.upsert({
      where: { email: 'test-user-1@example.com' },
      update: {},
      create: createTestUserData('test-user-1', 1)
    })

    const testUser2 = await prisma.user.upsert({
      where: { email: 'test-user-2@example.com' },
      update: {},
      create: createTestUserData('test-user-2', 2)
    })

    // Create unread message
    const message = await prisma.message.create({
      data: {
        senderId: testUser1.id,
        receiverId: testUser2.id,
        content: 'Unread message',
        type: 'TEXT',
        isRead: false
      }
    })

    // Mark as read
    const updatedMessage = await prisma.message.update({
      where: { id: message.id },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })

    if (!updatedMessage.isRead || !updatedMessage.readAt) {
      throw new Error('Message not marked as read correctly')
    }

    console.log(`   ✓ Message marked as read with timestamp`)

    // Clean up
    await prisma.message.delete({ where: { id: message.id } })
  })
}

async function testPusherEventTrigger() {
  await runTest('Pusher Event Trigger', async () => {
    // Check if Pusher credentials are configured
    if (!process.env.PUSHER_APP_ID || !process.env.NEXT_PUBLIC_PUSHER_KEY) {
      throw new Error('Pusher credentials not configured')
    }

    const channelName = getChatChannelName('test-user-1', 'test-user-2')
    
    // Try to trigger an event
    await triggerPusherEvent(channelName, 'test-event', {
      message: 'Test event data',
      timestamp: new Date().toISOString()
    })

    console.log(`   ✓ Pusher event triggered on channel: ${channelName}`)
  })
}

async function testChannelNameGeneration() {
  await runTest('Channel Name Generation', async () => {
    const channel1 = getChatChannelName('user-a', 'user-b')
    const channel2 = getChatChannelName('user-b', 'user-a')

    if (channel1 !== channel2) {
      throw new Error(`Channel names don't match: ${channel1} !== ${channel2}`)
    }

    if (!channel1.startsWith('private-chat-')) {
      throw new Error(`Invalid channel name format: ${channel1}`)
    }

    console.log(`   ✓ Channel name: ${channel1}`)
  })
}

async function cleanupTestData() {
  console.log('\n🧹 Cleaning up test data...')
  try {
    // Delete test users and their messages
    await prisma.message.deleteMany({
      where: {
        OR: [
          { senderId: 'test-user-1' },
          { senderId: 'test-user-2' },
          { receiverId: 'test-user-1' },
          { receiverId: 'test-user-2' }
        ]
      }
    })

    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['test-user-1@example.com', 'test-user-2@example.com']
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
  console.log('📊 TEST SUMMARY')
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
  console.log('🚀 Starting Pusher Messaging Tests')
  console.log('='.repeat(60))

  try {
    // Run all tests
    await testDatabaseConnection()
    await testChannelNameGeneration()
    await testMessageCreation()
    await testMessageRetrieval()
    await testMessageOrdering()
    await testReadReceipts()
    await testPusherEventTrigger()

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
