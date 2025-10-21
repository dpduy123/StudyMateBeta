-- =====================================================
-- Migration: Add Notifications System
-- Date: 2025-10-21
-- Description: Adds notifications table and enum for match requests and other notifications
-- =====================================================

-- Step 1: Create NotificationType enum
CREATE TYPE "NotificationType" AS ENUM (
  'MATCH_REQUEST',
  'MATCH_ACCEPTED',
  'NEW_MESSAGE',
  'ROOM_INVITE',
  'BADGE_EARNED',
  'ACHIEVEMENT_UNLOCKED'
);

COMMENT ON TYPE "NotificationType" IS 'Types of notifications users can receive';

-- Step 2: Create notifications table
CREATE TABLE "notifications" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "type" "NotificationType" NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT FALSE,

  -- Related entities
  "relatedUserId" TEXT,
  "relatedMatchId" TEXT,
  "relatedMessageId" TEXT,
  "relatedRoomId" TEXT,

  -- Metadata
  "metadata" JSONB,

  -- Timestamps
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "readAt" TIMESTAMP,

  -- Foreign key constraint
  CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

COMMENT ON TABLE "notifications" IS 'User notifications for match requests, messages, and other events';
COMMENT ON COLUMN "notifications"."userId" IS 'Recipient of the notification';
COMMENT ON COLUMN "notifications"."relatedUserId" IS 'User who triggered the notification (e.g., sender of match request)';
COMMENT ON COLUMN "notifications"."relatedMatchId" IS 'Related match ID for MATCH_REQUEST and MATCH_ACCEPTED notifications';
COMMENT ON COLUMN "notifications"."metadata" IS 'Additional JSON data (senderName, senderAvatar, etc.)';

-- Step 3: Create indexes for performance
CREATE INDEX "idx_notifications_userId_isRead" ON "notifications"("userId", "isRead");
CREATE INDEX "idx_notifications_userId_createdAt" ON "notifications"("userId", "createdAt" DESC);
CREATE INDEX "idx_notifications_type" ON "notifications"("type");
CREATE INDEX "idx_notifications_unread" ON "notifications"("userId", "createdAt" DESC)
  WHERE "isRead" = FALSE;

COMMENT ON INDEX "idx_notifications_userId_isRead" IS 'Fast lookup for user notifications by read status';
COMMENT ON INDEX "idx_notifications_userId_createdAt" IS 'Fast lookup for user notifications ordered by time';
COMMENT ON INDEX "idx_notifications_unread" IS 'Partial index for unread notifications only';

-- Step 4: Create trigger to auto-update readAt
CREATE OR REPLACE FUNCTION set_notification_read_at()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD."isRead" = FALSE AND NEW."isRead" = TRUE THEN
    NEW."readAt" = CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notification_read_at
  BEFORE UPDATE ON "notifications"
  FOR EACH ROW
  WHEN (OLD."isRead" IS DISTINCT FROM NEW."isRead")
  EXECUTE FUNCTION set_notification_read_at();

COMMENT ON FUNCTION set_notification_read_at() IS 'Automatically sets readAt when isRead becomes true';

-- Step 5: Create function to get unread count
CREATE OR REPLACE FUNCTION get_unread_notification_count(user_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO unread_count
  FROM "notifications"
  WHERE "userId" = user_id
    AND "isRead" = FALSE;

  RETURN unread_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_unread_notification_count(TEXT) IS 'Returns count of unread notifications for a user';

-- Step 6: Create function to cleanup old read notifications (optional)
CREATE OR REPLACE FUNCTION cleanup_old_notifications(retention_days INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM "notifications"
  WHERE "isRead" = TRUE
    AND "createdAt" < CURRENT_DATE - (retention_days || ' days')::INTERVAL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_notifications(INTEGER) IS 'Deletes read notifications older than specified days (default 30)';

-- Step 7: Grant permissions (if needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON "notifications" TO your_app_user;

-- =====================================================
-- Verification queries
-- =====================================================

-- Count notifications by type
-- SELECT type, COUNT(*) FROM notifications GROUP BY type;

-- Get unread notifications for a user
-- SELECT * FROM notifications WHERE "userId" = 'user_id' AND "isRead" = FALSE ORDER BY "createdAt" DESC;

-- Check unread count
-- SELECT get_unread_notification_count('user_id');

-- =====================================================
-- Rollback script (if needed)
-- =====================================================

-- To rollback this migration, run:
-- DROP TRIGGER IF EXISTS trigger_notification_read_at ON notifications;
-- DROP FUNCTION IF EXISTS set_notification_read_at();
-- DROP FUNCTION IF EXISTS get_unread_notification_count(TEXT);
-- DROP FUNCTION IF EXISTS cleanup_old_notifications(INTEGER);
-- DROP TABLE IF EXISTS notifications;
-- DROP TYPE IF EXISTS "NotificationType";
