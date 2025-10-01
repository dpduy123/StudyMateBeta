-- SQL Script để tạo room_messages và các bảng liên quan (FIXED VERSION)
-- Chạy script này trong Supabase SQL Editor

-- Tạo enum MessageType nếu chưa có
DO $$ BEGIN
    CREATE TYPE "MessageType" AS ENUM ('TEXT', 'FILE', 'VOICE', 'VIDEO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tạo enum RoomType nếu chưa có  
DO $$ BEGIN
    CREATE TYPE "RoomType" AS ENUM ('STUDY_GROUP', 'DISCUSSION', 'HELP_SESSION', 'CASUAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tạo bảng rooms nếu chưa có
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

-- Tạo bảng room_members nếu chưa có
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

-- Tạo bảng room_messages
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

-- Tạo unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS "room_members_roomId_userId_key" ON "room_members"("roomId", "userId");

-- Tạo indexes cho performance
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

-- Thêm foreign key constraints (chỉ thêm nếu bảng users đã có)
DO $$ BEGIN
    -- Kiểm tra xem bảng users có tồn tại không
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        -- Thêm foreign key cho rooms
        IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'rooms_ownerId_fkey') THEN
            ALTER TABLE "rooms" ADD CONSTRAINT "rooms_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
        
        -- Thêm foreign key cho room_members
        IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'room_members_userId_fkey') THEN
            ALTER TABLE "room_members" ADD CONSTRAINT "room_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
        
        -- Thêm foreign key cho room_messages
        IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'room_messages_senderId_fkey') THEN
            ALTER TABLE "room_messages" ADD CONSTRAINT "room_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
    END IF;
    
    -- Thêm foreign key giữa các bảng room
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'room_members_roomId_fkey') THEN
        ALTER TABLE "room_members" ADD CONSTRAINT "room_members_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'room_messages_roomId_fkey') THEN
        ALTER TABLE "room_messages" ADD CONSTRAINT "room_messages_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'room_messages_replyToId_fkey') THEN
        ALTER TABLE "room_messages" ADD CONSTRAINT "room_messages_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "room_messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE "rooms" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "room_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "room_messages" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view public rooms" ON "rooms";
DROP POLICY IF EXISTS "Users can create rooms" ON "rooms";
DROP POLICY IF EXISTS "Room owners can update rooms" ON "rooms";
DROP POLICY IF EXISTS "Users can view room members" ON "room_members";
DROP POLICY IF EXISTS "Users can join rooms" ON "room_members";
DROP POLICY IF EXISTS "Users can leave rooms" ON "room_members";
DROP POLICY IF EXISTS "Room members can view messages" ON "room_messages";
DROP POLICY IF EXISTS "Room members can send messages" ON "room_messages";
DROP POLICY IF EXISTS "Message senders can update own messages" ON "room_messages";
DROP POLICY IF EXISTS "Message senders can delete own messages" ON "room_messages";

-- Tạo RLS policies (without IF NOT EXISTS)
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
CREATE POLICY "Message senders can update own messages" ON "room_messages" FOR UPDATE USING (auth.uid()::text = senderId);
CREATE POLICY "Message senders can delete own messages" ON "room_messages" FOR DELETE USING (auth.uid()::text = senderId);

-- Enable realtime cho room_messages
DO $$
BEGIN
    -- Thêm bảng vào publication nếu chưa có
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE "room_messages";
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE "room_members";
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
END $$;

-- Thêm function để tự động update updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tạo trigger cho rooms
DROP TRIGGER IF EXISTS update_rooms_updated_at ON "rooms";
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON "rooms" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tạo trigger cho room_messages
DROP TRIGGER IF EXISTS update_room_messages_updated_at ON "room_messages";
CREATE TRIGGER update_room_messages_updated_at BEFORE UPDATE ON "room_messages" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Thêm comments
COMMENT ON TABLE "rooms" IS 'Study rooms for group video/voice/text sessions';
COMMENT ON TABLE "room_members" IS 'Membership tracking for study rooms';
COMMENT ON TABLE "room_messages" IS 'Group chat messages within study rooms';

-- Script hoàn thành
SELECT 'room_messages tables created successfully!' as result;