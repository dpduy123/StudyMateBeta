#!/usr/bin/env tsx

/**
 * Script to test mock data system
 * Usage: npx tsx scripts/test-mock-data.ts [--performance]
 */

import { quickMockDataTest, performanceTest } from '../lib/mock-data/test-mock-data'

async function main() {
  const args = process.argv.slice(2)
  const runPerformanceTest = args.includes('--performance')

  console.log('🧪 Mock Data System Tester')
  console.log('==========================\n')

  try {
    // Run basic tests
    console.log('🔍 Running basic tests...')
    const testResults = await quickMockDataTest()

    if (testResults.creation.success) {
      console.log('\n✅ Basic tests completed successfully!')
      
      // Show detailed results
      if (testResults.diversity) {
        console.log('\n📊 User Diversity:')
        console.log(`   Universities: ${testResults.diversity.universities}`)
        console.log(`   Majors: ${testResults.diversity.majors}`)
        console.log(`   Years: ${testResults.diversity.years}`)
        console.log(`   Total Users: ${testResults.diversity.totalUsers}`)
      }

      if (testResults.relationships) {
        console.log('\n💕 Match Relationships:')
        console.log(`   Total Matches: ${testResults.relationships.totalMatches}`)
        console.log(`   Statuses:`, testResults.relationships.statuses)
      }
    } else {
      console.log('\n❌ Basic tests failed!')
      console.log('Error:', testResults.creation.error)
    }

    // Run performance test if requested
    if (runPerformanceTest) {
      console.log('\n🏃‍♂️ Running performance test...')
      const perfResults = await performanceTest(5)
      
      console.log('\n📈 Performance Summary:')
      console.log(`   Average time: ${perfResults.avgTime.toFixed(2)}ms`)
      console.log(`   Operations per second: ${perfResults.operationsPerSecond.toFixed(2)}`)
    }

    console.log('\n🎉 Mock data system testing completed!')

  } catch (error) {
    console.error('❌ Error testing mock data system:', error)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  main()
}
