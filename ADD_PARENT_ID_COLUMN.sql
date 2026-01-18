-- ========================================
-- Add parent_id column to Collections table
-- ========================================
-- This migration adds hierarchical collection support
-- Run this script in Supabase SQL Editor

-- 1. Add parent_id column (allows null for parent collections)
ALTER TABLE collections
ADD COLUMN IF NOT EXISTS parent_id UUID NULL;

-- 2. Add foreign key to reference parent collection
ALTER TABLE collections
ADD CONSTRAINT fk_parent_collection
FOREIGN KEY (parent_id)
REFERENCES collections(id)
ON DELETE SET NULL;

-- 3. Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_collections_parent_id
ON collections(parent_id);

-- 4. Prevent a collection from being its own parent
ALTER TABLE collections
ADD CONSTRAINT chk_not_self_parent
CHECK (parent_id != id);

-- 5. Verify the column was added successfully
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'collections'
  AND column_name = 'parent_id';

-- 6. Show all collections with the new parent_id column
SELECT
  id,
  name,
  slug,
  parent_id,
  CASE
    WHEN parent_id IS NULL THEN 'Parent Collection'
    ELSE 'Child Collection'
  END AS collection_type,
  is_active,
  is_featured
FROM collections
ORDER BY created_at DESC;

-- Done! The hierarchical collection system is now ready.
