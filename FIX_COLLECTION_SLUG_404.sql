-- ========================================
-- فحص وإصلاح مشكلة 404 في صفحات الـ Collections
-- Diagnose and Fix Collection 404 Issues
-- ========================================

-- 1️⃣ عرض الـ Collections اللي بتظهر في الصفحة الرئيسية مع الـ slugs بتاعتها
-- ========================================================================
SELECT
  name AS "Collection Name",
  slug AS "URL Slug",
  'localhost:3000/collections/' || slug AS "Full URL",
  CASE
    WHEN slug LIKE '% %' THEN '❌ Has spaces!'
    WHEN slug != LOWER(slug) THEN '❌ Has uppercase!'
    WHEN slug ~ '[^a-z0-9\-]' THEN '❌ Has special chars!'
    ELSE '✅ Valid slug'
  END AS "Slug Status",
  display_type
FROM collections
WHERE is_featured = true AND is_active = true
ORDER BY
  CASE WHEN display_type = 'large' THEN 1 ELSE 2 END,
  created_at DESC;

-- 2️⃣ فحص الـ slugs الغلط وإصلاحها
-- =====================================
-- عرض الـ Collections اللي عندها slugs غلط
SELECT
  id,
  name,
  slug AS "Current Slug (WRONG)",
  LOWER(TRIM(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s\-]', '', 'g'))) AS "Suggested Fix",
  LOWER(TRIM(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s\-]', '', 'g'), '\s+', '-', 'g'))) AS "Clean Slug"
FROM collections
WHERE
  slug LIKE '% %'  -- has spaces
  OR slug != LOWER(slug)  -- has uppercase
  OR slug ~ '[^a-z0-9\-]'  -- has special characters
ORDER BY created_at DESC;

-- 3️⃣ إصلاح جميع الـ slugs الغلط تلقائياً
-- =========================================
-- هذا السكريبت هيصلح كل الـ slugs عشان تكون صحيحة
UPDATE collections
SET slug = LOWER(
  TRIM(
    REGEXP_REPLACE(
      REGEXP_REPLACE(name, '[^a-zA-Z0-9\s\-]', '', 'g'),  -- حذف الحروف الخاصة
      '\s+', '-', 'g'  -- تحويل المسافات لـ dash
    )
  )
)
WHERE
  slug LIKE '% %'  -- has spaces
  OR slug != LOWER(slug)  -- has uppercase
  OR slug ~ '[^a-z0-9\-]';  -- has special characters

-- 4️⃣ التحقق من النتيجة بعد الإصلاح
-- ====================================
SELECT
  name AS "Collection",
  slug AS "Fixed Slug",
  '✅ Fixed! Visit: localhost:3000/collections/' || slug AS "Status"
FROM collections
WHERE is_featured = true AND is_active = true
ORDER BY created_at DESC;

-- 5️⃣ إصلاح slug محدد يدوياً
-- =============================
-- لو عايز تصلح slug معين بنفسك:
-- UPDATE collections
-- SET slug = 'correct-slug-here'
-- WHERE name = 'Collection Name Here';

-- مثال:
-- UPDATE collections
-- SET slug = 'winter-collection'
-- WHERE name = 'Winter Collection';

-- 6️⃣ التأكد من عدم وجود slugs مكررة
-- ======================================
SELECT
  slug,
  COUNT(*) AS "Count",
  STRING_AGG(name, ', ') AS "Collections with same slug"
FROM collections
GROUP BY slug
HAVING COUNT(*) > 1;
