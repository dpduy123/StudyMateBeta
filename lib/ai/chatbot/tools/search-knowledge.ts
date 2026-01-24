// Tool: Search Knowledge Base

import { prisma } from '@/lib/prisma'

interface SearchKnowledgeArgs {
  query: string
  category?: 'study_tips' | 'platform_help' | 'faq' | 'academic'
}

interface KnowledgeResult {
  id: string
  title: string
  content: string
  category: string
  relevanceScore: number
}

// Built-in knowledge for when database is empty
const BUILT_IN_KNOWLEDGE: Record<string, { title: string; content: string; category: string }[]> = {
  study_tips: [
    {
      title: 'Phương pháp Pomodoro',
      content: `Phương pháp Pomodoro giúp tăng tập trung:
1. Học 25 phút liên tục
2. Nghỉ 5 phút
3. Sau 4 pomodoros, nghỉ dài 15-30 phút
4. Loại bỏ xao nhãng trong thời gian học
Mẹo: Sử dụng app như Forest hoặc Pomofocus để theo dõi.`,
      category: 'study_tips'
    },
    {
      title: 'Active Recall - Ôn tập chủ động',
      content: `Active Recall hiệu quả hơn đọc lại sách:
1. Đọc xong một phần → đóng sách
2. Viết lại những gì nhớ được
3. So sánh với nội dung gốc
4. Tập trung vào phần chưa nhớ
Kết hợp với Spaced Repetition (ôn tập cách quãng) để nhớ lâu hơn.`,
      category: 'study_tips'
    },
    {
      title: 'Học nhóm hiệu quả',
      content: `Để học nhóm hiệu quả:
1. Chọn nhóm 3-5 người có mục tiêu tương tự
2. Đặt agenda trước buổi học
3. Mỗi người chuẩn bị phần riêng để dạy lại
4. Thảo luận và giải đáp thắc mắc
5. Tổng kết và phân công cho buổi sau
StudyMate giúp bạn tìm bạn học phù hợp với mục tiêu và lịch học của mình.`,
      category: 'study_tips'
    }
  ],
  platform_help: [
    {
      title: 'Cách tăng match rate',
      content: `Để tăng tỷ lệ match trên StudyMate:
1. Hoàn thiện profile (thêm avatar, bio)
2. Cập nhật skills và interests chi tiết
3. Chọn thời gian học phù hợp
4. Viết study goals cụ thể
5. Tích cực tham gia phòng học
Profile đầy đủ giúp AI match chính xác hơn.`,
      category: 'platform_help'
    },
    {
      title: 'Sử dụng phòng học',
      content: `Tính năng Phòng học (Study Rooms):
1. Tạo phòng: Chọn chủ đề, đặt tên, mời bạn bè
2. Tham gia: Tìm phòng theo topic hoặc dùng link mời
3. Trong phòng: Chat text, voice call, chia sẻ file
4. Tips: Bật camera/mic để tương tác tốt hơn
Phòng học giúp bạn học cùng nhiều người cùng lúc.`,
      category: 'platform_help'
    },
    {
      title: 'Tìm bạn học với AI',
      content: `StudyMate sử dụng AI để match bạn học:
1. Vào mục "Khám phá" để xem gợi ý
2. AI xem xét: chuyên ngành, skills, interests, lịch học
3. Swipe phải để Like, trái để Pass
4. Khi cả hai Like → Match thành công!
5. Sau khi match, nhắn tin để bắt đầu học cùng
Bạn cũng có thể dùng chatbot này để tìm kiếm nhanh hơn.`,
      category: 'platform_help'
    }
  ],
  faq: [
    {
      title: 'Tại sao cần email .edu?',
      content: `StudyMate yêu cầu email .edu để:
1. Xác minh bạn là sinh viên thực sự
2. Tạo môi trường an toàn, tin cậy
3. Kết nối sinh viên cùng trường dễ dàng
Nếu trường bạn không có email .edu, liên hệ support để được hỗ trợ.`,
      category: 'faq'
    },
    {
      title: 'Match là gì?',
      content: `Match trên StudyMate:
- Khi bạn Like một người và họ cũng Like bạn → Match!
- Sau khi match, cả hai có thể nhắn tin cho nhau
- Match không có nghĩa là bạn phải học cùng ngay
- Hãy nhắn tin làm quen trước rồi hẹn học cùng`,
      category: 'faq'
    }
  ],
  academic: [
    {
      title: 'Ôn thi hiệu quả',
      content: `Chiến lược ôn thi:
1. Lập kế hoạch: Chia nội dung theo ngày
2. Ưu tiên phần yếu và hay thi
3. Làm đề cũ để quen format
4. Học nhóm để hỏi đáp
5. Nghỉ ngơi đủ giấc trước thi
Dùng StudyMate để tìm bạn học cùng ôn thi!`,
      category: 'academic'
    }
  ]
}

