-- Create room_messages table for group chat functionality
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
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Foreign key constraints
    CONSTRAINT fk_room_messages_room_id 
        FOREIGN KEY ("roomId") REFERENCES public.rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_room_messages_sender_id 
        FOREIGN KEY ("senderId") REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_room_messages_reply_to_id 
        FOREIGN KEY ("replyToId") REFERENCES public.room_messages(id) ON DELETE SET NULL,
    
    -- Check constraints
    CONSTRAINT chk_room_messages_type 
        CHECK (type IN ('TEXT', 'FILE', 'VOICE', 'VIDEO'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_room_messages_room_id ON public.room_messages("roomId");
CREATE INDEX IF NOT EXISTS idx_room_messages_sender_id ON public.room_messages("senderId");
CREATE INDEX IF NOT EXISTS idx_room_messages_created_at ON public.room_messages("createdAt");
CREATE INDEX IF NOT EXISTS idx_room_messages_reply_to_id ON public.room_messages("replyToId");

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_room_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_room_messages_updated_at
    BEFORE UPDATE ON public.room_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_room_messages_updated_at();

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
        
        -- Create trigger for messages table updatedAt
        CREATE TRIGGER trigger_messages_updated_at
            BEFORE UPDATE ON public.messages
            FOR EACH ROW
            EXECUTE FUNCTION update_room_messages_updated_at();
    END IF;
END $$;

-- Enable Row Level Security (RLS) for room_messages
ALTER TABLE public.room_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for room_messages
-- Users can read messages from rooms they are members of or that are public
CREATE POLICY "Users can read room messages they have access to" ON public.room_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.rooms r
            WHERE r.id = room_messages."roomId"
            AND (
                -- User is the room owner
                r."ownerId" = auth.uid()
                -- User is a member of the room
                OR EXISTS (
                    SELECT 1 FROM public.room_members rm
                    WHERE rm."roomId" = r.id
                    AND rm."userId" = auth.uid()
                    AND rm."leftAt" IS NULL
                    AND rm."isBanned" = false
                )
                -- Room is public (for non-private rooms)
                OR (r."isPrivate" = false)
            )
        )
    );

-- Users can insert messages into rooms they are members of
CREATE POLICY "Users can send messages to rooms they belong to" ON public.room_messages
    FOR INSERT WITH CHECK (
        "senderId" = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.rooms r
            WHERE r.id = room_messages."roomId"
            AND r."allowText" = true
            AND (
                -- User is the room owner
                r."ownerId" = auth.uid()
                -- User is a member of the room
                OR EXISTS (
                    SELECT 1 FROM public.room_members rm
                    WHERE rm."roomId" = r.id
                    AND rm."userId" = auth.uid()
                    AND rm."leftAt" IS NULL
                    AND rm."isBanned" = false
                )
            )
        )
    );

-- Users can update their own messages
CREATE POLICY "Users can update their own room messages" ON public.room_messages
    FOR UPDATE USING ("senderId" = auth.uid())
    WITH CHECK ("senderId" = auth.uid());

-- Users can delete their own messages, or room owners can delete any message in their room
CREATE POLICY "Users can delete room messages they own or room owners can delete any" ON public.room_messages
    FOR DELETE USING (
        "senderId" = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.rooms r
            WHERE r.id = room_messages."roomId"
            AND r."ownerId" = auth.uid()
        )
    );