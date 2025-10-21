-- =====================================================
-- StudyMate Database - Seed Data
-- =====================================================
-- This file contains initial seed data for the database
-- Execute AFTER 05_triggers.sql
-- =====================================================

-- =====================================================
-- BADGES SEED DATA
-- =====================================================

INSERT INTO badges (id, name, description, type, icon, requirement, "isActive", "createdAt")
VALUES
  (
    'badge_network_pro',
    'Network Pro',
    'Đã kết nối với 50+ sinh viên',
    'NETWORK_PRO',
    'https://studymate.app/badges/network-pro.svg',
    'Kết nối thành công với ít nhất 50 sinh viên khác',
    TRUE,
    CURRENT_TIMESTAMP
  ),
  (
    'badge_chat_master',
    'Chat Master',
    'Đã trao đổi 1000+ tin nhắn',
    'CHAT_MASTER',
    'https://studymate.app/badges/chat-master.svg',
    'Gửi tổng cộng 1000 tin nhắn trở lên',
    TRUE,
    CURRENT_TIMESTAMP
  ),
  (
    'badge_study_influencer',
    'Study Influencer',
    'Phòng học của bạn có 100+ lượt tham gia',
    'STUDY_INFLUENCER',
    'https://studymate.app/badges/study-influencer.svg',
    'Tạo phòng học thu hút tổng cộng 100 người tham gia',
    TRUE,
    CURRENT_TIMESTAMP
  ),
  (
    'badge_mentor',
    'Mentor',
    'Đã hỗ trợ 20+ sinh viên với điểm rating trung bình 4.5+',
    'MENTOR',
    'https://studymate.app/badges/mentor.svg',
    'Nhận rating trung bình 4.5 sao trở lên với ít nhất 20 đánh giá',
    TRUE,
    CURRENT_TIMESTAMP
  ),
  (
    'badge_early_adopter',
    'Early Adopter',
    'Là một trong 100 người dùng đầu tiên',
    'EARLY_ADOPTER',
    'https://studymate.app/badges/early-adopter.svg',
    'Đăng ký trong số 100 người dùng đầu tiên của nền tảng',
    TRUE,
    CURRENT_TIMESTAMP
  )
ON CONFLICT (name) DO NOTHING;

COMMENT ON TABLE badges IS 'Seeded with 5 core badge types for gamification';

-- =====================================================
-- ACHIEVEMENTS SEED DATA
-- =====================================================

INSERT INTO achievements (id, name, description, category, points, requirement, "isActive", "createdAt")
VALUES
  -- SOCIAL Achievements
  (
    'achievement_first_match',
    'First Connection',
    'Kết nối thành công lần đầu tiên',
    'SOCIAL',
    10,
    '{"type": "match_count", "target": 1}',
    TRUE,
    CURRENT_TIMESTAMP
  ),
  (
    'achievement_10_matches',
    'Social Butterfly',
    'Kết nối với 10 sinh viên',
    'SOCIAL',
    50,
    '{"type": "match_count", "target": 10}',
    TRUE,
    CURRENT_TIMESTAMP
  ),
  (
    'achievement_50_matches',
    'Super Networker',
    'Kết nối với 50 sinh viên',
    'SOCIAL',
    100,
    '{"type": "match_count", "target": 50}',
    TRUE,
    CURRENT_TIMESTAMP
  ),
  (
    'achievement_100_matches',
    'Connection Master',
    'Kết nối với 100 sinh viên',
    'SOCIAL',
    200,
    '{"type": "match_count", "target": 100}',
    TRUE,
    CURRENT_TIMESTAMP
  ),

  -- ACADEMIC Achievements
  (
    'achievement_first_study_session',
    'First Study Session',
    'Hoàn thành phiên học đầu tiên',
    'ACADEMIC',
    10,
    '{"type": "study_sessions", "target": 1}',
    TRUE,
    CURRENT_TIMESTAMP
  ),
  (
    'achievement_10_study_hours',
    'Dedicated Learner',
    'Học 10 giờ trên nền tảng',
    'ACADEMIC',
    50,
    '{"type": "study_hours", "target": 10}',
    TRUE,
    CURRENT_TIMESTAMP
  ),
  (
    'achievement_50_study_hours',
    'Study Champion',
    'Học 50 giờ trên nền tảng',
    'ACADEMIC',
    150,
    '{"type": "study_hours", "target": 50}',
    TRUE,
    CURRENT_TIMESTAMP
  ),
  (
    'achievement_100_study_hours',
    'Academic Warrior',
    'Học 100 giờ trên nền tảng',
    'ACADEMIC',
    300,
    '{"type": "study_hours", "target": 100}',
    TRUE,
    CURRENT_TIMESTAMP
  ),

  -- ENGAGEMENT Achievements
  (
    'achievement_7_day_streak',
    'Week Warrior',
    'Đăng nhập liên tục 7 ngày',
    'ENGAGEMENT',
    50,
    '{"type": "login_streak", "target": 7}',
    TRUE,
    CURRENT_TIMESTAMP
  ),
  (
    'achievement_30_day_streak',
    'Monthly Master',
    'Đăng nhập liên tục 30 ngày',
    'ENGAGEMENT',
    150,
    '{"type": "login_streak", "target": 30}',
    TRUE,
    CURRENT_TIMESTAMP
  ),
  (
    'achievement_100_messages',
    'Chatty Cathy',
    'Gửi 100 tin nhắn',
    'ENGAGEMENT',
    30,
    '{"type": "message_count", "target": 100}',
    TRUE,
    CURRENT_TIMESTAMP
  ),
  (
    'achievement_1000_messages',
    'Communication Expert',
    'Gửi 1000 tin nhắn',
    'ENGAGEMENT',
    100,
    '{"type": "message_count", "target": 1000}',
    TRUE,
    CURRENT_TIMESTAMP
  ),

  -- LEADERSHIP Achievements
  (
    'achievement_first_room',
    'Room Creator',
    'Tạo phòng học đầu tiên',
    'LEADERSHIP',
    20,
    '{"type": "rooms_created", "target": 1}',
    TRUE,
    CURRENT_TIMESTAMP
  ),
  (
    'achievement_10_rooms',
    'Study Leader',
    'Tạo 10 phòng học',
    'LEADERSHIP',
    100,
    '{"type": "rooms_created", "target": 10}',
    TRUE,
    CURRENT_TIMESTAMP
  ),
  (
    'achievement_popular_room',
    'Popularity King',
    'Tạo phòng có 50+ thành viên',
    'LEADERSHIP',
    150,
    '{"type": "room_members_max", "target": 50}',
    TRUE,
    CURRENT_TIMESTAMP
  ),
  (
    'achievement_5_star_mentor',
    'Five Star Mentor',
    'Nhận 10 đánh giá 5 sao',
    'LEADERSHIP',
    200,
    '{"type": "five_star_ratings", "target": 10}',
    TRUE,
    CURRENT_TIMESTAMP
  )
