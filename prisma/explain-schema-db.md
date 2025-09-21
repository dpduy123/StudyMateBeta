Cấu trúc chính của Database:

  1. User Model (Người dùng)

  - Xác thực: email (.edu), emailVerified, username
  - Thông tin cá nhân: firstName, lastName, avatar, bio
  - Hồ sơ học thuật: university, major, year, gpa
  - Sở thích học tập: interests[], skills[], studyGoals[], preferredStudyTime[], languages[]
  - Subscription tiers: BASIC (miễn phí), PREMIUM (79k/tháng), ELITE (149k/tháng)
  - AI metrics: responseRate, averageRating để thuật toán AI matching

  2. Match System (Khám phá - AI Matching)

  - Match model: quản lý kết nối giữa sinh viên
  - Status: PENDING, ACCEPTED, REJECTED, BLOCKED
  - Unique constraint: ngăn duplicate matches giữa 2 user

  3. Messaging System (Tin nhắn)

  - Message types: TEXT, FILE, VOICE, VIDEO
  - File sharing: fileUrl, fileName, fileSize cho tài liệu học tập
  - Read receipts: isRead, readAt

  4. Voice/Video Chat Rooms

  - Room types: STUDY_GROUP, DISCUSSION, HELP_SESSION, CASUAL
  - Room settings: allowVideo, allowVoice, allowText, allowScreenShare (premium)
  - RoomMember: quản lý thành viên, mute/ban capabilities

  5. Achievement System (Thành tích)

  - Badges: NETWORK_PRO, CHAT_MASTER, STUDY_INFLUENCER, MENTOR
  - Achievements: categories (SOCIAL, ACADEMIC, ENGAGEMENT, LEADERSHIP)
  - Progress tracking: progress float (0.0-1.0) cho từng achievement

  6. Rating System

  - 5-star rating: giữa users sau study sessions
  - Context-based: "study_session", "room_interaction"
  - Comment system: feedback chi tiết

  7. Analytics & Metrics

  - UserActivity: tracking mọi hoạt động (login, match_sent, message_sent)
  - DailyMetrics: thống kê hằng ngày cho admin dashboard

  Tính năng Premium được hỗ trợ:

  BASIC (Miễn phí):

  - 5 matches/ngày (qua logic app)
  - 5 study rooms/ngày
  - Messaging cơ bản

  PREMIUM (79k/tháng):

  - Unlimited matches
  - Advanced filters
  - Bộ lọc nâng cao

  ELITE (149k/tháng):

  - AI Tutor Access
  - Exclusive Events
  - Career Mentoring
  - Screen sharing trong rooms

  Quan hệ chính trong Database:

  - User ↔ Match (1:many sender/receiver)
  - User ↔ Message (1:many sender/receiver)
  - User ↔ Room (1:many owner + many:many members)
  - User ↔ Badge/Achievement (many:many với timestamps)
  - User ↔ Rating (many:many với context)

  Schema này đã sẵn sàng cho:
  - OAuth 2.0 authentication với email .edu
  - AI-driven matching algorithm
  - Real-time messaging & voice/video calls
  - Gamification với badges & leaderboards
  - Analytics cho B2B university partnerships