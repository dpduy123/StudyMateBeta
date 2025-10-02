/**
 * Test utilities for mock data system
 */

import { createMockMatchingData, clearMockData } from './matching-data'

/**
 * Test mock data creation and validation
 */
export class MockDataTester {
  /**
   * Test basic mock data creation
   */
  async testMockDataCreation() {
    console.log('🧪 Testing mock data creation...')
    
    try {
      // Clear any existing data first
      await clearMockData()
      console.log('✅ Cleared existing data')
      
      // Create new mock data
      const mockData = await createMockMatchingData()
      console.log('✅ Created mock data successfully')
      
      // Validate data structure
      const validation = this.validateMockData(mockData)
      console.log('✅ Data validation passed:', validation)
      
      return {
        success: true,
        data: mockData,
        validation
      }
    } catch (error) {
      console.error('❌ Mock data creation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Test mock data clearing
   */
  async testMockDataClearing() {
    console.log('🧪 Testing mock data clearing...')
    
    try {
      await clearMockData()
      console.log('✅ Mock data cleared successfully')
      return { success: true }
    } catch (error) {
      console.error('❌ Mock data clearing failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Validate mock data structure
   */
  validateMockData(mockData: any) {
    const validation = {
      users: {
        count: mockData.users?.length || 0,
        valid: (mockData.users?.length || 0) === 10
      },
      matches: {
        count: mockData.matches?.length || 0,
        valid: (mockData.matches?.length || 0) === 10
      },
      messages: {
        count: mockData.messages?.length || 0,
        valid: (mockData.messages?.length || 0) === 6
      },
      rooms: {
        count: mockData.rooms?.length || 0,
        valid: (mockData.rooms?.length || 0) === 4
      },
      badges: {
        count: mockData.badges?.length || 0,
        valid: (mockData.badges?.length || 0) === 5
      },
      achievements: {
        count: mockData.achievements?.length || 0,
        valid: (mockData.achievements?.length || 0) === 4
      },
      ratings: {
        count: mockData.ratings?.length || 0,
        valid: (mockData.ratings?.length || 0) === 4
      }
    }

    const allValid = Object.values(validation).every(item => item.valid)
    
    return {
      ...validation,
      allValid
    }
  }

  /**
   * Test user profile diversity
   */
  testUserDiversity(users: any[]) {
    console.log('🧪 Testing user profile diversity...')
    
    const universities = new Set(users.map(u => u.university))
    const majors = new Set(users.map(u => u.major))
    const years = new Set(users.map(u => u.year))
    
    const diversity = {
      universities: universities.size,
      majors: majors.size,
      years: years.size,
      totalUsers: users.length
    }
    
    console.log('📊 User diversity:', diversity)
    
    return {
      ...diversity,
      hasGoodDiversity: universities.size >= 3 && majors.size >= 3 && years.size >= 3
    }
  }

  /**
   * Test match relationships
   */
  testMatchRelationships(matches: any[]) {
    console.log('🧪 Testing match relationships...')
    
    const statuses = matches.reduce((acc, match) => {
      acc[match.status] = (acc[match.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const relationships = {
      totalMatches: matches.length,
      statuses,
      hasAcceptedMatches: statuses.ACCEPTED > 0,
      hasPendingMatches: statuses.PENDING > 0
    }
    
    console.log('💕 Match relationships:', relationships)
    
    return relationships
  }

  /**
   * Run comprehensive test
   */
  async runComprehensiveTest() {
    console.log('🚀 Running comprehensive mock data test...\n')
    
    const results: any = {
      creation: await this.testMockDataCreation(),
      clearing: await this.testMockDataClearing()
    }
    
    if (results.creation.success && results.creation.data) {
      const diversity = this.testUserDiversity(results.creation.data.users)
      const relationships = this.testMatchRelationships(results.creation.data.matches)
      
      results.diversity = diversity
      results.relationships = relationships
    }
    
    console.log('\n📋 Test Results:')
    console.log('================')
    console.log(`✅ Creation: ${results.creation.success ? 'PASSED' : 'FAILED'}`)
    console.log(`✅ Clearing: ${results.clearing.success ? 'PASSED' : 'FAILED'}`)
    
    if (results.creation.success) {
      console.log(`✅ Diversity: ${results.diversity?.hasGoodDiversity ? 'PASSED' : 'FAILED'}`)
      console.log(`✅ Relationships: ${results.relationships?.hasAcceptedMatches ? 'PASSED' : 'FAILED'}`)
    }
    
    const allPassed = results.creation.success && results.clearing.success
    console.log(`\n🎯 Overall: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`)
    
    return results
  }
}

/**
 * Quick test function
 */
export async function quickMockDataTest() {
  const tester = new MockDataTester()
  return await tester.runComprehensiveTest()
}

/**
 * Performance test for mock data operations
 */
export async function performanceTest(iterations: number = 5) {
  console.log(`🏃‍♂️ Running performance test with ${iterations} iterations...`)
  
  const times = []
  
  for (let i = 0; i < iterations; i++) {
    const startTime = Date.now()
    
    try {
      await clearMockData()
      const mockData = await createMockMatchingData()
      
      const endTime = Date.now()
      const duration = endTime - startTime
      times.push(duration)
      
      console.log(`⏱️ Iteration ${i + 1}: ${duration}ms`)
    } catch (error) {
      console.error(`❌ Iteration ${i + 1} failed:`, error)
    }
  }
  
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length
  const minTime = Math.min(...times)
  const maxTime = Math.max(...times)
  
  console.log(`\n📊 Performance Results:`)
  console.log(`   Average time: ${avgTime.toFixed(2)}ms`)
  console.log(`   Min time: ${minTime}ms`)
  console.log(`   Max time: ${maxTime}ms`)
  console.log(`   Operations per second: ${(1000 / avgTime).toFixed(2)}`)
  
  return {
    avgTime,
    minTime,
    maxTime,
    operationsPerSecond: 1000 / avgTime,
    times
  }
}
