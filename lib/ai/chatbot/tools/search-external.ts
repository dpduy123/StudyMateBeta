// Tool: Search External Knowledge Sources (Wikipedia, Educational APIs)

interface ExternalSearchArgs {
  query: string
  sources?: ('wikipedia' | 'academic')[]
  language?: 'vi' | 'en'
}

interface ExternalSearchResult {
  id: string
  title: string
  summary: string
  source: string
  url?: string
  relevanceScore: number
}

// Wikipedia API search
async function searchWikipedia(
  query: string,
  language: 'vi' | 'en' = 'vi'
): Promise<ExternalSearchResult[]> {
  const baseUrl = `https://${language}.wikipedia.org/w/api.php`

  try {
    // Search for articles
    const searchParams = new URLSearchParams({
      action: 'query',
      list: 'search',
      srsearch: query,
      srlimit: '3',
      format: 'json',
      origin: '*'
    })

    const searchResponse = await fetch(`${baseUrl}?${searchParams}`, {
      headers: { 'Accept': 'application/json' }
    })

    if (!searchResponse.ok) {
      console.error('Wikipedia search failed:', searchResponse.status)
      return []
    }

    const searchData = await searchResponse.json()
    const searchResults = searchData.query?.search || []

    if (searchResults.length === 0) {
      return []
    }

    // Get extracts for found articles
    const titles = searchResults.map((r: { title: string }) => r.title).join('|')
    const extractParams = new URLSearchParams({
      action: 'query',
      titles: titles,
      prop: 'extracts|info',
      exintro: 'true',
      explaintext: 'true',
      exsentences: '4',
      inprop: 'url',
      format: 'json',
      origin: '*'
    })

    const extractResponse = await fetch(`${baseUrl}?${extractParams}`, {
      headers: { 'Accept': 'application/json' }
    })

    if (!extractResponse.ok) {
      return []
    }

    const extractData = await extractResponse.json()
    const pages = extractData.query?.pages || {}

    const results: ExternalSearchResult[] = []
    let index = 0

    for (const pageId of Object.keys(pages)) {
      const page = pages[pageId]
      if (page.extract && page.extract.length > 50) {
        results.push({
          id: `wiki_${language}_${pageId}`,
          title: page.title,
          summary: page.extract.substring(0, 500) + (page.extract.length > 500 ? '...' : ''),
          source: `Wikipedia (${language.toUpperCase()})`,
          url: page.fullurl,
          relevanceScore: 90 - index * 10
        })
        index++
      }
    }

    return results
  } catch (error) {
    console.error('Wikipedia search error:', error)
    return []
  }
}

// DuckDuckGo Instant Answer API for academic content
async function searchDuckDuckGo(query: string): Promise<ExternalSearchResult[]> {
  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      no_redirect: '1',
      no_html: '1',
      skip_disambig: '1'
    })

    const response = await fetch(`https://api.duckduckgo.com/?${params}`, {
      headers: { 'Accept': 'application/json' }
    })

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    const results: ExternalSearchResult[] = []

    // Abstract (main result)
    if (data.Abstract && data.Abstract.length > 50) {
      results.push({
        id: `ddg_abstract_${Date.now()}`,
        title: data.Heading || query,
        summary: data.Abstract,
        source: data.AbstractSource || 'DuckDuckGo',
        url: data.AbstractURL,
        relevanceScore: 95
      })
    }

    // Related topics
    if (data.RelatedTopics) {
      for (let i = 0; i < Math.min(2, data.RelatedTopics.length); i++) {
        const topic = data.RelatedTopics[i]
        if (topic.Text && topic.Text.length > 30) {
          results.push({
            id: `ddg_related_${i}`,
            title: topic.Text.substring(0, 50) + '...',
            summary: topic.Text,
            source: 'DuckDuckGo',
            url: topic.FirstURL,
            relevanceScore: 80 - i * 10
          })
        }
      }
    }

    return results
  } catch (error) {
    console.error('DuckDuckGo search error:', error)
    return []
  }
}

