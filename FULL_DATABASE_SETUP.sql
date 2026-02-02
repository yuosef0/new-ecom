-- ============================================
-- FULL DATABASE SETUP SCRIPT
-- Copy and paste this entrie file into the Supabase SQL Editor to set up your database.
-- ============================================

-- ============================================
-- 001_INITIAL_SCHEMA.SQL
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE product_collections (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, collection_id)
);

CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT false
);

CREATE TABLE sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  sort_order INT DEFAULT 0
);

INSERT INTO sizes (name, sort_order) VALUES
  ('XS', 1), ('S', 2), ('M', 3), ('L', 4), ('XL', 5), ('XXL', 6);

CREATE TABLE colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  hex_code TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

INSERT INTO colors (name, hex_code, sort_order) VALUES
  ('Black', '#000000', 1), ('White', '#FFFFFF', 2), ('Navy', '#1E3A5F', 3),
  ('Burgundy', '#6F1D2A', 4), ('Gray', '#6B7280', 5), ('Charcoal', '#1E1E1E', 6);

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

CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id, variant_id)
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  guest_email TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  shipping_cost DECIMAL(10,2) DEFAULT 0 CHECK (shipping_cost >= 0),
  discount_amount DECIMAL(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
  total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  currency TEXT DEFAULT 'EGP',
  shipping_name TEXT NOT NULL,
  shipping_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_governorate TEXT NOT NULL,
  paymob_order_id TEXT,
  paymob_transaction_id TEXT,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT order_customer_check CHECK (user_id IS NOT NULL OR guest_email IS NOT NULL)
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  variant_name TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  quantity INT NOT NULL CHECK (quantity > 0),
  total DECIMAL(10,2) NOT NULL CHECK (total >= 0)
);

CREATE TABLE order_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO site_settings (key, value) VALUES
  ('shipping', '{"standard": {"name": "Standard Delivery", "price": 50, "days": "3-7"}, "express": {"name": "Express Delivery", "price": 100, "days": "1-2"}}'),
  ('store', '{"name": "DXLR", "currency": "EGP", "email": "support@dxlr-eg.com"}');

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================
-- 002_RLS_POLICIES.SQL
-- ============================================
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

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can read all profiles" ON profiles FOR SELECT USING (is_admin());
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (is_admin());

CREATE POLICY "Users can read own addresses" ON addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own addresses" ON addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own addresses" ON addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own addresses" ON addresses FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public can read active categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can read all categories" ON categories FOR SELECT USING (is_admin());
CREATE POLICY "Admins can insert categories" ON categories FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update categories" ON categories FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete categories" ON categories FOR DELETE USING (is_admin());

CREATE POLICY "Public can read active collections" ON collections FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can read all collections" ON collections FOR SELECT USING (is_admin());
CREATE POLICY "Admins can insert collections" ON collections FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update collections" ON collections FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete collections" ON collections FOR DELETE USING (is_admin());

CREATE POLICY "Public can read active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can read all products" ON products FOR SELECT USING (is_admin());
CREATE POLICY "Admins can insert products" ON products FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update products" ON products FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete products" ON products FOR DELETE USING (is_admin());

CREATE POLICY "Public can read product_collections" ON product_collections FOR SELECT USING (true);
CREATE POLICY "Admins can manage product_collections" ON product_collections FOR ALL USING (is_admin());

CREATE POLICY "Public can read product_images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Admins can manage product_images" ON product_images FOR ALL USING (is_admin());

CREATE POLICY "Public can read sizes" ON sizes FOR SELECT USING (true);
CREATE POLICY "Admins can manage sizes" ON sizes FOR ALL USING (is_admin());

CREATE POLICY "Public can read colors" ON colors FOR SELECT USING (true);
CREATE POLICY "Admins can manage colors" ON colors FOR ALL USING (is_admin());

