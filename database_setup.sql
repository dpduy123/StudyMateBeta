-- StudyMate Database Schema
-- Run this SQL script in your Supabase SQL Editor

-- Create enums
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE "SubscriptionTier" AS ENUM ('BASIC', 'PREMIUM', 'ELITE');
CREATE TYPE "MatchStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED');
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'FILE', 'VOICE', 'VIDEO');
CREATE TYPE "RoomType" AS ENUM ('STUDY_GROUP', 'DISCUSSION', 'HELP_SESSION', 'CASUAL');
CREATE TYPE "BadgeType" AS ENUM ('NETWORK_PRO', 'CHAT_MASTER', 'STUDY_INFLUENCER', 'MENTOR', 'EARLY_ADOPTER');
CREATE TYPE "AchievementCategory" AS ENUM ('SOCIAL', 'ACADEMIC', 'ENGAGEMENT', 'LEADERSHIP');

-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMPTZ,
    "username" TEXT,
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
    "subscriptionExpiry" TIMESTAMPTZ,
    "interests" TEXT[],
    "skills" TEXT[],
    "studyGoals" TEXT[],
    "preferredStudyTime" TEXT[],
    "languages" TEXT[],
    "isProfilePublic" BOOLEAN NOT NULL DEFAULT true,
    "allowMessages" BOOLEAN NOT NULL DEFAULT true,
    "allowCalls" BOOLEAN NOT NULL DEFAULT true,
    "responseRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "totalMatches" INTEGER NOT NULL DEFAULT 0,
    "successfulMatches" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActive" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Create unique constraints for users
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username");

-- Create matches table
CREATE TABLE IF NOT EXISTS "matches" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMPTZ,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint for matches
CREATE UNIQUE INDEX IF NOT EXISTS "matches_senderId_receiverId_key" ON "matches"("senderId", "receiverId");

-- Create messages table
CREATE TABLE IF NOT EXISTS "messages" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "type" "MessageType" NOT NULL DEFAULT 'TEXT',
    "content" TEXT NOT NULL,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMPTZ,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS "rooms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "RoomType" NOT NULL DEFAULT 'STUDY_GROUP',
    "topic" TEXT,
    "maxMembers" INTEGER NOT NULL DEFAULT 10,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT,
    "ownerId" TEXT NOT NULL,
    "allowVideo" BOOLEAN NOT NULL DEFAULT true,
    "allowVoice" BOOLEAN NOT NULL DEFAULT true,
    "allowText" BOOLEAN NOT NULL DEFAULT true,
    "allowScreenShare" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivity" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- Create room_members table
CREATE TABLE IF NOT EXISTS "room_members" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMPTZ,
    "isMuted" BOOLEAN NOT NULL DEFAULT false,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "room_members_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint for room_members
CREATE UNIQUE INDEX IF NOT EXISTS "room_members_roomId_userId_key" ON "room_members"("roomId", "userId");

-- Create room_messages table
CREATE TABLE IF NOT EXISTS "room_messages" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "type" "MessageType" NOT NULL DEFAULT 'TEXT',
    "content" TEXT NOT NULL,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "replyToId" TEXT,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "editedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "room_messages_pkey" PRIMARY KEY ("id")
);

-- Create badges table
CREATE TABLE IF NOT EXISTS "badges" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "BadgeType" NOT NULL,
    "icon" TEXT NOT NULL,
    "requirement" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint for badges
CREATE UNIQUE INDEX IF NOT EXISTS "badges_name_key" ON "badges"("name");

-- Create user_badges table
CREATE TABLE IF NOT EXISTS "user_badges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint for user_badges
CREATE UNIQUE INDEX IF NOT EXISTS "user_badges_userId_badgeId_key" ON "user_badges"("userId", "badgeId");

-- Create achievements table
CREATE TABLE IF NOT EXISTS "achievements" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "AchievementCategory" NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "requirement" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint for achievements
CREATE UNIQUE INDEX IF NOT EXISTS "achievements_name_key" ON "achievements"("name");

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS "user_achievements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "completedAt" TIMESTAMPTZ,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint for user_achievements
CREATE UNIQUE INDEX IF NOT EXISTS "user_achievements_userId_achievementId_key" ON "user_achievements"("userId", "achievementId");

-- Create ratings table
CREATE TABLE IF NOT EXISTS "ratings" (
    "id" TEXT NOT NULL,
    "giverId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "context" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint for ratings
CREATE UNIQUE INDEX IF NOT EXISTS "ratings_giverId_receiverId_context_key" ON "ratings"("giverId", "receiverId", "context");

-- Create user_activities table
CREATE TABLE IF NOT EXISTS "user_activities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_activities_pkey" PRIMARY KEY ("id")
);

