/**
 * Verification script for API performance optimizations
 * Run with: npx tsx scripts/verify-optimizations.ts
 */

import { prisma } from '@/lib/prisma'
import { apiCache } from '@/lib/cache/ApiCache'

async function verifyOptimizations() {
    console.log('🔍 Verifying API Performance Optimizations...\n')

    let allPassed = true

    try {
        // 1. Verify database indexes exist
        console.log('📊 Step 1: Checking database indexes...')
        const indexes = await prisma.$queryRaw<any[]>`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'messages'
      AND indexname LIKE 'idx_messages_%'
      ORDER BY indexname
    `

        const requiredIndexes = [
            'idx_messages_conversation_id_created_at',
            'idx_messages_conversation_id_created_at_reverse',
            'idx_messages_receiver_id_is_read',
            'idx_messages_conversation_read_status'
        ]

        const existingIndexNames = indexes.map(idx => idx.indexname)
        const missingIndexes = requiredIndexes.filter(
            name => !existingIndexNames.includes(name)
        )

        if (missingIndexes.length > 0) {
            console.log(`   ❌ Missing indexes: ${missingIndexes.join(', ')}`)
            console.log(`   Run: npx tsx scripts/apply-messaging-indexes.ts`)
            allPassed = false
        } else {
            console.log(`   ✅ All required indexes exist (${requiredIndexes.length} indexes)`)
        }
        console.log()

        // 2. Verify cache system is working
        console.log('💾 Step 2: Testing cache system...')

        const testKey = 'test:verification'
        const testData = { message: 'Cache test', timestamp: Date.now() }

        // Test set
        await apiCache.set(testKey, testData, 60)

        // Test get
        const cachedData = await apiCache.get(testKey)

        if (cachedData && JSON.stringify(cachedData) === JSON.stringify(testData)) {
            console.log('   ✅ Cache set/get working correctly')
        } else {
            console.log('   ❌ Cache not working properly')
            allPassed = false
        }

        // Test delete
        await apiCache.delete(testKey)
        const deletedData = await apiCache.get(testKey)

        if (deletedData === null) {
            console.log('   ✅ Cache delete working correctly')
        } else {
            console.log('   ❌ Cache delete not working')
            allPassed = false
        }
        console.log()

        // 3. Test query performance
        console.log('⚡ Step 3: Testing query performance...')

        const sampleUser = await prisma.user.findFirst({
            select: { id: true }
        })

        if (sampleUser) {
            // Test conversation query
            const convStart = Date.now()
            await prisma.$queryRaw`
        WITH ranked_messages AS (
          SELECT 
            m.id,
            m."senderId",
            m."receiverId",
            m."createdAt",
            CASE 
              WHEN m."senderId" = ${sampleUser.id} THEN m."receiverId"
              ELSE m."senderId"
            END as other_user_id,
            ROW_NUMBER() OVER (
              PARTITION BY CASE 
                WHEN m."senderId" = ${sampleUser.id} THEN m."receiverId"
                ELSE m."senderId"
              END
              ORDER BY m."createdAt" DESC
            ) as rn
          FROM messages m
          WHERE m."senderId" = ${sampleUser.id} OR m."receiverId" = ${sampleUser.id}
        )
        SELECT * FROM ranked_messages WHERE rn = 1 LIMIT 10
      `
            const convTime = Date.now() - convStart

            if (convTime < 100) {
                console.log(`   ✅ Conversation query: ${convTime}ms (excellent)`)
            } else if (convTime < 200) {
                console.log(`   ⚠️  Conversation query: ${convTime}ms (acceptable)`)
            } else {
                console.log(`   ❌ Conversation query: ${convTime}ms (slow)`)
                allPassed = false
            }

            // Test unread count query
            const unreadStart = Date.now()
            await prisma.message.count({
                where: {
                    receiverId: sampleUser.id,
                    isRead: false
                }
            })
            const unreadTime = Date.now() - unreadStart

            if (unreadTime < 50) {
                console.log(`   ✅ Unread count query: ${unreadTime}ms (excellent)`)
            } else if (unreadTime < 100) {
                console.log(`   ⚠️  Unread count query: ${unreadTime}ms (acceptable)`)
            } else {
                console.log(`   ❌ Unread count query: ${unreadTime}ms (slow)`)
                allPassed = false
            }
        } else {
            console.log('   ⚠️  No users found, skipping query performance tests')
        }
        console.log()

        // 4. Verify API files exist
        console.log('📁 Step 4: Checking API files...')

        const fs = await import('fs')
        const path = await import('path')

        const requiredFiles = [
            'app/api/conversations/route.ts',
            'app/api/messages/private/route.ts',
            'lib/cache/ApiCache.ts',
            'database/migrations/add_messaging_performance_indexes.sql'
        ]

        let filesExist = true
        for (const file of requiredFiles) {
            const filePath = path.join(process.cwd(), file)
            if (fs.existsSync(filePath)) {
                console.log(`   ✅ ${file}`)
            } else {
                console.log(`   ❌ ${file} not found`)
                filesExist = false
                allPassed = false
            }
        }

        if (filesExist) {
            console.log('   ✅ All required files exist')
        }
        console.log()

        // 5. Check index usage statistics
        console.log('📈 Step 5: Index usage statistics...')
        try {
            const indexStats = await prisma.$queryRaw<any[]>`
        SELECT 
          indexrelname as indexname,
          idx_scan as scans,
          idx_tup_read as tuples_read,
          idx_tup_fetch as tuples_fetched
        FROM pg_stat_user_indexes 
        WHERE relname = 'messages'
        AND indexrelname LIKE 'idx_messages_%'
        ORDER BY idx_scan DESC
        LIMIT 10
      `

            if (indexStats.length > 0) {
                console.table(indexStats)
            } else {
                console.log('   ⚠️  No index usage statistics available yet (indexes just created)')
            }
        } catch (error: any) {
            console.log('   ⚠️  Could not fetch statistics (this is normal for new indexes)')
        }
        console.log()

        // Final summary
        console.log('═══════════════════════════════════════════════════')
        if (allPassed) {
            console.log('✅ All optimizations verified successfully!')
            console.log('\nNext steps:')
            console.log('1. Test the API endpoints in your application')
            console.log('2. Monitor response times and cache hit rates')
            console.log('3. Check the X-Cache header in API responses')
            console.log('4. Review docs/API_PERFORMANCE_OPTIMIZATION.md')
        } else {
            console.log('❌ Some optimizations need attention')
            console.log('\nPlease review the errors above and:')
            console.log('1. Run: npx tsx scripts/apply-messaging-indexes.ts')
            console.log('2. Ensure all files are properly created')
            console.log('3. Check database connection')
        }
        console.log('═══════════════════════════════════════════════════')

    } catch (error) {
        console.error('❌ Verification failed:', error)
        allPassed = false
    } finally {
        await prisma.$disconnect()
    }

    process.exit(allPassed ? 0 : 1)
}

// Run verification
verifyOptimizations()