CREATE POLICY "Public can read active variants" ON product_variants FOR SELECT USING (is_active = true AND EXISTS (SELECT 1 FROM products WHERE products.id = product_variants.product_id AND products.is_active = true));
CREATE POLICY "Admins can read all variants" ON product_variants FOR SELECT USING (is_admin());
CREATE POLICY "Admins can manage variants" ON product_variants FOR ALL USING (is_admin());

CREATE POLICY "Users can read own wishlist" ON wishlist_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to own wishlist" ON wishlist_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove from own wishlist" ON wishlist_items FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can read own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id OR (user_id IS NULL AND guest_email IS NOT NULL));
CREATE POLICY "Admins can read all orders" ON orders FOR SELECT USING (is_admin());
CREATE POLICY "Admins can update orders" ON orders FOR UPDATE USING (is_admin());

CREATE POLICY "Users can read own order items" ON order_items FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Admins can read all order items" ON order_items FOR SELECT USING (is_admin());

CREATE POLICY "Users can read own order tracking" ON order_tracking FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_tracking.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Admins can manage order tracking" ON order_tracking FOR ALL USING (is_admin());

CREATE POLICY "Public can read active promo codes" ON promo_codes FOR SELECT USING (is_active = true AND (starts_at IS NULL OR starts_at <= NOW()) AND (expires_at IS NULL OR expires_at > NOW()));
CREATE POLICY "Admins can manage promo codes" ON promo_codes FOR ALL USING (is_admin());

CREATE POLICY "Public can read site settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can update site settings" ON site_settings FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can insert site settings" ON site_settings FOR INSERT WITH CHECK (is_admin());


-- ============================================
-- 003_INDEXES.SQL
-- ============================================
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_created ON products(created_at DESC);
CREATE INDEX idx_products_search ON products USING GIN(to_tsvector('simple', name || ' ' || COALESCE(description, '')));

CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_stock ON product_variants(stock_quantity);
CREATE INDEX idx_variants_low_stock ON product_variants(product_id) WHERE stock_quantity <= low_stock_threshold AND stock_quantity > 0;
CREATE INDEX idx_variants_out_of_stock ON product_variants(product_id) WHERE stock_quantity = 0;

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_paymob ON orders(paymob_order_id) WHERE paymob_order_id IS NOT NULL;

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active);

CREATE INDEX idx_collections_slug ON collections(slug);
CREATE INDEX idx_collections_featured ON collections(is_featured) WHERE is_featured = true;
CREATE INDEX idx_collections_active ON collections(is_active);

CREATE INDEX idx_wishlist_user ON wishlist_items(user_id);
CREATE INDEX idx_wishlist_product ON wishlist_items(product_id);

CREATE INDEX idx_addresses_user ON addresses(user_id);
CREATE INDEX idx_addresses_default ON addresses(user_id) WHERE is_default = true;

CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_product_images_primary ON product_images(product_id) WHERE is_primary = true;

CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_codes_active ON promo_codes(is_active);


-- ============================================
-- 004_FUNCTIONS.SQL
-- ============================================
CREATE OR REPLACE FUNCTION decrement_stock(p_variant_id UUID, p_quantity INT)
RETURNS BOOLEAN AS $$
DECLARE
  current_stock INT;
