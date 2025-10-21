-- =====================================================
-- StudyMate Database - Tables
-- =====================================================
-- This file creates all database tables
-- Execute AFTER 01_enums.sql
-- =====================================================

-- =====================================================
-- CORE USER TABLE
-- =====================================================

CREATE TABLE "users" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT UNIQUE NOT NULL,
  "emailVerified" TIMESTAMP,
  "username" TEXT UNIQUE,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "avatar" TEXT,
  "bio" TEXT,
  "university" TEXT NOT NULL,
  "major" TEXT NOT NULL,
  "year" INTEGER NOT NULL,
  "gpa" DOUBLE PRECISION,
  "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
  "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'BASIC',
  "subscriptionExpiry" TIMESTAMP,

  -- Academic Profile (Array fields)
  "interests" TEXT[] NOT NULL DEFAULT '{}',
  "skills" TEXT[] NOT NULL DEFAULT '{}',
  "studyGoals" TEXT[] NOT NULL DEFAULT '{}',
  "preferredStudyTime" TEXT[] NOT NULL DEFAULT '{}',
  "languages" TEXT[] NOT NULL DEFAULT '{}',

  -- Settings
  "isProfilePublic" BOOLEAN NOT NULL DEFAULT TRUE,
  "allowMessages" BOOLEAN NOT NULL DEFAULT TRUE,
  "allowCalls" BOOLEAN NOT NULL DEFAULT TRUE,

  -- Metrics for AI matching
  "responseRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  "totalMatches" INTEGER NOT NULL DEFAULT 0,
  "successfulMatches" INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastActive" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT "users_email_check" CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT "users_year_check" CHECK (year >= 1 AND year <= 7),
  CONSTRAINT "users_gpa_check" CHECK (gpa IS NULL OR (gpa >= 0.0 AND gpa <= 4.0)),
  CONSTRAINT "users_responseRate_check" CHECK (responseRate >= 0.0 AND responseRate <= 100.0),
  CONSTRAINT "users_averageRating_check" CHECK (averageRating >= 0.0 AND averageRating <= 5.0)
);

COMMENT ON TABLE "users" IS 'Core user table storing student profiles and academic information';
COMMENT ON COLUMN "users"."interests" IS 'Array of academic interests for AI matching';
COMMENT ON COLUMN "users"."skills" IS 'Array of skills/competencies for matching complementary study partners';
COMMENT ON COLUMN "users"."preferredStudyTime" IS 'Preferred study time slots (morning, afternoon, evening, night)';
COMMENT ON COLUMN "users"."responseRate" IS 'Percentage of messages/matches responded to (0-100)';

-- =====================================================
-- MATCHING SYSTEM
-- =====================================================

