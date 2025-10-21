-- =====================================================
-- StudyMate Database - Functions & Stored Procedures
-- =====================================================
-- This file contains reusable database functions
-- Execute AFTER 03_indexes.sql
-- =====================================================

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to update the updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically updates updatedAt timestamp on row modification';

-- =====================================================
-- USER FUNCTIONS
-- =====================================================

-- Function to calculate user's average rating
CREATE OR REPLACE FUNCTION calculate_user_average_rating(user_id TEXT)
RETURNS DOUBLE PRECISION AS $$
DECLARE
  avg_rating DOUBLE PRECISION;
BEGIN
  SELECT COALESCE(AVG(rating), 0.0)
  INTO avg_rating
  FROM ratings
  WHERE "receiverId" = user_id;

  RETURN ROUND(avg_rating::numeric, 2)::DOUBLE PRECISION;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_user_average_rating(TEXT) IS 'Calculates average rating for a user based on all received ratings';

-- Function to update user metrics
CREATE OR REPLACE FUNCTION update_user_metrics(user_id TEXT)
RETURNS VOID AS $$
DECLARE
  total_sent INTEGER;
  total_received INTEGER;
  total_accepted INTEGER;
  avg_rating DOUBLE PRECISION;
BEGIN
  -- Calculate total matches sent
  SELECT COUNT(*) INTO total_sent
  FROM matches
  WHERE "senderId" = user_id;

  -- Calculate total matches received
  SELECT COUNT(*) INTO total_received
  FROM matches
  WHERE "receiverId" = user_id;

  -- Calculate accepted matches (both sent and received)
  SELECT COUNT(*) INTO total_accepted
  FROM matches
  WHERE ("senderId" = user_id OR "receiverId" = user_id)
    AND status = 'ACCEPTED';

  -- Get average rating
  avg_rating := calculate_user_average_rating(user_id);

  -- Update user metrics
  UPDATE users
  SET
    "totalMatches" = total_sent + total_received,
    "successfulMatches" = total_accepted,
    "averageRating" = avg_rating,
    "updatedAt" = CURRENT_TIMESTAMP
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_user_metrics(TEXT) IS 'Recalculates and updates all metrics for a specific user';

