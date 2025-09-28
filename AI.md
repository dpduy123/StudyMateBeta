 Quá trình AI Matching Engine

  Bước 1: Lấy thông tin của bạn

  // API lấy profile hiện tại từ database
  const currentUserProfile = await prisma.user.findUnique({
    where: { id: currentUser.id }
  })
  - Dữ liệu thu thập: university, major, year, interests, skills, studyGoals, preferredStudyTime, languages

  Bước 2: Tìm ứng viên tiềm năng

  const candidateUsers = await prisma.user.findMany({
    where: {
      id: { notIn: allExcludedIds }, // Loại trừ người đã match/pass
      isProfilePublic: true          // Chỉ lấy profile công khai
    }
  })
  - Loại trừ: Bạn, người đã match, người đã pass
  - Chỉ lấy: Profile công khai và active

  Bước 3: AI Scoring Algorithm

  Với mỗi ứng viên, AI tính điểm dựa trên 7 tiêu chí:

  🏫 University Match (15%)

  calculateUniversityMatch(user1, user2)
  - Cùng trường: 100 điểm
  - Khác trường: 30 điểm
  - VD: Bạn ở UET, match với người UET = 100 điểm

  📚 Major Compatibility (20%)

  calculateMajorMatch(user1, user2)
  - Cùng ngành: 100 điểm
  - Ngành liên quan: 70 điểm (CS ↔ Software Engineering)
  - Khác ngành: 20 điểm
  - VD: Computer Science + Software Engineering = 70 điểm

  🎓 Year Compatibility (10%)

  calculateYearCompatibility(user1, user2)
  - Cùng năm: 100 điểm
  - Chênh 1 năm: 80 điểm
  - Chênh 2 năm: 50 điểm
  - Chênh 3+ năm: 20 điểm

  💡 Interests Match (20%)

  calculateInterestsMatch(user1, user2)
  Bạn: ['Coding', 'Gaming', 'AI', 'Music']
  Người khác: ['Coding', 'AI', 'Reading', 'Travel']
  Common: ['Coding', 'AI'] = 2/4 = 50 điểm

  🛠 Skills Compatibility (15%)

  calculateSkillsMatch(user1, user2)
  2 loại scoring:
  - Overlap: Cùng skills → 100 điểm
  - Complementary: Skills bổ sung → 80 điểm
  Bạn: ['React', 'Frontend']
  Người khác: ['Node.js', 'Backend']
  → Complementary = 80 điểm (Frontend + Backend)

  ⏰ Study Time Match (15%)

  calculateStudyTimeMatch(user1, user2)
  Bạn: ['Morning', 'Evening']
  Người khác: ['Evening', 'Night']
  Common: ['Evening'] = 1/2 = 50 điểm

  🌍 Language Match (5%)

  calculateLanguageMatch(user1, user2)
  - Có ngôn ngữ chung: 100 điểm
  - Không có chung: 30 điểm

  Bước 4: Tính điểm tổng

  const totalScore =
    universityMatch * 0.15 +      // 15%
    majorMatch * 0.20 +           // 20%
    yearCompatibility * 0.10 +    // 10%
    interestsMatch * 0.20 +       // 20%
    skillsMatch * 0.15 +          // 15%
    studyTimeMatch * 0.15 +       // 15%
    languageMatch * 0.05          // 5%

  Bước 5: Sắp xếp và trả kết quả

  return scoredUsers
    .sort((a, b) => b.matchScore - a.matchScore) // Sắp xếp giảm dần
    .slice(0, limit)                             // Lấy top matches

  📊 Ví dụ thực tế

  Profile của bạn:
  - University: "UET"
  - Major: "Computer Science"
  - Year: 3
  - Interests: ['AI', 'Gaming']
  - Skills: ['Python', 'React']

  Ứng viên A:
  - University: "UET" → 100 điểm (15%)
  - Major: "Software Engineering" → 70 điểm (20%)
  - Year: 3 → 100 điểm (10%)
  - Interests: ['AI', 'Reading'] → 50 điểm (20%)
  - Skills: ['Node.js', 'Backend'] → 80 điểm (15% - complementary)
  - Study Time: Overlap 50% → 50 điểm (15%)
  - Language: Có chung → 100 điểm (5%)

  Điểm cuối:
  100*0.15 + 70*0.20 + 100*0.10 + 50*0.20 + 80*0.15 + 50*0.15 + 100*0.05 = 74 điểm

  🎯 Tại sao algorithm này thông minh:

  1. Cân bằng: Major và Interests được ưu tiên cao (20% mỗi cái)
  2. Complementary Skills: Khuyến khích diversity (Frontend + Backend)
  3. Proximity: Cùng trường/năm được bonus
  4. Practical: Study time compatibility quan trọng cho collaboration

  Algorithm này đảm bảo bạn gặp những người vừa tương đồng vừa bổ sung cho nhau! 🚀