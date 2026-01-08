# Database Migrations

> **Execution Order:** Run migrations in numerical order (001 → 002 → 003 → 004)
> **Where to Run:** Supabase Dashboard → SQL Editor, or via Supabase CLI

---

## Migration 001: Initial Schema

**File:** `supabase/migrations/001_initial_schema.sql`

```sql
-- ============================================
-- DXLR E-Commerce Platform - Initial Schema
-- Migration 001
-- ============================================

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES (extends auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- ADDRESSES
-- ============================================
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  governorate TEXT NOT NULL,
  postal_code TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CATEGORIES
-- ============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COLLECTIONS
-- ============================================
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRODUCTS
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  base_price DECIMAL(10,2) NOT NULL CHECK (base_price >= 0),
  compare_at_price DECIMAL(10,2) CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRODUCT COLLECTIONS (Junction Table)
-- ============================================
CREATE TABLE product_collections (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, collection_id)
);

-- ============================================
-- PRODUCT IMAGES
-- ============================================
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT false
);

-- ============================================
-- SIZES
-- ============================================
CREATE TABLE sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  sort_order INT DEFAULT 0
);

-- Insert default sizes
INSERT INTO sizes (name, sort_order) VALUES
  ('XS', 1),
  ('S', 2),
  ('M', 3),
  ('L', 4),
  ('XL', 5),
  ('XXL', 6);

-- ============================================
-- COLORS
-- ============================================
CREATE TABLE colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  hex_code TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

-- Insert default colors
INSERT INTO colors (name, hex_code, sort_order) VALUES
  ('Black', '#000000', 1),
  ('White', '#FFFFFF', 2),
  ('Navy', '#1E3A5F', 3),
  ('Burgundy', '#6F1D2A', 4),
  ('Gray', '#6B7280', 5),
  ('Charcoal', '#1E1E1E', 6);

-- ============================================
-- PRODUCT VARIANTS
-- ============================================
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size_id UUID REFERENCES sizes(id) ON DELETE SET NULL,
  color_id UUID REFERENCES colors(id) ON DELETE SET NULL,
  sku TEXT UNIQUE,
  price_adjustment DECIMAL(10,2) DEFAULT 0,
  stock_quantity INT DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold INT DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(product_id, size_id, color_id)
);

-- ============================================
-- WISHLIST ITEMS
-- ============================================
CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id, variant_id)
);

-- ============================================
-- ORDERS
-- ============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  guest_email TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
  )),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN (
    'pending', 'paid', 'failed', 'refunded'
  )),
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  shipping_cost DECIMAL(10,2) DEFAULT 0 CHECK (shipping_cost >= 0),
  discount_amount DECIMAL(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
  total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  currency TEXT DEFAULT 'EGP',

  -- Shipping snapshot
  shipping_name TEXT NOT NULL,
  shipping_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_governorate TEXT NOT NULL,

  -- Payment details
  paymob_order_id TEXT,
  paymob_transaction_id TEXT,
  payment_method TEXT,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Require either user_id or guest_email
  CONSTRAINT order_customer_check CHECK (user_id IS NOT NULL OR guest_email IS NOT NULL)
);

-- ============================================
-- ORDER ITEMS
-- ============================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,

  -- Snapshot at time of order
  product_name TEXT NOT NULL,
  variant_name TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  quantity INT NOT NULL CHECK (quantity > 0),
  total DECIMAL(10,2) NOT NULL CHECK (total >= 0)
);

-- ============================================
-- ORDER TRACKING
-- ============================================
CREATE TABLE order_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROMO CODES
-- ============================================
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL CHECK (discount_value > 0),
  min_order_amount DECIMAL(10,2),
  max_uses INT,
  used_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SITE SETTINGS
-- ============================================
CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO site_settings (key, value) VALUES
  ('shipping', '{"standard": {"name": "Standard Delivery", "price": 50, "days": "3-7"}, "express": {"name": "Express Delivery", "price": 100, "days": "1-2"}}'),
  ('store', '{"name": "DXLR", "currency": "EGP", "email": "support@dxlr-eg.com"}');

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Migration 002: RLS Policies

**File:** `supabase/migrations/002_rls_policies.sql`

```sql
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
```

---

## Migration 003: Indexes

**File:** `supabase/migrations/003_indexes.sql`

```sql
-- ============================================
-- DXLR E-Commerce Platform - Indexes
-- Migration 003
-- ============================================

