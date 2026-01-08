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
