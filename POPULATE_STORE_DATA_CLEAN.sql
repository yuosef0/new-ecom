-- ========================================
-- Fill Complete Store Data
-- ========================================

-- WARNING: This script deletes all existing data!
-- DELETE OLD DATA
DELETE FROM order_items;
DELETE FROM order_tracking;
DELETE FROM orders;
DELETE FROM wishlist_items;
DELETE FROM product_variants;
DELETE FROM product_collections;
DELETE FROM product_images;
DELETE FROM products;
DELETE FROM collections;
DELETE FROM categories;

-- CREATE CATEGORIES
INSERT INTO categories (id, name, slug, description, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Tracksuits', 'tracksuits', 'Comfortable athletic wear', true),
('550e8400-e29b-41d4-a716-446655440002', 'Sets', 'sets', 'Matching clothing sets', true),
('550e8400-e29b-41d4-a716-446655440003', 'Sweatpants', 'sweatpants', 'Casual sweatpants', true),
('550e8400-e29b-41d4-a716-446655440004', 'Hoodies', 'hoodies', 'Warm hoodies and sweatshirts', true),
('550e8400-e29b-41d4-a716-446655440005', 'T-Shirts', 't-shirts', 'Casual t-shirts', true),
('550e8400-e29b-41d4-a716-446655440006', 'Jackets', 'jackets', 'Stylish jackets', true);

-- CREATE PARENT COLLECTIONS
INSERT INTO collections (id, name, slug, description, image_url, is_featured, is_active) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'Winter Collection', 'winter-collection',
 'Warm and cozy winter essentials',
 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=600&fit=crop',
 true, true),

('650e8400-e29b-41d4-a716-446655440002', 'Summer Collection', 'summer-collection',
 'Light and breathable summer wear',
 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=600&fit=crop',
 true, true),

('650e8400-e29b-41d4-a716-446655440003', 'Fall Collection', 'fall-collection',
 'Transitional pieces for autumn',
 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&h=600&fit=crop',
 true, true);

-- CREATE CHILD COLLECTIONS (Winter)
INSERT INTO collections (id, name, slug, description, image_url, parent_id, is_featured, is_active) VALUES
('650e8400-e29b-41d4-a716-446655440011', 'Winter Track Suits', 'winter-track-suits',
 'Athletic tracksuits for cold weather',
 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop',
 '650e8400-e29b-41d4-a716-446655440001', true, true),

('650e8400-e29b-41d4-a716-446655440012', 'Winter Sets', 'winter-sets',
 'Matching winter clothing sets',
 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&fit=crop',
 '650e8400-e29b-41d4-a716-446655440001', true, true),

('650e8400-e29b-41d4-a716-446655440013', 'Winter Sweatpants', 'winter-sweatpants',
 'Warm and comfortable sweatpants',
 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=400&fit=crop',
 '650e8400-e29b-41d4-a716-446655440001', true, true),

('650e8400-e29b-41d4-a716-446655440014', 'Winter Hoodies', 'winter-hoodies',
 'Cozy hoodies for winter',
 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop',
 '650e8400-e29b-41d4-a716-446655440001', true, true);

-- CREATE CHILD COLLECTIONS (Summer)
INSERT INTO collections (id, name, slug, description, image_url, parent_id, is_featured, is_active) VALUES
('650e8400-e29b-41d4-a716-446655440021', 'Summer Track Suits', 'summer-track-suits',
 'Lightweight athletic wear for summer',
 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop',
 '650e8400-e29b-41d4-a716-446655440002', true, true),

('650e8400-e29b-41d4-a716-446655440022', 'Summer Sets', 'summer-sets',
 'Breathable summer outfits',
 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop',
 '650e8400-e29b-41d4-a716-446655440002', true, true),

('650e8400-e29b-41d4-a716-446655440023', 'Summer T-Shirts', 'summer-t-shirts',
 'Cool and casual t-shirts',
 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
 '650e8400-e29b-41d4-a716-446655440002', true, true);

