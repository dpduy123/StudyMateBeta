-- =====================================================
-- Migration: Create Notifications for Existing Pending Matches
-- Date: 2025-10-21
-- Description: Generates notifications for all existing PENDING match requests
-- =====================================================

-- This script will create notifications for all pending matches that don't have notifications yet

DO $$
DECLARE
  match_record RECORD;
  sender_first_name TEXT;
  sender_last_name TEXT;
  sender_avatar TEXT;
  sender_university TEXT;
  notification_count INTEGER := 0;
BEGIN
  RAISE NOTICE 'Starting to create notifications for pending matches...';

  -- Loop through all PENDING matches
  FOR match_record IN
    SELECT
      m.id AS match_id,
      m."senderId",
      m."receiverId",
      m."createdAt",
      u."firstName" AS sender_first_name,
      u."lastName" AS sender_last_name,
      u.avatar AS sender_avatar,
      u.university AS sender_university
    FROM matches m
    JOIN users u ON m."senderId" = u.id
    WHERE m.status = 'PENDING'
      -- Only create notifications for matches that don't already have one
      AND NOT EXISTS (
        SELECT 1
        FROM notifications n
        WHERE n."relatedMatchId" = m.id
          AND n.type = 'MATCH_REQUEST'
      )
    ORDER BY m."createdAt" DESC
  LOOP
    -- Create notification for the receiver
    INSERT INTO notifications (
      id,
      "userId",
      type,
      title,
      message,
      "isRead",
      "relatedUserId",
      "relatedMatchId",
      metadata,
      "createdAt",
      "readAt"
    )
    VALUES (
      -- Generate CUID-like ID (simplified version)
      'notif_' || substr(md5(random()::text), 1, 24),
      match_record."receiverId",
      'MATCH_REQUEST',
      'Yeu cau ket noi moi',
      match_record.sender_first_name || ' ' || match_record.sender_last_name || ' muon ket noi voi ban',
      FALSE,
      match_record."senderId",
      match_record.match_id,
      jsonb_build_object(
        'senderName', match_record.sender_first_name || ' ' || match_record.sender_last_name,
        'senderAvatar', match_record.sender_avatar,
        'senderUniversity', match_record.sender_university
      ),
      match_record."createdAt",
      NULL
    );

    notification_count := notification_count + 1;

    RAISE NOTICE 'Created notification for match % (Sender: % %, Receiver: %)',
      match_record.match_id,
      match_record.sender_first_name,
      match_record.sender_last_name,
      match_record."receiverId";
  END LOOP;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Total notifications created: %', notification_count;
  RAISE NOTICE '========================================';

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating notifications: %', SQLERRM;
END $$;

-- =====================================================
-- Verification Query
-- =====================================================

-- Check how many notifications were created
SELECT
  COUNT(*) AS total_notifications,
  COUNT(CASE WHEN "isRead" = FALSE THEN 1 END) AS unread_notifications,
  COUNT(CASE WHEN type = 'MATCH_REQUEST' THEN 1 END) AS match_request_notifications
FROM notifications;

-- Show sample of created notifications
SELECT
  n.id,
  n.type,
  n.title,
  n.message,
  n."isRead",
  n."createdAt",
  u."firstName" || ' ' || u."lastName" AS receiver_name
FROM notifications n
JOIN users u ON n."userId" = u.id
WHERE n.type = 'MATCH_REQUEST'
ORDER BY n."createdAt" DESC
LIMIT 10;

-- =====================================================
-- Rollback (if needed)
-- =====================================================

-- To remove all notifications created by this migration:
-- DELETE FROM notifications WHERE type = 'MATCH_REQUEST';