export async function searchKnowledge(
  args: Record<string, unknown>,
  currentUserId: string
): Promise<{ results: KnowledgeResult[]; total: number; message: string }> {
  const query = (args.query as string) || ''
  const category = args.category as 'study_tips' | 'platform_help' | 'faq' | 'academic' | undefined

  console.log(`📚 [Chatbot Tool] Searching knowledge: "${query}" in ${category || 'all'}`)

  try {
    // Search in database
    const dbResults = await prisma.knowledgeDocument.findMany({
      where: {
        isActive: true,
        ...(category ? { category } : {}),
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { tags: { hasSome: query.toLowerCase().split(' ') } }
        ]
      },
      take: 5,
      orderBy: { updatedAt: 'desc' }
    })

    // If database has results, use them
    if (dbResults.length > 0) {
      const results: KnowledgeResult[] = dbResults.map((doc, index) => ({
        id: doc.id,
        title: doc.title,
        content: doc.content,
        category: doc.category,
        relevanceScore: 100 - index * 10 // Simple relevance scoring
      }))

      return {
        results,
        total: results.length,
        message: `Tìm thấy ${results.length} kết quả cho "${query}".`
      }
    }

    // Fallback to built-in knowledge
    const searchTerms = query.toLowerCase().split(' ')
    const matchedResults: KnowledgeResult[] = []

    const categoriesToSearch = category ? [category] : Object.keys(BUILT_IN_KNOWLEDGE)

    for (const cat of categoriesToSearch) {
      const docs = BUILT_IN_KNOWLEDGE[cat] || []
      for (const doc of docs) {
        const titleMatch = searchTerms.some(term =>
          doc.title.toLowerCase().includes(term)
        )
        const contentMatch = searchTerms.some(term =>
          doc.content.toLowerCase().includes(term)
        )

        if (titleMatch || contentMatch) {
          matchedResults.push({
            id: `builtin_${cat}_${docs.indexOf(doc)}`,
            title: doc.title,
            content: doc.content,
            category: doc.category,
            relevanceScore: titleMatch ? 90 : 70
          })
        }
      }
    }

    // Sort by relevance
    matchedResults.sort((a, b) => b.relevanceScore - a.relevanceScore)
    const topResults = matchedResults.slice(0, 5)

    if (topResults.length === 0) {
      // Return general tips if nothing matched
      const defaultTips = BUILT_IN_KNOWLEDGE.study_tips.slice(0, 2).map((doc, index) => ({
        id: `default_${index}`,
        title: doc.title,
        content: doc.content,
        category: doc.category,
        relevanceScore: 50
      }))

      return {
        results: defaultTips,
        total: defaultTips.length,
        message: `Không tìm thấy kết quả chính xác cho "${query}", nhưng đây là một số tips hữu ích.`
      }
    }

    console.log(`✅ [Chatbot Tool] Found ${topResults.length} knowledge results`)

    return {
      results: topResults,
      total: topResults.length,
      message: `Tìm thấy ${topResults.length} kết quả cho "${query}".`
    }
  } catch (error) {
    console.error('❌ [Chatbot Tool] Search knowledge error:', error)
    throw new Error('Không thể tìm kiếm lúc này. Vui lòng thử lại.')
  }
}
