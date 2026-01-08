-- ============================================
-- DXLR E-Commerce Platform - RLS Policies
-- Migration 002
-- ============================================

-- Enable RLS on ALL tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (is_admin());

-- ============================================
-- ADDRESSES POLICIES
-- ============================================

-- Users can manage their own addresses
CREATE POLICY "Users can read own addresses"
  ON addresses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses"
  ON addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
  ON addresses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
  ON addresses FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- CATEGORIES POLICIES (Public Read)
-- ============================================

-- Anyone can read active categories
CREATE POLICY "Public can read active categories"
  ON categories FOR SELECT
  USING (is_active = true);

-- Admins can read all categories
CREATE POLICY "Admins can read all categories"
  ON categories FOR SELECT
  USING (is_admin());

-- Admins can manage categories
CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  USING (is_admin());

-- ============================================
-- COLLECTIONS POLICIES (Public Read)
-- ============================================

-- Anyone can read active collections
CREATE POLICY "Public can read active collections"
  ON collections FOR SELECT
  USING (is_active = true);

-- Admins can read all collections
CREATE POLICY "Admins can read all collections"
  ON collections FOR SELECT
  USING (is_admin());

-- Admins can manage collections
CREATE POLICY "Admins can insert collections"
  ON collections FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update collections"
  ON collections FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete collections"
  ON collections FOR DELETE
  USING (is_admin());

-- ============================================
-- PRODUCTS POLICIES (Public Read)
-- ============================================

-- Anyone can read active products
CREATE POLICY "Public can read active products"
  ON products FOR SELECT
  USING (is_active = true);

-- Admins can read all products
CREATE POLICY "Admins can read all products"
  ON products FOR SELECT
  USING (is_admin());

-- Admins can manage products
CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  USING (is_admin());

-- ============================================
-- PRODUCT_COLLECTIONS POLICIES
-- ============================================

-- Public read (join table)
CREATE POLICY "Public can read product_collections"
  ON product_collections FOR SELECT
  USING (true);

-- Admins can manage
CREATE POLICY "Admins can manage product_collections"
  ON product_collections FOR ALL
  USING (is_admin());

-- ============================================
-- PRODUCT_IMAGES POLICIES
-- ============================================

-- Public read
CREATE POLICY "Public can read product_images"
  ON product_images FOR SELECT
  USING (true);

-- Admins can manage
CREATE POLICY "Admins can manage product_images"
  ON product_images FOR ALL
  USING (is_admin());

-- ============================================
-- SIZES POLICIES (Public Read)
-- ============================================

CREATE POLICY "Public can read sizes"
  ON sizes FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage sizes"
  ON sizes FOR ALL
  USING (is_admin());

-- ============================================
-- COLORS POLICIES (Public Read)
-- ============================================

CREATE POLICY "Public can read colors"
  ON colors FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage colors"
  ON colors FOR ALL
  USING (is_admin());

-- ============================================
-- PRODUCT_VARIANTS POLICIES
-- ============================================

-- Public can read active variants of active products
CREATE POLICY "Public can read active variants"
  ON product_variants FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_variants.product_id
      AND products.is_active = true
    )
  );

-- Admins can read all
CREATE POLICY "Admins can read all variants"
  ON product_variants FOR SELECT
  USING (is_admin());

-- Admins can manage
CREATE POLICY "Admins can manage variants"
  ON product_variants FOR ALL
  USING (is_admin());

-- ============================================
-- WISHLIST_ITEMS POLICIES
-- ============================================

CREATE POLICY "Users can read own wishlist"
  ON wishlist_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to own wishlist"
  ON wishlist_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from own wishlist"
  ON wishlist_items FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- ORDERS POLICIES
-- ============================================

-- Users can read their own orders
CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create orders (for themselves or as guest)
CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR (user_id IS NULL AND guest_email IS NOT NULL)
  );

-- Admins can read all orders
CREATE POLICY "Admins can read all orders"
  ON orders FOR SELECT
  USING (is_admin());

-- Admins can update orders
CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  USING (is_admin());

-- ============================================
-- ORDER_ITEMS POLICIES
-- ============================================

-- Users can read items of their own orders
CREATE POLICY "Users can read own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Admins can read all
CREATE POLICY "Admins can read all order items"
  ON order_items FOR SELECT
  USING (is_admin());

-- Insert allowed during order creation (via service role)
-- No direct insert policy for users

-- ============================================
-- ORDER_TRACKING POLICIES
-- ============================================

-- Users can read tracking for their orders
CREATE POLICY "Users can read own order tracking"
  ON order_tracking FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_tracking.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Admins can manage
CREATE POLICY "Admins can manage order tracking"
  ON order_tracking FOR ALL
  USING (is_admin());

-- ============================================
-- PROMO_CODES POLICIES
-- ============================================

-- Public can read active promo codes (for validation)
CREATE POLICY "Public can read active promo codes"
  ON promo_codes FOR SELECT
  USING (
    is_active = true
    AND (starts_at IS NULL OR starts_at <= NOW())
    AND (expires_at IS NULL OR expires_at > NOW())
  );

-- Admins can manage
CREATE POLICY "Admins can manage promo codes"
  ON promo_codes FOR ALL
  USING (is_admin());

-- ============================================
-- SITE_SETTINGS POLICIES
-- ============================================

-- Public can read settings
CREATE POLICY "Public can read site settings"
  ON site_settings FOR SELECT
  USING (true);

-- Admins can update settings
CREATE POLICY "Admins can update site settings"
  ON site_settings FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can insert site settings"
  ON site_settings FOR INSERT
  WITH CHECK (is_admin());
