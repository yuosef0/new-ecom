-- ========================================
-- فحص مشكلة: الكاردات ظاهرة لكن الصور مش بتظهر
-- ========================================

-- 1️⃣ فحص: هل الصور موجودة فعلاً في قاعدة البيانات؟
-- ================================================
SELECT
  id,
  name,
  slug,
  CASE
    WHEN image_url IS NOT NULL THEN '✅ موجودة'
    ELSE '❌ NULL'
  END AS "حالة الصورة",
  image_url AS "رابط الصورة",
  is_featured,
  is_active,
  display_type
FROM collections
WHERE is_active = true
ORDER BY created_at DESC;

-- 2️⃣ فحص: الكولكشنات المميزة (اللي المفروض تظهر في الصفحة الرئيسية)
-- =================================================================
SELECT
  name AS "الكولكشن",
  CASE
    WHEN image_url IS NOT NULL THEN '✅ نعم'
    ELSE '❌ لا'
  END AS "عنده صورة؟",
  LEFT(image_url, 60) AS "أول 60 حرف من الرابط",
  display_type AS "نوع الكارد"
FROM collections
WHERE is_featured = true AND is_active = true
ORDER BY
  CASE WHEN display_type = 'large' THEN 1 ELSE 2 END,
  created_at DESC;

-- 3️⃣ إحصائيات سريعة
-- =================
SELECT
  COUNT(*) AS "إجمالي الكولكشنات",
  SUM(CASE WHEN image_url IS NOT NULL THEN 1 ELSE 0 END) AS "عدد الكولكشنات بصور",
  SUM(CASE WHEN image_url IS NULL THEN 1 ELSE 0 END) AS "عدد الكولكشنات بدون صور",
  SUM(CASE WHEN is_featured = true AND is_active = true THEN 1 ELSE 0 END) AS "الكولكشنات المميزة (ستظهر)"
FROM collections;

-- 4️⃣ فحص: هل فيه مشكلة في نوع البيانات؟
-- =======================================
SELECT
  column_name AS "اسم العمود",
  data_type AS "نوع البيانات",
  is_nullable AS "يقبل NULL؟"
FROM information_schema.columns
WHERE table_name = 'collections'
  AND column_name IN ('id', 'name', 'image_url', 'is_featured', 'display_type', 'is_active')
ORDER BY ordinal_position;

-- 5️⃣ فحص: RLS Policies (Row Level Security)
-- =========================================
-- عرض جميع الـ policies على جدول collections
SELECT
  policyname AS "اسم الـ Policy",
  cmd AS "النوع",
  qual AS "الشرط",
  with_check AS "التحقق"
FROM pg_policies
WHERE tablename = 'collections';

-- 6️⃣ حل محتمل: التأكد من أن image_url ليس NULL لجميع الكولكشنات المميزة
-- ========================================================================
-- لو لقينا إن فيه كولكشنات مميزة بدون صور، نحطلهم صورة تجريبية

-- عرض الكولكشنات المميزة بدون صور
SELECT
  id,
  name,
  slug,
  'هذا الكولكشن مميز لكن بدون صورة' AS "المشكلة"
FROM collections
WHERE is_featured = true
  AND is_active = true
  AND image_url IS NULL;

-- لو عايز تضيف صور تجريبية للكولكشنات المميزة اللي مفيهاش صور:
-- (غير التعليق عن السطر التالي)
-- UPDATE collections
-- SET image_url = 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=400&fit=crop'
-- WHERE is_featured = true AND is_active = true AND image_url IS NULL;