ON CONFLICT (name) DO NOTHING;

COMMENT ON TABLE achievements IS 'Seeded with 16 core achievements across 4 categories';

-- =====================================================
-- SAMPLE UNIVERSITIES (for reference)
-- =====================================================

-- Note: This is just a comment for reference. Universities are stored as TEXT in users table
-- Common Vietnamese Universities:
-- - Đại học Bách Khoa TP.HCM (HCMUT)
-- - Đại học Kinh tế TP.HCM (UEH)
-- - Đại học Công nghệ Thông tin (UIT)
-- - Đại học Quốc gia Hà Nội (VNU)
-- - Đại học FPT
-- - Đại học Tôn Đức Thắng
-- - Đại học Ngoại thương
-- - Đại học Sư phạm TP.HCM

-- =====================================================
-- SAMPLE MAJORS (for reference)
-- =====================================================

-- Common majors stored as TEXT:
-- - Khoa học Máy tính (Computer Science)
-- - Kỹ thuật Phần mềm (Software Engineering)
-- - Kinh tế (Economics)
-- - Quản trị Kinh doanh (Business Administration)
-- - Kỹ thuật Điện tử (Electronics Engineering)
-- - Ngôn ngữ Anh (English Language)
-- - Marketing
-- - Kế toán (Accounting)

-- =====================================================
-- SAMPLE INTERESTS (for reference)
-- =====================================================

-- Common interests array values:
-- - "Lập trình" (Programming)
-- - "Toán học" (Mathematics)
-- - "Kinh doanh" (Business)
-- - "Ngoại ngữ" (Foreign Languages)
-- - "Marketing"
-- - "Thiết kế" (Design)
-- - "Dữ liệu" (Data Science)
-- - "AI/Machine Learning"

-- =====================================================
-- SAMPLE SKILLS (for reference)
-- =====================================================

-- Common skills array values:
-- - "Python"
-- - "JavaScript"
-- - "Excel"
-- - "Presentation"
-- - "Research"
-- - "Writing"
-- - "Data Analysis"
-- - "Public Speaking"

-- =====================================================
-- INITIAL DAILY METRICS
-- =====================================================

-- Insert initial metrics row for today
INSERT INTO daily_metrics (
  id,
  date,
  "totalUsers",
  "activeUsers",
  "newUsers",
  "totalMatches",
  "successfulMatches",
  "totalMessages",
  "totalRooms",
  "activeRooms",
  "createdAt",
  "updatedAt"
)
VALUES (
  gen_random_uuid()::TEXT,
  CURRENT_DATE,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (date) DO NOTHING;

COMMENT ON TABLE daily_metrics IS 'Initialized with today''s metrics';

-- =====================================================
-- HELPFUL QUERIES FOR SEEDING MORE DATA
-- =====================================================

-- To add test users, use the application's seed API:
-- POST /api/seed/users?count=100

-- To add test matches:
-- POST /api/seed/matches

-- To add test messages:
-- POST /api/seed/messages

-- To add test rooms:
-- POST /api/seed/rooms

-- =====================================================
-- DATABASE STATISTICS AFTER SEEDING
-- =====================================================

DO $$
DECLARE
  badge_count INTEGER;
  achievement_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO badge_count FROM badges;
  SELECT COUNT(*) INTO achievement_count FROM achievements;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'StudyMate Database Seeding Complete';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Badges seeded: %', badge_count;
  RAISE NOTICE 'Achievements seeded: %', achievement_count;
  RAISE NOTICE 'Daily metrics initialized: 1 row';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Use the application seed API to add:';
  RAISE NOTICE '  - Test users';
  RAISE NOTICE '  - Test matches';
  RAISE NOTICE '  - Test messages';
  RAISE NOTICE '  - Test rooms';
  RAISE NOTICE '========================================';
END $$;
