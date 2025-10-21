# StudyMate Database Documentation

Complete PostgreSQL database schema, functions, triggers, and setup for the StudyMate platform.

## 📁 File Structure

```
database/
├── README.md           # This file - complete documentation
├── init.sql           # Master initialization script (runs all files)
├── 01_enums.sql       # PostgreSQL enum types
├── 02_tables.sql      # All table schemas with constraints
├── 03_indexes.sql     # Performance indexes
├── 04_functions.sql   # Stored procedures and functions
├── 05_triggers.sql    # Automated triggers
└── 06_seed.sql        # Initial seed data (badges, achievements)
```

## 🚀 Quick Start

### Option 1: Using the Master Script (Recommended)

```bash
# Connect to your PostgreSQL database and run:
psql -U postgres -d studymate -f database/init.sql
```

This will execute all files in the correct order.

### Option 2: Supabase SQL Editor

If using Supabase, execute each file in order through the SQL Editor:

1. Copy contents of `01_enums.sql` → Execute
2. Copy contents of `02_tables.sql` → Execute
3. Copy contents of `03_indexes.sql` → Execute
4. Copy contents of `04_functions.sql` → Execute
5. Copy contents of `05_triggers.sql` → Execute
6. Copy contents of `06_seed.sql` → Execute

### Option 3: Individual Files

```bash
psql -U postgres -d studymate -f database/01_enums.sql
psql -U postgres -d studymate -f database/02_tables.sql
psql -U postgres -d studymate -f database/03_indexes.sql
psql -U postgres -d studymate -f database/04_functions.sql
psql -U postgres -d studymate -f database/05_triggers.sql
psql -U postgres -d studymate -f database/06_seed.sql
```

## 📊 Database Schema

### Enums (7 types)

- **UserStatus**: `ACTIVE`, `INACTIVE`, `SUSPENDED`
- **SubscriptionTier**: `BASIC`, `PREMIUM`, `ELITE`
- **MatchStatus**: `PENDING`, `ACCEPTED`, `REJECTED`, `BLOCKED`
- **MessageType**: `TEXT`, `FILE`, `VOICE`, `VIDEO`
- **RoomType**: `STUDY_GROUP`, `DISCUSSION`, `HELP_SESSION`, `CASUAL`
- **BadgeType**: `NETWORK_PRO`, `CHAT_MASTER`, `STUDY_INFLUENCER`, `MENTOR`, `EARLY_ADOPTER`
- **AchievementCategory**: `SOCIAL`, `ACADEMIC`, `ENGAGEMENT`, `LEADERSHIP`

### Core Tables (14 tables)

#### 1. **users** - User Profiles
- Student accounts with academic information
- Subscription tier management
- AI matching metrics (interests, skills, study times)
- Response rate and rating tracking

#### 2. **matches** - Student Matching
- Tinder-style match requests
- Status tracking (pending → accepted/rejected/blocked)
- Response timestamp tracking

#### 3. **messages** - Private Messaging
- 1-to-1 messages between matched users
- Support for text, files, voice, video
- Read receipts and timestamps

#### 4. **rooms** - Study Rooms
- Voice/video chat rooms
- Room types and capacity management
- Privacy settings and passwords

#### 5. **room_members** - Room Membership
- User participation in rooms
- Join/leave tracking
- Mute and ban management

#### 6. **room_messages** - Group Chat
- Messages within study rooms
- Reply threading support
- Edit tracking

#### 7. **badges** - Achievement Badges
- Predefined badge types
- Icons and requirements

#### 8. **user_badges** - Earned Badges
- Tracks which users earned which badges
- Timestamp of earning

#### 9. **achievements** - Achievement Definitions
- Categorized achievements
- Points system
- JSON requirement definitions

#### 10. **user_achievements** - Achievement Progress
- Tracks progress (0.0 to 1.0)
- Completion timestamps

#### 11. **ratings** - User Ratings
- 1-5 star rating system
- Context-specific ratings
- Comments support

#### 12. **user_activities** - Activity Log
- All user actions logged
- JSON metadata support
- Analytics foundation

#### 13. **daily_metrics** - Analytics
- Daily aggregated statistics
- User growth tracking
- Engagement metrics

## 🔧 Functions & Stored Procedures

