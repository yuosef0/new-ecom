-- ========================================
-- تحديث صور المجموعات بصور بسيطة من Unsplash
-- Update Collection Images with Simple Unsplash URLs
-- ========================================

-- صور بسيطة ومضمونة من Unsplash (بدون معاملات معقدة)

-- 1. صورة افتراضية لجميع المجموعات أولاً
UPDATE collections
SET image_url = 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04'
WHERE is_active = true;

-- 2. صور محددة لكل نوع من المجموعات

-- Hoodies
UPDATE collections
SET image_url = 'https://images.unsplash.com/photo-1556821840-3a63f95609a7'
WHERE name = 'Hoodies' OR slug LIKE '%hoodie%';

-- Winter Sale
UPDATE collections
SET image_url = 'https://images.unsplash.com/photo-1483985988355-763728e1935b'
WHERE name = 'Winter Sale' OR slug LIKE '%winter%';

-- Blankets
UPDATE collections
SET image_url = 'https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5'
WHERE name = 'Blankets' OR slug LIKE '%blanket%';

-- Sweatpants
UPDATE collections
SET image_url = 'https://images.unsplash.com/photo-1608748010899-18f300247112'
WHERE name = 'Sweatpants' OR slug LIKE '%sweatpant%';

-- Track Suits
UPDATE collections
SET image_url = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f'
WHERE name = 'Track Suits' OR slug LIKE '%track%';

-- Sets
UPDATE collections
SET image_url = 'https://images.unsplash.com/photo-1523359346063-d879354c0ea5'
WHERE name = 'Sets' OR slug LIKE '%set%';

-- التحقق من النتيجة
SELECT
  name AS "المجموعة",
  CASE
    WHEN image_url IS NOT NULL THEN '✅'
    ELSE '❌'
  END AS "حالة",
  LEFT(image_url, 60) AS "الرابط"
FROM collections
WHERE is_featured = true AND is_active = true
ORDER BY
  CASE WHEN display_type = 'large' THEN 1 ELSE 2 END,
  created_at DESC;
