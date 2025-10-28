-- Add replyToId and isEdited fields to messages table for reply and edit functionality
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS "replyToId" TEXT,
ADD COLUMN IF NOT EXISTS "isEdited" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "editedAt" TIMESTAMP;

-- Add foreign key constraint for replyToId
ALTER TABLE messages
ADD CONSTRAINT "messages_replyToId_fkey" 
FOREIGN KEY ("replyToId") REFERENCES messages(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS "messages_replyToId_idx" ON messages("replyToId");
