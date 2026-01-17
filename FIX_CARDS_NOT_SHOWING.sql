-- ========================================
-- حل مشكلة عدم ظهور الكاردات في الصفحة الرئيسية
-- رغم وجود الصور في قاعدة البيانات
-- ========================================

-- الخطوة 1: فحص المشكلة
-- ======================
SELECT
  name AS "اسم الكولكشن",
  slug AS "الرابط",
  CASE
    WHEN image_url IS NOT NULL THEN '✅ موجودة'
    ELSE '❌ مفقودة'
  END AS "الصورة",
  CASE
    WHEN is_featured = true THEN '✅ نعم'
    WHEN is_featured = false THEN '❌ لا'
    ELSE '⚠️ NULL'
  END AS "مميز؟",
  CASE
    WHEN display_type = 'large' THEN '🟦 كبير'
    WHEN display_type = 'small' THEN '🟨 صغير'
    ELSE '❌ NULL أو غير صحيح'
  END AS "نوع الكارد",
  CASE
    WHEN is_featured = true AND display_type IN ('large', 'small') THEN '✅ سيظهر'
    ELSE '❌ لن يظهر - المشكلة هنا!'
  END AS "الحالة"
FROM collections
WHERE is_active = true
ORDER BY created_at DESC;

-- الخطوة 2: إصلاح المشكلة
-- =======================

-- تأكد من أن is_featured = true لجميع الكولكشنات النشطة
UPDATE collections
SET is_featured = true
WHERE is_active = true;

-- تأكد من أن display_type له قيمة صحيحة
-- سنضع القيمة 'large' لأي كولكشن مفيش له display_type
UPDATE collections
SET display_type = 'large'
WHERE display_type IS NULL OR display_type NOT IN ('large', 'small');

-- الخطوة 3: التحقق من الإصلاح
-- ============================
SELECT
  name AS "الكولكشنات التي ستظهر الآن",
  CASE
    WHEN display_type = 'large' THEN '🟦 كارد كبير (كامل العرض)'
    WHEN display_type = 'small' THEN '🟨 كارد صغير (سكرول)'
  END AS "نوع العرض",
  CASE
    WHEN image_url IS NOT NULL THEN '✅ بصورة'
    ELSE '⬛ خلفية سوداء'
  END AS "الشكل"
FROM collections
WHERE is_featured = true AND is_active = true
ORDER BY
  CASE WHEN display_type = 'large' THEN 1 ELSE 2 END,
  created_at DESC;

-- ملاحظة مهمة:
-- ============
-- بعد تشغيل هذا السكريبت، افتح الصفحة الرئيسية واعمل Refresh
-- لو لسه مش ظاهرة، أعد تشغيل السيرفر (npm run dev)