// Educational content suggestions based on topic
function getEducationalContent(query: string): ExternalSearchResult[] {
  const queryLower = query.toLowerCase()
  const suggestions: ExternalSearchResult[] = []

  // Programming topics
  if (queryLower.includes('python') || queryLower.includes('lập trình')) {
    suggestions.push({
      id: 'edu_python_1',
      title: 'Học Python cơ bản',
      summary: 'Các nguồn học Python miễn phí: 1) Python.org Tutorial - Tài liệu chính thức. 2) Codecademy - Học tương tác. 3) freeCodeCamp - Khóa học đầy đủ trên YouTube. 4) W3Schools - Tham khảo nhanh syntax. Bắt đầu với data types, loops, functions rồi đến OOP.',
      source: 'StudyMate Recommendations',
      relevanceScore: 85
    })
  }

  if (queryLower.includes('machine learning') || queryLower.includes('ml') || queryLower.includes('ai')) {
    suggestions.push({
      id: 'edu_ml_1',
      title: 'Học Machine Learning',
      summary: 'Lộ trình học ML: 1) Nền tảng: Python, Math (Linear Algebra, Statistics). 2) Khóa học: Andrew Ng trên Coursera, fast.ai miễn phí. 3) Thực hành: Kaggle competitions, Google Colab notebooks. 4) Frameworks: Bắt đầu với scikit-learn, sau đó TensorFlow/PyTorch.',
      source: 'StudyMate Recommendations',
      relevanceScore: 85
    })
  }

  if (queryLower.includes('web') || queryLower.includes('frontend') || queryLower.includes('javascript')) {
    suggestions.push({
      id: 'edu_web_1',
      title: 'Học Web Development',
      summary: 'Lộ trình Frontend: 1) HTML/CSS cơ bản - MDN Web Docs. 2) JavaScript - JavaScript.info, Eloquent JavaScript. 3) Framework: React (phổ biến nhất), Vue, hoặc Angular. 4) Thực hành: Build projects cá nhân, contribute open source. Dùng GitHub để showcase portfolio.',
      source: 'StudyMate Recommendations',
      relevanceScore: 85
    })
  }

  // Study methods
  if (queryLower.includes('ôn thi') || queryLower.includes('thi cử') || queryLower.includes('exam')) {
    suggestions.push({
      id: 'edu_exam_1',
      title: 'Chiến lược ôn thi hiệu quả',
      summary: 'Phương pháp ôn thi khoa học: 1) Spaced Repetition - Ôn cách quãng với Anki/Quizlet. 2) Practice Testing - Làm đề cũ nhiều lần. 3) Interleaving - Xen kẽ các môn/chủ đề. 4) Teach Others - Giải thích cho người khác giúp nhớ lâu. 5) Sleep Well - Ngủ đủ 7-8h để consolidate memory.',
      source: 'StudyMate Recommendations',
      relevanceScore: 85
    })
  }

  // Math topics
  if (queryLower.includes('toán') || queryLower.includes('math') || queryLower.includes('calculus')) {
    suggestions.push({
      id: 'edu_math_1',
      title: 'Tài nguyên học Toán',
      summary: 'Nguồn học Toán online: 1) Khan Academy - Giải tích, Đại số tuyến tính miễn phí. 2) 3Blue1Brown - Video visualization tuyệt vời. 3) MIT OpenCourseWare - Courses đầy đủ. 4) Paul\'s Online Notes - Tài liệu Calculus chi tiết. 5) Symbolab/Wolfram Alpha - Giải và kiểm tra bài tập.',
      source: 'StudyMate Recommendations',
      relevanceScore: 85
    })
  }

  // English learning
  if (queryLower.includes('tiếng anh') || queryLower.includes('english') || queryLower.includes('ielts') || queryLower.includes('toeic')) {
    suggestions.push({
      id: 'edu_english_1',
      title: 'Học tiếng Anh hiệu quả',
      summary: 'Phương pháp học tiếng Anh: 1) Input nhiều - Xem phim/YouTube với subtitles, đọc sách. 2) Vocab - Anki flashcards với context sentences. 3) Grammar - English Grammar in Use (Raymond Murphy). 4) Speaking - iTalki, HelloTalk để practice với native. 5) IELTS/TOEIC - Làm đề thật, timing chính xác.',
      source: 'StudyMate Recommendations',
      relevanceScore: 85
    })
  }

  return suggestions
}

export async function searchExternalKnowledge(
  args: Record<string, unknown>,
  currentUserId: string
): Promise<{ results: ExternalSearchResult[]; total: number; message: string }> {
  const query = (args.query as string) || ''
  const sources = (args.sources as ('wikipedia' | 'academic')[]) || ['wikipedia', 'academic']
  const language = (args.language as 'vi' | 'en') || 'vi'

  console.log(`🌐 [Chatbot Tool] Searching external: "${query}" in ${sources.join(', ')}`)

  try {
    const allResults: ExternalSearchResult[] = []

    // Search in parallel
    const searchPromises: Promise<ExternalSearchResult[]>[] = []

    if (sources.includes('wikipedia')) {
      // Search both Vietnamese and English Wikipedia
      searchPromises.push(searchWikipedia(query, 'vi'))
      if (language === 'en' || query.match(/[a-zA-Z]{3,}/)) {
        searchPromises.push(searchWikipedia(query, 'en'))
      }
    }

    if (sources.includes('academic')) {
      searchPromises.push(searchDuckDuckGo(query))
    }

    // Always add educational suggestions
    const educationalContent = getEducationalContent(query)
    allResults.push(...educationalContent)

    // Wait for all searches
    const searchResults = await Promise.all(searchPromises)
    for (const results of searchResults) {
      allResults.push(...results)
    }

    // Sort by relevance and deduplicate
    const uniqueResults = allResults
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5)

    console.log(`✅ [Chatbot Tool] Found ${uniqueResults.length} external results`)

    if (uniqueResults.length === 0) {
      return {
        results: [],
        total: 0,
        message: `Không tìm thấy kết quả cho "${query}". Hãy thử từ khóa khác hoặc hỏi cụ thể hơn.`
      }
    }

    return {
      results: uniqueResults,
      total: uniqueResults.length,
      message: `Tìm thấy ${uniqueResults.length} kết quả từ các nguồn bên ngoài.`
    }
  } catch (error) {
    console.error('❌ [Chatbot Tool] External search error:', error)
    throw new Error('Không thể tìm kiếm lúc này. Vui lòng thử lại.')
  }
}
