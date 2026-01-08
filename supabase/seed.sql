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
