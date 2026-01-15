# 📊 Setup Admin Analytics Function

## المشكلة
صفحة الـ Admin Dashboard بتعرض error: "Failed to fetch analytics"

السبب: Database function `get_admin_stats` مش موجودة

---

## ✅ الحل: إنشاء Database Function

### 1️⃣ افتح Supabase SQL Editor

اذهب إلى: **Supabase Dashboard** → **SQL Editor**

---

### 2️⃣ شغّل السكريبت ده

```sql
-- ============================================
-- Create Admin Stats Function
-- ============================================

-- Drop function if exists
DROP FUNCTION IF EXISTS get_admin_stats();

-- Create function to calculate admin statistics
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
  -- Total Revenue (sum of all completed/delivered orders)
  SELECT COALESCE(SUM(total), 0)
  INTO total_revenue
  FROM orders
  WHERE status IN ('confirmed', 'processing', 'shipped', 'delivered');

  -- Total Orders
  SELECT COUNT(*)
  INTO total_orders
  FROM orders;

  -- Pending Orders (orders that need action)
  SELECT COUNT(*)
  INTO pending_orders
  FROM orders
  WHERE status IN ('pending', 'confirmed');

  -- Total Customers (unique users who placed orders)
  SELECT COUNT(DISTINCT user_id)
  INTO total_customers
  FROM orders
  WHERE user_id IS NOT NULL;

  -- Total Products
  SELECT COUNT(*)
  INTO total_products
  FROM products
  WHERE is_active = true;

  -- Low Stock Count (products below threshold but not zero)
  SELECT COUNT(DISTINCT product_id)
  INTO low_stock_count
  FROM product_variants
  WHERE stock_quantity > 0
    AND stock_quantity <= low_stock_threshold;

  -- Out of Stock Count
  SELECT COUNT(DISTINCT product_id)
  INTO out_of_stock_count
  FROM product_variants
  WHERE stock_quantity = 0;

  -- Build JSON result
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

-- Grant execute permission to authenticated users
-- (API will check admin role separately)
GRANT EXECUTE ON FUNCTION get_admin_stats() TO authenticated;
```

---

### 3️⃣ تحقق من النجاح

شغّل الكويري ده للتأكد:

```sql
-- Test the function
SELECT get_admin_stats();
```

**✅ النتيجة المتوقعة:**
```json
{
  "total_revenue": 0,
  "total_orders": 0,
  "pending_orders": 0,
  "total_customers": 0,
  "total_products": 15,
  "low_stock_count": 0,
  "out_of_stock_count": 0
}
```

---

## 🧪 اختبار صفحة الـ Admin

بعد ما تشغّل السكريبت:

1. **سجل دخول كـ Admin**
2. اذهب إلى: `http://localhost:3000/admin`
3. **المفروض تشوف:**
   - ✅ Dashboard يحمل بنجاح
   - ✅ Cards بتعرض الأرقام (Total Revenue, Orders, etc.)
   - ✅ Recent Orders table
   - ✅ مفيش errors في Console

---

## 📝 ملاحظات

### إذا ظهر Error 403 (Forbidden):
معناه إنك مش admin. اعمل الخطوات دي:

```sql
-- Check your role
SELECT email, role FROM profiles WHERE email = 'your-email@example.com';

-- If not admin, update to admin
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

### إذا ظهر Error 401 (Unauthorized):
معناه إنك مش مسجل دخول. ارجع لصفحة `/login` وسجل دخول.

---

## 🔧 إضافة بيانات تجريبية (Optional)

لو عايز تشوف أرقام حقيقية في Dashboard، ممكن تضيف بيانات تجريبية:

```sql
-- Add test orders (optional)
INSERT INTO orders (
  id,
  user_id,
  order_number,
  total,
  status,
  shipping_name,
  shipping_email,
  shipping_phone,
  shipping_address,
  shipping_city,
  shipping_governorate,
  payment_method,
  created_at
)
SELECT
  gen_random_uuid(),
  (SELECT id FROM auth.users LIMIT 1), -- Use first user
  'ORD-' || LPAD((ROW_NUMBER() OVER())::TEXT, 5, '0'),
  (RANDOM() * 500 + 100)::DECIMAL(10,2), -- Random price between 100-600
  (ARRAY['pending', 'confirmed', 'delivered'])[FLOOR(RANDOM() * 3 + 1)], -- Random status
  'Test Customer ' || generate_series,
  'test' || generate_series || '@example.com',
  '010' || LPAD(generate_series::TEXT, 8, '0'),
  'Test Address ' || generate_series,
  'Cairo',
  'Cairo',
  'cash_on_delivery',
  NOW() - (generate_series || ' days')::INTERVAL
FROM generate_series(1, 10);
```

---

## ✅ Success Checklist

- ✅ Function `get_admin_stats()` created
- ✅ Function returns JSON with all stats
- ✅ Admin user can access `/admin` dashboard
- ✅ Dashboard displays stats without errors
- ✅ Recent orders show up (if any orders exist)

---

**🎉 بعد الخطوات دي، الـ Admin Dashboard هيشتغل بنجاح!**
