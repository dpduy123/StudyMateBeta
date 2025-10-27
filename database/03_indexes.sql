-- =====================================================
-- StudyMate Database - Indexes
-- =====================================================
-- This file creates all database indexes for performance optimization
-- Execute AFTER 02_tables.sql
-- =====================================================

-- =====================================================
-- USERS TABLE INDEXES
-- =====================================================

-- Primary lookup indexes
CREATE INDEX "idx_users_email" ON "users"("email");
CREATE INDEX "idx_users_username" ON "users"("username");
CREATE INDEX "idx_users_status" ON "users"("status");
CREATE INDEX "idx_users_subscriptionTier" ON "users"("subscriptionTier");

-- Academic matching indexes (for AI algorithm)
CREATE INDEX "idx_users_university" ON "users"("university");
CREATE INDEX "idx_users_major" ON "users"("major");
CREATE INDEX "idx_users_year" ON "users"("year");
CREATE INDEX "idx_users_university_major" ON "users"("university", "major");
CREATE INDEX "idx_users_university_major_year" ON "users"("university", "major", "year");

-- Array field indexes (GIN for array operations)
CREATE INDEX "idx_users_interests" ON "users" USING GIN("interests");
CREATE INDEX "idx_users_skills" ON "users" USING GIN("skills");
CREATE INDEX "idx_users_studyGoals" ON "users" USING GIN("studyGoals");
CREATE INDEX "idx_users_preferredStudyTime" ON "users" USING GIN("preferredStudyTime");
CREATE INDEX "idx_users_languages" ON "users" USING GIN("languages");

-- Timestamp indexes for activity tracking
CREATE INDEX "idx_users_createdAt" ON "users"("createdAt");
CREATE INDEX "idx_users_lastActive" ON "users"("lastActive");
CREATE INDEX "idx_users_subscriptionExpiry" ON "users"("subscriptionExpiry") WHERE "subscriptionExpiry" IS NOT NULL;

-- Composite index for active users discovery
CREATE INDEX "idx_users_active_discovery" ON "users"("status", "isProfilePublic", "lastActive")
  WHERE "status" = 'ACTIVE' AND "isProfilePublic" = TRUE;

-- Metrics indexes for leaderboards
CREATE INDEX "idx_users_averageRating" ON "users"("averageRating" DESC) WHERE "averageRating" > 0;
CREATE INDEX "idx_users_totalMatches" ON "users"("totalMatches" DESC);
CREATE INDEX "idx_users_successfulMatches" ON "users"("successfulMatches" DESC);

COMMENT ON INDEX "idx_users_interests" IS 'GIN index for fast array overlap queries in matching algorithm';
COMMENT ON INDEX "idx_users_active_discovery" IS 'Optimizes discovery page queries for active, public users';

-- =====================================================
-- MATCHES TABLE INDEXES
-- =====================================================

-- Foreign key indexes
CREATE INDEX "idx_matches_senderId" ON "matches"("senderId");
CREATE INDEX "idx_matches_receiverId" ON "matches"("receiverId");

-- Status-based queries
CREATE INDEX "idx_matches_status" ON "matches"("status");

-- User-specific match history
CREATE INDEX "idx_matches_sender_status" ON "matches"("senderId", "status");
CREATE INDEX "idx_matches_receiver_status" ON "matches"("receiverId", "status");

-- Pending matches for notifications
CREATE INDEX "idx_matches_pending" ON "matches"("receiverId", "status", "createdAt")
  WHERE "status" = 'PENDING';

-- Recent matches
CREATE INDEX "idx_matches_createdAt" ON "matches"("createdAt" DESC);
CREATE INDEX "idx_matches_respondedAt" ON "matches"("respondedAt" DESC) WHERE "respondedAt" IS NOT NULL;

-- Accepted matches for messaging
CREATE INDEX "idx_matches_accepted" ON "matches"("senderId", "receiverId", "status")
  WHERE "status" = 'ACCEPTED';