### User Functions
- `calculate_user_average_rating(user_id)` - Calculate user's average rating
- `update_user_metrics(user_id)` - Recalculate all user metrics
- `can_send_match(user_id)` - Check daily match quota
- `get_active_subscription_tier(user_id)` - Get tier considering expiry

### Matching Functions
- `are_users_matched(user1_id, user2_id)` - Check if users matched
- `get_mutual_matches_count(user1_id, user2_id)` - Count mutual connections

### Room Functions
- `can_join_room(user_id)` - Check daily room quota
- `get_active_room_member_count(room_id)` - Count active members
- `is_room_full(room_id)` - Check capacity
- `is_user_in_room(user_id, room_id)` - Check membership

### Messaging Functions
- `get_unread_message_count(user_id)` - Total unread messages
- `get_unread_from_sender_count(receiver_id, sender_id)` - Unread from sender
- `mark_conversation_read(receiver_id, sender_id)` - Mark all as read

### Analytics Functions
- `update_daily_metrics(date)` - Update daily statistics

### Achievement Functions
- `check_and_award_achievement(user_id, achievement_id)` - Award achievement
- `update_achievement_progress(user_id, achievement_id, progress)` - Update progress

### Cleanup Functions
- `cleanup_old_activities(retention_days)` - Delete old activity logs
- `cleanup_expired_subscriptions()` - Downgrade expired subscriptions

## ⚡ Triggers (30+ triggers)

### Auto-Update Triggers
- **updatedAt timestamps** - All tables automatically update on modification
- **lastActive tracking** - Updates when users perform actions
- **respondedAt** - Sets when match status changes from PENDING

### Validation Triggers
- **Message validation** - Only matched users can message
- **Room capacity** - Prevents joining full rooms
- **Subscription limits** - Enforces match/room quotas per tier
- **Subscription changes** - Validates tier downgrades

### Metric Update Triggers
- **User metrics** - Auto-updates on match/rating changes
- **Average ratings** - Recalculates on new ratings
- **Room activity** - Updates lastActivity on messages/joins

### Activity Logging Triggers
- **Match activity** - Logs match sent/accepted events
- **Message activity** - Logs message sending
- **Room activity** - Logs room join/leave
- **Rating activity** - Logs rating submissions
- **User deletion** - Logs account deletions

### Business Logic Triggers
- **Read receipts** - Sets readAt when isRead becomes true
- **Message editing** - Sets isEdited and editedAt on content change
- **Room ownership** - Auto-adds owner as first member
- **Achievement checks** - Checks progress on badge earning

## 📈 Indexes (60+ indexes)

### Primary Indexes
- All foreign keys indexed
- Unique constraints on critical fields
- Composite indexes for common queries

### Performance Indexes
- **Discovery queries** - University, major, year combinations
- **Array operations** - GIN indexes on interests, skills, languages
- **Conversations** - Sender/receiver pairs with timestamps
- **Unread messages** - Partial index for fast notifications
- **Room discovery** - Public rooms by type and activity
- **Leaderboards** - Sorted by ratings, matches, etc.

### Full-Text Search
- **Room search** - GIN index on name and description
- **User search** - Ready for future implementation

### Partial Indexes
- Only index relevant rows (e.g., active users, unread messages)
- Significant space savings and query performance

## 🌱 Seed Data

The database is seeded with:

### 5 Badges
1. **Network Pro** - 50+ connections
2. **Chat Master** - 1000+ messages
3. **Study Influencer** - 100+ room participants
4. **Mentor** - 4.5+ rating with 20+ reviews
5. **Early Adopter** - First 100 users

### 16 Achievements
Across 4 categories:
- **Social** (4) - First connection to 100 connections
- **Academic** (4) - First study session to 100 hours
- **Engagement** (4) - 7-day streak to 1000 messages
- **Leadership** (4) - First room to 5-star mentor

### Initial Metrics
- Today's daily metrics row initialized

## 🔒 Security Features

### Data Integrity
- Foreign key constraints with CASCADE delete
- Check constraints on valid ranges (GPA, ratings, etc.)
- Unique constraints preventing duplicates
- NOT NULL constraints on critical fields

### Business Rules
- Users can't match/message themselves
- Messages only between matched users
- Room capacity enforced
- Subscription tier limits enforced
- Expired subscriptions auto-downgraded

