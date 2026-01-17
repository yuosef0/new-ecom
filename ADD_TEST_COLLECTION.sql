-- ========================================
-- إضافة Collection تجريبي للاختبار
-- Add Test Collection
-- ========================================

-- إضافة collection جديد مع كل الإعدادات الصحيحة
INSERT INTO collections (
  name,
  slug,
  description,
  image_url,
  is_active,
  is_featured,
  display_type
) VALUES (
  'Test Collection',                                              -- الاسم
  'test-collection',                                              -- الـ slug (لازم يكون unique)
  'This is a test collection to verify the page is working',      -- الوصف
  'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04', -- صورة تجريبية
  true,                                                           -- Active ✅
  true,                                                           -- Featured ✅
  'large'                                                         -- كارد كبير
);

-- التحقق من إضافة الـ Collection
SELECT
  name,
  slug,
  '✅ Successfully added!' AS "Status",
  'Visit: /collections/' || slug AS "URL"
FROM collections
WHERE slug = 'test-collection';

-- ملحوظة:
-- بعد تشغيل هذا السكريبت، روح على:
-- http://localhost:3000/collections/test-collection
-- المفروض الصفحة تفتح بدون 404