-- CREATE CHILD COLLECTIONS (Fall)
INSERT INTO collections (id, name, slug, description, image_url, parent_id, is_featured, is_active) VALUES
('650e8400-e29b-41d4-a716-446655440031', 'Fall Track Suits', 'fall-track-suits',
 'Perfect for autumn workouts',
 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop',
 '650e8400-e29b-41d4-a716-446655440003', true, true),

('650e8400-e29b-41d4-a716-446655440032', 'Fall Jackets', 'fall-jackets',
 'Stylish jackets for cooler days',
 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop',
 '650e8400-e29b-41d4-a716-446655440003', true, true),

('650e8400-e29b-41d4-a716-446655440033', 'Fall Sets', 'fall-sets',
 'Versatile autumn outfits',
 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=400&fit=crop',
 '650e8400-e29b-41d4-a716-446655440003', true, true);

-- CREATE PRODUCTS (Winter)
INSERT INTO products (id, name, slug, description, base_price, compare_at_price, category_id, is_featured, is_active) VALUES
('750e8400-e29b-41d4-a716-446655440001', 'Classic Black Tracksuit', 'classic-black-tracksuit',
 'Premium quality tracksuit for winter workouts', 89.99, 129.99, '550e8400-e29b-41d4-a716-446655440001', true, true),

('750e8400-e29b-41d4-a716-446655440002', 'Navy Blue Athletic Set', 'navy-blue-athletic-set',
 'Comfortable navy tracksuit with fleece lining', 94.99, 139.99, '550e8400-e29b-41d4-a716-446655440001', true, true),

('750e8400-e29b-41d4-a716-446655440003', 'Grey Performance Tracksuit', 'grey-performance-tracksuit',
 'Moisture-wicking grey tracksuit', 79.99, 119.99, '550e8400-e29b-41d4-a716-446655440001', true, true),

('750e8400-e29b-41d4-a716-446655440004', 'Burgundy Winter Set', 'burgundy-winter-set',
 'Stylish burgundy hoodie and joggers set', 84.99, 124.99, '550e8400-e29b-41d4-a716-446655440002', true, true),

('750e8400-e29b-41d4-a716-446655440005', 'Olive Green Casual Set', 'olive-green-casual-set',
 'Relaxed fit olive set for everyday wear', 79.99, 114.99, '550e8400-e29b-41d4-a716-446655440002', true, true),

('750e8400-e29b-41d4-a716-446655440006', 'Black Fleece Joggers', 'black-fleece-joggers',
 'Warm fleece joggers with pockets', 44.99, 64.99, '550e8400-e29b-41d4-a716-446655440003', true, true),

('750e8400-e29b-41d4-a716-446655440007', 'Charcoal Slim Fit Sweatpants', 'charcoal-slim-fit-sweatpants',
 'Modern slim fit sweatpants', 49.99, 69.99, '550e8400-e29b-41d4-a716-446655440003', true, true),

('750e8400-e29b-41d4-a716-446655440008', 'Oversized Cream Hoodie', 'oversized-cream-hoodie',
 'Cozy oversized hoodie in cream', 59.99, 89.99, '550e8400-e29b-41d4-a716-446655440004', true, true);

-- CREATE PRODUCTS (Summer)
INSERT INTO products (id, name, slug, description, base_price, compare_at_price, category_id, is_featured, is_active) VALUES
('750e8400-e29b-41d4-a716-446655440011', 'White Mesh Tracksuit', 'white-mesh-tracksuit',
 'Breathable mesh tracksuit for hot weather', 69.99, 99.99, '550e8400-e29b-41d4-a716-446655440001', true, true),

('750e8400-e29b-41d4-a716-446655440012', 'Sky Blue Athletic Set', 'sky-blue-athletic-set',
 'Light and airy summer tracksuit', 64.99, 94.99, '550e8400-e29b-41d4-a716-446655440001', true, true),