-- ============================================
-- PRODUCTS INDEXES
-- ============================================
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_created ON products(created_at DESC);

-- Full-text search (simple tokenizer for mixed content)
CREATE INDEX idx_products_search ON products
  USING GIN(to_tsvector('simple', name || ' ' || COALESCE(description, '')));

-- ============================================
-- PRODUCT VARIANTS INDEXES
-- ============================================
CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_stock ON product_variants(stock_quantity);
CREATE INDEX idx_variants_low_stock ON product_variants(product_id)
  WHERE stock_quantity <= low_stock_threshold AND stock_quantity > 0;
CREATE INDEX idx_variants_out_of_stock ON product_variants(product_id)
  WHERE stock_quantity = 0;

-- ============================================
-- ORDERS INDEXES
-- ============================================
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_paymob ON orders(paymob_order_id) WHERE paymob_order_id IS NOT NULL;

-- ============================================
-- ORDER ITEMS INDEXES
-- ============================================
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ============================================
-- CATEGORIES INDEXES
-- ============================================
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active);

-- ============================================
-- COLLECTIONS INDEXES
-- ============================================
CREATE INDEX idx_collections_slug ON collections(slug);
CREATE INDEX idx_collections_featured ON collections(is_featured) WHERE is_featured = true;
CREATE INDEX idx_collections_active ON collections(is_active);

-- ============================================
-- WISHLIST INDEXES
-- ============================================
CREATE INDEX idx_wishlist_user ON wishlist_items(user_id);
CREATE INDEX idx_wishlist_product ON wishlist_items(product_id);

-- ============================================
-- ADDRESSES INDEXES
-- ============================================
CREATE INDEX idx_addresses_user ON addresses(user_id);
CREATE INDEX idx_addresses_default ON addresses(user_id) WHERE is_default = true;

-- ============================================
-- PRODUCT IMAGES INDEXES
-- ============================================
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_product_images_primary ON product_images(product_id) WHERE is_primary = true;

-- ============================================
-- PROMO CODES INDEXES
-- ============================================
CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_codes_active ON promo_codes(is_active);
```

---

## Migration 004: Functions

**File:** `supabase/migrations/004_functions.sql`

```sql
-- ============================================
-- DXLR E-Commerce Platform - Database Functions
-- Migration 004
-- ============================================

-- ============================================
-- DECREMENT STOCK FUNCTION
-- Used after successful payment
-- ============================================
CREATE OR REPLACE FUNCTION decrement_stock(
  p_variant_id UUID,
  p_quantity INT
)
RETURNS BOOLEAN AS $$
DECLARE
  current_stock INT;
BEGIN
  -- Get current stock with row lock
  SELECT stock_quantity INTO current_stock
  FROM product_variants
  WHERE id = p_variant_id
  FOR UPDATE;

  -- Check if enough stock
  IF current_stock IS NULL THEN
    RAISE EXCEPTION 'Variant not found: %', p_variant_id;
  END IF;

  IF current_stock < p_quantity THEN
    RAISE EXCEPTION 'Insufficient stock for variant %: requested %, available %',
      p_variant_id, p_quantity, current_stock;
  END IF;

  -- Decrement stock
  UPDATE product_variants
  SET stock_quantity = stock_quantity - p_quantity
  WHERE id = p_variant_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INCREMENT PROMO CODE USAGE
