-- =====================================================
-- StudyMate Database - Triggers
-- =====================================================
-- This file creates all database triggers for automation
-- Execute AFTER 04_functions.sql
-- =====================================================

-- =====================================================
-- TIMESTAMP TRIGGERS (updatedAt)
-- =====================================================

-- Trigger for users table
CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for matches table
CREATE TRIGGER trigger_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for messages table
CREATE TRIGGER trigger_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for rooms table
CREATE TRIGGER trigger_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for room_messages table
CREATE TRIGGER trigger_room_messages_updated_at
  BEFORE UPDATE ON room_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for daily_metrics table
CREATE TRIGGER trigger_daily_metrics_updated_at
  BEFORE UPDATE ON daily_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TRIGGER trigger_users_updated_at ON users IS 'Auto-updates updatedAt timestamp on user modifications';

-- =====================================================
-- USER ACTIVITY TRIGGERS
-- =====================================================

-- Trigger to update lastActive on user actions
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET "lastActive" = CURRENT_TIMESTAMP
  WHERE id = NEW."userId" OR id = NEW."senderId";

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to matches when sent
CREATE TRIGGER trigger_match_updates_last_active
  AFTER INSERT ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_user_last_active();

-- Apply to messages when sent
CREATE TRIGGER trigger_message_updates_last_active
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_user_last_active();

-- Apply to room joins
CREATE TRIGGER trigger_room_member_updates_last_active
  AFTER INSERT ON room_members
  FOR EACH ROW
  EXECUTE FUNCTION update_user_last_active();

COMMENT ON FUNCTION update_user_last_active() IS 'Updates user lastActive timestamp on platform activity';

-- =====================================================
-- MATCH TRIGGERS
-- =====================================================

-- Trigger to set respondedAt when match status changes
CREATE OR REPLACE FUNCTION set_match_responded_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set respondedAt if status changed from PENDING to something else
  IF OLD.status = 'PENDING' AND NEW.status != 'PENDING' THEN
    NEW."respondedAt" = CURRENT_TIMESTAMP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_match_responded_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION set_match_responded_at();

COMMENT ON FUNCTION set_match_responded_at() IS 'Sets respondedAt timestamp when match status changes from PENDING';

-- Trigger to update user metrics when match status changes
CREATE OR REPLACE FUNCTION update_metrics_on_match_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Update metrics for both sender and receiver
  PERFORM update_user_metrics(NEW."senderId");
  PERFORM update_user_metrics(NEW."receiverId");

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_match_updates_user_metrics
  AFTER INSERT OR UPDATE OF status ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_metrics_on_match_change();

COMMENT ON FUNCTION update_metrics_on_match_change() IS 'Recalculates user metrics when matches change';

