#!/usr/bin/env tsx

/**
 * Script to seed matching data for testing
 * Usage: npx tsx scripts/seed-matching-data.ts [--clear]
 */

import { createMockMatchingData, clearMockData } from '../lib/mock-data/matching-data'

async function main() {
  const args = process.argv.slice(2)
  const shouldClear = args.includes('--clear')

  console.log('🎭 Matching Data Seeder')
  console.log('======================\n')

  try {
    if (shouldClear) {
      console.log('🧹 Clearing existing mock data...')
      await clearMockData()
      console.log('✅ Mock data cleared successfully\n')
    }

    console.log('🌱 Creating mock matching data...')
    const mockData = await createMockMatchingData()

    console.log('\n🎉 Mock data creation completed!')
    console.log('📊 Summary:')
    console.log(`   👥 Users: ${mockData.users.length}`)
    console.log(`   💕 Matches: ${mockData.matches.length}`)
    console.log(`   💬 Messages: ${mockData.messages.length}`)
    console.log(`   🏠 Rooms: ${mockData.rooms.length}`)
    console.log(`   🏆 Badges: ${mockData.badges.length}`)
    console.log(`   🎯 Achievements: ${mockData.achievements.length}`)
    console.log(`   ⭐ Ratings: ${mockData.ratings.length}`)

    console.log('\n🚀 You can now test the matching system with realistic data!')

  } catch (error) {
    console.error('❌ Error seeding matching data:', error)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  main()
}
