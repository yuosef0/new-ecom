-- إضافة الحقول المطلوبة لجدول collections
ALTER TABLE collections
ADD COLUMN IF NOT EXISTS display_type TEXT DEFAULT 'large' CHECK (display_type IN ('small', 'large'));

ALTER TABLE collections
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- إنشاء index للترتيب
CREATE INDEX IF NOT EXISTS idx_collections_sort_order ON collections(sort_order);
CREATE INDEX IF NOT EXISTS idx_collections_display_type ON collections(display_type);

-- RLS Policies
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- حذف الـ policies القديمة إن وجدت
DROP POLICY IF EXISTS "Public can view active collections" ON collections;
DROP POLICY IF EXISTS "Admins can do everything on collections" ON collections;

-- السماح للجميع بقراءة الـ collections النشطة
CREATE POLICY "Public can view active collections"
  ON collections FOR SELECT
  TO public
  USING (is_active = true);

-- السماح للـ Admin بكل العمليات
CREATE POLICY "Admins can do everything on collections"
  ON collections FOR ALL
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- التحقق من النجاح
SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'collections'
ORDER BY ordinal_position;
