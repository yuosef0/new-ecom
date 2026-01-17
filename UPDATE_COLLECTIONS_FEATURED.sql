-- تحديث جميع الكولكشنات الموجودة لتصبح مميزة (is_featured = true)
-- هذا سيجعلها تظهر في الكاردات بالصفحة الرئيسية

-- تحديث جميع الكولكشنات النشطة لتصبح مميزة
UPDATE collections
SET is_featured = true
WHERE is_active = true;

-- عرض النتائج
SELECT
  id,
  name,
  slug,
  display_type,
  is_featured,
  is_active,
  created_at
FROM collections
ORDER BY display_type DESC, created_at DESC;
