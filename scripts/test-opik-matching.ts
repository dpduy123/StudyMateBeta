/**
 * Test script to verify Opik integration with Smart Matching
 * Run with: npx tsx scripts/test-opik-matching.ts
 */

import { getOpikClient, traceAICall, flushTraces } from '../lib/ai/opik'
import { recordMatchOutcome, recordMutualMatch, recordMatchQualityRating } from '../lib/ai/match-feedback'

// Mock user profiles for testing
const mockCurrentUser = {
  id: 'user-001',
  firstName: 'Minh',
  lastName: 'Nguyen',
  university: 'HCMUT',
  major: 'Computer Science',
  year: 3,
  interests: ['AI', 'Web Development', 'Gaming'],
  skills: ['Python', 'JavaScript', 'Machine Learning'],
  studyGoals: ['Improve coding', 'Learn AI'],
  preferredStudyTime: ['Tối (19:00-22:00)', 'Cuối tuần'],
  languages: ['Vietnamese', 'English'],
}

const mockCandidates = [
  {
    id: 'user-002',
    firstName: 'Lan',
    lastName: 'Tran',
    university: 'HCMUT',
    major: 'Software Engineering',
    year: 3,
    interests: ['AI', 'Mobile Development', 'Reading'],
    skills: ['Java', 'Kotlin', 'Machine Learning'],
    studyGoals: ['Build mobile apps', 'Learn AI'],
    preferredStudyTime: ['Tối (19:00-22:00)'],
    languages: ['Vietnamese', 'English'],
  },
  {
    id: 'user-003',
    firstName: 'Duc',
    lastName: 'Le',
    university: 'HCMUS',
    major: 'Data Science',
    year: 2,
    interests: ['Data Analysis', 'Statistics', 'Gaming'],
    skills: ['Python', 'R', 'SQL'],
    studyGoals: ['Data visualization', 'Machine learning'],
    preferredStudyTime: ['Chiều (12:00-18:00)'],
    languages: ['Vietnamese'],
  },
]

async function testMatchingWithOpik() {
  console.log('🧪 Testing Opik Integration with Smart Matching...\n')

  // Test 1: Check Opik client
  console.log('1️⃣ Checking Opik client...')
  const client = getOpikClient()

  if (!client) {
    console.log('❌ Opik client not initialized')
    return
  }
  console.log('✅ Opik client ready\n')

  // Test 2: Simulate matching algorithm with tracing
  console.log('2️⃣ Testing matching algorithm tracing...')

  const matchingResult = await traceAICall(
    'test_matching_algorithm',
    {
      currentUserId: mockCurrentUser.id,
      currentUserMajor: mockCurrentUser.major,
      candidateCount: mockCandidates.length,
    },
    async () => {
      // Simulate matching calculation
      await new Promise((resolve) => setTimeout(resolve, 50))

      const scoredCandidates = mockCandidates.map((candidate) => {
        // Simple scoring logic for testing
        let score = 50

        // Same university bonus
        if (candidate.university === mockCurrentUser.university) score += 15

        // Related major bonus
        if (candidate.major.includes('Software') || candidate.major.includes('Data')) score += 10

        // Shared interests bonus
        const sharedInterests = candidate.interests.filter((i) =>
          mockCurrentUser.interests.includes(i)
        ).length
        score += sharedInterests * 5

        // Shared skills bonus
        const sharedSkills = candidate.skills.filter((s) =>
          mockCurrentUser.skills.includes(s)
        ).length
        score += sharedSkills * 5

        return {
          userId: candidate.id,
          name: `${candidate.firstName} ${candidate.lastName}`,
          score: Math.min(99, score),
          factors: {
            university: candidate.university === mockCurrentUser.university,
            sharedInterests,
            sharedSkills,
          },
        }
      })

      return scoredCandidates.sort((a, b) => b.score - a.score)
    },
    {
      feature: 'smart_matching',
      testMode: true,
    }
  )

  console.log('✅ Matching results:')
  matchingResult.forEach((match, index) => {
    console.log(`   ${index + 1}. ${match.name}: ${match.score}% match`)
  })
  console.log()

  // Test 3: Record match outcomes
  console.log('3️⃣ Testing match outcome recording...')

  const matchId = `match-${Date.now()}`

  // Record a "like" action
  await recordMatchOutcome(
    matchId,
    mockCurrentUser.id,
    mockCandidates[0].id,
    'accepted',
    {
      matchScore: matchingResult[0].score,
      timeToDecision: 3500, // 3.5 seconds
      platform: 'web',
    }
  )
  console.log('✅ Recorded "accepted" outcome\n')

  // Test 4: Record a mutual match
  console.log('4️⃣ Testing mutual match recording...')

  await recordMutualMatch(
    `mutual-${Date.now()}`,
    mockCurrentUser.id,
    mockCandidates[0].id,
    {
      matchScore: matchingResult[0].score,
    }
  )
  console.log('✅ Recorded mutual match\n')

  // Test 5: Record quality rating
  console.log('5️⃣ Testing quality rating...')

  await recordMatchQualityRating(
    matchId,
    mockCurrentUser.id,
    4, // 4 out of 5 stars
    'Great study partner, very helpful!'
  )
  console.log('✅ Recorded quality rating\n')

  // Test 6: Flush all traces
  console.log('6️⃣ Flushing traces to Opik...')
  await flushTraces()

  console.log('\n🎉 All Phase 2 tests passed!')
  console.log('\n📊 Check your Opik dashboard to see:')
  console.log('   - test_matching_algorithm trace')
  console.log('   - match_outcome feedback')
  console.log('   - mutual_match trace')
  console.log('   - match_quality feedback')
  console.log(`\n   Dashboard: https://www.comet.com/opik`)
}

// Run the test
testMatchingWithOpik().catch(console.error)
