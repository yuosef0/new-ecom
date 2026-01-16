# 🗄️ إعداد قاعدة البيانات للـ Admin Dashboard

## نظرة عامة
هذا الملف يحتوي على جميع الـ SQL scripts المطلوبة لإنشاء الجداول الخاصة بـ Admin Dashboard.

---

## 📋 الجداول المطلوبة

### 1. Slider Images Table

```sql
-- جدول صور السلايدر
CREATE TABLE IF NOT EXISTS slider_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index للترتيب والبحث السريع
CREATE INDEX IF NOT EXISTS idx_slider_images_display_order ON slider_images(display_order);
CREATE INDEX IF NOT EXISTS idx_slider_images_is_active ON slider_images(is_active);

-- RLS Policies
ALTER TABLE slider_images ENABLE ROW LEVEL SECURITY;

-- السماح للجميع بالقراءة
CREATE POLICY "Public can view active slider images"
  ON slider_images FOR SELECT
  USING (is_active = true);

-- السماح للـ Admin بكل العمليات
CREATE POLICY "Admins can do everything on slider images"
  ON slider_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

### 2. Top Bar Messages Table

```sql
-- جدول رسائل الشريط العلوي
CREATE TABLE IF NOT EXISTS top_bar_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_ar TEXT NOT NULL,
  message_en TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_top_bar_messages_display_order ON top_bar_messages(display_order);
CREATE INDEX IF NOT EXISTS idx_top_bar_messages_is_active ON top_bar_messages(is_active);

-- RLS Policies
ALTER TABLE top_bar_messages ENABLE ROW LEVEL SECURITY;

-- السماح للجميع بقراءة الرسائل النشطة
CREATE POLICY "Public can view active top bar messages"
  ON top_bar_messages FOR SELECT
  USING (is_active = true);

-- السماح للـ Admin بكل العمليات
CREATE POLICY "Admins can do everything on top bar messages"
  ON top_bar_messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

### 3. Theme Settings Table

```sql
-- جدول إعدادات الألوان والثيم
CREATE TABLE IF NOT EXISTS theme_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  setting_label TEXT NOT NULL,
  setting_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default theme settings
INSERT INTO theme_settings (setting_key, setting_value, setting_label, setting_description)
VALUES
  ('primary_color', '#e60000', 'اللون الأساسي', 'اللون الأساسي للموقع'),
  ('primary_hover', '#cc0000', 'لون الـ Hover', 'لون الأزرار عند التمرير'),
  ('top_bar_bg', '#e60000', 'خلفية الشريط العلوي', 'لون خلفية الشريط العلوي'),
  ('button_text', '#ffffff', 'لون نص الأزرار', 'لون النص في الأزرار'),
  ('price_color', '#e60000', 'لون الأسعار', 'لون عرض الأسعار'),
  ('product_card_bg', '#ffffff', 'خلفية كارد المنتج', 'لون خلفية بطاقة المنتج')
ON CONFLICT (setting_key) DO NOTHING;

-- RLS Policies
ALTER TABLE theme_settings ENABLE ROW LEVEL SECURITY;

-- السماح للجميع بالقراءة
CREATE POLICY "Public can view theme settings"
  ON theme_settings FOR SELECT
  USING (true);

-- السماح للـ Admin بالتحديث فقط
CREATE POLICY "Admins can update theme settings"
  ON theme_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

### 4. Reviews Table

```sql
-- جدول التقييمات
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- RLS Policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- السماح للجميع بقراءة التقييمات المعتمدة
CREATE POLICY "Public can view approved reviews"
  ON reviews FOR SELECT
  USING (is_approved = true);

-- السماح للمستخدمين المسجلين بإضافة تقييمات
CREATE POLICY "Authenticated users can insert reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- السماح للـ Admin بكل العمليات
CREATE POLICY "Admins can do everything on reviews"
  ON reviews FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

### 5. تحديث جدول Coupons (إذا لم يكن موجوداً)

```sql
-- جدول الكوبونات (إذا لم يكن موجوداً)
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_purchase_amount DECIMAL(10,2) DEFAULT 0,
  max_discount_amount DECIMAL(10,2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_until ON coupons(valid_until);

-- RLS Policies
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- السماح للجميع بقراءة الكوبونات النشطة
CREATE POLICY "Public can view active coupons"
  ON coupons FOR SELECT
  USING (is_active = true AND (valid_until IS NULL OR valid_until > NOW()));

-- السماح للـ Admin بكل العمليات
CREATE POLICY "Admins can do everything on coupons"
  ON coupons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## 🔍 Verification Queries

بعد تشغيل الـ SQL scripts، استخدم هذه الاستعلامات للتحقق:

```sql
-- التحقق من وجود الجداول
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'slider_images',
    'top_bar_messages',
    'theme_settings',
    'reviews',
    'coupons'
  )
ORDER BY table_name;

-- التحقق من عدد السجلات
SELECT
  (SELECT COUNT(*) FROM slider_images) as slider_count,
  (SELECT COUNT(*) FROM top_bar_messages) as messages_count,
  (SELECT COUNT(*) FROM theme_settings) as settings_count,
  (SELECT COUNT(*) FROM reviews) as reviews_count,
  (SELECT COUNT(*) FROM coupons) as coupons_count;

-- التحقق من إعدادات الثيم الافتراضية
SELECT setting_key, setting_value, setting_label
FROM theme_settings
ORDER BY setting_key;
```

---

## 📝 ملاحظات

1. **RLS Policies**: جميع الجداول محمية بـ Row Level Security
2. **Indexes**: تم إنشاء indexes على الأعمدة المستخدمة بكثرة
3. **Foreign Keys**: جدول التقييمات مرتبط بجدول المنتجات
4. **Default Values**: تم تعيين قيم افتراضية مناسبة
5. **Theme Settings**: يتم إدراج الإعدادات الافتراضية تلقائياً

---

## 🚀 الخطوات التالية

بعد تشغيل الـ SQL scripts:

1. ✅ تحقق من إنشاء الجداول
2. ✅ تحقق من إعدادات الثيم الافتراضية
3. ✅ أضف صور للسلايدر من `/admin/slider`
4. ✅ أضف رسائل للشريط العلوي من `/admin/top-bar-messages`
5. ✅ اختبر التقييمات من صفحات المنتجات
6. ✅ أنشئ كوبونات من `/admin/coupons`

---

## 🔧 استكشاف الأخطاء

### مشكلة: "relation does not exist"
**الحل:** تأكد من تشغيل جميع الـ SQL scripts بالترتيب

### مشكلة: "permission denied for table"
**الحل:** تحقق من أن المستخدم admin في جدول profiles

### مشكلة: "duplicate key value"
**الحل:** قد تكون الإعدادات موجودة بالفعل، استخدم ON CONFLICT

---

**🎉 بعد إكمال الإعداد، ستكون لديك لوحة تحكم كاملة وجاهزة للاستخدام!**
