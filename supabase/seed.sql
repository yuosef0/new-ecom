-- ============================================
-- DXLR E-Commerce Platform - Seed Data
-- For development/testing only
-- ============================================

-- ============================================
-- CLEANUP EXISTING SAMPLE DATA
-- ============================================
-- Delete in reverse order of foreign key dependencies
DELETE FROM product_variants WHERE product_id::text LIKE '30000000-%';
DELETE FROM product_images WHERE product_id::text LIKE '30000000-%';
DELETE FROM product_collections WHERE product_id::text LIKE '30000000-%' OR collection_id::text LIKE '20000000-%';
DELETE FROM products WHERE id::text LIKE '30000000-%';
DELETE FROM collections WHERE id::text LIKE '20000000-%';
DELETE FROM categories WHERE id::text LIKE '10000000-%';
DELETE FROM promo_codes WHERE code IN ('WELCOME10', 'FLAT100');

-- ============================================
-- SAMPLE CATEGORIES
-- ============================================
INSERT INTO categories (id, name, slug, description, sort_order, is_active) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Hoodies', 'hoodies', 'Comfortable hoodies for everyday wear', 1, true),
  ('10000000-0000-0000-0000-000000000002', 'T-Shirts', 't-shirts', 'Premium cotton t-shirts', 2, true),
  ('10000000-0000-0000-0000-000000000003', 'Jackets', 'jackets', 'Stylish jackets for all seasons', 3, true),
  ('10000000-0000-0000-0000-000000000004', 'Pants', 'pants', 'Comfortable pants and joggers', 4, true),
  ('10000000-0000-0000-0000-000000000005', 'Accessories', 'accessories', 'Caps, bags, and more', 5, true);

