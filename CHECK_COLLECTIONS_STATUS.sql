-- ========================================
-- فحص شامل لحالة الكولكشنات
-- ========================================

-- 1️⃣ عرض جميع الكولكشنات مع تفاصيلها
SELECT
  name AS "اسم الكولكشن",
  slug AS "الرابط",
  CASE
    WHEN image_url IS NOT NULL THEN '✅ موجودة'
    ELSE '❌ غير موجودة'
  END AS "الصورة",
  CASE
    WHEN is_featured THEN '⭐ مميز'
    ELSE '⚪ عادي'
  END AS "مميز؟",
  CASE
    WHEN is_active THEN '👁️ نشط'
    ELSE '🔒 مخفي'
  END AS "نشط؟",
  display_type AS "نوع الكارد"
FROM collections
ORDER BY created_at DESC;

-- 2️⃣ إحصائيات سريعة
SELECT
  COUNT(*) AS "إجمالي الكولكشنات",
  SUM(CASE WHEN image_url IS NOT NULL THEN 1 ELSE 0 END) AS "عدد الكولكشنات بصور",
  SUM(CASE WHEN image_url IS NULL THEN 1 ELSE 0 END) AS "عدد الكولكشنات بدون صور",
  SUM(CASE WHEN is_featured THEN 1 ELSE 0 END) AS "عدد الكولكشنات المميزة",
  SUM(CASE WHEN is_active THEN 1 ELSE 0 END) AS "عدد الكولكشنات النشطة"
FROM collections;

-- 3️⃣ الكولكشنات التي ستظهر في الصفحة الرئيسية
SELECT
  name AS "سيظهر في الصفحة الرئيسية",
  display_type AS "نوع الكارد",
  CASE
    WHEN image_url IS NOT NULL THEN 'بصورة ✅'
    ELSE 'خلفية سوداء ⬛'
  END AS "العرض"
FROM collections
WHERE is_featured = true AND is_active = true
ORDER BY
  CASE WHEN display_type = 'large' THEN 1 ELSE 2 END,
  created_at DESC;

-- 4️⃣ الكولكشنات التي ستظهر في السايد بار فقط
SELECT
  name AS "سيظهر في السايد بار فقط"
FROM collections
WHERE is_active = true AND is_featured = false
ORDER BY created_at DESC;

-- 5️⃣ الكولكشنات المخفية تماماً
SELECT
  name AS "مخفي تماماً (لن يظهر)"
FROM collections
WHERE is_active = false
ORDER BY created_at DESC;