CREATE TABLE "matches" (
  "id" TEXT PRIMARY KEY,
  "senderId" TEXT NOT NULL,
  "receiverId" TEXT NOT NULL,
  "status" "MatchStatus" NOT NULL DEFAULT 'PENDING',
  "message" TEXT,

  -- Timestamps
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "respondedAt" TIMESTAMP,

  -- Foreign Keys
  CONSTRAINT "matches_senderId_fkey" FOREIGN KEY ("senderId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "matches_receiverId_fkey" FOREIGN KEY ("receiverId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,

  -- Constraints
  CONSTRAINT "matches_senderId_receiverId_key" UNIQUE ("senderId", "receiverId"),
  CONSTRAINT "matches_no_self_match" CHECK ("senderId" != "receiverId")
);

COMMENT ON TABLE "matches" IS 'Tracks match requests and connections between students';
COMMENT ON COLUMN "matches"."message" IS 'Optional introductory message sent with match request';

-- =====================================================
-- MESSAGING SYSTEM
-- =====================================================

CREATE TABLE "messages" (
  "id" TEXT PRIMARY KEY,
  "senderId" TEXT NOT NULL,
  "receiverId" TEXT NOT NULL,
  "type" "MessageType" NOT NULL DEFAULT 'TEXT',
  "content" TEXT NOT NULL,
  "fileUrl" TEXT,
  "fileName" TEXT,
  "fileSize" INTEGER,
  "isRead" BOOLEAN NOT NULL DEFAULT FALSE,

  -- Timestamps
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "readAt" TIMESTAMP,

  -- Foreign Keys
  CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "messages_receiverId_fkey" FOREIGN KEY ("receiverId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,

  -- Constraints
  CONSTRAINT "messages_fileSize_check" CHECK ("fileSize" IS NULL OR "fileSize" > 0)
);

COMMENT ON TABLE "messages" IS 'Private 1-to-1 messages between matched students';
COMMENT ON COLUMN "messages"."fileUrl" IS 'Supabase storage URL for file attachments';

-- =====================================================
-- ROOM SYSTEM (Voice/Video Chat)
-- =====================================================

CREATE TABLE "rooms" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "type" "RoomType" NOT NULL DEFAULT 'STUDY_GROUP',
  "topic" TEXT,
  "maxMembers" INTEGER NOT NULL DEFAULT 10,
  "isPrivate" BOOLEAN NOT NULL DEFAULT FALSE,
  "password" TEXT,
  "ownerId" TEXT NOT NULL,

  -- Room settings
  "allowVideo" BOOLEAN NOT NULL DEFAULT TRUE,
  "allowVoice" BOOLEAN NOT NULL DEFAULT TRUE,
  "allowText" BOOLEAN NOT NULL DEFAULT TRUE,
  "allowScreenShare" BOOLEAN NOT NULL DEFAULT FALSE,

  -- Timestamps
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastActivity" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Foreign Keys
  CONSTRAINT "rooms_ownerId_fkey" FOREIGN KEY ("ownerId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,

  -- Constraints
  CONSTRAINT "rooms_maxMembers_check" CHECK ("maxMembers" >= 2 AND "maxMembers" <= 50),
  CONSTRAINT "rooms_password_private_check" CHECK (
    ("isPrivate" = FALSE AND "password" IS NULL) OR
    ("isPrivate" = TRUE)
  )
);

COMMENT ON TABLE "rooms" IS 'Voice/video chat rooms for collaborative studying';
COMMENT ON COLUMN "rooms"."allowScreenShare" IS 'Premium feature for screen sharing';
COMMENT ON COLUMN "rooms"."lastActivity" IS 'Last message or member activity timestamp';

-- =====================================================
-- ROOM MEMBERSHIP
-- =====================================================

CREATE TABLE "room_members" (
  "id" TEXT PRIMARY KEY,
  "roomId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "joinedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "leftAt" TIMESTAMP,
  "isMuted" BOOLEAN NOT NULL DEFAULT FALSE,
  "isBanned" BOOLEAN NOT NULL DEFAULT FALSE,

  -- Foreign Keys
  CONSTRAINT "room_members_roomId_fkey" FOREIGN KEY ("roomId")
    REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "room_members_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,

  -- Constraints
  CONSTRAINT "room_members_roomId_userId_key" UNIQUE ("roomId", "userId")
);

COMMENT ON TABLE "room_members" IS 'Tracks user membership and participation in rooms';
COMMENT ON COLUMN "room_members"."leftAt" IS 'Timestamp when user left (NULL if still in room)';

-- =====================================================
-- ROOM MESSAGES
-- =====================================================

CREATE TABLE "room_messages" (
  "id" TEXT PRIMARY KEY,
  "roomId" TEXT NOT NULL,
  "senderId" TEXT NOT NULL,
  "type" "MessageType" NOT NULL DEFAULT 'TEXT',
  "content" TEXT NOT NULL,
  "fileUrl" TEXT,
  "fileName" TEXT,
  "fileSize" INTEGER,
  "replyToId" TEXT,
  "isEdited" BOOLEAN NOT NULL DEFAULT FALSE,
  "editedAt" TIMESTAMP,

  -- Timestamps
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Foreign Keys
  CONSTRAINT "room_messages_roomId_fkey" FOREIGN KEY ("roomId")
    REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "room_messages_senderId_fkey" FOREIGN KEY ("senderId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "room_messages_replyToId_fkey" FOREIGN KEY ("replyToId")
    REFERENCES "room_messages"("id") ON DELETE SET NULL ON UPDATE CASCADE,

  -- Constraints
  CONSTRAINT "room_messages_fileSize_check" CHECK ("fileSize" IS NULL OR "fileSize" > 0),
  CONSTRAINT "room_messages_no_self_reply" CHECK ("id" != "replyToId")
);

COMMENT ON TABLE "room_messages" IS 'Group chat messages within study rooms';
COMMENT ON COLUMN "room_messages"."replyToId" IS 'Reference to parent message for threaded replies';

-- =====================================================
-- ACHIEVEMENT SYSTEM - BADGES
-- =====================================================

CREATE TABLE "badges" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT UNIQUE NOT NULL,
  "description" TEXT NOT NULL,
  "type" "BadgeType" NOT NULL,
  "icon" TEXT NOT NULL,
  "requirement" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,

  -- Timestamps
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE "badges" IS 'Predefined badges that users can earn';
COMMENT ON COLUMN "badges"."requirement" IS 'Human-readable description of earning criteria';

-- =====================================================
-- USER BADGES
-- =====================================================

CREATE TABLE "user_badges" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "badgeId" TEXT NOT NULL,
  "earnedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Foreign Keys
  CONSTRAINT "user_badges_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "user_badges_badgeId_fkey" FOREIGN KEY ("badgeId")
    REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE,

  -- Constraints
  CONSTRAINT "user_badges_userId_badgeId_key" UNIQUE ("userId", "badgeId")
);

COMMENT ON TABLE "user_badges" IS 'Tracks which badges each user has earned';

-- =====================================================
-- ACHIEVEMENTS
-- =====================================================

CREATE TABLE "achievements" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT UNIQUE NOT NULL,
  "description" TEXT NOT NULL,
  "category" "AchievementCategory" NOT NULL,
  "points" INTEGER NOT NULL DEFAULT 0,
  "requirement" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,

  -- Timestamps
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT "achievements_points_check" CHECK ("points" >= 0)
);

COMMENT ON TABLE "achievements" IS 'Predefined achievements users can unlock';
COMMENT ON COLUMN "achievements"."requirement" IS 'JSON string describing achievement criteria';

-- =====================================================
-- USER ACHIEVEMENTS
-- =====================================================

CREATE TABLE "user_achievements" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "achievementId" TEXT NOT NULL,
  "progress" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  "completedAt" TIMESTAMP,

  -- Foreign Keys
  CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "user_achievements_achievementId_fkey" FOREIGN KEY ("achievementId")
    REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE,

  -- Constraints
  CONSTRAINT "user_achievements_userId_achievementId_key" UNIQUE ("userId", "achievementId"),
  CONSTRAINT "user_achievements_progress_check" CHECK ("progress" >= 0.0 AND "progress" <= 1.0)
);

