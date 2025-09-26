-- Simple room_messages table creation
-- First, let's check what types the existing tables use

-- Create room_messages table matching existing schema types
CREATE TABLE IF NOT EXISTS public.room_messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "roomId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'TEXT',
    content TEXT NOT NULL,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "replyToId" TEXT,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "editedAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_room_messages_room_id ON public.room_messages("roomId");
CREATE INDEX IF NOT EXISTS idx_room_messages_sender_id ON public.room_messages("senderId");
CREATE INDEX IF NOT EXISTS idx_room_messages_created_at ON public.room_messages("createdAt");

-- Add updatedAt field to existing messages table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' 
        AND table_schema = 'public' 
        AND column_name = 'updatedAt'
    ) THEN
        ALTER TABLE public.messages 
        ADD COLUMN "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
    END IF;
END $$;

-- Enable Row Level Security (RLS) for room_messages
ALTER TABLE public.room_messages ENABLE ROW LEVEL SECURITY;

-- Basic RLS policy - users can read all room messages for now (we can restrict later)
CREATE POLICY "Enable read access for all users" ON public.room_messages
    FOR SELECT USING (true);

-- Users can insert their own messages
CREATE POLICY "Users can insert their own messages" ON public.room_messages
    FOR INSERT WITH CHECK ("senderId"::text = auth.uid()::text);

-- Users can update their own messages
CREATE POLICY "Users can update their own messages" ON public.room_messages
    FOR UPDATE USING ("senderId"::text = auth.uid()::text);

-- Users can delete their own messages
CREATE POLICY "Users can delete their own messages" ON public.room_messages
    FOR DELETE USING ("senderId"::text = auth.uid()::text);