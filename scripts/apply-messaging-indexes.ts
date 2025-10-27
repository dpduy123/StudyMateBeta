/**
 * Script to apply messaging performance indexes
 * Run with: npx tsx scripts/apply-messaging-indexes.ts
 */

import { prisma } from '@/lib/prisma'

async function applyIndexes() {
  console.log('🚀 Applying messaging performance indexes...\n')

  try {
    // Apply indexes using raw SQL (without CONCURRENTLY to avoid transaction issues)
    const indexes = [
      {
        name: 'idx_messages_conversation_id_created_at',
        sql: `CREATE INDEX IF NOT EXISTS "idx_messages_conversation_id_created_at" 
              ON "messages"("senderId", "receiverId", "createdAt" DESC)`,
        description: 'Conversation queries with ordering'
      },
      {
        name: 'idx_messages_conversation_id_created_at_reverse',
        sql: `CREATE INDEX IF NOT EXISTS "idx_messages_conversation_id_created_at_reverse" 
              ON "messages"("receiverId", "senderId", "createdAt" DESC)`,
        description: 'Reverse conversation queries'
      },
      {
        name: 'idx_messages_receiver_id_is_read',
        sql: `CREATE INDEX IF NOT EXISTS "idx_messages_receiver_id_is_read" 
              ON "messages"("receiverId", "isRead") 
              WHERE "isRead" = FALSE`,
        description: 'Unread message count queries'
      },
      {
        name: 'idx_messages_conversation_read_status',
        sql: `CREATE INDEX IF NOT EXISTS "idx_messages_conversation_read_status" 
              ON "messages"("senderId", "receiverId", "isRead", "createdAt" DESC)`,
        description: 'Conversation queries with read status'
      }
    ]

    for (const index of indexes) {
      console.log(`📊 Creating index: ${index.name}`)
      console.log(`   Purpose: ${index.description}`)
      
      try {
        await prisma.$executeRawUnsafe(index.sql)
        console.log(`   ✅ Success\n`)
      } catch (error: any) {
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          console.log(`   ⚠️  Index already exists\n`)
        } else {
          console.error(`   ❌ Error: ${error.message}\n`)
        }
      }
    }

    console.log('✅ Index creation complete!\n')

    // Analyze the messages table to update statistics
    console.log('📈 Analyzing messages table to update query planner statistics...')
    await prisma.$executeRaw`ANALYZE messages`
    console.log('✅ Analysis complete!\n')

    // Show index usage statistics
    console.log('📊 Current index usage statistics:')
    try {
      const indexStats = await prisma.$queryRaw<any[]>`
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_scan as scans,
          idx_tup_read as tuples_read,
          idx_tup_fetch as tuples_fetched
        FROM pg_stat_user_indexes 
        WHERE tablename = 'messages'
        ORDER BY idx_scan DESC
        LIMIT 10
      `

      if (indexStats.length > 0) {
        console.table(indexStats)
      } else {
        console.log('   No statistics available yet (indexes just created)')
      }
    } catch (error: any) {
      console.log('   ⚠️  Could not fetch statistics:', error.message)
    }

  } catch (error) {
    console.error('❌ Error applying indexes:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
applyIndexes()
  .then(() => {
    console.log('✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
