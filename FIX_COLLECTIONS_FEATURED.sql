-- ========================================
-- إصلاح مشكلة عدم ظهور الكولكشنات في الكاردات
-- ========================================

-- الخطوة 1: تغيير القيمة الافتراضية لـ is_featured لتكون true
-- هذا سيجعل أي كولكشن جديد يُضاف مميزاً تلقائياً
ALTER TABLE collections
ALTER COLUMN is_featured SET DEFAULT true;

-- الخطوة 2: تحديث جميع الكولكشنات الموجودة لتصبح مميزة
-- هذا سيصلح الكولكشنات الحالية
UPDATE collections
SET is_featured = true
WHERE is_active = true;

-- الخطوة 3: التحقق من النتائج
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

-- ✅ بعد تنفيذ هذا السكريبت:
-- 1. جميع الكولكشنات الموجودة ستظهر في الكاردات
-- 2. أي كولكشن جديد تضيفه سيظهر في الكاردات تلقائياً
