-- =====================================================
-- Migration: Update successfulMatches Count for Existing Users
-- Date: 2025-10-21
-- Description: Calculates and updates successfulMatches based on ACCEPTED matches
-- =====================================================

-- This script updates successfulMatches count for all users based on their accepted matches

DO $$
DECLARE
  user_record RECORD;
  accepted_count INTEGER;
  total_updated INTEGER := 0;
BEGIN
  RAISE NOTICE 'Starting to update successfulMatches count...';
  RAISE NOTICE '========================================';

  -- Loop through all users
  FOR user_record IN
    SELECT id, "firstName", "lastName", "successfulMatches"
    FROM users
    ORDER BY "createdAt" ASC
  LOOP
    -- Count ACCEPTED matches for this user (both sent and received)
    SELECT COUNT(*)
    INTO accepted_count
    FROM matches
    WHERE (
      "senderId" = user_record.id OR "receiverId" = user_record.id
    )
    AND status = 'ACCEPTED';

    -- Update user's successfulMatches if it's different
    IF accepted_count != user_record."successfulMatches" THEN
      UPDATE users
      SET "successfulMatches" = accepted_count
      WHERE id = user_record.id;

      total_updated := total_updated + 1;

      RAISE NOTICE 'Updated user % % - Old: %, New: %',
        user_record."firstName",
        user_record."lastName",
        user_record."successfulMatches",
        accepted_count;
    ELSE
      RAISE NOTICE 'User % % already correct: %',
        user_record."firstName",
        user_record."lastName",
        accepted_count;
    END IF;
  END LOOP;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Total users updated: %', total_updated;
  RAISE NOTICE '========================================';

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error updating successfulMatches: %', SQLERRM;
END $$;

-- =====================================================
-- Verification Queries
-- =====================================================

-- Show users with their match counts
SELECT
  u.id,
  u."firstName" || ' ' || u."lastName" AS name,
  u."successfulMatches" AS successful_matches_count,
  COUNT(CASE WHEN m.status = 'ACCEPTED' THEN 1 END) AS actual_accepted_count,
  CASE
    WHEN u."successfulMatches" = COUNT(CASE WHEN m.status = 'ACCEPTED' THEN 1 END)
    THEN 'OK'
    ELSE 'MISMATCH'
  END AS status
FROM users u
LEFT JOIN matches m ON (u.id = m."senderId" OR u.id = m."receiverId")
GROUP BY u.id, u."firstName", u."lastName", u."successfulMatches"
ORDER BY u."successfulMatches" DESC;

-- Summary statistics
SELECT
  COUNT(*) AS total_users,
  SUM("successfulMatches") AS total_successful_matches,
  AVG("successfulMatches") AS avg_successful_matches,
  MAX("successfulMatches") AS max_successful_matches
FROM users;

-- Users with most successful matches
SELECT
  u."firstName" || ' ' || u."lastName" AS name,
  u.university,
  u."successfulMatches"
FROM users u
WHERE u."successfulMatches" > 0
ORDER BY u."successfulMatches" DESC
LIMIT 10;

-- =====================================================
-- Rollback (if needed)
-- =====================================================

-- To reset all successfulMatches to 0:
-- UPDATE users SET "successfulMatches" = 0;
