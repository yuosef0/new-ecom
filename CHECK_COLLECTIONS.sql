-- ========================================
-- فحص كل الـ Collections الموجودة
-- Check All Collections
-- ========================================

-- 1️⃣ عرض كل الـ Collections (Active وغير Active)
-- ================================================
SELECT
  id,
  name,
  slug,
  CASE
    WHEN is_active = true THEN '✅ Active'
    ELSE '❌ Inactive'
  END AS "Status",
  CASE
    WHEN is_featured = true THEN '⭐ Featured'
    ELSE '📦 Normal'
  END AS "Featured?",
  display_type AS "Display Type",
  image_url AS "Image URL",
  created_at AS "Created At"
FROM collections
ORDER BY created_at DESC;

-- 2️⃣ عرض الـ Collections اللي هتظهر في الصفحة الرئيسية
-- =========================================================
SELECT
  name AS "Collection Name",
  slug AS "URL Slug",
  display_type AS "Card Size",
  CASE
    WHEN image_url IS NOT NULL THEN '✅ Has Image'
    ELSE '❌ No Image'
  END AS "Image?"
FROM collections
WHERE is_active = true AND is_featured = true
ORDER BY
  CASE WHEN display_type = 'large' THEN 1 ELSE 2 END,
  created_at DESC;

-- 3️⃣ فحص Collection معين بالـ slug
-- ===================================
-- غيّر 'your-slug-here' بالـ slug اللي عايز تفحصه
SELECT
  *
FROM collections
WHERE slug = 'your-slug-here';

-- 4️⃣ تفعيل collection معين
-- ==========================
-- لو Collection موجود بس مش active، استخدم ده:
-- UPDATE collections
-- SET is_active = true
-- WHERE slug = 'your-slug-here';

-- 5️⃣ إحصائيات سريعة
-- ===================
SELECT
  COUNT(*) AS "Total Collections",
  SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) AS "Active",
  SUM(CASE WHEN is_active = false THEN 1 ELSE 0 END) AS "Inactive",
  SUM(CASE WHEN is_featured = true THEN 1 ELSE 0 END) AS "Featured",
  SUM(CASE WHEN image_url IS NOT NULL THEN 1 ELSE 0 END) AS "With Images"
FROM collections;
