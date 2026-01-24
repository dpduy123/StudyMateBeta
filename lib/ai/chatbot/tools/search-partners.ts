// Tool: Search Study Partners
// Reuses the existing B2C query API logic

import { prisma } from '@/lib/prisma'
import { GeminiB2CQuery } from '@/lib/ai/gemini-b2c-query'

interface SearchPartnersArgs {
  query: string
  limit?: number
}

interface PartnerResult {
  id: string
  name: string
  university: string
  major: string
  year: number
  matchScore: number
  interests: string[]
  skills: string[]
  preferredStudyTime: string[]
  reasoning?: string
}

export async function searchStudyPartners(
  args: Record<string, unknown>,
  currentUserId: string
): Promise<{ partners: PartnerResult[]; total: number; message: string }> {
  const query = (args.query as string) || ''
  const limit = (args.limit as number) || 5

  console.log(`🔍 [Chatbot Tool] Searching partners: "${query}" for user ${currentUserId}`)

  try {
    // Get candidates from database (exclude current user and already connected)
    const excludedUserIds = await getExcludedUserIds(currentUserId)

    const candidates = await prisma.user.findMany({
      where: {
        id: { notIn: [...excludedUserIds, currentUserId] },
        isProfilePublic: true,
        status: 'ACTIVE',
        lastActive: {
          gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) // Last 60 days
        }
      },
      take: 50, // Get more for AI scoring
      orderBy: { lastActive: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        university: true,
        major: true,
        year: true,
        interests: true,
        skills: true,
        studyGoals: true,
        preferredStudyTime: true,
        languages: true,
        bio: true,
        gpa: true,
        avatar: true
      }
    })

    if (candidates.length === 0) {
      return {
        partners: [],
        total: 0,
        message: 'Không tìm thấy bạn học phù hợp. Hãy thử với tiêu chí khác.'
      }
    }

    // Use Gemini to score and filter based on query
    const geminiQuery = new GeminiB2CQuery()
    const queryResult = await geminiQuery.queryUsers(query, candidates)

    // Filter by minimum score and limit results
    const filteredResults = queryResult.scoredUsers
      .filter(r => r.score >= 50)
      .slice(0, limit)

    // Map scored users back to candidates to get full profile info
    const partners: PartnerResult[] = []
    for (const scored of filteredResults) {
      const candidate = candidates.find(c => c.id === scored.userId)
      if (candidate) {
        partners.push({
          id: candidate.id,
          name: `${candidate.firstName} ${candidate.lastName}`,
          university: candidate.university,
          major: candidate.major,
          year: candidate.year,
          matchScore: scored.score,
          interests: candidate.interests,
          skills: candidate.skills,
          preferredStudyTime: candidate.preferredStudyTime,
          reasoning: scored.reasoning
        })
      }
    }

    console.log(`✅ [Chatbot Tool] Found ${partners.length} partners`)

    return {
      partners,
      total: partners.length,
      message: partners.length > 0
        ? `Tìm thấy ${partners.length} bạn học phù hợp với tiêu chí "${query}".`
        : 'Không tìm thấy bạn học phù hợp với tiêu chí này.'
    }
  } catch (error) {
    console.error('❌ [Chatbot Tool] Search partners error:', error)
    throw new Error('Không thể tìm kiếm bạn học lúc này. Vui lòng thử lại.')
  }
}

async function getExcludedUserIds(userId: string): Promise<string[]> {
  // Get users already connected or blocked
  const matches = await prisma.match.findMany({
    where: {
      OR: [
        { senderId: userId, status: { in: ['ACCEPTED', 'BLOCKED'] } },
        { receiverId: userId, status: { in: ['ACCEPTED', 'BLOCKED'] } }
      ]
    },
    select: {
      senderId: true,
      receiverId: true
    }
  })

  const excludedIds = matches.map(m =>
    m.senderId === userId ? m.receiverId : m.senderId
  )

  return [...new Set(excludedIds)]
}
