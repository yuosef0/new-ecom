-- ========================================
-- إضافة صور تجريبية للكولكشنات (للاختبار)
-- ========================================

-- الخطوة 1: التحقق من الكولكشنات الموجودة
SELECT id, name, slug, image_url, is_featured, is_active
FROM collections
ORDER BY created_at DESC;

-- الخطوة 2: إضافة صور للكولكشنات حسب الـ slug
-- (استبدل الـ slugs بالموجودة عندك)

UPDATE collections
SET image_url = 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=400&fit=crop'
WHERE slug = 'track-suits';

UPDATE collections
SET image_url = 'https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=800&h=400&fit=crop'
WHERE slug = 'sets';

UPDATE collections
SET image_url = 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=400&fit=crop'
WHERE slug = 'sweatpants';

UPDATE collections
SET image_url = 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&h=400&fit=crop'
WHERE slug = 'blankets';

UPDATE collections
SET image_url = 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=400&fit=crop'
WHERE slug = 'hoodies-collection';

UPDATE collections
SET image_url = 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=400&fit=crop'
WHERE slug = 'winter-sale';

-- الخطوة 3: التحقق من التحديثات
SELECT id, name, slug, image_url, is_featured, is_active
FROM collections
WHERE image_url IS NOT NULL
ORDER BY created_at DESC;

-- ملاحظة: هذه صور تجريبية فقط
-- لإضافة صورك الخاصة، استخدم لوحة الإدارة /admin/collections