BEGIN
  SELECT stock_quantity INTO current_stock FROM product_variants WHERE id = p_variant_id FOR UPDATE;
  IF current_stock IS NULL THEN RAISE EXCEPTION 'Variant not found: %', p_variant_id; END IF;
  IF current_stock < p_quantity THEN RAISE EXCEPTION 'Insufficient stock for variant %: requested %, available %', p_variant_id, p_quantity, current_stock; END IF;
  UPDATE product_variants SET stock_quantity = stock_quantity - p_quantity WHERE id = p_variant_id;
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_promo_usage(p_code TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  promo RECORD;
BEGIN
  SELECT * INTO promo FROM promo_codes WHERE code = p_code FOR UPDATE;
  IF promo IS NULL THEN RAISE EXCEPTION 'Promo code not found: %', p_code; END IF;
  IF promo.max_uses IS NOT NULL AND promo.used_count >= promo.max_uses THEN RAISE EXCEPTION 'Promo code has reached maximum uses: %', p_code; END IF;
  UPDATE promo_codes SET used_count = used_count + 1 WHERE code = p_code;
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_product_details(p_slug TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'product', row_to_json(p),
    'images', (SELECT json_agg(row_to_json(i) ORDER BY i.sort_order) FROM product_images i WHERE i.product_id = p.id),
    'variants', (
      SELECT json_agg(json_build_object(
        'id', v.id, 'sku', v.sku, 'price_adjustment', v.price_adjustment, 'stock_quantity', v.stock_quantity,
        'size', json_build_object('id', s.id, 'name', s.name),
        'color', json_build_object('id', c.id, 'name', c.name, 'hex_code', c.hex_code)
      ))
      FROM product_variants v
      LEFT JOIN sizes s ON v.size_id = s.id
      LEFT JOIN colors c ON v.color_id = c.id
      WHERE v.product_id = p.id AND v.is_active = true
    ),
    'category', (SELECT row_to_json(cat) FROM categories cat WHERE cat.id = p.category_id)
  ) INTO result
  FROM products p WHERE p.slug = p_slug AND p.is_active = true;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

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
RETURNS TABLE (id UUID, name TEXT, slug TEXT, base_price DECIMAL, compare_at_price DECIMAL, primary_image TEXT, category_name TEXT, total_stock BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id, p.name, p.slug, p.base_price, p.compare_at_price,
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
    AND (NOT in_stock_only OR EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.stock_quantity > 0))
  ORDER BY
    CASE WHEN sort_by = 'price' AND sort_order = 'asc' THEN p.base_price END ASC,
    CASE WHEN sort_by = 'price' AND sort_order = 'desc' THEN p.base_price END DESC,
    CASE WHEN sort_by = 'name' AND sort_order = 'asc' THEN p.name END ASC,
    CASE WHEN sort_by = 'name' AND sort_order = 'desc' THEN p.name END DESC,
    CASE WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN p.created_at END ASC,
    CASE WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN p.created_at END DESC
  LIMIT page_limit OFFSET page_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON AS $$
DECLARE result JSON;
BEGIN
  SELECT json_build_object(
    'total_revenue', COALESCE((SELECT SUM(total) FROM orders WHERE payment_status = 'paid'), 0),
    'total_orders', (SELECT COUNT(*) FROM orders),
    'pending_orders', (SELECT COUNT(*) FROM orders WHERE status = 'pending'),
    'total_customers', (SELECT COUNT(*) FROM profiles WHERE role = 'customer'),
    'total_products', (SELECT COUNT(*) FROM products),
    'low_stock_count', (SELECT COUNT(DISTINCT product_id) FROM product_variants WHERE stock_quantity <= low_stock_threshold AND stock_quantity > 0),
    'out_of_stock_count', (SELECT COUNT(DISTINCT product_id) FROM product_variants WHERE stock_quantity = 0)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;


-- ============================================
-- 005_UPDATE_PROFILE_TRIGGER.SQL
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- 006_ADD_HERO_AND_MARQUEE.SQL
-- ============================================
INSERT INTO site_settings (key, value) VALUES
  ('hero_image', '{"image_url": "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=600&fit=crop", "title": "Winter Collection", "button_text": "Shop Now", "button_link": "/products"}'),
  ('marquee_text', '{"text": "FREE SHIPPING ON All Orders", "is_active": true}')
ON CONFLICT (key) DO NOTHING;


-- ============================================
-- MISSING: TOP BAR MESSAGES
-- ============================================
CREATE TABLE IF NOT EXISTS top_bar_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_en TEXT NOT NULL,
  message_ar TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE top_bar_messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'top_bar_messages' AND policyname = 'Public can read top_bar_messages') THEN
        CREATE POLICY "Public can read top_bar_messages" ON top_bar_messages FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'top_bar_messages' AND policyname = 'Admins can manage top_bar_messages') THEN
        CREATE POLICY "Admins can manage top_bar_messages" ON top_bar_messages FOR ALL USING (is_admin());
    END IF;