('750e8400-e29b-41d4-a716-446655440013', 'Beige Linen Set', 'beige-linen-set',
 'Premium linen summer outfit', 79.99, 109.99, '550e8400-e29b-41d4-a716-446655440002', true, true),

('750e8400-e29b-41d4-a716-446655440014', 'Mint Green Casual Set', 'mint-green-casual-set',
 'Fresh mint colored summer set', 59.99, 84.99, '550e8400-e29b-41d4-a716-446655440002', true, true),

('750e8400-e29b-41d4-a716-446655440015', 'Basic White Cotton Tee', 'basic-white-cotton-tee',
 'Essential white t-shirt', 24.99, 34.99, '550e8400-e29b-41d4-a716-446655440005', true, true),

('750e8400-e29b-41d4-a716-446655440016', 'Coral Pink V-Neck Tee', 'coral-pink-v-neck-tee',
 'Soft coral pink v-neck t-shirt', 29.99, 39.99, '550e8400-e29b-41d4-a716-446655440005', true, true);

-- CREATE PRODUCTS (Fall)
INSERT INTO products (id, name, slug, description, base_price, compare_at_price, category_id, is_featured, is_active) VALUES
('750e8400-e29b-41d4-a716-446655440021', 'Rust Orange Tracksuit', 'rust-orange-tracksuit',
 'Perfect autumn color tracksuit', 84.99, 119.99, '550e8400-e29b-41d4-a716-446655440001', true, true),

('750e8400-e29b-41d4-a716-446655440022', 'Forest Green Athletic Set', 'forest-green-athletic-set',
 'Rich forest green tracksuit', 89.99, 124.99, '550e8400-e29b-41d4-a716-446655440001', true, true),

('750e8400-e29b-41d4-a716-446655440023', 'Tan Bomber Jacket', 'tan-bomber-jacket',
 'Classic bomber jacket in tan', 119.99, 159.99, '550e8400-e29b-41d4-a716-446655440006', true, true),

('750e8400-e29b-41d4-a716-446655440024', 'Black Denim Jacket', 'black-denim-jacket',
 'Versatile black denim jacket', 99.99, 139.99, '550e8400-e29b-41d4-a716-446655440006', true, true),

('750e8400-e29b-41d4-a716-446655440025', 'Caramel Knit Set', 'caramel-knit-set',
 'Cozy caramel knit outfit', 94.99, 134.99, '550e8400-e29b-41d4-a716-446655440002', true, true),

('750e8400-e29b-41d4-a716-446655440026', 'Chocolate Brown Set', 'chocolate-brown-set',
 'Rich chocolate brown matching set', 89.99, 129.99, '550e8400-e29b-41d4-a716-446655440002', true, true);

