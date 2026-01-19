-- ============================================
-- Refresh Admin Stats Function
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop the function if it exists and recreate it
DROP FUNCTION IF EXISTS get_admin_stats();

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

-- Test the function
SELECT get_admin_stats();