-- ============================================
-- SAMPLE COLLECTIONS (More than 2 for scrollable section)
-- ============================================
INSERT INTO collections (id, name, slug, description, image_url, is_featured, is_active) VALUES
  ('20000000-0000-0000-0000-000000000001', 'Track Suits', 'track-suits', 'Premium track suits for comfort and style', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=400&fit=crop', true, true),
  ('20000000-0000-0000-0000-000000000002', 'Blankets', 'blankets', 'Cozy blankets to keep you warm', 'https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=800&h=400&fit=crop', true, true),
  ('20000000-0000-0000-0000-000000000003', 'Sweatpants', 'sweatpants', 'Comfortable sweatpants for everyday wear', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=300&fit=crop', true, true),
  ('20000000-0000-0000-0000-000000000004', 'Sets', 'sets', 'Complete matching sets', 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=300&fit=crop', true, true),
  ('20000000-0000-0000-0000-000000000005', 'Hoodies', 'hoodies-collection', 'Stylish hoodies for all occasions', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=400&fit=crop', true, true),
  ('20000000-0000-0000-0000-000000000006', 'Winter Sale', 'winter-sale', 'Hot deals on winter essentials', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=400&fit=crop', true, true);

-- ============================================
-- SAMPLE PRODUCTS (More products for different collections)
-- ============================================
INSERT INTO products (id, name, slug, short_description, description, base_price, compare_at_price, category_id, is_active, is_featured) VALUES
  -- Hoodies
  ('30000000-0000-0000-0000-000000000001', 'Classic Pullover Hoodie', 'classic-pullover-hoodie', 'Premium cotton pullover hoodie', 'Comfortable and stylish pullover hoodie made from premium cotton blend. Perfect for everyday wear.', 899.00, 1099.00, '10000000-0000-0000-0000-000000000001', true, true),
  ('30000000-0000-0000-0000-000000000002', 'Zip-Up Hoodie', 'zip-up-hoodie', 'Versatile zip-up hoodie', 'Full zip hoodie with side pockets and adjustable drawstrings.', 949.00, NULL, '10000000-0000-0000-0000-000000000001', true, true),
  ('30000000-0000-0000-0000-000000000003', 'Oversized Hoodie', 'oversized-hoodie', 'Trendy oversized fit hoodie', 'Comfortable oversized hoodie with dropped shoulders for a relaxed look.', 999.00, 1199.00, '10000000-0000-0000-0000-000000000001', true, false),

  -- T-Shirts
  ('30000000-0000-0000-0000-000000000004', 'Basic Cotton Tee', 'basic-cotton-tee', 'Essential everyday t-shirt', 'Soft cotton t-shirt in classic fit. A wardrobe essential.', 449.00, NULL, '10000000-0000-0000-0000-000000000002', true, false),
  ('30000000-0000-0000-0000-000000000005', 'Graphic Print Tee', 'graphic-print-tee', 'Statement graphic t-shirt', 'Bold graphic design on premium cotton tee.', 499.00, 599.00, '10000000-0000-0000-0000-000000000002', true, true),

  -- Jackets
  ('30000000-0000-0000-0000-000000000006', 'Bomber Jacket', 'bomber-jacket', 'Classic bomber style jacket', 'Timeless bomber jacket with ribbed cuffs and hem.', 1299.00, 1499.00, '10000000-0000-0000-0000-000000000003', true, true),
  ('30000000-0000-0000-0000-000000000007', 'Windbreaker', 'windbreaker', 'Lightweight windbreaker', 'Water-resistant windbreaker perfect for outdoor activities.', 1099.00, NULL, '10000000-0000-0000-0000-000000000003', true, false),

  -- Pants
  ('30000000-0000-0000-0000-000000000008', 'Track Pants', 'track-pants', 'Athletic track pants', 'Comfortable track pants with side stripes and elastic waistband.', 749.00, 899.00, '10000000-0000-0000-0000-000000000004', true, true),
  ('30000000-0000-0000-0000-000000000009', 'Jogger Pants', 'jogger-pants', 'Tapered jogger pants', 'Modern tapered fit joggers with adjustable drawstring.', 799.00, NULL, '10000000-0000-0000-0000-000000000004', true, true),
  ('30000000-0000-0000-0000-000000000010', 'Cargo Pants', 'cargo-pants', 'Utility cargo pants', 'Multi-pocket cargo pants for ultimate functionality.', 849.00, 999.00, '10000000-0000-0000-0000-000000000004', true, false),

  -- Accessories
  ('30000000-0000-0000-0000-000000000011', 'Baseball Cap', 'baseball-cap', 'Classic baseball cap', 'Adjustable baseball cap with embroidered logo.', 299.00, NULL, '10000000-0000-0000-0000-000000000005', true, false),
  ('30000000-0000-0000-0000-000000000012', 'Backpack', 'backpack', 'Spacious daily backpack', 'Durable backpack with laptop compartment and multiple pockets.', 699.00, 799.00, '10000000-0000-0000-0000-000000000005', true, true);

-- ============================================
-- PRODUCT IMAGES (Using Unsplash images)
-- ============================================
INSERT INTO product_images (product_id, url, alt_text, sort_order, is_primary) VALUES
  -- Hoodies
  ('30000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600', 'Classic Pullover Hoodie', 1, true),
  ('30000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600', 'Zip-Up Hoodie', 1, true),
  ('30000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600', 'Oversized Hoodie', 1, true),

  -- T-Shirts
  ('30000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', 'Basic Cotton Tee', 1, true),
  ('30000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600', 'Graphic Print Tee', 1, true),

  -- Jackets
  ('30000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600', 'Bomber Jacket', 1, true),
  ('30000000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600', 'Windbreaker', 1, true),

  -- Pants
  ('30000000-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600', 'Track Pants', 1, true),
  ('30000000-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600', 'Jogger Pants', 1, true),
  ('30000000-0000-0000-0000-000000000010', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600', 'Cargo Pants', 1, true),

  -- Accessories
  ('30000000-0000-0000-0000-000000000011', 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600', 'Baseball Cap', 1, true),
  ('30000000-0000-0000-0000-000000000012', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600', 'Backpack', 1, true);

-- ============================================
-- PRODUCT COLLECTIONS (Link products to collections)
-- ============================================
INSERT INTO product_collections (product_id, collection_id) VALUES
  -- Track Suits Collection
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000001'),

  -- Blankets Collection (can add future blanket products here)
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002'),

  -- Sweatpants Collection
  ('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000003'),
  ('30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000003'),
  ('30000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000003'),

  -- Sets Collection
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004'),
  ('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000004'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000004'),

  -- Hoodies Collection
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000005'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000005'),

  -- Winter Sale Collection
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000006'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000006'),
  ('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000006'),
  ('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000006'),
  ('30000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000006');

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
  color_white UUID;
BEGIN
  SELECT id INTO size_s FROM sizes WHERE name = 'S';
  SELECT id INTO size_m FROM sizes WHERE name = 'M';
  SELECT id INTO size_l FROM sizes WHERE name = 'L';
  SELECT id INTO size_xl FROM sizes WHERE name = 'XL';
  SELECT id INTO color_black FROM colors WHERE name = 'Black';
  SELECT id INTO color_charcoal FROM colors WHERE name = 'Charcoal';
  SELECT id INTO color_navy FROM colors WHERE name = 'Navy';
  SELECT id INTO color_white FROM colors WHERE name = 'White';

  -- Classic Pullover Hoodie variants
  INSERT INTO product_variants (product_id, size_id, color_id, sku, stock_quantity) VALUES
    ('30000000-0000-0000-0000-000000000001', size_m, color_black, 'CPH-BLK-M', 15),
    ('30000000-0000-0000-0000-000000000001', size_l, color_black, 'CPH-BLK-L', 12),
    ('30000000-0000-0000-0000-000000000001', size_xl, color_black, 'CPH-BLK-XL', 8);

  -- Zip-Up Hoodie variants
  INSERT INTO product_variants (product_id, size_id, color_id, sku, stock_quantity) VALUES
    ('30000000-0000-0000-0000-000000000002', size_m, color_navy, 'ZUH-NVY-M', 10),
    ('30000000-0000-0000-0000-000000000002', size_l, color_navy, 'ZUH-NVY-L', 8);

  -- Oversized Hoodie variants
  INSERT INTO product_variants (product_id, size_id, color_id, sku, stock_quantity) VALUES
    ('30000000-0000-0000-0000-000000000003', size_l, color_charcoal, 'OH-CHR-L', 5),
    ('30000000-0000-0000-0000-000000000003', size_xl, color_charcoal, 'OH-CHR-XL', 6);

  -- Basic Cotton Tee variants
  INSERT INTO product_variants (product_id, size_id, color_id, sku, stock_quantity) VALUES
    ('30000000-0000-0000-0000-000000000004', size_s, color_white, 'BCT-WHT-S', 20),
    ('30000000-0000-0000-0000-000000000004', size_m, color_white, 'BCT-WHT-M', 25),
    ('30000000-0000-0000-0000-000000000004', size_l, color_black, 'BCT-BLK-L', 18);

  -- Graphic Print Tee variants
  INSERT INTO product_variants (product_id, size_id, color_id, sku, stock_quantity) VALUES
    ('30000000-0000-0000-0000-000000000005', size_m, color_black, 'GPT-BLK-M', 15),
    ('30000000-0000-0000-0000-000000000005', size_l, color_black, 'GPT-BLK-L', 12);

  -- Bomber Jacket variants
  INSERT INTO product_variants (product_id, size_id, color_id, sku, stock_quantity) VALUES
    ('30000000-0000-0000-0000-000000000006', size_m, color_black, 'BJ-BLK-M', 5),
    ('30000000-0000-0000-0000-000000000006', size_l, color_black, 'BJ-BLK-L', 6);

  -- Windbreaker variants
  INSERT INTO product_variants (product_id, size_id, color_id, sku, stock_quantity) VALUES
    ('30000000-0000-0000-0000-000000000007', size_m, color_navy, 'WB-NVY-M', 8),
    ('30000000-0000-0000-0000-000000000007', size_l, color_navy, 'WB-NVY-L', 7);

  -- Track Pants variants
  INSERT INTO product_variants (product_id, size_id, color_id, sku, stock_quantity) VALUES
    ('30000000-0000-0000-0000-000000000008', size_m, color_black, 'TP-BLK-M', 12),
    ('30000000-0000-0000-0000-000000000008', size_l, color_black, 'TP-BLK-L', 10),
    ('30000000-0000-0000-0000-000000000008', size_xl, color_black, 'TP-BLK-XL', 8);

  -- Jogger Pants variants
  INSERT INTO product_variants (product_id, size_id, color_id, sku, stock_quantity) VALUES
    ('30000000-0000-0000-0000-000000000009', size_m, color_charcoal, 'JP-CHR-M', 15),
    ('30000000-0000-0000-0000-000000000009', size_l, color_charcoal, 'JP-CHR-L', 12);

  -- Cargo Pants variants
  INSERT INTO product_variants (product_id, size_id, color_id, sku, stock_quantity) VALUES
    ('30000000-0000-0000-0000-000000000010', size_m, color_charcoal, 'CP-CHR-M', 10),
    ('30000000-0000-0000-0000-000000000010', size_l, color_charcoal, 'CP-CHR-L', 8);

  -- Baseball Cap (one size fits all)
  INSERT INTO product_variants (product_id, size_id, color_id, sku, stock_quantity) VALUES
    ('30000000-0000-0000-0000-000000000011', size_m, color_black, 'BC-BLK-OS', 30),
    ('30000000-0000-0000-0000-000000000011', size_m, color_navy, 'BC-NVY-OS', 25);

  -- Backpack (one size)
  INSERT INTO product_variants (product_id, size_id, color_id, sku, stock_quantity) VALUES
    ('30000000-0000-0000-0000-000000000012', size_m, color_black, 'BP-BLK-OS', 20);
END $$;

-- ============================================
-- SAMPLE PROMO CODE
-- ============================================
INSERT INTO promo_codes (code, description, discount_type, discount_value, min_order_amount, is_active) VALUES
  ('WELCOME10', 'Welcome discount - 10% off', 'percentage', 10, 500, true),
  ('FLAT100', 'Flat 100 EGP off', 'fixed', 100, 1000, true);

-- ============================================
-- SITE SETTINGS - Free Shipping
-- ============================================
INSERT INTO site_settings (key, value)
VALUES (
  'free_shipping',
  '{
    "is_active": false,
    "min_order_amount": 500
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