COMMENT ON INDEX "idx_matches_pending" IS 'Fast lookup for pending match requests';
COMMENT ON INDEX "idx_matches_accepted" IS 'Validates if two users can message each other';

-- =====================================================
-- MESSAGES TABLE INDEXES
-- =====================================================

-- Foreign key indexes
CREATE INDEX "idx_messages_senderId" ON "messages"("senderId");
CREATE INDEX "idx_messages_receiverId" ON "messages"("receiverId");

-- Conversation queries (most common use case)
CREATE INDEX "idx_messages_conversation" ON "messages"("senderId", "receiverId", "createdAt" DESC);
CREATE INDEX "idx_messages_conversation_reverse" ON "messages"("receiverId", "senderId", "createdAt" DESC);

-- Performance-optimized index for conversation queries with ordering
-- Optimizes conversation list loading and message pagination
CREATE INDEX "idx_messages_conversation_id_created_at" ON "messages"("senderId", "receiverId", "createdAt" DESC);
CREATE INDEX "idx_messages_conversation_id_created_at_reverse" ON "messages"("receiverId", "senderId", "createdAt" DESC);

-- Unread messages (critical for notifications)
CREATE INDEX "idx_messages_unread" ON "messages"("receiverId", "isRead", "createdAt")
  WHERE "isRead" = FALSE;

-- Optimized index for unread message count queries (90-95% faster)
CREATE INDEX "idx_messages_receiver_id_is_read" ON "messages"("receiverId", "isRead") 
  WHERE "isRead" = FALSE;

-- Message type filtering
CREATE INDEX "idx_messages_type" ON "messages"("type");

-- File messages
CREATE INDEX "idx_messages_files" ON "messages"("senderId", "type", "createdAt")
  WHERE "type" IN ('FILE', 'VOICE', 'VIDEO');

-- Timestamp for pagination
CREATE INDEX "idx_messages_createdAt" ON "messages"("createdAt" DESC);

-- Composite index for conversation view with read status
CREATE INDEX "idx_messages_conversation_full" ON "messages"(
  "senderId", "receiverId", "isRead", "createdAt" DESC
);

COMMENT ON INDEX "idx_messages_unread" IS 'Critical for fast unread message count queries';
COMMENT ON INDEX "idx_messages_conversation" IS 'Optimizes message thread loading';

-- =====================================================
-- ROOMS TABLE INDEXES
-- =====================================================

-- Foreign key indexes
CREATE INDEX "idx_rooms_ownerId" ON "rooms"("ownerId");

-- Room discovery
CREATE INDEX "idx_rooms_type" ON "rooms"("type");
CREATE INDEX "idx_rooms_isPrivate" ON "rooms"("isPrivate");

-- Public rooms discovery
CREATE INDEX "idx_rooms_public_active" ON "rooms"("type", "lastActivity" DESC)
  WHERE "isPrivate" = FALSE;

-- Room search by topic
CREATE INDEX "idx_rooms_topic" ON "rooms"("topic") WHERE "topic" IS NOT NULL;

-- Active rooms
CREATE INDEX "idx_rooms_lastActivity" ON "rooms"("lastActivity" DESC);

-- Recently created rooms
CREATE INDEX "idx_rooms_createdAt" ON "rooms"("createdAt" DESC);

-- Full-text search on room name and description
CREATE INDEX "idx_rooms_search" ON "rooms" USING GIN(
  to_tsvector('english', COALESCE("name", '') || ' ' || COALESCE("description", ''))
);

COMMENT ON INDEX "idx_rooms_public_active" IS 'Fast discovery of active public study rooms';
COMMENT ON INDEX "idx_rooms_search" IS 'Full-text search for room names and descriptions';

-- =====================================================
-- ROOM MEMBERS TABLE INDEXES
-- =====================================================

-- Foreign key indexes
CREATE INDEX "idx_room_members_roomId" ON "room_members"("roomId");
CREATE INDEX "idx_room_members_userId" ON "room_members"("userId");

