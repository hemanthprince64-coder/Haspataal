-- ============================================================
-- Migration: 02_timeline_fts_index.sql
-- Purpose:   Add tsvector full-text search column and GIN index
--            to timeline_events table.
-- Target:    Supabase (PostgreSQL 15+)
-- Author:    Haspataal Engineering
-- Date:      2026-06-30
--
-- INSTRUCTIONS FOR SUPABASE SQL EDITOR:
--   1. Open your Supabase project → SQL Editor.
--   2. Paste the entire contents of this file.
--   3. Click "Run" (or press Ctrl+Enter).
--   4. Verify by running the smoke-test query at the bottom.
--
-- PRISMA NOTE:
--   Prisma does not natively manage tsvector columns or GIN
--   indexes. The `searchVector` field in schema.prisma is typed
--   as `String? @map("search_vector")` so the Prisma client can
--   read the column, but this migration MUST be applied manually
--   via Supabase SQL Editor or psql — NOT through `prisma migrate`.
-- ============================================================

-- ─── 1. Add the generated tsvector column ───────────────────
-- Concats title, subtitle, summary, description with different
-- weights so title matches rank highest (A), description lowest (D).
ALTER TABLE timeline_events
  ADD COLUMN IF NOT EXISTS search_vector tsvector
    GENERATED ALWAYS AS (
      setweight(to_tsvector('english', coalesce(title, '')),       'A') ||
      setweight(to_tsvector('english', coalesce(subtitle, '')),    'B') ||
      setweight(to_tsvector('english', coalesce(summary, '')),     'C') ||
      setweight(to_tsvector('english', coalesce(description, '')), 'D')
    ) STORED;

-- ─── 2. Build the GIN index ──────────────────────────────────
-- CONCURRENTLY avoids a full table lock on production.
-- Remove CONCURRENTLY if running inside a transaction block.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_timeline_events_fts
  ON timeline_events
  USING GIN (search_vector);

-- ─── 3. Composite covering index for tenant-scoped FTS ───────
-- Speeds up the common query pattern:
--   WHERE patient_id = ? AND status = 'ACTIVE'
--     AND search_vector @@ to_tsquery(...)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_timeline_events_patient_fts
  ON timeline_events (patient_id, status)
  INCLUDE (search_vector);

-- ─── 4. RLS policy for the new column ───────────────────────
-- The column is read-only (GENERATED STORED), so the existing
-- hospital_id / patient_id RLS policies on timeline_events
-- already cover it. No new policy is required.

-- ─── 5. Backfill for existing rows ───────────────────────────
-- GENERATED ALWAYS AS STORED columns are auto-populated on
-- INSERT and UPDATE. For rows that existed BEFORE this migration
-- was applied, PostgreSQL backfills automatically at ALTER TABLE
-- time — no separate UPDATE is required.

-- ─── 6. Smoke test (run after applying) ──────────────────────
-- Expected: returns rows ranked by relevance where title / summary
--           contains the test token "fever".
--
-- SELECT id, patient_id, title,
--        ts_rank(search_vector, to_tsquery('english', 'fever')) AS rank
-- FROM   timeline_events
-- WHERE  search_vector @@ to_tsquery('english', 'fever')
--   AND  status = 'ACTIVE'
-- ORDER  BY rank DESC
-- LIMIT  10;
