-- ========================================
-- Add parent_id column to Collections table
-- ========================================
-- This migration adds hierarchical collection support
-- Safe to run multiple times - checks if already exists

-- 1. Add parent_id column (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'collections' AND column_name = 'parent_id'
  ) THEN
    ALTER TABLE collections ADD COLUMN parent_id UUID NULL;
    RAISE NOTICE 'Column parent_id added successfully';
  ELSE
    RAISE NOTICE 'Column parent_id already exists';
  END IF;
END $$;

-- 2. Add foreign key constraint (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_parent_collection'
    AND table_name = 'collections'
  ) THEN
    ALTER TABLE collections
    ADD CONSTRAINT fk_parent_collection
    FOREIGN KEY (parent_id)
    REFERENCES collections(id)
    ON DELETE SET NULL;
    RAISE NOTICE 'Foreign key constraint added successfully';
  ELSE
    RAISE NOTICE 'Foreign key constraint already exists';
  END IF;
END $$;

-- 3. Add index (if not exists)
CREATE INDEX IF NOT EXISTS idx_collections_parent_id
ON collections(parent_id);

-- 4. Add check constraint (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'chk_not_self_parent'
    AND table_name = 'collections'
  ) THEN
    ALTER TABLE collections
    ADD CONSTRAINT chk_not_self_parent
    CHECK (parent_id != id);
    RAISE NOTICE 'Check constraint added successfully';
  ELSE
    RAISE NOTICE 'Check constraint already exists';
  END IF;
END $$;

-- 5. Verify the setup
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'collections'
  AND column_name = 'parent_id';

-- 6. Show all collections
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

-- Migration complete! Safe to run multiple times.