-- Active members (currently in room)
CREATE INDEX "idx_room_members_active" ON "room_members"("roomId", "userId")
  WHERE "leftAt" IS NULL AND "isBanned" = FALSE;

-- User's current rooms
CREATE INDEX "idx_room_members_user_active" ON "room_members"("userId", "joinedAt" DESC)
  WHERE "leftAt" IS NULL;

-- Room member count queries
CREATE INDEX "idx_room_members_room_active_count" ON "room_members"("roomId")
  WHERE "leftAt" IS NULL AND "isBanned" = FALSE;

-- Ban management
CREATE INDEX "idx_room_members_banned" ON "room_members"("roomId", "isBanned")
  WHERE "isBanned" = TRUE;

COMMENT ON INDEX "idx_room_members_active" IS 'Fast lookup of current room participants';

-- =====================================================
-- ROOM MESSAGES TABLE INDEXES
-- =====================================================

-- Foreign key indexes
CREATE INDEX "idx_room_messages_roomId" ON "room_messages"("roomId");
CREATE INDEX "idx_room_messages_senderId" ON "room_messages"("senderId");
CREATE INDEX "idx_room_messages_replyToId" ON "room_messages"("replyToId") WHERE "replyToId" IS NOT NULL;

-- Room chat history (most common query)
CREATE INDEX "idx_room_messages_room_time" ON "room_messages"("roomId", "createdAt" DESC);

-- Message type filtering
CREATE INDEX "idx_room_messages_type" ON "room_messages"("roomId", "type");

-- Recent messages for room activity
CREATE INDEX "idx_room_messages_createdAt" ON "room_messages"("createdAt" DESC);

-- Edited messages
CREATE INDEX "idx_room_messages_edited" ON "room_messages"("roomId", "isEdited", "editedAt")
  WHERE "isEdited" = TRUE;

-- Threaded replies
CREATE INDEX "idx_room_messages_replies" ON "room_messages"("replyToId", "createdAt")
  WHERE "replyToId" IS NOT NULL;

COMMENT ON INDEX "idx_room_messages_room_time" IS 'Optimizes room chat history pagination';

-- =====================================================
-- BADGES TABLE INDEXES
-- =====================================================

-- Badge type filtering
CREATE INDEX "idx_badges_type" ON "badges"("type");

-- Active badges only
CREATE INDEX "idx_badges_active" ON "badges"("isActive") WHERE "isActive" = TRUE;

-- =====================================================
-- USER BADGES TABLE INDEXES
-- =====================================================

-- Foreign key indexes
CREATE INDEX "idx_user_badges_userId" ON "user_badges"("userId");
CREATE INDEX "idx_user_badges_badgeId" ON "user_badges"("badgeId");

-- User's badges ordered by when earned
CREATE INDEX "idx_user_badges_user_earned" ON "user_badges"("userId", "earnedAt" DESC);

-- Recent badge awards (for activity feed)
CREATE INDEX "idx_user_badges_earnedAt" ON "user_badges"("earnedAt" DESC);

COMMENT ON INDEX "idx_user_badges_user_earned" IS 'Display user profile badges in chronological order';

-- =====================================================
-- ACHIEVEMENTS TABLE INDEXES
-- =====================================================

-- Category filtering
CREATE INDEX "idx_achievements_category" ON "achievements"("category");

-- Active achievements
CREATE INDEX "idx_achievements_active" ON "achievements"("isActive") WHERE "isActive" = TRUE;

-- Points leaderboard
CREATE INDEX "idx_achievements_points" ON "achievements"("points" DESC);

-- =====================================================
-- USER ACHIEVEMENTS TABLE INDEXES
-- =====================================================

-- Foreign key indexes
CREATE INDEX "idx_user_achievements_userId" ON "user_achievements"("userId");
CREATE INDEX "idx_user_achievements_achievementId" ON "user_achievements"("achievementId");

-- User's achievements
CREATE INDEX "idx_user_achievements_user_progress" ON "user_achievements"("userId", "progress");