-- Trigger to log match activity
CREATE OR REPLACE FUNCTION log_match_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Log match sent activity
  INSERT INTO user_activities (id, "userId", "activityType", metadata, "createdAt")
  VALUES (
    gen_random_uuid()::TEXT,
    NEW."senderId",
    'match_sent',
    jsonb_build_object(
      'matchId', NEW.id,
      'receiverId', NEW."receiverId",
      'status', NEW.status
    ),
    CURRENT_TIMESTAMP
  );

  -- If match is accepted, log for receiver too
  IF NEW.status = 'ACCEPTED' THEN
    INSERT INTO user_activities (id, "userId", "activityType", metadata, "createdAt")
    VALUES (
      gen_random_uuid()::TEXT,
      NEW."receiverId",
      'match_accepted',
      jsonb_build_object(
        'matchId', NEW.id,
        'senderId', NEW."senderId"
      ),
      CURRENT_TIMESTAMP
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_match_log_activity
  AFTER INSERT OR UPDATE OF status ON matches
  FOR EACH ROW
  EXECUTE FUNCTION log_match_activity();

COMMENT ON FUNCTION log_match_activity() IS 'Logs match-related activities for analytics';

-- =====================================================
-- MESSAGE TRIGGERS
-- =====================================================

-- Trigger to validate messages can only be sent between matched users
CREATE OR REPLACE FUNCTION validate_message_match()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT are_users_matched(NEW."senderId", NEW."receiverId") THEN
    RAISE EXCEPTION 'Cannot send message: users are not matched'
      USING HINT = 'Users must have an accepted match to send messages';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_message_match
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION validate_message_match();

COMMENT ON FUNCTION validate_message_match() IS 'Ensures messages can only be sent between matched users';

-- Trigger to set readAt when message is read
CREATE OR REPLACE FUNCTION set_message_read_at()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD."isRead" = FALSE AND NEW."isRead" = TRUE THEN
    NEW."readAt" = CURRENT_TIMESTAMP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_message_read_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  WHEN (OLD."isRead" IS DISTINCT FROM NEW."isRead")
  EXECUTE FUNCTION set_message_read_at();

COMMENT ON FUNCTION set_message_read_at() IS 'Sets readAt timestamp when message isRead changes to true';

-- Trigger to log message activity
CREATE OR REPLACE FUNCTION log_message_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_activities (id, "userId", "activityType", metadata, "createdAt")
  VALUES (
    gen_random_uuid()::TEXT,
    NEW."senderId",
    'message_sent',
    jsonb_build_object(
      'messageId', NEW.id,
      'receiverId', NEW."receiverId",
      'type', NEW.type
    ),
    CURRENT_TIMESTAMP
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_message_log_activity
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION log_message_activity();

COMMENT ON FUNCTION log_message_activity() IS 'Logs message sending activity';

-- =====================================================
-- ROOM TRIGGERS
-- =====================================================

-- Trigger to update room lastActivity on new messages
CREATE OR REPLACE FUNCTION update_room_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE rooms
  SET "lastActivity" = CURRENT_TIMESTAMP
  WHERE id = NEW."roomId";

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_room_message_updates_activity
  AFTER INSERT ON room_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_room_last_activity();

CREATE TRIGGER trigger_room_member_updates_activity
  AFTER INSERT OR UPDATE ON room_members
  FOR EACH ROW
  EXECUTE FUNCTION update_room_last_activity();

COMMENT ON FUNCTION update_room_last_activity() IS 'Updates room lastActivity on messages and member changes';

-- Trigger to validate room capacity before joining
CREATE OR REPLACE FUNCTION validate_room_capacity()
RETURNS TRIGGER AS $$
BEGIN
  IF is_room_full(NEW."roomId") THEN
    RAISE EXCEPTION 'Cannot join room: room is at maximum capacity'
      USING HINT = 'Try a different room or wait for a spot to open';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_room_capacity
  BEFORE INSERT ON room_members
  FOR EACH ROW
  WHEN (NEW."leftAt" IS NULL)
  EXECUTE FUNCTION validate_room_capacity();

COMMENT ON FUNCTION validate_room_capacity() IS 'Prevents joining rooms that are at max capacity';

-- Trigger to validate room subscription limits
CREATE OR REPLACE FUNCTION validate_room_subscription_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_id_val TEXT;
BEGIN
  user_id_val := NEW."userId";

  IF NOT can_join_room(user_id_val) THEN
    RAISE EXCEPTION 'Cannot join room: daily room limit reached for your subscription tier'
      USING HINT = 'Upgrade to Premium for unlimited room access';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_room_limit
  BEFORE INSERT ON room_members
  FOR EACH ROW
  WHEN (NEW."leftAt" IS NULL)
  EXECUTE FUNCTION validate_room_subscription_limit();

COMMENT ON FUNCTION validate_room_subscription_limit() IS 'Enforces room join limits based on subscription tier';

-- Trigger to automatically add room owner as first member
CREATE OR REPLACE FUNCTION add_owner_as_room_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO room_members (id, "roomId", "userId", "joinedAt")
  VALUES (
    gen_random_uuid()::TEXT,
    NEW.id,
    NEW."ownerId",
    CURRENT_TIMESTAMP
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_add_owner_as_member
  AFTER INSERT ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION add_owner_as_room_member();

COMMENT ON FUNCTION add_owner_as_room_member() IS 'Automatically adds room owner as first member';

-- Trigger to log room activity
CREATE OR REPLACE FUNCTION log_room_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_activities (id, "userId", "activityType", metadata, "createdAt")
  VALUES (
    gen_random_uuid()::TEXT,
    NEW."userId",
    CASE
      WHEN NEW."leftAt" IS NULL THEN 'room_joined'
      ELSE 'room_left'
    END,
    jsonb_build_object(
      'roomId', NEW."roomId",
      'joinedAt', NEW."joinedAt",
      'leftAt', NEW."leftAt"
    ),
    CURRENT_TIMESTAMP
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_room_member_log_activity
  AFTER INSERT OR UPDATE OF "leftAt" ON room_members
  FOR EACH ROW
  EXECUTE FUNCTION log_room_activity();

COMMENT ON FUNCTION log_room_activity() IS 'Logs room join and leave activities';

-- =====================================================
-- RATING TRIGGERS
-- =====================================================

-- Trigger to update user average rating when new rating is added
CREATE OR REPLACE FUNCTION update_rating_on_new_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate and update receiver's average rating
  UPDATE users
  SET "averageRating" = calculate_user_average_rating(NEW."receiverId")
  WHERE id = NEW."receiverId";

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_rating_updates_user_avg
  AFTER INSERT OR UPDATE OF rating ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_rating_on_new_rating();

COMMENT ON FUNCTION update_rating_on_new_rating() IS 'Updates user average rating when they receive new rating';

-- Trigger to log rating activity
CREATE OR REPLACE FUNCTION log_rating_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_activities (id, "userId", "activityType", metadata, "createdAt")
  VALUES (
    gen_random_uuid()::TEXT,
    NEW."giverId",
    'rating_given',
    jsonb_build_object(
      'ratingId', NEW.id,
      'receiverId', NEW."receiverId",
      'rating', NEW.rating,
      'context', NEW.context
    ),
    CURRENT_TIMESTAMP
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_rating_log_activity
  AFTER INSERT ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION log_rating_activity();

COMMENT ON FUNCTION log_rating_activity() IS 'Logs rating submission activity';

-- =====================================================
-- ACHIEVEMENT TRIGGERS
-- =====================================================

-- Trigger to check achievements when user badges are earned
CREATE OR REPLACE FUNCTION check_badge_achievements()
RETURNS TRIGGER AS $$
BEGIN
  -- Example: Award achievement for earning 5 badges
  DECLARE
    badge_count INTEGER;
  BEGIN
    SELECT COUNT(*)
    INTO badge_count
    FROM user_badges
    WHERE "userId" = NEW."userId";

    -- Update achievement progress (if such achievement exists)
    -- This is a simplified example - real implementation would be more sophisticated
    IF badge_count >= 5 THEN
      INSERT INTO user_activities (id, "userId", "activityType", metadata, "createdAt")
      VALUES (
        gen_random_uuid()::TEXT,
        NEW."userId",
        'badge_earned',
        jsonb_build_object(
          'badgeId', NEW."badgeId",
          'totalBadges', badge_count
        ),
        CURRENT_TIMESTAMP
      );
    END IF;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_badge_achievements
  AFTER INSERT ON user_badges
  FOR EACH ROW
  EXECUTE FUNCTION check_badge_achievements();

COMMENT ON FUNCTION check_badge_achievements() IS 'Checks and awards achievements related to badge collection';

-- =====================================================
-- DATA INTEGRITY TRIGGERS
-- =====================================================

-- Trigger to prevent deleting room owner while room has members
CREATE OR REPLACE FUNCTION prevent_delete_room_owner()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM rooms
    WHERE "ownerId" = OLD.id
  ) THEN
    RAISE EXCEPTION 'Cannot delete user: user owns active rooms'
      USING HINT = 'Transfer room ownership or delete rooms first';
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_prevent_delete_room_owner
  BEFORE DELETE ON users
  FOR EACH ROW
  EXECUTE FUNCTION prevent_delete_room_owner();

COMMENT ON FUNCTION prevent_delete_room_owner() IS 'Prevents deletion of users who own active rooms';

-- Trigger to set editedAt when room message is edited
CREATE OR REPLACE FUNCTION set_message_edited_at()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.content != NEW.content THEN
    NEW."isEdited" = TRUE;
    NEW."editedAt" = CURRENT_TIMESTAMP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_room_message_edited_at
  BEFORE UPDATE ON room_messages
  FOR EACH ROW
  WHEN (OLD.content IS DISTINCT FROM NEW.content)
  EXECUTE FUNCTION set_message_edited_at();

COMMENT ON FUNCTION set_message_edited_at() IS 'Sets isEdited and editedAt when message content changes';

-- =====================================================
-- SUBSCRIPTION TRIGGERS
-- =====================================================

-- Trigger to validate subscription tier downgrades don't happen immediately
CREATE OR REPLACE FUNCTION validate_subscription_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If downgrading from PREMIUM/ELITE to BASIC, ensure expiry is set
  IF OLD."subscriptionTier" IN ('PREMIUM', 'ELITE')
     AND NEW."subscriptionTier" = 'BASIC'
     AND NEW."subscriptionExpiry" IS NOT NULL
     AND NEW."subscriptionExpiry" > CURRENT_TIMESTAMP THEN
    RAISE EXCEPTION 'Cannot downgrade: subscription has not expired yet'
      USING HINT = 'Wait until subscription expires or cancel subscription expiry first';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_subscription_change
  BEFORE UPDATE OF "subscriptionTier" ON users
  FOR EACH ROW
  WHEN (OLD."subscriptionTier" IS DISTINCT FROM NEW."subscriptionTier")
  EXECUTE FUNCTION validate_subscription_change();

COMMENT ON FUNCTION validate_subscription_change() IS 'Validates subscription tier changes follow business rules';

-- =====================================================
-- CLEANUP TRIGGERS
-- =====================================================

-- Trigger to cleanup user data on account deletion
CREATE OR REPLACE FUNCTION cleanup_user_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the deletion
  INSERT INTO user_activities (id, "userId", "activityType", metadata, "createdAt")
  VALUES (
    gen_random_uuid()::TEXT,
    OLD.id,
    'account_deleted',
    jsonb_build_object(
      'email', OLD.email,
      'deletedAt', CURRENT_TIMESTAMP
    ),
    CURRENT_TIMESTAMP
  );

  -- Note: Related data will be cascade deleted by foreign key constraints
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cleanup_user_data
  BEFORE DELETE ON users
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_user_data();

COMMENT ON FUNCTION cleanup_user_data() IS 'Logs user deletion before cascade delete occurs';
