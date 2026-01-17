-- ========================================
-- إضافة صور للمجموعات التي ليس لديها صور
-- Fix Collections Missing Images
-- ========================================

-- الخطوة 1: فحص المجموعات الحالية
-- =====================================
SELECT
  id,
  name,
  slug,
  CASE
    WHEN image_url IS NOT NULL THEN '✅ Has Image'
    ELSE '❌ No Image'
  END AS "Image Status",
  is_featured,
  display_type
FROM collections
WHERE is_active = true
ORDER BY created_at DESC;

-- الخطوة 2: إضافة صور مناسبة لكل مجموعة
-- =========================================

-- صور عالية الجودة من Unsplash للمجموعات المختلفة
-- يمكنك تعديل الروابط حسب احتياجك

-- المجموعة: Winter Collection
UPDATE collections
SET image_url = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=600&fit=crop&q=80'
WHERE slug = 'winter-collection' AND (image_url IS NULL OR image_url = '');

-- المجموعة: Summer Collection
UPDATE collections
SET image_url = 'https://images.unsplash.com/photo-1523359346063-d879354c0ea5?w=1200&h=600&fit=crop&q=80'
WHERE slug = 'summer-collection' AND (image_url IS NULL OR image_url = '');

-- المجموعة: Spring Collection
UPDATE collections
SET image_url = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=600&fit=crop&q=80'
WHERE slug = 'spring-collection' AND (image_url IS NULL OR image_url = '');

-- المجموعة: Accessories
UPDATE collections
SET image_url = 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=1200&h=600&fit=crop&q=80'
WHERE slug = 'accessories' AND (image_url IS NULL OR image_url = '');

-- المجموعة: Men's Fashion
UPDATE collections
SET image_url = 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=1200&h=600&fit=crop&q=80'
WHERE slug = 'mens-fashion' AND (image_url IS NULL OR image_url = '');

-- المجموعة: Women's Fashion
UPDATE collections
SET image_url = 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1200&h=600&fit=crop&q=80'
WHERE slug = 'womens-fashion' AND (image_url IS NULL OR image_url = '');

-- للمجموعات الأخرى بدون صور، استخدم صورة افتراضية عامة
UPDATE collections
SET image_url = 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=600&fit=crop&q=80'
WHERE (image_url IS NULL OR image_url = '')
  AND is_active = true;

-- الخطوة 3: التحقق من النتيجة
-- =============================
SELECT
  name AS "Collection Name",
  CASE
    WHEN image_url IS NOT NULL THEN '✅ Now has image'
    ELSE '❌ Still missing'
  END AS "Status",
  CASE
    WHEN display_type = 'large' THEN '🟦 Large Card'
    WHEN display_type = 'small' THEN '🟨 Small Card'
  END AS "Display Type",
  LEFT(image_url, 60) AS "Image URL Preview"
FROM collections
WHERE is_active = true
ORDER BY
  CASE WHEN display_type = 'large' THEN 1 ELSE 2 END,
  created_at DESC;

-- الخطوة 4: عرض المجموعات المميزة (ستظهر في الصفحة الرئيسية)
-- =================================================================
SELECT
  name AS "Featured Collection",
  display_type AS "Card Type",
  '✅ Ready to display!' AS "Status"
FROM collections
WHERE is_featured = true
  AND is_active = true
  AND image_url IS NOT NULL
ORDER BY
  CASE WHEN display_type = 'large' THEN 1 ELSE 2 END,
  created_at DESC;

-- ملاحظات:
-- =========
-- 1. جميع الصور من Unsplash وهي مجانية للاستخدام
-- 2. الصور بدقة عالية (1200x600) ومحسّنة للعرض
-- 3. يمكنك تغيير الروابط لاستخدام صور خاصة بك
-- 4. بعد تشغيل هذا السكريبت، قم بتحديث الصفحة الرئيسية