-- Create daily_metrics table
CREATE TABLE IF NOT EXISTS "daily_metrics" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "totalUsers" INTEGER NOT NULL DEFAULT 0,
    "activeUsers" INTEGER NOT NULL DEFAULT 0,
    "newUsers" INTEGER NOT NULL DEFAULT 0,
    "totalMatches" INTEGER NOT NULL DEFAULT 0,
    "successfulMatches" INTEGER NOT NULL DEFAULT 0,
    "totalMessages" INTEGER NOT NULL DEFAULT 0,
    "totalRooms" INTEGER NOT NULL DEFAULT 0,
    "activeRooms" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_metrics_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint for daily_metrics
CREATE UNIQUE INDEX IF NOT EXISTS "daily_metrics_date_key" ON "daily_metrics"("date");

-- Add foreign key constraints
ALTER TABLE "matches" ADD CONSTRAINT "matches_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "matches" ADD CONSTRAINT "matches_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "rooms" ADD CONSTRAINT "rooms_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "room_members" ADD CONSTRAINT "room_members_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "room_members" ADD CONSTRAINT "room_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "room_messages" ADD CONSTRAINT "room_messages_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "room_messages" ADD CONSTRAINT "room_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "room_messages" ADD CONSTRAINT "room_messages_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "room_messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ratings" ADD CONSTRAINT "ratings_giverId_fkey" FOREIGN KEY ("giverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");
CREATE INDEX IF NOT EXISTS "users_university_idx" ON "users"("university");
CREATE INDEX IF NOT EXISTS "users_major_idx" ON "users"("major");
CREATE INDEX IF NOT EXISTS "users_lastActive_idx" ON "users"("lastActive");

CREATE INDEX IF NOT EXISTS "matches_senderId_idx" ON "matches"("senderId");
CREATE INDEX IF NOT EXISTS "matches_receiverId_idx" ON "matches"("receiverId");
CREATE INDEX IF NOT EXISTS "matches_status_idx" ON "matches"("status");
CREATE INDEX IF NOT EXISTS "matches_createdAt_idx" ON "matches"("createdAt");

CREATE INDEX IF NOT EXISTS "messages_senderId_idx" ON "messages"("senderId");
CREATE INDEX IF NOT EXISTS "messages_receiverId_idx" ON "messages"("receiverId");
CREATE INDEX IF NOT EXISTS "messages_createdAt_idx" ON "messages"("createdAt");
CREATE INDEX IF NOT EXISTS "messages_isRead_idx" ON "messages"("isRead");

CREATE INDEX IF NOT EXISTS "rooms_ownerId_idx" ON "rooms"("ownerId");
CREATE INDEX IF NOT EXISTS "rooms_type_idx" ON "rooms"("type");
CREATE INDEX IF NOT EXISTS "rooms_isPrivate_idx" ON "rooms"("isPrivate");
CREATE INDEX IF NOT EXISTS "rooms_lastActivity_idx" ON "rooms"("lastActivity");

CREATE INDEX IF NOT EXISTS "room_members_roomId_idx" ON "room_members"("roomId");
CREATE INDEX IF NOT EXISTS "room_members_userId_idx" ON "room_members"("userId");
CREATE INDEX IF NOT EXISTS "room_members_leftAt_idx" ON "room_members"("leftAt");

CREATE INDEX IF NOT EXISTS "room_messages_roomId_idx" ON "room_messages"("roomId");
CREATE INDEX IF NOT EXISTS "room_messages_senderId_idx" ON "room_messages"("senderId");
CREATE INDEX IF NOT EXISTS "room_messages_createdAt_idx" ON "room_messages"("createdAt");
CREATE INDEX IF NOT EXISTS "room_messages_replyToId_idx" ON "room_messages"("replyToId");

CREATE INDEX IF NOT EXISTS "user_activities_userId_idx" ON "user_activities"("userId");
CREATE INDEX IF NOT EXISTS "user_activities_activityType_idx" ON "user_activities"("activityType");
CREATE INDEX IF NOT EXISTS "user_activities_createdAt_idx" ON "user_activities"("createdAt");

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "matches" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rooms" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "room_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "room_messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "badges" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_badges" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "achievements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_achievements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ratings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_activities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "daily_metrics" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic ones - you may need to adjust based on your auth setup)
-- Users can view and update their own data
CREATE POLICY "Users can view own data" ON "users" FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can update own data" ON "users" FOR UPDATE USING (auth.uid()::text = id);

-- Public read access for some user data (for matching)
CREATE POLICY "Public can view user profiles" ON "users" FOR SELECT USING (isProfilePublic = true);