END $$;


-- ============================================
-- 007_ALLOW_NULLABLE_MESSAGE_AR.SQL
-- ============================================
ALTER TABLE top_bar_messages ALTER COLUMN message_ar DROP NOT NULL;
ALTER TABLE top_bar_messages ALTER COLUMN message_en SET NOT NULL;


-- ============================================
-- 20240203_CREATE_PAGES_AND_FAQS.SQL
-- ============================================
CREATE TABLE IF NOT EXISTS pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS faq_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO pages (slug, title, content) VALUES
('about', 'About RiLIKS', '<p>Founded in 2024, RiLIKS emerged from a desire to bring high-quality, accessible fashion to the Egyptian market.</p>'),
('contact', 'Get in Touch', '<p>Have questions about your order or need style advice? We''re here to help.</p>'),
('faqs', 'Frequently Asked Questions', '<p>Quick answers to common questions about our products and services.</p>'),
('shipping', 'Shipping & Delivery', '<p>Everything you need to know about getting your order.</p>'),
('returns', 'Return & Exchange', '<p>We want you to love what you ordered. If something isn''t right, let us know.</p>'),
('privacy', 'Privacy Policy', '<p>RiLIKS ("we", "our", or "us") respects your privacy...</p>')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO faq_items (category, question, answer, sort_order) VALUES
('Orders & Shipping', 'How do I track my order?', 'Once your order is shipped, you will receive an email and SMS with a tracking number.', 10),
('Orders & Shipping', 'How long does delivery take?', 'Standard delivery within Cairo takes 2-3 business days. For other governorates, it usually takes 3-5 business days.', 20),
('Orders & Shipping', 'Do you ship internationally?', 'Currently, we only ship within Egypt. We plan to expand internationally soon.', 30),
('Returns & Refunds', 'What is your return policy?', 'We offer a 14-day return policy for unworn items in their original condition.', 40),
('Returns & Refunds', 'How do I request a return?', 'Go to ''My Orders'', select the order, and click ''Request Return''.', 50),
('Returns & Refunds', 'When will I get my refund?', 'Refunds are processed within 5-7 business days after we receive and inspect the returned item.', 60),
('Products & Sizing', 'How do I know my size?', 'Check our Size Guide linked on every product page.', 70),
('Products & Sizing', 'Are your products authentic?', 'Yes, all our products are 100% authentic.', 80);

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pages' AND policyname = 'Public pages are viewable by everyone') THEN
    CREATE POLICY "Public pages are viewable by everyone" ON pages FOR SELECT USING (true);
    CREATE POLICY "Admins can insert pages" ON pages FOR INSERT WITH CHECK (is_admin());
    CREATE POLICY "Admins can update pages" ON pages FOR UPDATE USING (is_admin());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'faq_items' AND policyname = 'Public faqs are viewable by everyone') THEN
    CREATE POLICY "Public faqs are viewable by everyone" ON faq_items FOR SELECT USING (true);
    CREATE POLICY "Admins can insert faqs" ON faq_items FOR INSERT WITH CHECK (is_admin());
    CREATE POLICY "Admins can update faqs" ON faq_items FOR UPDATE USING (is_admin());
    CREATE POLICY "Admins can delete faqs" ON faq_items FOR DELETE USING (is_admin());
  END IF;
END $$;


