-- =====================================================
-- Migration: Add Posts System (News Feed)
-- Date: 2024-12-29
-- Description: Adds posts, post_likes, post_comments tables for LinkedIn-style news feed
-- =====================================================

-- Step 1: Create posts table
CREATE TABLE "posts" (
  "id" TEXT PRIMARY KEY,
  "authorId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "imageUrl" TEXT,

  -- Timestamps
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Foreign key constraint
  CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

COMMENT ON TABLE "posts" IS 'User posts for the news feed - academic content sharing';
COMMENT ON COLUMN "posts"."authorId" IS 'User who created the post';
COMMENT ON COLUMN "posts"."content" IS 'Post content text';
COMMENT ON COLUMN "posts"."imageUrl" IS 'Optional image attachment URL';

-- Step 2: Create post_likes table
CREATE TABLE "post_likes" (
  "id" TEXT PRIMARY KEY,
  "postId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Foreign key constraints
  CONSTRAINT "post_likes_postId_fkey" FOREIGN KEY ("postId")
    REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "post_likes_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,

  -- Unique constraint: one like per user per post
  CONSTRAINT "post_likes_postId_userId_key" UNIQUE ("postId", "userId")
);

COMMENT ON TABLE "post_likes" IS 'Likes on posts';
COMMENT ON COLUMN "post_likes"."postId" IS 'Post that was liked';
COMMENT ON COLUMN "post_likes"."userId" IS 'User who liked the post';

-- Step 3: Create post_comments table
CREATE TABLE "post_comments" (
  "id" TEXT PRIMARY KEY,
  "postId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "content" TEXT NOT NULL,

  -- Timestamps
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Foreign key constraints
  CONSTRAINT "post_comments_postId_fkey" FOREIGN KEY ("postId")
    REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "post_comments_authorId_fkey" FOREIGN KEY ("authorId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

COMMENT ON TABLE "post_comments" IS 'Comments on posts';
COMMENT ON COLUMN "post_comments"."postId" IS 'Post being commented on';
COMMENT ON COLUMN "post_comments"."authorId" IS 'User who wrote the comment';
COMMENT ON COLUMN "post_comments"."content" IS 'Comment content text';

-- Step 4: Create indexes for performance

-- Posts indexes
CREATE INDEX "idx_posts_authorId" ON "posts"("authorId");
CREATE INDEX "idx_posts_createdAt" ON "posts"("createdAt" DESC);
CREATE INDEX "idx_posts_authorId_createdAt" ON "posts"("authorId", "createdAt" DESC);

COMMENT ON INDEX "idx_posts_authorId" IS 'Fast lookup for posts by author';
COMMENT ON INDEX "idx_posts_createdAt" IS 'Fast lookup for posts ordered by time (news feed)';
COMMENT ON INDEX "idx_posts_authorId_createdAt" IS 'Fast lookup for user posts ordered by time';

-- Post likes indexes
CREATE INDEX "idx_post_likes_postId" ON "post_likes"("postId");
CREATE INDEX "idx_post_likes_userId" ON "post_likes"("userId");

COMMENT ON INDEX "idx_post_likes_postId" IS 'Fast lookup for likes on a post';
COMMENT ON INDEX "idx_post_likes_userId" IS 'Fast lookup for posts liked by user';

-- Post comments indexes
CREATE INDEX "idx_post_comments_postId" ON "post_comments"("postId");
CREATE INDEX "idx_post_comments_authorId" ON "post_comments"("authorId");
CREATE INDEX "idx_post_comments_postId_createdAt" ON "post_comments"("postId", "createdAt" ASC);

COMMENT ON INDEX "idx_post_comments_postId" IS 'Fast lookup for comments on a post';
COMMENT ON INDEX "idx_post_comments_authorId" IS 'Fast lookup for comments by user';
COMMENT ON INDEX "idx_post_comments_postId_createdAt" IS 'Fast lookup for comments ordered by time';

-- Step 5: Create trigger to auto-update updatedAt on posts
CREATE OR REPLACE FUNCTION update_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_posts_updated_at
  BEFORE UPDATE ON "posts"
  FOR EACH ROW
  EXECUTE FUNCTION update_posts_updated_at();

COMMENT ON FUNCTION update_posts_updated_at() IS 'Automatically updates updatedAt timestamp on posts';

-- Step 6: Create trigger to auto-update updatedAt on post_comments
CREATE OR REPLACE FUNCTION update_post_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_post_comments_updated_at
  BEFORE UPDATE ON "post_comments"
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comments_updated_at();

COMMENT ON FUNCTION update_post_comments_updated_at() IS 'Automatically updates updatedAt timestamp on post comments';

-- Step 7: Create helper functions

-- Function to get post likes count
CREATE OR REPLACE FUNCTION get_post_likes_count(post_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  likes_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO likes_count
  FROM "post_likes"
  WHERE "postId" = post_id;

  RETURN likes_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_post_likes_count(TEXT) IS 'Returns count of likes for a post';

-- Function to get post comments count
CREATE OR REPLACE FUNCTION get_post_comments_count(post_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  comments_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO comments_count
  FROM "post_comments"
  WHERE "postId" = post_id;

  RETURN comments_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_post_comments_count(TEXT) IS 'Returns count of comments for a post';

-- Function to check if user liked a post
CREATE OR REPLACE FUNCTION has_user_liked_post(user_id TEXT, post_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  liked BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM "post_likes"
    WHERE "userId" = user_id AND "postId" = post_id
  ) INTO liked;

  RETURN liked;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION has_user_liked_post(TEXT, TEXT) IS 'Checks if a user has liked a specific post';

-- Step 8: Create activity logging trigger for posts
CREATE OR REPLACE FUNCTION log_post_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO "user_activities" ("id", "userId", "activityType", "metadata", "createdAt")
    VALUES (
      gen_random_uuid()::TEXT,
      NEW."authorId",
      'post_created',
      jsonb_build_object('postId', NEW."id"),
      CURRENT_TIMESTAMP
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_post_activity
  AFTER INSERT ON "posts"
  FOR EACH ROW
  EXECUTE FUNCTION log_post_activity();

COMMENT ON FUNCTION log_post_activity() IS 'Logs post creation to user activities';

-- =====================================================
-- Verification queries
-- =====================================================

-- Get recent posts with author info
-- SELECT p.*, u."firstName", u."lastName", u."avatar"
-- FROM posts p
-- JOIN users u ON p."authorId" = u."id"
-- ORDER BY p."createdAt" DESC
-- LIMIT 10;

-- Get post with likes and comments count
-- SELECT p.*, get_post_likes_count(p."id") as likes, get_post_comments_count(p."id") as comments
-- FROM posts p
-- WHERE p."id" = 'post_id';

-- Check if user liked a post
-- SELECT has_user_liked_post('user_id', 'post_id');

-- =====================================================
-- Rollback script (if needed)
-- =====================================================

-- To rollback this migration, run:
-- DROP TRIGGER IF EXISTS trigger_log_post_activity ON posts;
-- DROP FUNCTION IF EXISTS log_post_activity();
-- DROP TRIGGER IF EXISTS trigger_post_comments_updated_at ON post_comments;
-- DROP FUNCTION IF EXISTS update_post_comments_updated_at();
-- DROP TRIGGER IF EXISTS trigger_posts_updated_at ON posts;
-- DROP FUNCTION IF EXISTS update_posts_updated_at();
-- DROP FUNCTION IF EXISTS has_user_liked_post(TEXT, TEXT);
-- DROP FUNCTION IF EXISTS get_post_comments_count(TEXT);
-- DROP FUNCTION IF EXISTS get_post_likes_count(TEXT);
-- DROP TABLE IF EXISTS post_comments;
-- DROP TABLE IF EXISTS post_likes;
-- DROP TABLE IF EXISTS posts;
