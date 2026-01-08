# API Routes Specification

> **Purpose:** Complete specification for all API routes
> **Security:** All routes validate input server-side with Zod

---

## Route Overview

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/products/search` | Public | Search products |
| POST | `/api/cart/validate` | Public | Validate cart & get prices |
| POST | `/api/checkout` | Public* | Create order & initiate payment |
| POST | `/api/webhooks/paymob` | Webhook | Handle payment callback |
| GET | `/api/auth/callback` | Public | Supabase auth callback |
| PATCH | `/api/admin/orders/[id]/status` | Admin | Update order status |
| POST | `/api/admin/products` | Admin | Create product |
| PATCH | `/api/admin/products/[id]` | Admin | Update product |
| DELETE | `/api/admin/products/[id]` | Admin | Delete product |
| POST | `/api/admin/upload` | Admin | Upload image |
| GET | `/api/admin/analytics` | Admin | Dashboard stats |

*Guest checkout allowed with email

---

## Public Routes

### GET `/api/products/search`

Search and filter products.

**Query Parameters:**
```typescript
{
  q?: string;           // Search query
  category?: string;    // Category slug
  collection?: string;  // Collection slug
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'name';
  page?: number;        // Default: 1
  limit?: number;       // Default: 20, Max: 50
}
```

**Response (200):**
```typescript
{
  products: Array<{
    id: string;
    name: string;
    slug: string;
    base_price: number;
    compare_at_price: number | null;
    primary_image: string | null;
    category: { name: string; slug: string } | null;
    in_stock: boolean;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
```

**Implementation:**
```typescript
// app/api/products/search/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  collection: z.string().optional(),
  min_price: z.coerce.number().optional(),
  max_price: z.coerce.number().optional(),
  in_stock: z.coerce.boolean().optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'name']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export async function GET(request: NextRequest) {
  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = searchSchema.safeParse(searchParams);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  }

  const supabase = await createClient();
  // ... build and execute query
}
```

---

### POST `/api/cart/validate`

Validate cart items, check stock, and return current prices.

**Request Body:**
```typescript
{
  items: Array<{
    productId: string;
    variantId: string | null;
    quantity: number;
  }>;
}
```

**Response (200):**
```typescript
{
  valid: boolean;
  items: Array<{
    productId: string;
    variantId: string | null;
    quantity: number;
    available: boolean;
    stock_quantity: number;
    price: number;           // Current price (base + adjustment)
    compare_at_price: number | null;
    product_name: string;
    variant_name: string | null;
    image_url: string | null;
  }>;
  subtotal: number;
  errors: Array<{
    productId: string;
    variantId: string | null;
    error: 'not_found' | 'out_of_stock' | 'insufficient_stock' | 'inactive';
  }>;
}
```

**Validation Schema:**
```typescript
const cartValidateSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    variantId: z.string().uuid().nullable(),
    quantity: z.number().int().min(1).max(99),
  })).min(1).max(50),
});
```

---

### POST `/api/checkout`

Create order and initiate Paymob payment.

**Request Body:**
```typescript
{
  email: string;
  shipping: {
    full_name: string;
    phone: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    governorate: string;
    postal_code?: string;
  };
  shipping_method: 'standard' | 'express';
  payment_method: 'card' | 'wallet';
  promo_code?: string;
  notes?: string;
  items: Array<{
    productId: string;
    variantId: string | null;
    quantity: number;
  }>;
}
```

**Response (200):**
```typescript
{
  order_id: string;
  order_number: string;
  payment_url: string;      // Paymob redirect URL
  // OR
  iframe_url: string;       // Paymob iframe URL
  payment_key: string;      // For iframe integration
}
```

**Response (400):**
```typescript
{
  error: string;
  details?: {
    field: string;
    message: string;
  }[];
}
```

**Implementation Flow:**
```
1. Validate request body with Zod
2. Validate cart items (stock check)
3. Calculate prices server-side
4. Apply promo code if provided
5. Calculate shipping cost
6. Create order in database (status: pending)
7. Call Paymob Auth API → get token
8. Call Paymob Order API → get order_id
9. Call Paymob Payment Key API → get payment_key
10. Return payment URL/key to client
```

**Validation Schema:**
```typescript
const checkoutSchema = z.object({
  email: z.string().email(),
  shipping: z.object({
    full_name: z.string().min(2).max(100),
    phone: z.string().min(10).max(20),
    address_line_1: z.string().min(5).max(200),
    address_line_2: z.string().max(200).optional(),
    city: z.string().min(2).max(100),
    governorate: z.string().min(2).max(100),
    postal_code: z.string().max(10).optional(),
  }),
  shipping_method: z.enum(['standard', 'express']),
  payment_method: z.enum(['card', 'wallet']),
  promo_code: z.string().max(50).optional(),
  notes: z.string().max(500).optional(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    variantId: z.string().uuid().nullable(),
    quantity: z.number().int().min(1).max(99),
  })).min(1),
});
```

---

### POST `/api/webhooks/paymob`

Handle Paymob payment notification.

**Headers Required:**
```
Content-Type: application/json
```

**Request Body (from Paymob):**
```typescript
{
  obj: {
    id: number;                    // Transaction ID
    pending: boolean;
    amount_cents: number;
    success: boolean;
    is_auth: boolean;
    is_capture: boolean;
    is_refunded: boolean;
    is_voided: boolean;
    order: {
      id: number;                  // Paymob order ID
    };
    source_data: {
      type: string;                // 'card', 'wallet'
      sub_type: string;
    };
    data: {
      // Card/wallet details
    };
  };
  type: string;                    // 'TRANSACTION'
  hmac: string;                    // HMAC signature
}
```

**Response (200):**
```typescript
{ received: true }
```

**Implementation:**
```typescript
// app/api/webhooks/paymob/route.ts
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifyPaymobHMAC } from '@/lib/paymob/webhook';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();

  // 1. Verify HMAC signature
  const isValid = verifyPaymobHMAC(body, process.env.PAYMOB_HMAC_SECRET!);
  if (!isValid) {
    console.error('Invalid Paymob HMAC');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const transaction = body.obj;
  const paymobOrderId = transaction.order.id.toString();

  // 2. Find order by Paymob order ID
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('paymob_order_id', paymobOrderId)
    .single();

  if (!order) {
    console.error('Order not found for Paymob order:', paymobOrderId);
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // 3. Check if already processed (idempotency)
  if (order.payment_status === 'paid') {
    return NextResponse.json({ received: true, already_processed: true });
  }

  // 4. Update order based on transaction status
  if (transaction.success && !transaction.is_voided && !transaction.is_refunded) {
    // Payment successful
    await supabaseAdmin.from('orders').update({
      payment_status: 'paid',
      status: 'confirmed',
      paymob_transaction_id: transaction.id.toString(),
    }).eq('id', order.id);

    // 5. Decrement stock for each item
    const { data: items } = await supabaseAdmin
      .from('order_items')
      .select('variant_id, quantity')
      .eq('order_id', order.id);

    for (const item of items || []) {
      if (item.variant_id) {
        await supabaseAdmin.rpc('decrement_stock', {
          p_variant_id: item.variant_id,
          p_quantity: item.quantity,
        });
      }
    }

    // 6. Add tracking entry
    await supabaseAdmin.from('order_tracking').insert({
      order_id: order.id,
      status: 'confirmed',
      description: 'Payment received, order confirmed',
    });

  } else {
    // Payment failed
    await supabaseAdmin.from('orders').update({
      payment_status: 'failed',
    }).eq('id', order.id);
  }

  return NextResponse.json({ received: true });
}
```

**HMAC Verification:**
```typescript
// lib/paymob/webhook.ts
import crypto from 'crypto';

export function verifyPaymobHMAC(body: any, secret: string): boolean {
  const obj = body.obj;

  // Paymob HMAC fields in specific order
  const hmacString = [
    obj.amount_cents,
    obj.created_at,
    obj.currency,
    obj.error_occured,
    obj.has_parent_transaction,
    obj.id,
    obj.integration_id,
    obj.is_3d_secure,
    obj.is_auth,
    obj.is_capture,
    obj.is_refunded,
    obj.is_standalone_payment,
    obj.is_voided,
    obj.order.id,
    obj.owner,
    obj.pending,
    obj.source_data.pan,
    obj.source_data.sub_type,
    obj.source_data.type,
    obj.success,
  ].join('');

  const calculatedHMAC = crypto
    .createHmac('sha512', secret)
    .update(hmacString)
    .digest('hex');

  return calculatedHMAC === body.hmac;
}
```

---

### GET `/api/auth/callback`

Handle Supabase auth callback (OAuth, magic link).

**Query Parameters:**
```
code: string           // Auth code from Supabase
next?: string          // Redirect path after auth
```

**Implementation:**
```typescript
// app/api/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(next, request.url));
}
```

---

## Admin Routes

All admin routes:
1. Verify user is authenticated
2. Verify user has `admin` role
3. Return 401/403 if not authorized

### Admin Auth Helper

```typescript
// lib/utils/admin-auth.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { user, profile };
}
```

---

### PATCH `/api/admin/orders/[id]/status`

Update order status.

**Request Body:**
```typescript
{
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  tracking_description?: string;
}
```

**Response (200):**
```typescript
{
  success: true;
  order: Order;
}
```

**Implementation:**
```typescript
// app/api/admin/orders/[id]/status/route.ts
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifyAdmin } from '@/lib/utils/admin-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const statusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
  tracking_description: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await verifyAdmin();
  if (auth.error) return auth.error;

  const body = await request.json();
  const parsed = statusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { status, tracking_description } = parsed.data;

  // Update order
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Add tracking entry
  await supabaseAdmin.from('order_tracking').insert({
    order_id: params.id,
    status,
    description: tracking_description || `Order status updated to ${status}`,
  });

  return NextResponse.json({ success: true, order });
}
```

---

### POST `/api/admin/products`

Create a new product.

**Request Body:**
```typescript
{
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  base_price: number;
  compare_at_price?: number;
  category_id?: string;
  is_active?: boolean;
  is_featured?: boolean;
  meta_title?: string;
  meta_description?: string;
  images?: Array<{
    url: string;
    alt_text?: string;
    is_primary?: boolean;
  }>;
  variants?: Array<{
    size_id?: string;
    color_id?: string;
    sku?: string;
    price_adjustment?: number;
    stock_quantity: number;
  }>;
}
```

**Response (201):**
```typescript
{
  success: true;
  product: Product;
}
```

---

### PATCH `/api/admin/products/[id]`

Update an existing product.

**Request Body:** Same as POST, all fields optional

**Response (200):**
```typescript
{
  success: true;
  product: Product;
}
```

---

### DELETE `/api/admin/products/[id]`

Soft delete a product (set is_active to false).

**Response (200):**
```typescript
{
  success: true;
}
```

---

### POST `/api/admin/upload`

Upload image to Supabase Storage.

**Request:** `multipart/form-data`
```
file: File           // Image file
folder?: string      // Storage folder (default: 'products')
```

**Response (200):**
```typescript
{
  url: string;       // Public URL of uploaded image
  path: string;      // Storage path
}
```

**Implementation:**
```typescript
// app/api/admin/upload/route.ts
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifyAdmin } from '@/lib/utils/admin-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const auth = await verifyAdmin();
  if (auth.error) return auth.error;

  const formData = await request.formData();
  const file = formData.get('file') as File;
  const folder = (formData.get('folder') as string) || 'products';

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large' }, { status: 400 });
  }

  // Generate unique filename
  const ext = file.name.split('.').pop();
  const filename = `${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  // Upload to Supabase Storage
  const { data, error } = await supabaseAdmin.storage
    .from('images')
    .upload(filename, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get public URL
  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('images')
    .getPublicUrl(data.path);

  return NextResponse.json({ url: publicUrl, path: data.path });
}
```

