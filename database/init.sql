-- =====================================================
-- StudyMate Database - Master Initialization Script
-- =====================================================
-- This is the main initialization file that executes
-- all database setup scripts in the correct order.
--
-- Usage:
--   psql -U postgres -d studymate -f init.sql
--
-- Or with Supabase:
--   Execute each section in the Supabase SQL Editor
-- =====================================================

\echo '=========================================='
\echo 'StudyMate Database Initialization'
\echo '=========================================='
\echo ''

-- =====================================================
-- STEP 1: Create Enums
-- =====================================================

\echo '→ Step 1/6: Creating enums...'
\i 01_enums.sql
\echo '✓ Enums created successfully'
\echo ''

-- =====================================================
-- STEP 2: Create Tables
-- =====================================================

\echo '→ Step 2/6: Creating tables...'
\i 02_tables.sql
\echo '✓ Tables created successfully'
\echo ''

-- =====================================================
-- STEP 3: Create Indexes
-- =====================================================

\echo '→ Step 3/6: Creating indexes...'
\i 03_indexes.sql
\echo '✓ Indexes created successfully'
\echo ''

-- =====================================================
-- STEP 4: Create Functions
-- =====================================================

\echo '→ Step 4/6: Creating functions and stored procedures...'
\i 04_functions.sql
\echo '✓ Functions created successfully'
\echo ''

-- =====================================================
-- STEP 5: Create Triggers
-- =====================================================

\echo '→ Step 5/6: Creating triggers...'
\i 05_triggers.sql
\echo '✓ Triggers created successfully'
\echo ''

-- =====================================================
-- STEP 6: Seed Initial Data
-- =====================================================

\echo '→ Step 6/6: Seeding initial data...'
\i 06_seed.sql
\echo '✓ Initial data seeded successfully'
\echo ''

-- =====================================================
-- VERIFICATION
-- =====================================================

\echo '=========================================='
\echo 'Database Initialization Complete!'
\echo '=========================================='
\echo ''
\echo 'Verification:'
\echo ''

-- Count tables
SELECT
  'Tables created: ' || COUNT(*)::TEXT AS status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';

-- Count enums
SELECT
  'Enums created: ' || COUNT(*)::TEXT AS status
FROM pg_type
WHERE typtype = 'e';

-- Count indexes
SELECT
  'Indexes created: ' || COUNT(*)::TEXT AS status
FROM pg_indexes
WHERE schemaname = 'public';

-- Count functions
SELECT
  'Functions created: ' || COUNT(*)::TEXT AS status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.prokind IN ('f', 'p');

-- Count triggers
SELECT
  'Triggers created: ' || COUNT(*)::TEXT AS status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
  AND NOT t.tgisinternal;

-- Count badges
SELECT
  'Badges seeded: ' || COUNT(*)::TEXT AS status
FROM badges;

-- Count achievements
SELECT
  'Achievements seeded: ' || COUNT(*)::TEXT AS status
FROM achievements;

\echo ''
\echo '=========================================='
\echo 'Database is ready for use!'
\echo '=========================================='
\echo ''
\echo 'Next steps:'
\echo '  1. Configure your .env file with database URL'
\echo '  2. Run: npx prisma generate'
\echo '  3. Run: npx prisma db push (if using Prisma)'
\echo '  4. Start seeding test data via API:'
\echo '     POST /api/seed/users?count=100'
\echo ''
\echo 'For more information, see database/README.md'
\echo ''
