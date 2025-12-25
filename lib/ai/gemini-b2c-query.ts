import { GoogleGenerativeAI } from '@google/generative-ai'

export interface B2CUserProfile {
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
  bio?: string | null
  gpa?: number | null
  averageRating?: number | null
  totalMatches?: number
  subscriptionTier?: string
}

export interface QueryCriteria {
  major?: string
  skills?: string[]
  interests?: string[]
  preferredStudyTime?: string[]
  languages?: string[]
  university?: string
  yearRange?: { min?: number; max?: number }
  gpaMin?: number
  preferences?: string[]
}

export interface ScoredUser {
  userId: string
  score: number
  reasoning: string
  matchedCriteria: string[]
}

export interface B2CQueryResult {
  extractedCriteria: QueryCriteria
  scoredUsers: ScoredUser[]
}

export class GeminiB2CQuery {
  private model: any
  private generativeAI: GoogleGenerativeAI

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables')
    }

    this.generativeAI = new GoogleGenerativeAI(apiKey)
    this.model = this.generativeAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 8192,
      }
    })
  }

  /**
   * Query users based on natural language search (Vietnamese)
   */
  async queryUsers(
    query: string,
    users: B2CUserProfile[]
  ): Promise<B2CQueryResult> {
    const startTime = Date.now()
    console.log(`🔍 Gemini B2C Query: Processing query "${query}" against ${users.length} users`)

    try {
      const prompt = this.buildQueryPrompt(query, users)

      const result = await this.model.generateContent(prompt)
      const response = result.response
      const text = response.text()

      console.log(`🔍 Gemini B2C Query: Response received in ${Date.now() - startTime}ms`)

      const queryResult = this.parseQueryResponse(text, users)

      console.log(`✅ Gemini B2C Query: Found ${queryResult.scoredUsers.length} matching users`)
      return queryResult

    } catch (error) {
      console.error('❌ Gemini B2C Query: Error processing query:', error)
      // Fallback: return all users with default scores
      return {
        extractedCriteria: {},
        scoredUsers: users.map((user, index) => ({
          userId: user.id,
          score: Math.max(30, 100 - index * 2),
          reasoning: 'Không thể phân tích query (lỗi AI)',
          matchedCriteria: []
        }))
      }
    }
  }

  /**
   * Build prompt for Vietnamese natural language query
   */
  private buildQueryPrompt(query: string, users: B2CUserProfile[]): string {
    const usersData = users.map((u, index) => ({
      index: index + 1,
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      university: u.university,
      major: u.major,
      year: u.year,
      interests: u.interests || [],
      skills: u.skills || [],
      studyGoals: u.studyGoals || [],
      preferredStudyTime: u.preferredStudyTime || [],
      languages: u.languages || [],
      bio: u.bio || '',
      gpa: u.gpa,
      rating: u.averageRating,
      totalMatches: u.totalMatches
    }))

    return `Bạn là AI tìm kiếm của StudyMate - nền tảng kết nối bạn học dành cho sinh viên Việt Nam.

**QUERY TÌM KIẾM TỪ NGƯỜI DÙNG:**
"${query}"

**NHIỆM VỤ:**

1. **Phân tích query** và trích xuất các tiêu chí tìm kiếm:
   - Chuyên ngành/lĩnh vực (major): VD: "Data Science", "lập trình", "kinh tế"
   - Kỹ năng (skills): VD: "Python", "Machine Learning", "Excel"
   - Sở thích (interests): VD: "AI", "nghiên cứu", "đọc sách"
   - Thời gian học (preferredStudyTime): VD: "21h" = "Tối (19:00-22:00)", "sáng" = "Sáng (6:00-12:00)"
   - Ngôn ngữ (languages): VD: "tiếng Anh", "English"
   - Trường (university): nếu có đề cập
   - Năm học (year): VD: "năm 3", "sinh viên mới"
   - GPA tối thiểu (gpaMin): nếu có yêu cầu
   - Ưu tiên khác (preferences): VD: "ưu tiên nữ", "có kinh nghiệm"

2. **Chấm điểm mỗi ứng viên (0-100)** dựa trên độ phù hợp với query:
   - 90-100: Rất phù hợp, đáp ứng hầu hết tiêu chí
   - 70-89: Khá phù hợp, đáp ứng các tiêu chí chính
   - 50-69: Phù hợp một phần
   - 30-49: Ít phù hợp
   - 0-29: Không phù hợp (không trả về)

3. **Giải thích lý do bằng tiếng Việt** (ngắn gọn, 1-2 câu)

**DANH SÁCH ỨNG VIÊN (${users.length} người):**
${JSON.stringify(usersData, null, 2)}

**QUY TẮC MAPPING THỜI GIAN:**
- "sáng", "buổi sáng", "6h-12h" → "Sáng (6:00-12:00)"
- "chiều", "buổi chiều", "12h-18h" → "Chiều (12:00-18:00)"
- "tối", "buổi tối", "19h-22h", "21h" → "Tối (19:00-22:00)"
- "đêm", "khuya", "22h-2h" → "Đêm (22:00-02:00)"
- "cuối tuần", "weekend" → "Cuối tuần"

**OUTPUT FORMAT (BẮT BUỘC JSON HỢP LỆ):**
{
  "extractedCriteria": {
    "major": "string hoặc null",
    "skills": ["array"] hoặc [],
    "interests": ["array"] hoặc [],
    "preferredStudyTime": ["array"] hoặc [],
    "languages": ["array"] hoặc [],
    "university": "string hoặc null",
    "yearRange": { "min": number, "max": number } hoặc null,
    "gpaMin": number hoặc null,
    "preferences": ["array các yêu cầu khác"] hoặc []
  },
  "scoredUsers": [
    {
      "userId": "id của ứng viên",
      "score": 95,
      "reasoning": "Chuyên ngành Data Science phù hợp, thời gian học tối (21h) trùng khớp, có kỹ năng Python và ML",
      "matchedCriteria": ["major", "preferredStudyTime", "skills"]
    }
  ]
}

**LƯU Ý QUAN TRỌNG:**
- Chỉ trả về JSON, KHÔNG có text khác
- Sắp xếp scoredUsers từ điểm CAO đến THẤP
- Chỉ trả về users có score >= 30
- Reasoning phải bằng tiếng Việt, ngắn gọn
- Nếu query không rõ ràng, cố gắng suy luận từ ngữ cảnh
- matchedCriteria liệt kê các tiêu chí mà user đáp ứng`
  }

  /**
   * Parse Gemini response and extract query results
   */
  private parseQueryResponse(text: string, users: B2CUserProfile[]): B2CQueryResult {
    try {
      // Remove markdown code blocks if present
      let cleanText = text.trim()
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/```\n?/g, '')
      }

      const parsed = JSON.parse(cleanText)

      // Validate structure
      if (!parsed.extractedCriteria || !Array.isArray(parsed.scoredUsers)) {
        throw new Error('Invalid response structure')
      }

      // Sanitize and validate scored users
      const scoredUsers: ScoredUser[] = parsed.scoredUsers
        .filter((item: any) =>
          item.userId &&
          typeof item.score === 'number' &&
          item.score >= 30
        )
        .map((item: any) => ({
          userId: item.userId,
          score: Math.min(100, Math.max(0, Math.round(item.score))),
          reasoning: item.reasoning || 'Phù hợp với yêu cầu tìm kiếm',
          matchedCriteria: Array.isArray(item.matchedCriteria) ? item.matchedCriteria : []
        }))
        .sort((a: ScoredUser, b: ScoredUser) => b.score - a.score)

      return {
        extractedCriteria: parsed.extractedCriteria || {},
        scoredUsers
      }

    } catch (error) {
      console.error('❌ Failed to parse Gemini B2C Query response:', error)
      console.error('Response text:', text.substring(0, 500))

      // Fallback: return all users with default scores
      return {
        extractedCriteria: {},
        scoredUsers: users.slice(0, 50).map((user, index) => ({
          userId: user.id,
          score: Math.max(30, 80 - index),
          reasoning: 'Không thể phân tích chi tiết (lỗi parse)',
          matchedCriteria: []
        }))
      }
    }
  }
}
