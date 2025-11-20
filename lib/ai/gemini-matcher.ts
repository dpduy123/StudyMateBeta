import { GoogleGenerativeAI } from '@google/generative-ai'

export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  university: string
  major: string
  year: number
  interests: string[]
  skills: string[]
  studyGoals: string[]
  preferredStudyTime: string[]
  languages: string[]
  bio?: string
  gpa?: number
}

export interface SortedMatch {
  userId: string
  score: number
  reasoning: string
}

export class GeminiMatcher {
  private model: any
  private generativeAI: GoogleGenerativeAI

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables')
    }

    this.generativeAI = new GoogleGenerativeAI(apiKey)
    // Use Gemini 2.0 Flash Experimental (latest and fastest)
    this.model = this.generativeAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.3, // Lower temperature for consistent scoring
        maxOutputTokens: 8192,
      }
    })
  }

  /**
   * Sort candidates by compatibility with current user using Gemini AI
   */
  async sortCandidatesByCompatibility(
    currentUser: UserProfile,
    candidates: UserProfile[]
  ): Promise<SortedMatch[]> {
    const startTime = Date.now()
    console.log(`🤖 Gemini AI: Sorting ${candidates.length} candidates for user ${currentUser.id}`)

    try {
      const prompt = this.buildSortingPrompt(currentUser, candidates)

      const result = await this.model.generateContent(prompt)
      const response = result.response
      const text = response.text()

      console.log(`🤖 Gemini AI: Response received in ${Date.now() - startTime}ms`)

      // Parse JSON response
      const sortedMatches = this.parseGeminiResponse(text, candidates)

      console.log(`✅ Gemini AI: Sorted ${sortedMatches.length} candidates successfully`)
      return sortedMatches

    } catch (error) {
      console.error('❌ Gemini AI: Error sorting candidates:', error)
      // Fallback: return candidates in original order with default scores
      return candidates.map((candidate, index) => ({
        userId: candidate.id,
        score: 75 + (25 - index), // Descending scores 75-100
        reasoning: 'Fallback scoring (AI error)'
      }))
    }
  }

  /**
   * Build prompt for Gemini AI
   */
  private buildSortingPrompt(currentUser: UserProfile, candidates: UserProfile[]): string {
    const candidatesData = candidates.map((c, index) => ({
      index: index + 1,
      id: c.id,
      name: `${c.firstName} ${c.lastName}`,
      university: c.university,
      major: c.major,
      year: c.year,
      interests: c.interests,
      skills: c.skills,
      studyGoals: c.studyGoals,
      preferredStudyTime: c.preferredStudyTime,
      languages: c.languages,
      bio: c.bio,
      gpa: c.gpa
    }))

    return `You are an AI matching expert for a student study partner platform called StudyMate.

**Current User Profile:**
- Name: ${currentUser.firstName} ${currentUser.lastName}
- University: ${currentUser.university}
- Major: ${currentUser.major}
- Year: ${currentUser.year}
- Interests: ${currentUser.interests.join(', ')}
- Skills: ${currentUser.skills.join(', ')}
- Study Goals: ${currentUser.studyGoals.join(', ')}
- Preferred Study Time: ${currentUser.preferredStudyTime.join(', ')}
- Languages: ${currentUser.languages.join(', ')}
${currentUser.bio ? `- Bio: ${currentUser.bio}` : ''}
${currentUser.gpa ? `- GPA: ${currentUser.gpa}` : ''}

**Task:**
Sort the following ${candidates.length} candidates by compatibility with the current user for study partnership.

**Candidates:**
${JSON.stringify(candidatesData, null, 2)}

**Scoring Criteria (in order of importance):**
1. **Major & Academic Alignment (30%)** - Same or related majors, similar academic level
2. **Shared Interests (25%)** - Common study topics, hobbies, academic interests
3. **Study Time Compatibility (20%)** - Overlapping preferred study times
4. **Skills Complementarity (15%)** - Skills that complement each other (e.g., one good at math, other at writing)
5. **University Match (10%)** - Same university for easier in-person meetings

**Output Format (MUST be valid JSON):**
Return a JSON array of objects, sorted from BEST match (highest score) to worst match (lowest score):

[
  {
    "userId": "candidate_id",
    "score": 95,
    "reasoning": "Same CS major, 4 shared interests (AI, algorithms, coding, gaming), overlapping study times (evening, weekend), complementary skills (frontend + backend)"
  },
  {
    "userId": "candidate_id",
    "score": 87,
    "reasoning": "Related major (Software Eng vs CS), 3 shared interests, same university, but different study times"
  }
]

**Important:**
- Scores should range from 60-99
- Higher scores mean better compatibility
- Provide brief, specific reasoning for each score
- Return ONLY valid JSON, no additional text
- Sort from highest to lowest score`
  }

  /**
   * Parse Gemini response and extract sorted matches
   */
  private parseGeminiResponse(text: string, candidates: UserProfile[]): SortedMatch[] {
    try {
      // Remove markdown code blocks if present
      let cleanText = text.trim()
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/```\n?/g, '')
      }

      const parsed = JSON.parse(cleanText)

      if (!Array.isArray(parsed)) {
        throw new Error('Response is not an array')
      }

      // Validate and sanitize
      const sortedMatches: SortedMatch[] = parsed
        .filter(item => item.userId && typeof item.score === 'number')
        .map(item => ({
          userId: item.userId,
          score: Math.min(99, Math.max(60, item.score)), // Clamp between 60-99
          reasoning: item.reasoning || 'No reasoning provided'
        }))

      // Ensure all candidates are included (add missing ones at the end)
      const includedIds = new Set(sortedMatches.map(m => m.userId))
      const missingCandidates = candidates
        .filter(c => !includedIds.has(c.id))
        .map(c => ({
          userId: c.id,
          score: 60,
          reasoning: 'Not ranked by AI (fallback)'
        }))

      return [...sortedMatches, ...missingCandidates]

    } catch (error) {
      console.error('❌ Failed to parse Gemini response:', error)
      console.error('Response text:', text.substring(0, 500))

      // Fallback: return in original order
      return candidates.map((c, index) => ({
        userId: c.id,
        score: 75 + (25 - index),
        reasoning: 'Fallback scoring (parse error)'
      }))
    }
  }

  /**
   * Get cache key for user's sorted matches
   */
  static getCacheKey(userId: string): string {
    return `gemini_sorted_matches:${userId}`
  }

  /**
   * Get cache key for prefetch queue
   */
  static getPrefetchKey(userId: string): string {
    return `gemini_prefetch_queue:${userId}`
  }
}