-- ============================================
-- SEED DATA (from seed.sql)
-- ============================================
-- Cleanup
DELETE FROM product_variants WHERE product_id::text LIKE '30000000-%';
DELETE FROM product_images WHERE product_id::text LIKE '30000000-%';
DELETE FROM product_collections WHERE product_id::text LIKE '30000000-%' OR collection_id::text LIKE '20000000-%';
DELETE FROM products WHERE id::text LIKE '30000000-%';
DELETE FROM collections WHERE id::text LIKE '20000000-%';
DELETE FROM categories WHERE id::text LIKE '10000000-%';
DELETE FROM promo_codes WHERE code IN ('WELCOME10', 'FLAT100');

-- Categories
INSERT INTO categories (id, name, slug, description, sort_order, is_active) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Hoodies', 'hoodies', 'Comfortable hoodies for everyday wear', 1, true),
  ('10000000-0000-0000-0000-000000000002', 'T-Shirts', 't-shirts', 'Premium cotton t-shirts', 2, true),
  ('10000000-0000-0000-0000-000000000003', 'Jackets', 'jackets', 'Stylish jackets for all seasons', 3, true),
  ('10000000-0000-0000-0000-000000000004', 'Pants', 'pants', 'Comfortable pants and joggers', 4, true),
  ('10000000-0000-0000-0000-000000000005', 'Accessories', 'accessories', 'Caps, bags, and more', 5, true);

