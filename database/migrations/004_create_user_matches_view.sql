-- =====================================================
-- Migration: Create User Matches View
-- Date: 2025-10-21
-- Description: Creates a view to easily see who users have matched with
-- =====================================================

-- =====================================================
-- Create View: user_matches_detailed
-- =====================================================

CREATE OR REPLACE VIEW user_matches_detailed AS
SELECT
  -- Match info
  m.id AS match_id,
  m.status,
  m."createdAt" AS matched_at,
  m."respondedAt" AS responded_at,

  -- User 1 (Sender)
  u1.id AS user1_id,
  u1."firstName" || ' ' || u1."lastName" AS user1_name,
  u1.email AS user1_email,
  u1.avatar AS user1_avatar,
  u1.university AS user1_university,
  u1.major AS user1_major,
  u1.year AS user1_year,

  -- User 2 (Receiver)
  u2.id AS user2_id,
  u2."firstName" || ' ' || u2."lastName" AS user2_name,
  u2.email AS user2_email,
  u2.avatar AS user2_avatar,
  u2.university AS user2_university,
  u2.major AS user2_major,
  u2.year AS user2_year,

  -- Additional info
  CASE
    WHEN m.status = 'ACCEPTED' THEN 'Đã kết nối'
    WHEN m.status = 'PENDING' THEN 'Đang chờ'
    WHEN m.status = 'REJECTED' THEN 'Đã từ chối'
    WHEN m.status = 'BLOCKED' THEN 'Đã chặn'
  END AS status_text,

  -- Calculate days since match
  EXTRACT(DAY FROM (CURRENT_TIMESTAMP - m."createdAt")) AS days_since_match

FROM matches m
JOIN users u1 ON m."senderId" = u1.id
JOIN users u2 ON m."receiverId" = u2.id;

COMMENT ON VIEW user_matches_detailed IS 'Detailed view of all matches with full user information';

-- =====================================================
-- Useful Queries
-- =====================================================

-- 1. Xem tất cả người đã match với user cụ thể (thay 'user_id' bằng ID thật)
-- SELECT * FROM get_user_matches('user_id');

-- 2. Xem tất cả ACCEPTED matches của user
-- SELECT * FROM get_user_matches('user_id') WHERE status = 'ACCEPTED';

-- 3. Xem pending requests của user
-- SELECT * FROM get_user_matches('user_id') WHERE status = 'PENDING';