-- ============================================
CREATE OR REPLACE FUNCTION increment_promo_usage(p_code TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  promo RECORD;
BEGIN
  SELECT * INTO promo
  FROM promo_codes
  WHERE code = p_code
  FOR UPDATE;

  IF promo IS NULL THEN
    RAISE EXCEPTION 'Promo code not found: %', p_code;
  END IF;

  IF promo.max_uses IS NOT NULL AND promo.used_count >= promo.max_uses THEN
    RAISE EXCEPTION 'Promo code has reached maximum uses: %', p_code;
  END IF;

  UPDATE promo_codes
  SET used_count = used_count + 1
  WHERE code = p_code;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GET PRODUCT WITH DETAILS (Optimized Query)
-- ============================================
CREATE OR REPLACE FUNCTION get_product_details(p_slug TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'product', row_to_json(p),
    'images', (
      SELECT json_agg(row_to_json(i) ORDER BY i.sort_order)
      FROM product_images i
      WHERE i.product_id = p.id
    ),
    'variants', (
      SELECT json_agg(
        json_build_object(
          'id', v.id,
          'sku', v.sku,
          'price_adjustment', v.price_adjustment,
          'stock_quantity', v.stock_quantity,
          'size', json_build_object('id', s.id, 'name', s.name),
          'color', json_build_object('id', c.id, 'name', c.name, 'hex_code', c.hex_code)
        )
      )
      FROM product_variants v
      LEFT JOIN sizes s ON v.size_id = s.id
      LEFT JOIN colors c ON v.color_id = c.id
      WHERE v.product_id = p.id AND v.is_active = true
    ),
    'category', (
      SELECT row_to_json(cat)
      FROM categories cat
      WHERE cat.id = p.category_id
    )
  ) INTO result
  FROM products p
  WHERE p.slug = p_slug AND p.is_active = true;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- SEARCH PRODUCTS
-- ============================================
CREATE OR REPLACE FUNCTION search_products(
  search_query TEXT,
  category_slug TEXT DEFAULT NULL,
  min_price DECIMAL DEFAULT NULL,
  max_price DECIMAL DEFAULT NULL,
  in_stock_only BOOLEAN DEFAULT false,
  sort_by TEXT DEFAULT 'created_at',
  sort_order TEXT DEFAULT 'desc',
  page_limit INT DEFAULT 20,
  page_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  base_price DECIMAL,
  compare_at_price DECIMAL,
  primary_image TEXT,
  category_name TEXT,
  total_stock BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.slug,
    p.base_price,
    p.compare_at_price,
    (SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = true LIMIT 1),
    c.name,
    COALESCE((SELECT SUM(pv.stock_quantity) FROM product_variants pv WHERE pv.product_id = p.id), 0)
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  WHERE p.is_active = true
    AND (search_query IS NULL OR to_tsvector('simple', p.name || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery('simple', search_query))
    AND (category_slug IS NULL OR c.slug = category_slug)
    AND (min_price IS NULL OR p.base_price >= min_price)
    AND (max_price IS NULL OR p.base_price <= max_price)
    AND (
      NOT in_stock_only
      OR EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.stock_quantity > 0)
    )
  ORDER BY
    CASE WHEN sort_by = 'price' AND sort_order = 'asc' THEN p.base_price END ASC,
    CASE WHEN sort_by = 'price' AND sort_order = 'desc' THEN p.base_price END DESC,
    CASE WHEN sort_by = 'name' AND sort_order = 'asc' THEN p.name END ASC,
    CASE WHEN sort_by = 'name' AND sort_order = 'desc' THEN p.name END DESC,
    CASE WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN p.created_at END ASC,
    CASE WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN p.created_at END DESC
  LIMIT page_limit
  OFFSET page_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- GET ADMIN DASHBOARD STATS
-- ============================================
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_revenue', COALESCE((SELECT SUM(total) FROM orders WHERE payment_status = 'paid'), 0),
    'total_orders', (SELECT COUNT(*) FROM orders),
    'pending_orders', (SELECT COUNT(*) FROM orders WHERE status = 'pending'),
    'total_customers', (SELECT COUNT(*) FROM profiles WHERE role = 'customer'),
    'total_products', (SELECT COUNT(*) FROM products),
    'low_stock_count', (
      SELECT COUNT(DISTINCT product_id)
      FROM product_variants
      WHERE stock_quantity <= low_stock_threshold AND stock_quantity > 0
    ),
    'out_of_stock_count', (
      SELECT COUNT(DISTINCT product_id)
      FROM product_variants
      WHERE stock_quantity = 0
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
```

---

## Seed Data

**File:** `supabase/seed.sql`

```sql
-- ============================================
-- DXLR E-Commerce Platform - Seed Data
-- For development/testing only
-- ============================================

-- ============================================
-- SAMPLE CATEGORIES
-- ============================================
INSERT INTO categories (id, name, slug, description, sort_order, is_active) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Hoodies', 'hoodies', 'Comfortable hoodies for everyday wear', 1, true),
  ('c1000000-0000-0000-0000-000000000002', 'T-Shirts', 't-shirts', 'Premium cotton t-shirts', 2, true),
  ('c1000000-0000-0000-0000-000000000003', 'Jackets', 'jackets', 'Stylish jackets for all seasons', 3, true),
  ('c1000000-0000-0000-0000-000000000004', 'Pants', 'pants', 'Comfortable pants and joggers', 4, true),
  ('c1000000-0000-0000-0000-000000000005', 'Accessories', 'accessories', 'Caps, bags, and more', 5, true);

-- ============================================
-- SAMPLE COLLECTIONS
-- ============================================
INSERT INTO collections (id, name, slug, description, is_featured, is_active) VALUES
  ('co100000-0000-0000-0000-000000000001', 'Winter Collection', 'winter-collection', 'Stay warm with our winter essentials', true, true),
  ('co100000-0000-0000-0000-000000000002', 'New Arrivals', 'new-arrivals', 'Check out our latest drops', true, true),
  ('co100000-0000-0000-0000-000000000003', 'Best Sellers', 'best-sellers', 'Our most popular items', false, true);

-- ============================================
-- SAMPLE PRODUCTS
-- ============================================
INSERT INTO products (id, name, slug, short_description, description, base_price, compare_at_price, category_id, is_active, is_featured) VALUES
  ('p1000000-0000-0000-0000-000000000001', 'Tech Hoodie', 'tech-hoodie', 'Minimalist hoodie for tech enthusiasts', 'Premium cotton blend hoodie with a clean, minimalist design. Perfect for coders and gamers who appreciate simplicity.', 899.00, 1099.00, 'c1000000-0000-0000-0000-000000000001', true, true),
  ('p1000000-0000-0000-0000-000000000002', 'Developer Tee', 'developer-tee', 'Comfortable tee for long coding sessions', 'Super soft cotton t-shirt designed for comfort during those long coding sessions.', 449.00, NULL, 'c1000000-0000-0000-0000-000000000002', true, false),
  ('p1000000-0000-0000-0000-000000000003', 'Gamer Jacket', 'gamer-jacket', 'Lightweight jacket with style', 'Sleek jacket that transitions from gaming setup to street style seamlessly.', 1299.00, 1499.00, 'c1000000-0000-0000-0000-000000000003', true, true),
  ('p1000000-0000-0000-0000-000000000004', 'Comfort Joggers', 'comfort-joggers', 'Ultimate comfort for any occasion', 'Relaxed fit joggers with premium fabric for maximum comfort.', 749.00, NULL, 'c1000000-0000-0000-0000-000000000004', true, false);

-- ============================================
-- PRODUCT IMAGES
-- ============================================
INSERT INTO product_images (product_id, url, alt_text, sort_order, is_primary) VALUES
  ('p1000000-0000-0000-0000-000000000001', 'https://placeholder.com/hoodie-1.jpg', 'Tech Hoodie Front', 1, true),
  ('p1000000-0000-0000-0000-000000000001', 'https://placeholder.com/hoodie-2.jpg', 'Tech Hoodie Back', 2, false),
  ('p1000000-0000-0000-0000-000000000002', 'https://placeholder.com/tee-1.jpg', 'Developer Tee Front', 1, true),
  ('p1000000-0000-0000-0000-000000000003', 'https://placeholder.com/jacket-1.jpg', 'Gamer Jacket Front', 1, true),
  ('p1000000-0000-0000-0000-000000000004', 'https://placeholder.com/joggers-1.jpg', 'Comfort Joggers', 1, true);

-- ============================================
-- PRODUCT COLLECTIONS
-- ============================================
INSERT INTO product_collections (product_id, collection_id) VALUES
  ('p1000000-0000-0000-0000-000000000001', 'co100000-0000-0000-0000-000000000001'),
  ('p1000000-0000-0000-0000-000000000001', 'co100000-0000-0000-0000-000000000002'),
  ('p1000000-0000-0000-0000-000000000002', 'co100000-0000-0000-0000-000000000002'),
  ('p1000000-0000-0000-0000-000000000003', 'co100000-0000-0000-0000-000000000001'),
  ('p1000000-0000-0000-0000-000000000003', 'co100000-0000-0000-0000-000000000003');

-- ============================================
-- PRODUCT VARIANTS (using actual size/color IDs)
-- ============================================
DO $$
DECLARE
  size_s UUID;
  size_m UUID;
  size_l UUID;
  size_xl UUID;
  color_black UUID;
  color_charcoal UUID;
  color_navy UUID;
BEGIN
  SELECT id INTO size_s FROM sizes WHERE name = 'S';
  SELECT id INTO size_m FROM sizes WHERE name = 'M';
  SELECT id INTO size_l FROM sizes WHERE name = 'L';
  SELECT id INTO size_xl FROM sizes WHERE name = 'XL';
  SELECT id INTO color_black FROM colors WHERE name = 'Black';
  SELECT id INTO color_charcoal FROM colors WHERE name = 'Charcoal';
  SELECT id INTO color_navy FROM colors WHERE name = 'Navy';

  -- Tech Hoodie variants
  INSERT INTO product_variants (product_id, size_id, color_id, sku, stock_quantity) VALUES
    ('p1000000-0000-0000-0000-000000000001', size_s, color_black, 'TH-BLK-S', 10),
    ('p1000000-0000-0000-0000-000000000001', size_m, color_black, 'TH-BLK-M', 15),
    ('p1000000-0000-0000-0000-000000000001', size_l, color_black, 'TH-BLK-L', 12),
    ('p1000000-0000-0000-0000-000000000001', size_xl, color_black, 'TH-BLK-XL', 8),
    ('p1000000-0000-0000-0000-000000000001', size_m, color_charcoal, 'TH-CHR-M', 10),
    ('p1000000-0000-0000-0000-000000000001', size_l, color_charcoal, 'TH-CHR-L', 7);

  -- Developer Tee variants
  INSERT INTO product_variants (product_id, size_id, color_id, sku, stock_quantity) VALUES
    ('p1000000-0000-0000-0000-000000000002', size_s, color_black, 'DT-BLK-S', 20),
    ('p1000000-0000-0000-0000-000000000002', size_m, color_black, 'DT-BLK-M', 25),
    ('p1000000-0000-0000-0000-000000000002', size_l, color_black, 'DT-BLK-L', 18),
    ('p1000000-0000-0000-0000-000000000002', size_m, color_navy, 'DT-NVY-M', 15);

  -- Gamer Jacket variants
  INSERT INTO product_variants (product_id, size_id, color_id, sku, stock_quantity) VALUES
    ('p1000000-0000-0000-0000-000000000003', size_m, color_black, 'GJ-BLK-M', 5),
    ('p1000000-0000-0000-0000-000000000003', size_l, color_black, 'GJ-BLK-L', 6),
    ('p1000000-0000-0000-0000-000000000003', size_xl, color_black, 'GJ-BLK-XL', 4);

  -- Comfort Joggers variants
  INSERT INTO product_variants (product_id, size_id, color_id, sku, stock_quantity) VALUES
    ('p1000000-0000-0000-0000-000000000004', size_m, color_charcoal, 'CJ-CHR-M', 12),
    ('p1000000-0000-0000-0000-000000000004', size_l, color_charcoal, 'CJ-CHR-L', 10),
    ('p1000000-0000-0000-0000-000000000004', size_xl, color_charcoal, 'CJ-CHR-XL', 8);
END $$;

-- ============================================
-- SAMPLE PROMO CODE
-- ============================================
INSERT INTO promo_codes (code, description, discount_type, discount_value, min_order_amount, is_active) VALUES
  ('WELCOME10', 'Welcome discount - 10% off', 'percentage', 10, 500, true),
  ('FLAT100', 'Flat 100 EGP off', 'fixed', 100, 1000, true);
```

---

## Execution Checklist

- [ ] Execute `001_initial_schema.sql`
- [ ] Verify all tables created (check Table Editor)
- [ ] Execute `002_rls_policies.sql`
- [ ] Verify RLS enabled (green lock icon on tables)
- [ ] Execute `003_indexes.sql`
- [ ] Execute `004_functions.sql`
- [ ] Execute `seed.sql` (development only)
- [ ] Test `is_admin()` function
- [ ] Test product queries work with RLS