---

### GET `/api/admin/analytics`

Get dashboard statistics.

**Response (200):**
```typescript
{
  total_revenue: number;
  total_orders: number;
  pending_orders: number;
  total_customers: number;
  total_products: number;
  low_stock_count: number;
  out_of_stock_count: number;
  recent_orders: Array<{
    id: string;
    order_number: string;
    total: number;
    status: string;
    created_at: string;
    customer_name: string;
  }>;
  revenue_by_day: Array<{
    date: string;
    revenue: number;
  }>;
}
```

**Implementation:**
```typescript
// app/api/admin/analytics/route.ts
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifyAdmin } from '@/lib/utils/admin-auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const auth = await verifyAdmin();
  if (auth.error) return auth.error;

  // Get stats using database function
  const { data: stats } = await supabaseAdmin.rpc('get_admin_stats');

  // Get recent orders
  const { data: recentOrders } = await supabaseAdmin
    .from('orders')
    .select('id, order_number, total, status, created_at, shipping_name')
    .order('created_at', { ascending: false })
    .limit(10);

  return NextResponse.json({
    ...stats,
    recent_orders: recentOrders?.map(o => ({
      ...o,
      customer_name: o.shipping_name,
    })),
  });
}
```

---

## Error Response Format

All error responses follow this format:

```typescript
{
  error: string;             // Human-readable message
  code?: string;             // Error code for client handling
  details?: Array<{          // Validation errors
    field: string;
    message: string;
  }>;
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (not admin)
- `404` - Not Found
- `409` - Conflict (e.g., duplicate)
- `500` - Internal Server Error

---

## Rate Limiting

Implement rate limiting on sensitive endpoints:

| Endpoint | Limit |
|----------|-------|
| `/api/auth/*` | 10 req/min |
| `/api/checkout` | 5 req/min |
| `/api/admin/*` | 100 req/min |
| Others | 60 req/min |

Use middleware or Vercel's built-in rate limiting.
