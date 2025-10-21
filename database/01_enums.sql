-- =====================================================
-- StudyMate Database - Enums
-- =====================================================
-- This file contains all PostgreSQL enum types used in the database
-- Execute this file FIRST before creating tables
-- =====================================================

-- User Status Enum
-- Represents the current status of a user account
CREATE TYPE "UserStatus" AS ENUM (
  'ACTIVE',      -- User account is active and can use all features
  'INACTIVE',    -- User account is inactive (e.g., temporarily deactivated)
  'SUSPENDED'    -- User account has been suspended by admin
);

-- Subscription Tier Enum
-- Defines the subscription levels available to users
CREATE TYPE "SubscriptionTier" AS ENUM (
  'BASIC',       -- Free tier: 5 matches/day, 5 rooms/day
  'PREMIUM',     -- 79,000 VND/month: Unlimited matches, advanced filters
  'ELITE'        -- 149,000 VND/month: AI Tutor, exclusive events, career mentoring
);

-- Match Status Enum
-- Tracks the state of a match between two users
CREATE TYPE "MatchStatus" AS ENUM (
  'PENDING',     -- Match request sent, awaiting response
  'ACCEPTED',    -- Match request accepted, both users can communicate
  'REJECTED',    -- Match request declined
  'BLOCKED'      -- User has blocked the other user
);

-- Message Type Enum
-- Defines the type of content in a message
CREATE TYPE "MessageType" AS ENUM (
  'TEXT',        -- Plain text message
  'FILE',        -- File attachment (PDF, images, etc.)
  'VOICE',       -- Voice message/recording
  'VIDEO'        -- Video message/recording
);

-- Room Type Enum
-- Categorizes different types of study rooms
CREATE TYPE "RoomType" AS ENUM (
  'STUDY_GROUP',  -- Focused study session with specific topic
  'DISCUSSION',   -- Open discussion about academic topics
  'HELP_SESSION', -- Q&A or tutoring session
  'CASUAL'        -- Casual hangout/break room
);

-- Badge Type Enum
-- Categories of badges users can earn
CREATE TYPE "BadgeType" AS ENUM (
  'NETWORK_PRO',       -- Earned by making many successful connections
  'CHAT_MASTER',       -- Earned by high messaging activity
  'STUDY_INFLUENCER',  -- Earned by creating popular study rooms
  'MENTOR',            -- Earned by helping other students
  'EARLY_ADOPTER'      -- Earned by early platform users
);

-- Achievement Category Enum
-- Categorizes achievements by type
CREATE TYPE "AchievementCategory" AS ENUM (
  'SOCIAL',      -- Social achievements (connections, messages)
  'ACADEMIC',    -- Academic achievements (study hours, topics mastered)
  'ENGAGEMENT',  -- Platform engagement achievements (daily logins, etc.)
  'LEADERSHIP'   -- Leadership achievements (room creation, mentoring)
);

-- =====================================================
-- Comments explaining enum usage
-- =====================================================

COMMENT ON TYPE "UserStatus" IS 'Tracks user account status for access control and moderation';
COMMENT ON TYPE "SubscriptionTier" IS 'Defines subscription levels with different feature access';
COMMENT ON TYPE "MatchStatus" IS 'Manages the lifecycle of student matching relationships';
COMMENT ON TYPE "MessageType" IS 'Categorizes message content types for proper rendering';
COMMENT ON TYPE "RoomType" IS 'Classifies study rooms by their purpose and focus';
COMMENT ON TYPE "BadgeType" IS 'Defines achievement badge categories for gamification';
COMMENT ON TYPE "AchievementCategory" IS 'Groups achievements by category for organization';