-- ADD PRODUCT IMAGES (Winter)
INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order) VALUES
('750e8400-e29b-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=500&fit=crop', 'Classic Black Tracksuit', true, 1),
('750e8400-e29b-41d4-a716-446655440002', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=500&fit=crop', 'Navy Blue Athletic Set', true, 1),
('750e8400-e29b-41d4-a716-446655440003', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&h=500&fit=crop', 'Grey Performance Tracksuit', true, 1),
('750e8400-e29b-41d4-a716-446655440004', 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=500&h=500&fit=crop', 'Burgundy Winter Set', true, 1),
('750e8400-e29b-41d4-a716-446655440005', 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=500&h=500&fit=crop', 'Olive Green Casual Set', true, 1),
('750e8400-e29b-41d4-a716-446655440006', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&h=500&fit=crop', 'Black Fleece Joggers', true, 1),
('750e8400-e29b-41d4-a716-446655440007', 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=500&h=500&fit=crop', 'Charcoal Slim Fit Sweatpants', true, 1),
('750e8400-e29b-41d4-a716-446655440008', 'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=500&h=500&fit=crop', 'Oversized Cream Hoodie', true, 1);

-- ADD PRODUCT IMAGES (Summer)
INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order) VALUES
('750e8400-e29b-41d4-a716-446655440011', 'https://images.unsplash.com/photo-1594938291221-94f18cbb5660?w=500&h=500&fit=crop', 'White Mesh Tracksuit', true, 1),
('750e8400-e29b-41d4-a716-446655440012', 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=500&h=500&fit=crop', 'Sky Blue Athletic Set', true, 1),
('750e8400-e29b-41d4-a716-446655440013', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=500&fit=crop', 'Beige Linen Set', true, 1),
('750e8400-e29b-41d4-a716-446655440014', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&h=500&fit=crop', 'Mint Green Casual Set', true, 1),
('750e8400-e29b-41d4-a716-446655440015', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop', 'Basic White Cotton Tee', true, 1),
('750e8400-e29b-41d4-a716-446655440016', 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500&h=500&fit=crop', 'Coral Pink V-Neck Tee', true, 1);

-- ADD PRODUCT IMAGES (Fall)
INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order) VALUES
('750e8400-e29b-41d4-a716-446655440021', 'https://images.unsplash.com/photo-1559582930-2485739c6fcd?w=500&h=500&fit=crop', 'Rust Orange Tracksuit', true, 1),
('750e8400-e29b-41d4-a716-446655440022', 'https://images.unsplash.com/photo-1622519407650-3df9883f76c5?w=500&h=500&fit=crop', 'Forest Green Athletic Set', true, 1),
('750e8400-e29b-41d4-a716-446655440023', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop', 'Tan Bomber Jacket', true, 1),
('750e8400-e29b-41d4-a716-446655440024', 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&h=500&fit=crop', 'Black Denim Jacket', true, 1),
('750e8400-e29b-41d4-a716-446655440025', 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&h=500&fit=crop', 'Caramel Knit Set', true, 1),
('750e8400-e29b-41d4-a716-446655440026', 'https://images.unsplash.com/photo-1544441893-675973e31985?w=500&h=500&fit=crop', 'Chocolate Brown Set', true, 1);

-- CREATE PRODUCT VARIANTS
DO $$
DECLARE
  size_s UUID;
  size_m UUID;
  size_l UUID;
  size_xl UUID;
  size_xxl UUID;
  color_black UUID;
  counter INT := 1;
  product_rec RECORD;
BEGIN
  SELECT id INTO size_s FROM sizes WHERE name = 'S';
  SELECT id INTO size_m FROM sizes WHERE name = 'M';
  SELECT id INTO size_l FROM sizes WHERE name = 'L';
  SELECT id INTO size_xl FROM sizes WHERE name = 'XL';
  SELECT id INTO size_xxl FROM sizes WHERE name = 'XXL';
  SELECT id INTO color_black FROM colors WHERE name = 'Black' LIMIT 1;

  FOR product_rec IN (SELECT id, name FROM products)
  LOOP
    INSERT INTO product_variants (product_id, size_id, color_id, sku, stock_quantity, is_active)
    VALUES (product_rec.id, size_s, color_black, 'SKU-' || counter || '-S', 15, true);
    counter := counter + 1;

    INSERT INTO product_variants (product_id, size_id, color_id, sku, stock_quantity, is_active)
    VALUES (product_rec.id, size_m, color_black, 'SKU-' || counter || '-M', 20, true);
    counter := counter + 1;

    INSERT INTO product_variants (product_id, size_id, color_id, sku, stock_quantity, is_active)
    VALUES (product_rec.id, size_l, color_black, 'SKU-' || counter || '-L', 25, true);
    counter := counter + 1;

    INSERT INTO product_variants (product_id, size_id, color_id, sku, stock_quantity, is_active)
    VALUES (product_rec.id, size_xl, color_black, 'SKU-' || counter || '-XL', 20, true);
    counter := counter + 1;

    INSERT INTO product_variants (product_id, size_id, color_id, sku, stock_quantity, is_active)
    VALUES (product_rec.id, size_xxl, color_black, 'SKU-' || counter || '-XXL', 15, true);
    counter := counter + 1;
  END LOOP;
END $$;

-- LINK PRODUCTS TO COLLECTIONS
-- Winter Track Suits
INSERT INTO product_collections (product_id, collection_id) VALUES
('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440011'),
('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440011'),
('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440011');

-- Winter Sets
INSERT INTO product_collections (product_id, collection_id) VALUES
('750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440012'),
('750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440012');

-- Winter Sweatpants
INSERT INTO product_collections (product_id, collection_id) VALUES
('750e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440013'),
('750e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440013');

-- Winter Hoodies
INSERT INTO product_collections (product_id, collection_id) VALUES
('750e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440014');

-- Summer Track Suits
INSERT INTO product_collections (product_id, collection_id) VALUES
('750e8400-e29b-41d4-a716-446655440011', '650e8400-e29b-41d4-a716-446655440021'),
('750e8400-e29b-41d4-a716-446655440012', '650e8400-e29b-41d4-a716-446655440021');

-- Summer Sets
INSERT INTO product_collections (product_id, collection_id) VALUES
('750e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440022'),
('750e8400-e29b-41d4-a716-446655440014', '650e8400-e29b-41d4-a716-446655440022');

-- Summer T-Shirts
INSERT INTO product_collections (product_id, collection_id) VALUES
('750e8400-e29b-41d4-a716-446655440015', '650e8400-e29b-41d4-a716-446655440023'),
('750e8400-e29b-41d4-a716-446655440016', '650e8400-e29b-41d4-a716-446655440023');

-- Fall Track Suits
INSERT INTO product_collections (product_id, collection_id) VALUES
('750e8400-e29b-41d4-a716-446655440021', '650e8400-e29b-41d4-a716-446655440031'),
('750e8400-e29b-41d4-a716-446655440022', '650e8400-e29b-41d4-a716-446655440031');

-- Fall Jackets
INSERT INTO product_collections (product_id, collection_id) VALUES
('750e8400-e29b-41d4-a716-446655440023', '650e8400-e29b-41d4-a716-446655440032'),
('750e8400-e29b-41d4-a716-446655440024', '650e8400-e29b-41d4-a716-446655440032');

-- Fall Sets
INSERT INTO product_collections (product_id, collection_id) VALUES
('750e8400-e29b-41d4-a716-446655440025', '650e8400-e29b-41d4-a716-446655440033'),
('750e8400-e29b-41d4-a716-446655440026', '650e8400-e29b-41d4-a716-446655440033');

-- VERIFICATION QUERIES
SELECT
  c.name AS "Collection Name",
  CASE WHEN c.parent_id IS NULL THEN 'Parent' ELSE 'Child' END AS "Type",
  p.name AS "Parent Name",
  COUNT(pc.product_id) AS "Products Count"
FROM collections c
LEFT JOIN collections p ON c.parent_id = p.id
LEFT JOIN product_collections pc ON c.id = pc.collection_id
GROUP BY c.id, c.name, c.parent_id, p.name
ORDER BY c.parent_id NULLS FIRST;

SELECT
  parent.name AS "Parent Collection",
  COUNT(DISTINCT pc.product_id) AS "Total Products"
FROM collections parent
LEFT JOIN collections child ON child.parent_id = parent.id
LEFT JOIN product_collections pc ON pc.collection_id = child.id
WHERE parent.parent_id IS NULL
GROUP BY parent.id, parent.name
ORDER BY parent.name;

SELECT
  p.name AS "Product",
  p.base_price AS "Price",
  COUNT(pv.id) AS "Variants",
  SUM(pv.stock_quantity) AS "Total Stock"
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
GROUP BY p.id, p.name, p.base_price
ORDER BY p.name;