-- Matches policies
CREATE POLICY "Users can view own matches" ON "matches" FOR SELECT USING (auth.uid()::text = senderId OR auth.uid()::text = receiverId);
CREATE POLICY "Users can create matches" ON "matches" FOR INSERT WITH CHECK (auth.uid()::text = senderId);
CREATE POLICY "Users can update received matches" ON "matches" FOR UPDATE USING (auth.uid()::text = receiverId);

-- Messages policies
CREATE POLICY "Users can view own messages" ON "messages" FOR SELECT USING (auth.uid()::text = senderId OR auth.uid()::text = receiverId);
CREATE POLICY "Users can send messages" ON "messages" FOR INSERT WITH CHECK (auth.uid()::text = senderId);
CREATE POLICY "Users can update own messages" ON "messages" FOR UPDATE USING (auth.uid()::text = senderId);

-- Room policies
CREATE POLICY "Users can view public rooms" ON "rooms" FOR SELECT USING (isPrivate = false OR ownerId = auth.uid()::text);
CREATE POLICY "Users can create rooms" ON "rooms" FOR INSERT WITH CHECK (auth.uid()::text = ownerId);
CREATE POLICY "Room owners can update rooms" ON "rooms" FOR UPDATE USING (auth.uid()::text = ownerId);

-- Room members policies
CREATE POLICY "Users can view room members" ON "room_members" FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM rooms 
        WHERE rooms.id = roomId 
        AND (rooms.isPrivate = false OR rooms.ownerId = auth.uid()::text OR userId = auth.uid()::text)
    )
);
CREATE POLICY "Users can join rooms" ON "room_members" FOR INSERT WITH CHECK (auth.uid()::text = userId);
CREATE POLICY "Users can leave rooms" ON "room_members" FOR UPDATE USING (auth.uid()::text = userId);

-- Room messages policies
CREATE POLICY "Room members can view messages" ON "room_messages" FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM room_members 
        WHERE room_members.roomId = "room_messages".roomId 
        AND room_members.userId = auth.uid()::text 
        AND room_members.leftAt IS NULL
    )
);
CREATE POLICY "Room members can send messages" ON "room_messages" FOR INSERT WITH CHECK (
    auth.uid()::text = senderId AND
    EXISTS (
        SELECT 1 FROM room_members 
        WHERE room_members.roomId = "room_messages".roomId 
        AND room_members.userId = auth.uid()::text 
        AND room_members.leftAt IS NULL
    )
);

-- Enable realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE "messages";
ALTER PUBLICATION supabase_realtime ADD TABLE "room_messages";
ALTER PUBLICATION supabase_realtime ADD TABLE "room_members";
ALTER PUBLICATION supabase_realtime ADD TABLE "matches";

-- Insert some sample data (optional)
-- You can uncomment and modify these if you want some initial data

/*
-- Sample badges
INSERT INTO "badges" ("id", "name", "description", "type", "icon", "requirement") VALUES
('badge_1', 'Network Pro', 'Connect with 10+ students', 'NETWORK_PRO', '🌐', 'Make 10 successful matches'),
('badge_2', 'Chat Master', 'Send 100+ messages', 'CHAT_MASTER', '💬', 'Send 100 messages'),
('badge_3', 'Study Influencer', 'Host 5+ study rooms', 'STUDY_INFLUENCER', '⭐', 'Create and host 5 study rooms');

-- Sample achievements
INSERT INTO "achievements" ("id", "name", "description", "category", "points", "requirement") VALUES
('achievement_1', 'First Connection', 'Make your first successful match', 'SOCIAL', 10, '{"matches": 1}'),
('achievement_2', 'Study Buddy', 'Complete 5 study sessions', 'ACADEMIC', 25, '{"study_sessions": 5}'),
('achievement_3', 'Active Learner', 'Log in for 7 consecutive days', 'ENGAGEMENT', 50, '{"consecutive_days": 7}');
*/

COMMENT ON TABLE "users" IS 'Core user profiles with academic information';
COMMENT ON TABLE "matches" IS 'Student matching system for study partnerships';
COMMENT ON TABLE "messages" IS 'Private messages between users';
COMMENT ON TABLE "rooms" IS 'Study rooms for group video/voice sessions';
COMMENT ON TABLE "room_members" IS 'Membership tracking for study rooms';
COMMENT ON TABLE "room_messages" IS 'Group chat messages within study rooms';
COMMENT ON TABLE "badges" IS 'Achievement badges for user accomplishments';
COMMENT ON TABLE "achievements" IS 'Gamification achievements for engagement';
COMMENT ON TABLE "ratings" IS 'Peer rating system for study quality';
COMMENT ON TABLE "user_activities" IS 'Activity tracking for analytics';
COMMENT ON TABLE "daily_metrics" IS 'Daily platform usage metrics';