-- =====================================================
-- Add Message Reactions Support
-- =====================================================
-- This migration adds support for message reactions
-- =====================================================

-- Create message_reactions table for private messages
CREATE TABLE IF NOT EXISTS "message_reactions" (
  "id" TEXT PRIMARY KEY,
  "messageId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "emoji" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Foreign Keys
  CONSTRAINT "message_reactions_messageId_fkey" FOREIGN KEY ("messageId")
    REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "message_reactions_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,

  -- Constraints
  CONSTRAINT "message_reactions_messageId_userId_emoji_key" UNIQUE ("messageId", "userId", "emoji")
);

COMMENT ON TABLE "message_reactions" IS 'Emoji reactions on private messages';
COMMENT ON COLUMN "message_reactions"."emoji" IS 'Unicode emoji character';

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS "idx_message_reactions_messageId" ON "message_reactions"("messageId");
CREATE INDEX IF NOT EXISTS "idx_message_reactions_userId" ON "message_reactions"("userId");

-- Create room_message_reactions table for room messages
CREATE TABLE IF NOT EXISTS "room_message_reactions" (
  "id" TEXT PRIMARY KEY,
  "messageId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "emoji" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Foreign Keys
  CONSTRAINT "room_message_reactions_messageId_fkey" FOREIGN KEY ("messageId")
    REFERENCES "room_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "room_message_reactions_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,

  -- Constraints
  CONSTRAINT "room_message_reactions_messageId_userId_emoji_key" UNIQUE ("messageId", "userId", "emoji")
);

COMMENT ON TABLE "room_message_reactions" IS 'Emoji reactions on room messages';
COMMENT ON COLUMN "room_message_reactions"."emoji" IS 'Unicode emoji character';

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS "idx_room_message_reactions_messageId" ON "room_message_reactions"("messageId");
CREATE INDEX IF NOT EXISTS "idx_room_message_reactions_userId" ON "room_message_reactions"("userId");