-- =====================================================
-- Create Function: get_user_matches
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_matches(target_user_id TEXT)
RETURNS TABLE (
  match_id TEXT,
  matched_user_id TEXT,
  matched_user_name TEXT,
  matched_user_email TEXT,
  matched_user_avatar TEXT,
  matched_user_university TEXT,
  matched_user_major TEXT,
  matched_user_year INTEGER,
  status TEXT,
  status_text TEXT,
  is_sender BOOLEAN,
  matched_at TIMESTAMP,
  responded_at TIMESTAMP,
  days_since_match NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id AS match_id,
    CASE
      WHEN m."senderId" = target_user_id THEN m."receiverId"
      ELSE m."senderId"
    END AS matched_user_id,
    CASE
      WHEN m."senderId" = target_user_id THEN u2."firstName" || ' ' || u2."lastName"
      ELSE u1."firstName" || ' ' || u1."lastName"
    END AS matched_user_name,
    CASE
      WHEN m."senderId" = target_user_id THEN u2.email
      ELSE u1.email
    END AS matched_user_email,
    CASE
      WHEN m."senderId" = target_user_id THEN u2.avatar
      ELSE u1.avatar
    END AS matched_user_avatar,
    CASE
      WHEN m."senderId" = target_user_id THEN u2.university
      ELSE u1.university
    END AS matched_user_university,
    CASE
      WHEN m."senderId" = target_user_id THEN u2.major
      ELSE u1.major
    END AS matched_user_major,
    CASE
      WHEN m."senderId" = target_user_id THEN u2.year
      ELSE u1.year
    END AS matched_user_year,
    m.status::TEXT,
    CASE
      WHEN m.status = 'ACCEPTED' THEN 'Da ket noi'
      WHEN m.status = 'PENDING' THEN 'Dang cho'
      WHEN m.status = 'REJECTED' THEN 'Da tu choi'
      WHEN m.status = 'BLOCKED' THEN 'Da chan'
    END AS status_text,
    (m."senderId" = target_user_id) AS is_sender,
    m."createdAt" AS matched_at,
    m."respondedAt" AS responded_at,
    EXTRACT(DAY FROM (CURRENT_TIMESTAMP - m."createdAt")) AS days_since_match
  FROM matches m
  JOIN users u1 ON m."senderId" = u1.id
  JOIN users u2 ON m."receiverId" = u2.id
  WHERE m."senderId" = target_user_id OR m."receiverId" = target_user_id
  ORDER BY m."createdAt" DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_user_matches(TEXT) IS 'Returns all matches for a specific user with detailed information';

-- =====================================================
-- Example Usage Queries
-- =====================================================

-- Query 1: Xem tất cả matches của user "Đỗ Duy"
SELECT
  matched_user_name AS "Người đã match",
  matched_user_university AS "Trường",
  matched_user_major AS "Ngành",
  status_text AS "Trạng thái",
  CASE
    WHEN is_sender THEN 'Bạn gửi'
    ELSE 'Họ gửi'
  END AS "Ai gửi",
  TO_CHAR(matched_at, 'DD/MM/YYYY HH24:MI') AS "Ngày match"
FROM get_user_matches(
  (SELECT id FROM users WHERE "firstName" = 'Đỗ' AND "lastName" = 'Duy' LIMIT 1)
);

-- Query 2: Đếm số matches theo status
SELECT
  u."firstName" || ' ' || u."lastName" AS user_name,
  COUNT(CASE WHEN m.status = 'ACCEPTED' THEN 1 END) AS accepted_count,
  COUNT(CASE WHEN m.status = 'PENDING' THEN 1 END) AS pending_count,
  COUNT(CASE WHEN m.status = 'REJECTED' THEN 1 END) AS rejected_count,
  COUNT(*) AS total_matches
FROM users u
LEFT JOIN matches m ON (u.id = m."senderId" OR u.id = m."receiverId")
GROUP BY u.id, u."firstName", u."lastName"
HAVING COUNT(*) > 0
ORDER BY accepted_count DESC;

-- Query 3: Xem chi tiết tất cả ACCEPTED matches trong hệ thống
SELECT
  user1_name AS "Người 1",
  user1_university AS "Trường 1",
  user2_name AS "Người 2",
  user2_university AS "Trường 2",
  TO_CHAR(matched_at, 'DD/MM/YYYY') AS "Ngày kết nối",
  days_since_match || ' ngày' AS "Thời gian"
FROM user_matches_detailed
WHERE status = 'ACCEPTED'
ORDER BY matched_at DESC;

-- Query 4: Tìm users có nhiều matches nhất
SELECT
  u."firstName" || ' ' || u."lastName" AS name,
  u.university,
  u."successfulMatches",
  COUNT(m.id) AS total_interactions,
  COUNT(CASE WHEN m.status = 'ACCEPTED' THEN 1 END) AS accepted,
  COUNT(CASE WHEN m.status = 'PENDING' THEN 1 END) AS pending
FROM users u
LEFT JOIN matches m ON (u.id = m."senderId" OR u.id = m."receiverId")
GROUP BY u.id, u."firstName", u."lastName", u.university, u."successfulMatches"
ORDER BY accepted DESC, total_interactions DESC
LIMIT 20;

-- Query 5: Xem ai đã gửi match request cho user nhưng chưa được accept
SELECT
  sender."firstName" || ' ' || sender."lastName" AS "Người gửi request",
  sender.university AS "Trường",
  sender.major AS "Ngành",
  receiver."firstName" || ' ' || receiver."lastName" AS "Người nhận",
  m."createdAt" AS "Thời gian gửi",
  EXTRACT(DAY FROM (CURRENT_TIMESTAMP - m."createdAt")) || ' ngày trước' AS "Cách đây"
FROM matches m
JOIN users sender ON m."senderId" = sender.id
JOIN users receiver ON m."receiverId" = receiver.id
WHERE m.status = 'PENDING'
ORDER BY m."createdAt" DESC;

-- =====================================================
-- Verification
-- =====================================================

-- Check if view was created
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'user_matches_detailed';

-- Check if function was created
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'get_user_matches';

RAISE NOTICE '========================================';
RAISE NOTICE 'Migration completed successfully!';
RAISE NOTICE 'Created view: user_matches_detailed';
RAISE NOTICE 'Created function: get_user_matches(user_id)';
RAISE NOTICE '========================================';
RAISE NOTICE 'Usage example:';
RAISE NOTICE '  SELECT * FROM get_user_matches(''your_user_id'');';
RAISE NOTICE '========================================';