-- Function to check if user can send more matches (subscription limits)
CREATE OR REPLACE FUNCTION can_send_match(user_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_tier "SubscriptionTier";
  today_matches INTEGER;
  max_matches INTEGER;
BEGIN
  -- Get user's subscription tier
  SELECT "subscriptionTier" INTO user_tier
  FROM users
  WHERE id = user_id;

  -- Check subscription expiry for PREMIUM/ELITE
  IF user_tier IN ('PREMIUM', 'ELITE') THEN
    -- Check if subscription is still valid
    IF EXISTS (
      SELECT 1 FROM users
      WHERE id = user_id
        AND "subscriptionExpiry" IS NOT NULL
        AND "subscriptionExpiry" < CURRENT_TIMESTAMP
    ) THEN
      user_tier := 'BASIC'; -- Downgrade if expired
    END IF;
  END IF;

  -- Set daily match limit based on tier
  IF user_tier = 'BASIC' THEN
    max_matches := 5;
  ELSE
    RETURN TRUE; -- PREMIUM and ELITE have unlimited matches
  END IF;

  -- Count matches sent today
  SELECT COUNT(*) INTO today_matches
  FROM matches
  WHERE "senderId" = user_id
    AND DATE("createdAt") = CURRENT_DATE;

  RETURN today_matches < max_matches;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION can_send_match(TEXT) IS 'Checks if user has remaining daily match quota based on subscription tier';

-- Function to get user's active subscription tier (considering expiry)
CREATE OR REPLACE FUNCTION get_active_subscription_tier(user_id TEXT)
RETURNS "SubscriptionTier" AS $$
DECLARE
  user_tier "SubscriptionTier";
  expiry_date TIMESTAMP;
BEGIN
  SELECT "subscriptionTier", "subscriptionExpiry"
  INTO user_tier, expiry_date
  FROM users
  WHERE id = user_id;

  -- If subscription has expired, return BASIC
  IF user_tier IN ('PREMIUM', 'ELITE') AND expiry_date IS NOT NULL AND expiry_date < CURRENT_TIMESTAMP THEN
    RETURN 'BASIC'::SubscriptionTier;
  END IF;

  RETURN user_tier;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_active_subscription_tier(TEXT) IS 'Returns user tier accounting for subscription expiration';

-- =====================================================
-- MATCHING FUNCTIONS
-- =====================================================

-- Function to check if two users are matched
CREATE OR REPLACE FUNCTION are_users_matched(user1_id TEXT, user2_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM matches
    WHERE (
      ("senderId" = user1_id AND "receiverId" = user2_id) OR
      ("senderId" = user2_id AND "receiverId" = user1_id)
    )
    AND status = 'ACCEPTED'
  );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION are_users_matched(TEXT, TEXT) IS 'Checks if two users have an accepted match';

-- Function to get mutual matches count
CREATE OR REPLACE FUNCTION get_mutual_matches_count(user1_id TEXT, user2_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  mutual_count INTEGER;
BEGIN
  -- Find users who are matched with both user1 and user2
  SELECT COUNT(DISTINCT m1."receiverId")
  INTO mutual_count
  FROM matches m1
  INNER JOIN matches m2 ON m1."receiverId" = m2."receiverId"
  WHERE m1."senderId" = user1_id
    AND m2."senderId" = user2_id
    AND m1.status = 'ACCEPTED'
    AND m2.status = 'ACCEPTED';

  RETURN mutual_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_mutual_matches_count(TEXT, TEXT) IS 'Counts mutual connections between two users';

-- =====================================================
-- ROOM FUNCTIONS
-- =====================================================

-- Function to check if user can join more rooms (subscription limits)
CREATE OR REPLACE FUNCTION can_join_room(user_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_tier "SubscriptionTier";
  today_joins INTEGER;
  max_joins INTEGER;
BEGIN
  user_tier := get_active_subscription_tier(user_id);

  -- Set daily room join limit based on tier
  IF user_tier = 'BASIC' THEN
    max_joins := 5;
  ELSE
    RETURN TRUE; -- PREMIUM and ELITE have unlimited room access
  END IF;

  -- Count rooms joined today
  SELECT COUNT(*) INTO today_joins
  FROM room_members
  WHERE "userId" = user_id
    AND DATE("joinedAt") = CURRENT_DATE;

  RETURN today_joins < max_joins;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION can_join_room(TEXT) IS 'Checks if user can join more rooms today based on subscription tier';

-- Function to get active room member count
CREATE OR REPLACE FUNCTION get_active_room_member_count(room_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  member_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO member_count
  FROM room_members
  WHERE "roomId" = room_id
    AND "leftAt" IS NULL
    AND "isBanned" = FALSE;

  RETURN member_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_active_room_member_count(TEXT) IS 'Returns count of active members in a room';

-- Function to check if room is full
CREATE OR REPLACE FUNCTION is_room_full(room_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  current_members INTEGER;
  max_allowed INTEGER;
BEGIN
  SELECT "maxMembers" INTO max_allowed
  FROM rooms
  WHERE id = room_id;

  current_members := get_active_room_member_count(room_id);

  RETURN current_members >= max_allowed;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION is_room_full(TEXT) IS 'Checks if room has reached maximum capacity';

-- Function to check if user is room member
CREATE OR REPLACE FUNCTION is_user_in_room(user_id TEXT, room_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM room_members
    WHERE "userId" = user_id
      AND "roomId" = room_id
      AND "leftAt" IS NULL
      AND "isBanned" = FALSE
  );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION is_user_in_room(TEXT, TEXT) IS 'Checks if user is an active member of specified room';

-- =====================================================
-- MESSAGING FUNCTIONS
-- =====================================================

-- Function to get unread message count
CREATE OR REPLACE FUNCTION get_unread_message_count(user_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO unread_count
  FROM messages
  WHERE "receiverId" = user_id
    AND "isRead" = FALSE;

  RETURN unread_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_unread_message_count(TEXT) IS 'Returns total unread messages for a user';

-- Function to get unread messages from specific sender
CREATE OR REPLACE FUNCTION get_unread_from_sender_count(receiver_id TEXT, sender_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO unread_count
  FROM messages
  WHERE "receiverId" = receiver_id
    AND "senderId" = sender_id
    AND "isRead" = FALSE;

  RETURN unread_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_unread_from_sender_count(TEXT, TEXT) IS 'Returns unread message count from specific sender';

-- Function to mark conversation as read
CREATE OR REPLACE FUNCTION mark_conversation_read(receiver_id TEXT, sender_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE messages
  SET
    "isRead" = TRUE,
    "readAt" = CURRENT_TIMESTAMP
  WHERE "receiverId" = receiver_id
    AND "senderId" = sender_id
    AND "isRead" = FALSE;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION mark_conversation_read(TEXT, TEXT) IS 'Marks all messages from sender to receiver as read';

-- =====================================================
-- ANALYTICS FUNCTIONS
-- =====================================================

-- Function to update daily metrics
CREATE OR REPLACE FUNCTION update_daily_metrics(metric_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
DECLARE
  total_users_count INTEGER;
  active_users_count INTEGER;
  new_users_count INTEGER;
  total_matches_count INTEGER;
  successful_matches_count INTEGER;
  total_messages_count INTEGER;
  total_rooms_count INTEGER;
  active_rooms_count INTEGER;
BEGIN
  -- Total users
  SELECT COUNT(*) INTO total_users_count
  FROM users;

  -- Active users (logged in within last 7 days)
  SELECT COUNT(*) INTO active_users_count
  FROM users
  WHERE "lastActive" >= CURRENT_DATE - INTERVAL '7 days';

  -- New users registered on metric_date
  SELECT COUNT(*) INTO new_users_count
  FROM users
  WHERE DATE("createdAt") = metric_date;

  -- Total matches
  SELECT COUNT(*) INTO total_matches_count
  FROM matches
  WHERE DATE("createdAt") = metric_date;

  -- Successful matches (accepted)
  SELECT COUNT(*) INTO successful_matches_count
  FROM matches
  WHERE DATE("createdAt") = metric_date
    AND status = 'ACCEPTED';

  -- Total messages
  SELECT COUNT(*) INTO total_messages_count
  FROM messages
  WHERE DATE("createdAt") = metric_date;

  -- Total rooms created
  SELECT COUNT(*) INTO total_rooms_count
  FROM rooms
  WHERE DATE("createdAt") = metric_date;

  -- Active rooms (with activity on metric_date)
  SELECT COUNT(*) INTO active_rooms_count
  FROM rooms
  WHERE DATE("lastActivity") = metric_date;

  -- Insert or update daily metrics
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
    "activeRooms"
  )
  VALUES (
    gen_random_uuid()::TEXT,
    metric_date,
    total_users_count,
    active_users_count,
    new_users_count,
    total_matches_count,
    successful_matches_count,
    total_messages_count,
    total_rooms_count,
    active_rooms_count
  )
  ON CONFLICT (date) DO UPDATE SET
    "totalUsers" = EXCLUDED."totalUsers",
    "activeUsers" = EXCLUDED."activeUsers",
    "newUsers" = EXCLUDED."newUsers",
    "totalMatches" = EXCLUDED."totalMatches",
    "successfulMatches" = EXCLUDED."successfulMatches",
    "totalMessages" = EXCLUDED."totalMessages",
    "totalRooms" = EXCLUDED."totalRooms",
    "activeRooms" = EXCLUDED."activeRooms",
    "updatedAt" = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_daily_metrics(DATE) IS 'Calculates and updates daily platform metrics';

-- =====================================================
-- ACHIEVEMENT FUNCTIONS
-- =====================================================

-- Function to check and award achievement
CREATE OR REPLACE FUNCTION check_and_award_achievement(user_id TEXT, achievement_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  awarded BOOLEAN := FALSE;
BEGIN
  -- Check if achievement already awarded
  IF NOT EXISTS (
    SELECT 1 FROM user_achievements
    WHERE "userId" = user_id
      AND "achievementId" = achievement_id
      AND "completedAt" IS NOT NULL
  ) THEN
    -- Update or insert user achievement
    INSERT INTO user_achievements (
      id,
      "userId",
      "achievementId",
      progress,
      "completedAt"
    )
    VALUES (
      gen_random_uuid()::TEXT,
      user_id,
      achievement_id,
      1.0,
      CURRENT_TIMESTAMP
    )
    ON CONFLICT ("userId", "achievementId") DO UPDATE SET
      progress = 1.0,
      "completedAt" = CURRENT_TIMESTAMP;

    awarded := TRUE;
  END IF;

  RETURN awarded;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_and_award_achievement(TEXT, TEXT) IS 'Awards achievement to user if not already earned';

-- Function to update achievement progress
CREATE OR REPLACE FUNCTION update_achievement_progress(
  user_id TEXT,
  achievement_id TEXT,
  new_progress DOUBLE PRECISION
)
RETURNS VOID AS $$
BEGIN
  -- Insert or update progress
  INSERT INTO user_achievements (
    id,
    "userId",
    "achievementId",
    progress,
    "completedAt"
  )
  VALUES (
    gen_random_uuid()::TEXT,
    user_id,
    achievement_id,
    LEAST(new_progress, 1.0),
    CASE WHEN new_progress >= 1.0 THEN CURRENT_TIMESTAMP ELSE NULL END
  )
  ON CONFLICT ("userId", "achievementId") DO UPDATE SET
    progress = LEAST(new_progress, 1.0),
    "completedAt" = CASE
      WHEN new_progress >= 1.0 AND user_achievements."completedAt" IS NULL
      THEN CURRENT_TIMESTAMP
      ELSE user_achievements."completedAt"
    END;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_achievement_progress(TEXT, TEXT, DOUBLE PRECISION) IS 'Updates user progress towards an achievement';

-- =====================================================
-- SEARCH FUNCTIONS
-- =====================================================

-- Function to search users by interests
CREATE OR REPLACE FUNCTION search_users_by_interests(search_interests TEXT[])
RETURNS TABLE (
  user_id TEXT,
  match_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    id AS user_id,
    (
      SELECT COUNT(*)
      FROM unnest(interests) AS interest
      WHERE interest = ANY(search_interests)
    )::INTEGER AS match_count
  FROM users
  WHERE interests && search_interests
    AND status = 'ACTIVE'
    AND "isProfilePublic" = TRUE
  ORDER BY match_count DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION search_users_by_interests(TEXT[]) IS 'Searches users by matching interests, ordered by relevance';

-- =====================================================
-- CLEANUP FUNCTIONS
-- =====================================================

-- Function to cleanup old activities (data retention)
CREATE OR REPLACE FUNCTION cleanup_old_activities(retention_days INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM user_activities
  WHERE "createdAt" < CURRENT_DATE - (retention_days || ' days')::INTERVAL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_activities(INTEGER) IS 'Deletes user activities older than specified days (default 90)';

-- Function to cleanup expired subscriptions
CREATE OR REPLACE FUNCTION cleanup_expired_subscriptions()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE users
  SET
    "subscriptionTier" = 'BASIC',
    "subscriptionExpiry" = NULL,
    "updatedAt" = CURRENT_TIMESTAMP
  WHERE "subscriptionTier" IN ('PREMIUM', 'ELITE')
    AND "subscriptionExpiry" IS NOT NULL
    AND "subscriptionExpiry" < CURRENT_TIMESTAMP;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_subscriptions() IS 'Downgrades users with expired premium subscriptions to BASIC tier';
