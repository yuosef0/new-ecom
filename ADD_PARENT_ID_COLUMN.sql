-- ========================================
-- إضافة عمود parent_id لجدول Collections
-- Add parent_id column to Collections table
-- ========================================

-- 1️⃣ إضافة عمود parent_id
-- Add parent_id column (allows null for parent collections)
ALTER TABLE collections
ADD COLUMN IF NOT EXISTS parent_id UUID NULL;

-- 2️⃣ إضافة Foreign Key Constraint
-- Add foreign key to reference parent collection
ALTER TABLE collections
ADD CONSTRAINT fk_parent_collection
FOREIGN KEY (parent_id)
REFERENCES collections(id)
ON DELETE SET NULL;

-- 3️⃣ إضافة Index للأداء
-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_collections_parent_id
ON collections(parent_id);

-- 4️⃣ إضافة Check Constraint لمنع Circular Dependencies
-- Prevent a collection from being its own parent
ALTER TABLE collections
ADD CONSTRAINT chk_not_self_parent
CHECK (parent_id != id);

-- 5️⃣ التحقق من النتيجة
-- Verify the column was added successfully
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'collections'
  AND column_name = 'parent_id';

-- 6️⃣ عرض جميع الـ Collections مع الـ parent_id الجديد
-- Show all collections with the new parent_id column
SELECT
  id,
  name,
  slug,
  parent_id,
  CASE
    WHEN parent_id IS NULL THEN '✅ Parent Collection'
    ELSE '📁 Child Collection'
  END AS "Type",
  is_active,
  is_featured
FROM collections
ORDER BY created_at DESC;

-- ملاحظة:
-- بعد تشغيل هذا السكريبت، النظام الهرمي هيشتغل بشكل صحيح
-- After running this script, the hierarchical system will work correctly