-- Collections
INSERT INTO collections (id, name, slug, description, image_url, is_featured, is_active) VALUES
  ('20000000-0000-0000-0000-000000000001', 'Track Suits', 'track-suits', 'Premium track suits for comfort and style', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=400&fit=crop', true, true),
  ('20000000-0000-0000-0000-000000000002', 'Blankets', 'blankets', 'Cozy blankets to keep you warm', 'https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=800&h=400&fit=crop', true, true),
  ('20000000-0000-0000-0000-000000000003', 'Sweatpants', 'sweatpants', 'Comfortable sweatpants for everyday wear', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=300&fit=crop', true, true),
  ('20000000-0000-0000-0000-000000000004', 'Sets', 'sets', 'Complete matching sets', 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=300&fit=crop', true, true),
  ('20000000-0000-0000-0000-000000000005', 'Hoodies', 'hoodies-collection', 'Stylish hoodies for all occasions', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=400&fit=crop', true, true),
  ('20000000-0000-0000-0000-000000000006', 'Winter Sale', 'winter-sale', 'Hot deals on winter essentials', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=400&fit=crop', true, true);

-- Products
INSERT INTO products (id, name, slug, short_description, description, base_price, compare_at_price, category_id, is_active, is_featured) VALUES
  ('30000000-0000-0000-0000-000000000001', 'Classic Pullover Hoodie', 'classic-pullover-hoodie', 'Premium cotton pullover hoodie', 'Comfortable and stylish pullover hoodie made from premium cotton blend.', 899.00, 1099.00, '10000000-0000-0000-0000-000000000001', true, true),
  ('30000000-0000-0000-0000-000000000002', 'Zip-Up Hoodie', 'zip-up-hoodie', 'Versatile zip-up hoodie', 'Full zip hoodie with side pockets and adjustable drawstrings.', 949.00, NULL, '10000000-0000-0000-0000-000000000001', true, true),
  ('30000000-0000-0000-0000-000000000003', 'Oversized Hoodie', 'oversized-hoodie', 'Trendy oversized fit hoodie', 'Comfortable oversized hoodie with dropped shoulders.', 999.00, 1199.00, '10000000-0000-0000-0000-000000000001', true, false),
  ('30000000-0000-0000-0000-000000000004', 'Basic Cotton Tee', 'basic-cotton-tee', 'Essential everyday t-shirt', 'Soft cotton t-shirt in classic fit.', 449.00, NULL, '10000000-0000-0000-0000-000000000002', true, false),
  ('30000000-0000-0000-0000-000000000005', 'Graphic Print Tee', 'graphic-print-tee', 'Statement graphic t-shirt', 'Bold graphic design on premium cotton tee.', 499.00, 599.00, '10000000-0000-0000-0000-000000000002', true, true),
  ('30000000-0000-0000-0000-000000000006', 'Bomber Jacket', 'bomber-jacket', 'Classic bomber style jacket', 'Timeless bomber jacket with ribbed cuffs and hem.', 1299.00, 1499.00, '10000000-0000-0000-0000-000000000003', true, true),
  ('30000000-0000-0000-0000-000000000007', 'Windbreaker', 'windbreaker', 'Lightweight windbreaker', 'Water-resistant windbreaker perfect for outdoor activities.', 1099.00, NULL, '10000000-0000-0000-0000-000000000003', true, false),
  ('30000000-0000-0000-0000-000000000008', 'Track Pants', 'track-pants', 'Athletic track pants', 'Comfortable track pants with side stripes and elastic waistband.', 749.00, 899.00, '10000000-0000-0000-0000-000000000004', true, true),
  ('30000000-0000-0000-0000-000000000009', 'Jogger Pants', 'jogger-pants', 'Tapered jogger pants', 'Modern tapered fit joggers with adjustable drawstring.', 799.00, NULL, '10000000-0000-0000-0000-000000000004', true, true),
  ('30000000-0000-0000-0000-000000000010', 'Cargo Pants', 'cargo-pants', 'Utility cargo pants', 'Multi-pocket cargo pants for ultimate functionality.', 849.00, 999.00, '10000000-0000-0000-0000-000000000004', true, false),
  ('30000000-0000-0000-0000-000000000011', 'Baseball Cap', 'baseball-cap', 'Classic baseball cap', 'Adjustable baseball cap with embroidered logo.', 299.00, NULL, '10000000-0000-0000-0000-000000000005', true, false),
  ('30000000-0000-0000-0000-000000000012', 'Backpack', 'backpack', 'Spacious daily backpack', 'Durable backpack with laptop compartment.', 699.00, 799.00, '10000000-0000-0000-0000-000000000005', true, true);

-- Product Images
INSERT INTO product_images (product_id, url, alt_text, sort_order, is_primary) VALUES
  ('30000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600', 'Classic Pullover Hoodie', 1, true),
  ('30000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600', 'Zip-Up Hoodie', 1, true),
  ('30000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600', 'Oversized Hoodie', 1, true),
  ('30000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', 'Basic Cotton Tee', 1, true),
  ('30000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600', 'Graphic Print Tee', 1, true),
  ('30000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600', 'Bomber Jacket', 1, true),
  ('30000000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600', 'Windbreaker', 1, true),
  ('30000000-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600', 'Track Pants', 1, true),
  ('30000000-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600', 'Jogger Pants', 1, true),
  ('30000000-0000-0000-0000-000000000010', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600', 'Cargo Pants', 1, true),
  ('30000000-0000-0000-0000-000000000011', 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600', 'Baseball Cap', 1, true),
  ('30000000-0000-0000-0000-000000000012', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600', 'Backpack', 1, true);

-- Product Collections
INSERT INTO product_collections (product_id, collection_id) VALUES
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002'),
  ('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000003'),
  ('30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000003'),
  ('30000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000003'),
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004'),
  ('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000004'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000004'),
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000005'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000005'),
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000006'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000006'),
  ('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000006'),
  ('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000006'),
  ('30000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000006');

-- Product Variants
DO $$
DECLARE
  size_s UUID; size_m UUID; size_l UUID; size_xl UUID;
  color_black UUID; color_charcoal UUID; color_navy UUID; color_white UUID;
BEGIN
  SELECT id INTO size_s FROM sizes WHERE name = 'S';
  SELECT id INTO size_m FROM sizes WHERE name = 'M';
  SELECT id INTO size_l FROM sizes WHERE name = 'L';
  SELECT id INTO size_xl FROM sizes WHERE name = 'XL';
  SELECT id INTO color_black FROM colors WHERE name = 'Black';
  SELECT id INTO color_charcoal FROM colors WHERE name = 'Charcoal';
  SELECT id INTO color_navy FROM colors WHERE name = 'Navy';
  SELECT id INTO color_white FROM colors WHERE name = 'White';

  INSERT INTO product_variants (product_id, size_id, color_id, sku, stock_quantity) VALUES
    ('30000000-0000-0000-0000-000000000001', size_m, color_black, 'CPH-BLK-M', 15),
    ('30000000-0000-0000-0000-000000000001', size_l, color_black, 'CPH-BLK-L', 12),
    ('30000000-0000-0000-0000-000000000001', size_xl, color_black, 'CPH-BLK-XL', 8),
    ('30000000-0000-0000-0000-000000000002', size_m, color_navy, 'ZUH-NVY-M', 10),
    ('30000000-0000-0000-0000-000000000002', size_l, color_navy, 'ZUH-NVY-L', 8),
    ('30000000-0000-0000-0000-000000000003', size_l, color_charcoal, 'OH-CHR-L', 5),
    ('30000000-0000-0000-0000-000000000003', size_xl, color_charcoal, 'OH-CHR-XL', 6),
    ('30000000-0000-0000-0000-000000000004', size_s, color_white, 'BCT-WHT-S', 20),
    ('30000000-0000-0000-0000-000000000004', size_m, color_white, 'BCT-WHT-M', 25),
    ('30000000-0000-0000-0000-000000000004', size_l, color_black, 'BCT-BLK-L', 18),
    ('30000000-0000-0000-0000-000000000005', size_m, color_black, 'GPT-BLK-M', 15),
    ('30000000-0000-0000-0000-000000000005', size_l, color_black, 'GPT-BLK-L', 12),
    ('30000000-0000-0000-0000-000000000006', size_m, color_black, 'BJ-BLK-M', 5),
    ('30000000-0000-0000-0000-000000000006', size_l, color_black, 'BJ-BLK-L', 6),
    ('30000000-0000-0000-0000-000000000007', size_m, color_navy, 'WB-NVY-M', 8),
    ('30000000-0000-0000-0000-000000000007', size_l, color_navy, 'WB-NVY-L', 7),
    ('30000000-0000-0000-0000-000000000008', size_m, color_black, 'TP-BLK-M', 12),
    ('30000000-0000-0000-0000-000000000008', size_l, color_black, 'TP-BLK-L', 10),
    ('30000000-0000-0000-0000-000000000008', size_xl, color_black, 'TP-BLK-XL', 8),
    ('30000000-0000-0000-0000-000000000009', size_m, color_charcoal, 'JP-CHR-M', 15),
    ('30000000-0000-0000-0000-000000000009', size_l, color_charcoal, 'JP-CHR-L', 12),
    ('30000000-0000-0000-0000-000000000010', size_m, color_charcoal, 'CP-CHR-M', 10),
    ('30000000-0000-0000-0000-000000000010', size_l, color_charcoal, 'CP-CHR-L', 8),
    ('30000000-0000-0000-0000-000000000011', size_m, color_black, 'BC-BLK-OS', 30),
    ('30000000-0000-0000-0000-000000000011', size_m, color_navy, 'BC-NVY-OS', 25),
    ('30000000-0000-0000-0000-000000000012', size_m, color_black, 'BP-BLK-OS', 20);
END $$;

INSERT INTO promo_codes (code, description, discount_type, discount_value, min_order_amount, is_active) VALUES
  ('WELCOME10', 'Welcome discount - 10% off', 'percentage', 10, 500, true),
  ('FLAT100', 'Flat 100 EGP off', 'fixed', 100, 1000, true);

INSERT INTO site_settings (key, value) VALUES
  ('free_shipping', '{"is_active": false, "min_order_amount": 500}')
ON CONFLICT (key) DO NOTHING;