### Data Validation
- Email format validation
- Year range validation (1-7)
- GPA range validation (0.0-4.0)
- Rating range validation (1-5)
- Progress range validation (0.0-1.0)

## 🛠 Maintenance

### Regular Tasks

```sql
-- Update today's metrics (run daily via cron)
SELECT update_daily_metrics(CURRENT_DATE);

-- Cleanup old activity logs (run weekly)
SELECT cleanup_old_activities(90); -- Keep last 90 days

-- Cleanup expired subscriptions (run daily)
SELECT cleanup_expired_subscriptions();

-- Vacuum tables (run monthly)
VACUUM ANALYZE users;
VACUUM ANALYZE messages;
VACUUM ANALYZE room_messages;

-- Reindex if needed (run quarterly)
REINDEX TABLE users;
REINDEX TABLE matches;
```

### Monitoring

```sql
-- Check index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Check table sizes
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check slow queries (requires pg_stat_statements extension)
SELECT
  query,
  calls,
  mean_exec_time,
  total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

## 📝 Development Workflow

### With Prisma

The database schema is also defined in `prisma/schema.prisma`. You can choose:

**Option A: Prisma-first** (Recommended for development)
```bash
# Make changes to prisma/schema.prisma
npx prisma migrate dev --name your_migration_name
npx prisma generate
```

**Option B: SQL-first** (For production/complex changes)
```bash
# Make changes to SQL files
psql -f database/init.sql
npx prisma db pull  # Sync Prisma schema from database
npx prisma generate
```

### Environment Setup

```bash
# .env file
SUPABASE_CONNECTION_STRING="postgresql://user:pass@host:5432/dbname"
DIRECT_URL="postgresql://user:pass@host:5432/dbname"

# Generate Prisma client
npx prisma generate

# Push schema (development)
npx prisma db push

# Or create migration (production)
npx prisma migrate dev
```

## 🧪 Testing

### Seed Test Data via API

```bash
# Seed 100 test users
curl -X POST "http://localhost:3000/api/seed/users?count=100"

# Seed test matches
curl -X POST "http://localhost:3000/api/seed/matches"

# Seed test messages
curl -X POST "http://localhost:3000/api/seed/messages"

# Seed test rooms
curl -X POST "http://localhost:3000/api/seed/rooms"
```

### Useful Test Queries

```sql
-- Get all active users
SELECT * FROM users WHERE status = 'ACTIVE' LIMIT 10;

-- Get pending matches
SELECT * FROM matches WHERE status = 'PENDING';

-- Get unread message count per user
SELECT
  "receiverId",
  COUNT(*) as unread_count
FROM messages
WHERE "isRead" = FALSE
GROUP BY "receiverId";

-- Get top rated users
SELECT
  id,
  "firstName",
  "lastName",
  "averageRating",
  "totalMatches"
FROM users
ORDER BY "averageRating" DESC
LIMIT 10;
```

## 🚨 Troubleshooting

### Common Issues

**Issue**: "relation already exists"
```sql
-- Drop and recreate (CAUTION: Deletes all data)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
-- Then run init.sql again
```

**Issue**: Trigger not firing
```sql
-- Check trigger status
SELECT * FROM pg_trigger WHERE tgname = 'your_trigger_name';

-- Re-create trigger
DROP TRIGGER IF EXISTS your_trigger_name ON your_table;
-- Run trigger creation script again
```

**Issue**: Slow queries
```sql
-- Analyze table statistics
ANALYZE your_table;

-- Check if indexes are being used
EXPLAIN ANALYZE your_slow_query;
```

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Database Guide](https://supabase.com/docs/guides/database)
- [Prisma Documentation](https://www.prisma.io/docs)
- [StudyMate Project Docs](../README.md)

## 🤝 Contributing

When adding new database features:

1. Add enums to `01_enums.sql` if needed
2. Add tables to `02_tables.sql`
3. Add indexes to `03_indexes.sql`
4. Add functions to `04_functions.sql`
5. Add triggers to `05_triggers.sql`
6. Add seed data to `06_seed.sql` if needed
7. Update Prisma schema if using Prisma
8. Test with `init.sql`
9. Update this README

## 📄 License

Part of the StudyMate project. See main project README for license information.

---

**Last Updated**: 2025-10-21
**Database Version**: 1.0.0
**PostgreSQL Version**: 14+
