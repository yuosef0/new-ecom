-- ============================================
-- COMPLETE ADMIN DASHBOARD SETUP
-- ============================================
-- نسخ الملف ده كله وشغله في Supabase SQL Editor
-- بعد كده الـ Admin Dashboard هيشتغل 100%
-- ============================================

-- ============================================
-- 1. ADMIN ANALYTICS FUNCTION
-- ============================================

DROP FUNCTION IF EXISTS get_admin_stats();

CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON AS $$
DECLARE
  total_revenue DECIMAL;
  total_orders INTEGER;
  pending_orders INTEGER;
  total_customers INTEGER;
  total_products INTEGER;
  low_stock_count INTEGER;
  out_of_stock_count INTEGER;
  result JSON;
BEGIN
  SELECT COALESCE(SUM(total), 0) INTO total_revenue FROM orders
  WHERE status IN ('confirmed', 'processing', 'shipped', 'delivered');

  SELECT COUNT(*) INTO total_orders FROM orders;

  SELECT COUNT(*) INTO pending_orders FROM orders
  WHERE status IN ('pending', 'confirmed');

  SELECT COUNT(DISTINCT user_id) INTO total_customers FROM orders
  WHERE user_id IS NOT NULL;

  SELECT COUNT(*) INTO total_products FROM products WHERE is_active = true;

  SELECT COUNT(DISTINCT product_id) INTO low_stock_count FROM product_variants
  WHERE stock_quantity > 0 AND stock_quantity <= low_stock_threshold;

  SELECT COUNT(DISTINCT product_id) INTO out_of_stock_count FROM product_variants
  WHERE stock_quantity = 0;

  result := json_build_object(
    'total_revenue', total_revenue,
    'total_orders', total_orders,
    'pending_orders', pending_orders,
    'total_customers', total_customers,
    'total_products', total_products,
    'low_stock_count', low_stock_count,
    'out_of_stock_count', out_of_stock_count
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_admin_stats() TO authenticated;

-- ============================================
-- 2. SLIDER IMAGES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS slider_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_slider_images_display_order ON slider_images(display_order);
CREATE INDEX IF NOT EXISTS idx_slider_images_is_active ON slider_images(is_active);

ALTER TABLE slider_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active slider images" ON slider_images;
CREATE POLICY "Public can view active slider images"
  ON slider_images FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can do everything on slider images" ON slider_images;
CREATE POLICY "Admins can do everything on slider images"
  ON slider_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 3. TOP BAR MESSAGES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS top_bar_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_ar TEXT NOT NULL,
  message_en TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_top_bar_messages_display_order ON top_bar_messages(display_order);
CREATE INDEX IF NOT EXISTS idx_top_bar_messages_is_active ON top_bar_messages(is_active);

ALTER TABLE top_bar_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active top bar messages" ON top_bar_messages;
CREATE POLICY "Public can view active top bar messages"
  ON top_bar_messages FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can do everything on top bar messages" ON top_bar_messages;
CREATE POLICY "Admins can do everything on top bar messages"
  ON top_bar_messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 4. THEME SETTINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS theme_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  setting_label TEXT NOT NULL,
  setting_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO theme_settings (setting_key, setting_value, setting_label, setting_description)
VALUES
  ('primary_color', '#e60000', 'اللون الأساسي', 'اللون الأساسي للموقع'),
  ('primary_hover', '#cc0000', 'لون الـ Hover', 'لون الأزرار عند التمرير'),
  ('top_bar_bg', '#e60000', 'خلفية الشريط العلوي', 'لون خلفية الشريط العلوي'),
  ('button_text', '#ffffff', 'لون نص الأزرار', 'لون النص في الأزرار'),
  ('price_color', '#e60000', 'لون الأسعار', 'لون عرض الأسعار'),
  ('product_card_bg', '#ffffff', 'خلفية كارد المنتج', 'لون خلفية بطاقة المنتج')
ON CONFLICT (setting_key) DO NOTHING;

ALTER TABLE theme_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view theme settings" ON theme_settings;
CREATE POLICY "Public can view theme settings"
  ON theme_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can update theme settings" ON theme_settings;
CREATE POLICY "Admins can update theme settings"
  ON theme_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 5. REVIEWS TABLE
-- ============================================

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

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view approved reviews" ON reviews;
CREATE POLICY "Public can view approved reviews"
  ON reviews FOR SELECT
  USING (is_approved = true);

DROP POLICY IF EXISTS "Admins can do everything on reviews" ON reviews;
CREATE POLICY "Admins can do everything on reviews"
  ON reviews FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- 6. COUPONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL CHECK (discount_value > 0),
  min_purchase_amount DECIMAL(10,2) DEFAULT 0,
  max_discount_amount DECIMAL(10,2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_dates ON coupons(valid_from, valid_until);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active coupons" ON coupons;
CREATE POLICY "Public can view active coupons"
  ON coupons FOR SELECT
  USING (
    is_active = true
    AND valid_from <= NOW()
    AND (valid_until IS NULL OR valid_until >= NOW())
    AND (usage_limit IS NULL OR used_count < usage_limit)
  );

DROP POLICY IF EXISTS "Admins can do everything on coupons" ON coupons;
CREATE POLICY "Admins can do everything on coupons"
  ON coupons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 7. UPDATE PROFILES TABLE (ADD FULL_NAME IF NOT EXISTS)
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN full_name TEXT;
  END IF;
END $$;

-- ============================================
-- 8. VERIFY SETUP
-- ============================================

-- Test analytics function
SELECT get_admin_stats();

-- Check all tables exist
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'slider_images')
    THEN '✅ slider_images'
    ELSE '❌ slider_images'
  END as slider_table,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'top_bar_messages')
    THEN '✅ top_bar_messages'
    ELSE '❌ top_bar_messages'
  END as messages_table,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'theme_settings')
    THEN '✅ theme_settings'
    ELSE '❌ theme_settings'
  END as theme_table,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews')
    THEN '✅ reviews'
    ELSE '❌ reviews'
  END as reviews_table,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'coupons')
    THEN '✅ coupons'
    ELSE '❌ coupons'
  END as coupons_table;

-- ============================================
-- 🎉 SETUP COMPLETE!
-- ============================================
-- بعد ما تشغل الملف ده:
-- 1. روح على http://localhost:3000/admin
-- 2. هتشوف كل الصفحات شغالة
-- 3. Dashboard هيعرض الإحصائيات
-- 4. كل الصفحات الجديدة (Slider, Theme, Reviews, Coupons) هتشتغل
-- ============================================