COMMENT ON TABLE "user_achievements" IS 'Tracks user progress towards achievements';
COMMENT ON COLUMN "user_achievements"."progress" IS 'Completion percentage from 0.0 to 1.0';

-- =====================================================
-- RATING SYSTEM
-- =====================================================

CREATE TABLE "ratings" (
  "id" TEXT PRIMARY KEY,
  "giverId" TEXT NOT NULL,
  "receiverId" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "comment" TEXT,
  "context" TEXT,

  -- Timestamps
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Foreign Keys
  CONSTRAINT "ratings_giverId_fkey" FOREIGN KEY ("giverId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ratings_receiverId_fkey" FOREIGN KEY ("receiverId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,

  -- Constraints
  CONSTRAINT "ratings_giverId_receiverId_context_key" UNIQUE ("giverId", "receiverId", "context"),
  CONSTRAINT "ratings_rating_check" CHECK ("rating" >= 1 AND "rating" <= 5),
  CONSTRAINT "ratings_no_self_rating" CHECK ("giverId" != "receiverId")
);

COMMENT ON TABLE "ratings" IS 'User ratings and reviews for study interactions';
COMMENT ON COLUMN "ratings"."context" IS 'Context of rating: study_session, room_interaction, etc.';

-- =====================================================
-- ANALYTICS - USER ACTIVITY
-- =====================================================

CREATE TABLE "user_activities" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "activityType" TEXT NOT NULL,
  "metadata" JSONB,

  -- Timestamps
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE "user_activities" IS 'Logs user activities for analytics and behavior tracking';
COMMENT ON COLUMN "user_activities"."activityType" IS 'Type: login, match_sent, message_sent, room_joined, etc.';
COMMENT ON COLUMN "user_activities"."metadata" IS 'Additional context data stored as JSON';

-- =====================================================
-- ANALYTICS - DAILY METRICS
-- =====================================================

CREATE TABLE "daily_metrics" (
  "id" TEXT PRIMARY KEY,
  "date" DATE UNIQUE NOT NULL,
  "totalUsers" INTEGER NOT NULL DEFAULT 0,
  "activeUsers" INTEGER NOT NULL DEFAULT 0,
  "newUsers" INTEGER NOT NULL DEFAULT 0,
  "totalMatches" INTEGER NOT NULL DEFAULT 0,
  "successfulMatches" INTEGER NOT NULL DEFAULT 0,
  "totalMessages" INTEGER NOT NULL DEFAULT 0,
  "totalRooms" INTEGER NOT NULL DEFAULT 0,
  "activeRooms" INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT "daily_metrics_totals_check" CHECK (
    "totalUsers" >= 0 AND
    "activeUsers" >= 0 AND
    "newUsers" >= 0 AND
    "totalMatches" >= 0 AND
    "successfulMatches" >= 0 AND
    "totalMessages" >= 0 AND
    "totalRooms" >= 0 AND
    "activeRooms" >= 0
  )
);

COMMENT ON TABLE "daily_metrics" IS 'Aggregated daily metrics for platform analytics and reporting';