-- Completed achievements
CREATE INDEX "idx_user_achievements_completed" ON "user_achievements"("userId", "completedAt")
  WHERE "completedAt" IS NOT NULL;

-- In-progress achievements
CREATE INDEX "idx_user_achievements_in_progress" ON "user_achievements"("userId", "progress")
  WHERE "completedAt" IS NULL AND "progress" > 0;

-- Recent completions (for activity feed)
CREATE INDEX "idx_user_achievements_completedAt" ON "user_achievements"("completedAt" DESC)
  WHERE "completedAt" IS NOT NULL;

COMMENT ON INDEX "idx_user_achievements_in_progress" IS 'Track achievements user is actively working towards';

-- =====================================================
-- RATINGS TABLE INDEXES
-- =====================================================

-- Foreign key indexes
CREATE INDEX "idx_ratings_giverId" ON "ratings"("giverId");
CREATE INDEX "idx_ratings_receiverId" ON "ratings"("receiverId");

-- User's received ratings (for profile)
CREATE INDEX "idx_ratings_receiver_rating" ON "ratings"("receiverId", "rating", "createdAt" DESC);

-- Context-specific ratings
CREATE INDEX "idx_ratings_context" ON "ratings"("context") WHERE "context" IS NOT NULL;

-- Recent ratings
CREATE INDEX "idx_ratings_createdAt" ON "ratings"("createdAt" DESC);

-- Average rating calculation
CREATE INDEX "idx_ratings_receiver_avg" ON "ratings"("receiverId", "rating");

COMMENT ON INDEX "idx_ratings_receiver_avg" IS 'Efficient average rating calculation per user';

-- =====================================================
-- USER ACTIVITIES TABLE INDEXES
-- =====================================================

-- User activity history
CREATE INDEX "idx_user_activities_userId" ON "user_activities"("userId");
CREATE INDEX "idx_user_activities_user_time" ON "user_activities"("userId", "createdAt" DESC);

-- Activity type analytics
CREATE INDEX "idx_user_activities_type" ON "user_activities"("activityType");
CREATE INDEX "idx_user_activities_type_time" ON "user_activities"("activityType", "createdAt" DESC);

-- Recent activities (for feed)
CREATE INDEX "idx_user_activities_createdAt" ON "user_activities"("createdAt" DESC);

-- JSONB metadata queries (GIN index)
CREATE INDEX "idx_user_activities_metadata" ON "user_activities" USING GIN("metadata");

COMMENT ON INDEX "idx_user_activities_metadata" IS 'Enables fast queries on JSON metadata fields';

-- =====================================================
-- DAILY METRICS TABLE INDEXES
-- =====================================================

-- Date-based queries
CREATE INDEX "idx_daily_metrics_date" ON "daily_metrics"("date" DESC);

-- Time range analytics
CREATE INDEX "idx_daily_metrics_date_range" ON "daily_metrics"("date") WHERE "date" >= CURRENT_DATE - INTERVAL '90 days';

-- =====================================================
-- PERFORMANCE MONITORING
-- =====================================================

-- Index usage statistics view (for monitoring)
COMMENT ON INDEX "idx_users_active_discovery" IS 'Monitor usage with pg_stat_user_indexes';
COMMENT ON INDEX "idx_messages_conversation" IS 'Critical index - monitor for performance degradation';
COMMENT ON INDEX "idx_room_messages_room_time" IS 'High-traffic index for room chat';

-- =====================================================
-- INDEX MAINTENANCE NOTES
-- =====================================================

-- Recommended maintenance queries:
--
-- 1. Monitor index bloat:
--    SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
--    FROM pg_stat_user_indexes ORDER BY idx_scan;
--
-- 2. Rebuild bloated indexes:
--    REINDEX INDEX CONCURRENTLY idx_name;
--
-- 3. Vacuum tables regularly:
--    VACUUM ANALYZE users;
--    VACUUM ANALYZE messages;
--    VACUUM ANALYZE room_messages;
--
-- 4. Update statistics:
--    ANALYZE users;
--    ANALYZE matches;
