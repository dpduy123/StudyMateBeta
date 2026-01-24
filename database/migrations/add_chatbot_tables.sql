-- Migration: Add Chatbot Tables
-- Description: Creates tables for AI chatbot system (threads, messages, knowledge documents)
-- Run this in your Supabase SQL Editor

-- ==========================================
-- 1. Create ChatRole enum
-- ==========================================
DO $$ BEGIN
    CREATE TYPE "ChatRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM', 'TOOL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==========================================
-- 2. Create chat_threads table
-- ==========================================
CREATE TABLE IF NOT EXISTS "chat_threads" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_threads_pkey" PRIMARY KEY ("id")
);

-- ==========================================
-- 3. Create chat_messages table
-- ==========================================
CREATE TABLE IF NOT EXISTS "chat_messages" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "role" "ChatRole" NOT NULL,
    "content" TEXT NOT NULL,
    "toolCalls" JSONB,
    "toolResults" JSONB,
    "tokens" INTEGER,
    "latencyMs" INTEGER,
    "feedback" INTEGER,
    "feedbackText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- ==========================================
-- 4. Create knowledge_documents table
-- ==========================================
CREATE TABLE IF NOT EXISTS "knowledge_documents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "source" TEXT,
    "language" TEXT NOT NULL DEFAULT 'vi',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_documents_pkey" PRIMARY KEY ("id")
);

-- ==========================================
-- 5. Add Foreign Keys
-- ==========================================

-- chat_threads -> users
ALTER TABLE "chat_threads"
ADD CONSTRAINT "chat_threads_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- chat_messages -> chat_threads
ALTER TABLE "chat_messages"
ADD CONSTRAINT "chat_messages_threadId_fkey"
FOREIGN KEY ("threadId") REFERENCES "chat_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ==========================================
-- 6. Create Indexes for Performance
-- ==========================================

-- Indexes for chat_threads
CREATE INDEX IF NOT EXISTS "chat_threads_userId_idx" ON "chat_threads"("userId");
CREATE INDEX IF NOT EXISTS "chat_threads_userId_isActive_idx" ON "chat_threads"("userId", "isActive");

-- Indexes for chat_messages
CREATE INDEX IF NOT EXISTS "chat_messages_threadId_idx" ON "chat_messages"("threadId");
CREATE INDEX IF NOT EXISTS "chat_messages_threadId_createdAt_idx" ON "chat_messages"("threadId", "createdAt");

-- Indexes for knowledge_documents
CREATE INDEX IF NOT EXISTS "knowledge_documents_category_idx" ON "knowledge_documents"("category");
CREATE INDEX IF NOT EXISTS "knowledge_documents_category_isActive_idx" ON "knowledge_documents"("category", "isActive");

-- ==========================================
-- 7. Create trigger for updatedAt auto-update
-- ==========================================

-- Function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for chat_threads
DROP TRIGGER IF EXISTS update_chat_threads_updated_at ON "chat_threads";
CREATE TRIGGER update_chat_threads_updated_at
    BEFORE UPDATE ON "chat_threads"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for knowledge_documents
DROP TRIGGER IF EXISTS update_knowledge_documents_updated_at ON "knowledge_documents";
CREATE TRIGGER update_knowledge_documents_updated_at
    BEFORE UPDATE ON "knowledge_documents"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 8. Insert sample knowledge documents (optional)
-- ==========================================

INSERT INTO "knowledge_documents" ("id", "title", "content", "category", "tags", "language", "isActive", "createdAt", "updatedAt")
VALUES
(
    'kb_pomodoro_001',
    'Phương pháp Pomodoro',
    'Phương pháp Pomodoro giúp tăng tập trung:
1. Học 25 phút liên tục
2. Nghỉ 5 phút
3. Sau 4 pomodoros, nghỉ dài 15-30 phút
4. Loại bỏ xao nhãng trong thời gian học
Mẹo: Sử dụng app như Forest hoặc Pomofocus để theo dõi.',
    'study_tips',
    ARRAY['pomodoro', 'tập trung', 'học tập', 'time management'],
    'vi',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'kb_active_recall_001',
    'Active Recall - Ôn tập chủ động',
    'Active Recall hiệu quả hơn đọc lại sách:
1. Đọc xong một phần → đóng sách
2. Viết lại những gì nhớ được
3. So sánh với nội dung gốc
4. Tập trung vào phần chưa nhớ
Kết hợp với Spaced Repetition (ôn tập cách quãng) để nhớ lâu hơn.',
    'study_tips',
    ARRAY['active recall', 'ôn tập', 'ghi nhớ', 'spaced repetition'],
    'vi',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'kb_match_rate_001',
    'Cách tăng match rate',
    'Để tăng tỷ lệ match trên StudyMate:
1. Hoàn thiện profile (thêm avatar, bio)
2. Cập nhật skills và interests chi tiết
3. Chọn thời gian học phù hợp
4. Viết study goals cụ thể
5. Tích cực tham gia phòng học
Profile đầy đủ giúp AI match chính xác hơn.',
    'platform_help',
    ARRAY['match', 'profile', 'tips', 'hướng dẫn'],
    'vi',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'kb_study_room_001',
    'Sử dụng phòng học',
    'Tính năng Phòng học (Study Rooms):
1. Tạo phòng: Chọn chủ đề, đặt tên, mời bạn bè
2. Tham gia: Tìm phòng theo topic hoặc dùng link mời
3. Trong phòng: Chat text, voice call, chia sẻ file
4. Tips: Bật camera/mic để tương tác tốt hơn
Phòng học giúp bạn học cùng nhiều người cùng lúc.',
    'platform_help',
    ARRAY['room', 'phòng học', 'study room', 'hướng dẫn'],
    'vi',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'kb_what_is_match_001',
    'Match là gì?',
    'Match trên StudyMate:
- Khi bạn Like một người và họ cũng Like bạn → Match!
- Sau khi match, cả hai có thể nhắn tin cho nhau
- Match không có nghĩa là bạn phải học cùng ngay
- Hãy nhắn tin làm quen trước rồi hẹn học cùng',
    'faq',
    ARRAY['match', 'faq', 'câu hỏi thường gặp'],
    'vi',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;

-- ==========================================
-- Done!
-- ==========================================
-- After running this migration, regenerate Prisma client:
-- npx prisma generate
