/**
 * Script to test query performance with EXPLAIN ANALYZE
 * Run with: npx tsx scripts/test-query-performance.ts
 */

import { prisma } from '@/lib/prisma'

async function testQueryPerformance() {
  console.log('🔍 Testing query performance with EXPLAIN ANALYZE...\n')

  try {
    // Get a sample user ID for testing
    const sampleUser = await prisma.user.findFirst({
      select: { id: true }
    })

    if (!sampleUser) {
      console.log('⚠️  No users found in database. Please seed data first.')
      return
    }

    const userId = sampleUser.id
    console.log(`Using sample user ID: ${userId}\n`)

    // Test 1: Conversation query with ordering
    console.log('📊 Test 1: Conversation query with ordering')
    console.log('Query: SELECT * FROM messages WHERE senderId = ? AND receiverId = ? ORDER BY createdAt DESC LIMIT 20\n')
    
    const conversationExplain = await prisma.$queryRaw<any[]>`
      EXPLAIN ANALYZE 
      SELECT * FROM messages 
      WHERE "senderId" = ${userId} 
      ORDER BY "createdAt" DESC 
      LIMIT 20
    `
    
    console.log('Execution Plan:')
    conversationExplain.forEach(row => console.log(row['QUERY PLAN']))
    console.log('\n')

    // Test 2: Unread message count query
    console.log('📊 Test 2: Unread message count query')
    console.log('Query: SELECT COUNT(*) FROM messages WHERE receiverId = ? AND isRead = false\n')
    
    const unreadExplain = await prisma.$queryRaw<any[]>`
      EXPLAIN ANALYZE
      SELECT COUNT(*) FROM messages 
      WHERE "receiverId" = ${userId} AND "isRead" = false
    `
    
    console.log('Execution Plan:')
    unreadExplain.forEach(row => console.log(row['QUERY PLAN']))
    console.log('\n')

    // Test 3: Conversation list query (complex)
    console.log('📊 Test 3: Conversation list query (finding last message per conversation)')
    console.log('Query: Complex query to get all conversations with last message\n')
    
    const conversationListExplain = await prisma.$queryRaw<any[]>`
      EXPLAIN ANALYZE
      SELECT DISTINCT ON ("senderId", "receiverId")
        "id", "senderId", "receiverId", "content", "createdAt", "isRead"
      FROM messages
      WHERE "senderId" = ${userId} OR "receiverId" = ${userId}
      ORDER BY "senderId", "receiverId", "createdAt" DESC
      LIMIT 50
    `
    
    console.log('Execution Plan:')
    conversationListExplain.forEach(row => console.log(row['QUERY PLAN']))
    console.log('\n')

    // Show actual query performance metrics
    console.log('📈 Running actual queries to measure performance...\n')

    // Measure conversation query
    const conversationStart = Date.now()
    await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })
    const conversationTime = Date.now() - conversationStart
    console.log(`✅ Conversation query: ${conversationTime}ms`)

    // Measure unread count query
    const unreadStart = Date.now()
    await prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false
      }
    })
    const unreadTime = Date.now() - unreadStart
    console.log(`✅ Unread count query: ${unreadTime}ms`)

    // Show index usage
    console.log('\n📊 Index usage statistics:')
    const indexStats = await prisma.$queryRaw<any[]>`
      SELECT 
        indexname,
        idx_scan as scans,
        idx_tup_read as tuples_read,
        idx_tup_fetch as tuples_fetched,
        pg_size_pretty(pg_relation_size(indexrelid)) as size
      FROM pg_stat_user_indexes 
      WHERE tablename = 'messages'
      ORDER BY idx_scan DESC
    `

    console.table(indexStats)

  } catch (error) {
    console.error('❌ Error testing query performance:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
testQueryPerformance()
  .then(() => {
    console.log('\n✅ Performance testing complete')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
