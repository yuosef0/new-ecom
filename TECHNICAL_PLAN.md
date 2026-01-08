# DXLR E-Commerce Platform - Technical Execution Plan

## Executive Summary

Production-grade e-commerce platform built with Next.js 15 (App Router), Supabase, and Paymob payment integration. The existing 17 UI screens in `/ui` will be integrated without modification. Admin dashboard will be designed from scratch matching the brand aesthetics.

---

## Phase 1: Project Setup & Infrastructure

### 1.1 Project Structure

```
/new-ecom
├── /app                          # Next.js App Router
│   ├── /(storefront)             # Customer-facing routes (route group)
│   │   ├── /page.tsx             # Homepage
│   │   ├── /products
│   │   │   ├── /page.tsx         # All products
│   │   │   └── /[slug]/page.tsx  # Product details
│   │   ├── /collections/[slug]/page.tsx
│   │   ├── /categories/[slug]/page.tsx
│   │   ├── /cart/page.tsx
│   │   ├── /checkout/page.tsx
│   │   ├── /order-confirmation/[id]/page.tsx
│   │   ├── /track-order/page.tsx
│   │   ├── /wishlist/page.tsx
│   │   ├── /search/page.tsx
│   │   └── /layout.tsx           # Storefront layout
│   │
│   ├── /(admin)                  # Admin routes (route group)
│   │   ├── /admin
│   │   │   ├── /page.tsx         # Dashboard
│   │   │   ├── /products/...
│   │   │   ├── /orders/...
│   │   │   ├── /customers/...
│   │   │   ├── /collections/...
│   │   │   ├── /categories/...
│   │   │   ├── /settings/...
│   │   │   └── /layout.tsx       # Admin layout
│   │
│   ├── /(auth)                   # Auth routes
│   │   ├── /login/page.tsx
│   │   ├── /register/page.tsx
│   │   └── /forgot-password/page.tsx
│   │
│   ├── /api                      # API Routes
│   │   ├── /webhooks/paymob/route.ts
│   │   ├── /checkout/route.ts
│   │   └── /admin/...
│   │
│   ├── /layout.tsx               # Root layout
│   └── /globals.css
│
├── /components
│   ├── /storefront               # Converted UI components
│   │   ├── /layout
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   └── SideMenu.tsx
│   │   ├── /product
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── ProductGallery.tsx
│   │   │   └── VariantSelector.tsx
│   │   ├── /cart
│   │   │   ├── CartItem.tsx
│   │   │   ├── CartOverlay.tsx
│   │   │   └── CartSummary.tsx
│   │   ├── /checkout
│   │   │   ├── CheckoutForm.tsx
│   │   │   ├── ShippingForm.tsx
│   │   │   └── OrderSummary.tsx
│   │   ├── /search
│   │   │   ├── SearchOverlay.tsx
│   │   │   └── FilterPanel.tsx
│   │   └── /ui (shared primitives)
│   │
│   └── /admin                    # Admin dashboard components
│       ├── /layout
│       ├── /products
│       ├── /orders
│       └── /shared
│
├── /lib
│   ├── /supabase
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   ├── admin.ts              # Service role client (API only)
│   │   └── middleware.ts
│   ├── /paymob
│   │   ├── client.ts
│   │   ├── types.ts
│   │   └── webhook-handler.ts
│   ├── /queries                  # Data fetching functions
│   └── /utils
│
├── /hooks                        # Custom React hooks
├── /stores                       # Zustand stores
├── /types                        # TypeScript types
├── /ui (existing)                # Original HTML/CSS reference
├── /supabase
│   ├── /migrations               # Database migrations
│   └── /seed.sql
│
├── middleware.ts                 # Auth & route protection
├── next.config.ts
├── tailwind.config.ts
└── .env.local
```

### 1.2 Technology Versions

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.x | Framework (App Router) |
| React | 19.x | UI Library |
| TypeScript | 5.x | Type Safety |
| Tailwind CSS | 4.x | Styling |
| Supabase JS | 2.x | Database/Auth Client |
| Zustand | 5.x | Client State (Cart/UI) |
| Zod | 3.x | Validation |
| React Hook Form | 7.x | Form Handling |

### 1.3 Environment Configuration

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Paymob
PAYMOB_API_KEY=
PAYMOB_INTEGRATION_ID=
PAYMOB_IFRAME_ID=
PAYMOB_HMAC_SECRET=

# App
NEXT_PUBLIC_APP_URL=
```

---

## Phase 2: Database Schema Design

### 2.1 Core Tables

```sql
-- USERS & AUTH (extends Supabase auth.users)
profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- ADDRESSES
addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT, -- 'home', 'work', etc.
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  governorate TEXT NOT NULL,
  postal_code TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- CATEGORIES
categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- COLLECTIONS (seasonal, featured, etc.)
collections (
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
)

-- PRODUCTS
products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2), -- original price for discounts
  category_id UUID REFERENCES categories(id),
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- PRODUCT COLLECTIONS (many-to-many)
product_collections (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, collection_id)
)

-- PRODUCT IMAGES
product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT false
)

-- SIZE OPTIONS (reusable)
sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- 'S', 'M', 'L', 'XL', etc.
  sort_order INT DEFAULT 0
)

-- COLOR OPTIONS (reusable)
colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  hex_code TEXT NOT NULL, -- '#B12A34'
  sort_order INT DEFAULT 0
)

-- PRODUCT VARIANTS (size + color combinations)
product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  size_id UUID REFERENCES sizes(id),
  color_id UUID REFERENCES colors(id),
  sku TEXT UNIQUE,
  price_adjustment DECIMAL(10,2) DEFAULT 0, -- +/- from base price
  stock_quantity INT DEFAULT 0,
  low_stock_threshold INT DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(product_id, size_id, color_id)
)

-- WISHLIST
wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id, variant_id)
)

-- ORDERS
orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL, -- 'ORD-2024-XXXXX'
  user_id UUID REFERENCES profiles(id),
  guest_email TEXT, -- for guest checkout
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
  )),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN (
    'pending', 'paid', 'failed', 'refunded'
  )),
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EGP',

  -- Shipping details (snapshot)
  shipping_name TEXT NOT NULL,
  shipping_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_governorate TEXT NOT NULL,

  -- Payment details
  paymob_order_id TEXT,
  paymob_transaction_id TEXT,
  payment_method TEXT, -- 'card', 'wallet', 'cod'

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- ORDER ITEMS
order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),

  -- Snapshot at time of order
  product_name TEXT NOT NULL,
  variant_name TEXT, -- 'Black / XL'
  price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  total DECIMAL(10,2) NOT NULL
)

-- ORDER TRACKING
order_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- PROMO CODES
promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2),
  max_uses INT,
  used_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- SITE SETTINGS (key-value store)
site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

### 2.2 Database Indexes

```sql
-- Performance indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_stock ON product_variants(stock_quantity);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_wishlist_user ON wishlist_items(user_id);

-- Full-text search
CREATE INDEX idx_products_search ON products
  USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));
```

---

## Phase 3: Security Model (RLS Policies)

### 3.1 Role-Based Access Control

```sql
-- Helper function to check admin role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to get current user ID
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS UUID AS $$
  SELECT auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;
```

### 3.2 RLS Policies by Table

**Profiles:**
```sql
-- Users can read their own profile
CREATE POLICY "Users read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins read all profiles" ON profiles
  FOR SELECT USING (is_admin());
```

**Products (Public Read, Admin Write):**
```sql
-- Anyone can read active products
CREATE POLICY "Public read active products" ON products
  FOR SELECT USING (is_active = true);

-- Admins can read all products
CREATE POLICY "Admins read all products" ON products
  FOR SELECT USING (is_admin());

-- Only admins can insert/update/delete
CREATE POLICY "Admins manage products" ON products
  FOR ALL USING (is_admin());
```

**Orders:**
```sql
-- Users read own orders
CREATE POLICY "Users read own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Users create own orders
CREATE POLICY "Users create own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Admins full access
CREATE POLICY "Admins manage orders" ON orders
  FOR ALL USING (is_admin());
```

**Wishlist:**
```sql
-- Users manage own wishlist only
CREATE POLICY "Users manage own wishlist" ON wishlist_items
  FOR ALL USING (auth.uid() = user_id);
```

**Addresses:**
```sql
-- Users manage own addresses
CREATE POLICY "Users manage own addresses" ON addresses
  FOR ALL USING (auth.uid() = user_id);
```

### 3.3 Service Role Usage (API Routes Only)

```typescript
// lib/supabase/admin.ts - NEVER expose to client
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

**Service role used ONLY for:**
- Webhook handlers (Paymob)
- Admin API routes with middleware protection
- Stock updates after orders
- Order status updates

---

## Phase 4: Authentication & Authorization

### 4.1 Auth Strategy

| Method | Implementation |
|--------|---------------|
| Email/Password | Supabase Auth |
| Social Login | Google OAuth (optional phase 2) |
| Session Management | Supabase session + HTTP-only cookies |
| Admin Access | Role check in middleware + RLS |

### 4.2 Middleware Protection

```typescript
// middleware.ts
const protectedRoutes = ['/checkout', '/wishlist', '/orders']
const adminRoutes = ['/admin']

export async function middleware(request: NextRequest) {
  const { supabase, response } = createServerClient(request)
  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes - require auth
  if (protectedRoutes.some(r => pathname.startsWith(r))) {
    if (!user) redirect('/login')
  }

  // Admin routes - require admin role
  if (adminRoutes.some(r => pathname.startsWith(r))) {
    if (!user) redirect('/login')
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role !== 'admin') redirect('/')
  }
}
```

### 4.3 Guest Checkout Support

- Cart stored in Zustand with localStorage persistence
- Guest can proceed to checkout without account
- Email required for order tracking
- Optional account creation post-purchase

---

## Phase 5: State Management

### 5.1 State Architecture

| State Type | Solution | Scope |
|------------|----------|-------|
| Server State | React Server Components + Supabase | Products, Orders, Categories |
| Cart State | Zustand + localStorage | Client-side persistence |
| UI State | Zustand (non-persistent) | Modals, overlays, filters |
| Form State | React Hook Form | Checkout, Admin forms |
| Auth State | Supabase Auth | Session management |

### 5.2 Cart Store Structure

```typescript
interface CartStore {
  items: CartItem[]
  isOpen: boolean

  // Actions
  addItem: (product, variant, quantity) => void
  removeItem: (itemId) => void
  updateQuantity: (itemId, quantity) => void
  clearCart: () => void
  toggleCart: () => void

  // Computed
  totalItems: number
  subtotal: number
}
```

### 5.3 UI State Store

```typescript
interface UIStore {
  // Overlays
  searchOpen: boolean
  filterOpen: boolean
  menuOpen: boolean

  // Actions
  toggleSearch: () => void
  toggleFilter: () => void
  toggleMenu: () => void
  closeAll: () => void
}
```

---

## Phase 6: UI Integration Strategy

### 6.1 HTML/CSS Conversion Rules

**STRICT REQUIREMENTS:**
1. **No visual changes** - pixel-perfect preservation
2. **Extract Tailwind classes verbatim** from HTML
3. **Preserve color variables** exactly as defined
4. **Keep all Material Icons** references
5. **Maintain responsive breakpoints** (`max-w-sm`, etc.)

### 6.2 Conversion Process

```
/ui/[screen]/code.html → /components/storefront/[Component].tsx
```

**Step-by-step:**

1. **Analyze HTML structure** - Identify semantic sections
2. **Extract reusable components** - Headers, footers, cards
3. **Convert to JSX** - class→className, for→htmlFor
4. **Add TypeScript interfaces** - Props for dynamic data
5. **Replace static content** - Map over data props
6. **Add interactivity** - onClick handlers, state
7. **Connect to data** - Server Components fetch data

### 6.3 Component Mapping

| UI Screen | Components Created |
|-----------|-------------------|
| `home_page_-_winter_collection` | `HeroSection`, `ProductGrid`, `CategoryCarousel` |
| `product_details_screen` | `ProductGallery`, `VariantSelector`, `AddToCart`, `RelatedProducts` |
| `all_products_screen` | `ProductGrid`, `FilterBar`, `SortDropdown` |
| `shopping_cart_screen` | `CartPage`, `CartItem`, `CartSummary` |
| `shopping_cart_overlay_screen` | `CartOverlay` (modal) |
| `checkout_screen_1` | `CheckoutStepper`, `ShippingForm`, `ShippingMethod` |
| `checkout_screen_2` | `PaymentSection`, `OrderReview` |
| `order_confirmation_screen` | `OrderSuccess`, `OrderDetails` |
| `track_order_screen` | `OrderTracker`, `TrackingTimeline` |
| `your_wishlist_screen` | `WishlistGrid`, `WishlistItem` |
| `side_navigation_menu` | `SideMenu` (drawer) |
| `search_overlay_screen` | `SearchOverlay`, `SearchResults` |
| `filter_&_categories_screen` | `FilterPanel`, `CategoryList` |

### 6.4 Tailwind Configuration

```typescript
// tailwind.config.ts - Matching existing UI
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#B12A34',    // CTA Red
          burgundy: '#6F1D2A',   // Main brand
          dark: '#5A1621',       // Dark variant
          cream: '#F3EDE7',      // Background
          charcoal: '#1E1E1E',   // Text
          muted: '#CFC7BF',      // Borders
        }
      },
      fontFamily: {
        sans: ['Roboto', 'Inter', 'system-ui'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
      },
    }
  }
}
```

---

## Phase 7: Admin Dashboard Design

### 7.1 Design Principles

| Principle | Implementation |
|-----------|---------------|
| **Color Consistency** | Same brand palette (burgundy, cream, red CTAs) |
| **Clean & Minimal** | Generous whitespace, clear hierarchy |
| **Data-Dense** | Tables with sorting/filtering |
| **Responsive** | Works on tablet + desktop |

### 7.2 Admin Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  SIDEBAR (burgundy bg)           │   MAIN CONTENT       │
│  ─────────────────               │                      │
│  [Logo] DXLR Admin               │   Header Bar         │
│                                  │   ─────────────      │
│  Dashboard                       │   Page Title    [👤] │
│  Orders (badge)                  │                      │
│  Products                        │   ┌────────────────┐ │
│  Categories                      │   │                │ │
│  Collections                     │   │   Content      │ │
│  Customers                       │   │   Area         │ │
│  Promo Codes                     │   │                │ │
│  Settings                        │   └────────────────┘ │
│                                  │                      │
└─────────────────────────────────────────────────────────┘
```

### 7.3 Admin Pages

| Page | Features |
|------|----------|
| **Dashboard** | Revenue chart, recent orders, low stock alerts, quick stats |
| **Products** | Table view, bulk actions, filters, add/edit modal |
| **Product Editor** | Image upload, variant matrix (size×color), inventory |
| **Categories** | Tree view, drag-reorder, image upload |
| **Collections** | CRUD, featured toggle, date range |
| **Orders** | Table with status filters, detail view, status update, print |
| **Order Detail** | Items, customer info, tracking updates, refund action |
| **Customers** | List view, order history, total spent |
| **Promo Codes** | CRUD, usage stats, date validation |
| **Settings** | Shipping rates, site info, payment config |

### 7.4 Admin UI Components

Built with same Tailwind classes but admin-specific:
- `DataTable` - Sortable, filterable tables
- `StatCard` - Dashboard metrics
- `FormModal` - Slide-over forms
- `ImageUploader` - Supabase storage integration
- `StatusBadge` - Order/payment status pills
- `VariantMatrix` - Size/color grid editor

---

## Phase 8: Paymob Integration

### 8.1 Payment Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Checkout   │───▶│  Create     │───▶│  Paymob     │───▶│  Webhook    │
│  Submit     │    │  Order      │    │  iFrame     │    │  Handler    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                          │                  │                  │
                          ▼                  ▼                  ▼
                   Save order          Customer pays      Update order
                   status=pending      via card/wallet    status=paid
```

### 8.2 Implementation Steps

**1. Server-Side Order Creation (`/api/checkout`):**
```
- Validate cart items & stock
- Calculate totals with shipping
- Create order in database (status: pending)
- Call Paymob Auth API → get token
- Call Paymob Order API → get order_id
- Call Paymob Payment Key API → get payment_key
- Return payment_key + iframe_id to client
```

**2. Client-Side Payment:**
```
- Render Paymob iFrame with payment_key
- Customer enters card details
- Paymob handles 3D Secure
- Redirect to callback URL
```

**3. Webhook Handler (`/api/webhooks/paymob`):**
```
- Verify HMAC signature
- Parse transaction data
- Update order payment_status
- Update order status to 'confirmed'
- Decrement stock quantities
- Send confirmation email (optional)
```

### 8.3 Security Measures

| Risk | Mitigation |
|------|------------|
| Webhook spoofing | HMAC signature verification |
| Price manipulation | Server-side price calculation |
| Double payment | Idempotency via order_number |
| Stock overselling | Transaction-based stock decrement |
| Sensitive data exposure | Payment key single-use, server-only |

### 8.4 Paymob API Endpoints

```
POST https://accept.paymob.com/api/auth/tokens
POST https://accept.paymob.com/api/ecommerce/orders
POST https://accept.paymob.com/api/acceptance/payment_keys
```

---

## Phase 9: Performance Optimization

### 9.1 Server Components Strategy

| Route | Rendering | Caching |
|-------|-----------|---------|
| Homepage | SSG + ISR (60s) | CDN cached |
| Product Listing | SSG + ISR (60s) | CDN cached |
| Product Detail | SSG + ISR (60s) | CDN cached |
| Cart | Client Component | No cache |
| Checkout | Client Component | No cache |
| Admin | Server Component | No cache |

### 9.2 Data Fetching Patterns

```typescript
// Products page - Server Component with revalidation
export const revalidate = 60

async function ProductsPage() {
  const products = await getProducts() // Direct Supabase query
  return <ProductGrid products={products} />
}
```

### 9.3 Image Optimization

- **Supabase Storage** for product images
- **Next.js Image** component with:
  - Automatic WebP conversion
  - Responsive srcset
  - Lazy loading
  - Blur placeholder
- **Image sizes**: thumbnail (200px), card (400px), full (800px)

### 9.4 Bundle Optimization

- Dynamic imports for admin dashboard
- Route-based code splitting (automatic)
- Tree-shaking unused components
- No heavy dependencies (moment.js, lodash full)

---

## Phase 10: SEO Implementation

### 10.1 Metadata Strategy

```typescript
// app/(storefront)/products/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProduct(params.slug)
  return {
    title: `${product.name} | DXLR`,
    description: product.short_description,
    openGraph: {
      images: [product.images[0].url],
    },
  }
}
```

### 10.2 Technical SEO

| Feature | Implementation |
|---------|---------------|
| Sitemap | `app/sitemap.ts` - auto-generated |
| Robots | `app/robots.ts` |
| Canonical URLs | Metadata API |
| Structured Data | JSON-LD for products |
| Open Graph | Per-page metadata |

### 10.3 Structured Data (JSON-LD)

```typescript
// Product pages
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "...",
  "image": "...",
  "offers": {
    "@type": "Offer",
    "price": "...",
    "priceCurrency": "EGP",
    "availability": "InStock"
  }
}
```

---

## Phase 11: Deployment Architecture

### 11.1 Recommended Stack

| Service | Provider | Purpose |
|---------|----------|---------|
| Hosting | Vercel | Next.js optimized |
| Database | Supabase | PostgreSQL + Auth |
| Storage | Supabase Storage | Product images |
| CDN | Vercel Edge | Static assets |
| Monitoring | Vercel Analytics | Performance |

### 11.2 Environment Setup

```
Production:    main branch → vercel.app
Staging:       staging branch → staging.vercel.app
Development:   Local + Supabase local/dev project
```

### 11.3 CI/CD Pipeline

```yaml
# Automated on push
- Type checking (tsc)
- Linting (eslint)
- Build verification
- Deploy to Vercel
```

---

## Development Phases & Milestones

### Phase 1: Foundation (Setup)
- [ ] Initialize Next.js 15 project
- [ ] Configure Tailwind with brand colors
- [ ] Set up Supabase project
- [ ] Create database schema & migrations
- [ ] Implement RLS policies
- [ ] Set up authentication

### Phase 2: Storefront Core
- [ ] Convert all UI screens to components
- [ ] Implement storefront layout (header, footer, nav)
- [ ] Build homepage with Server Components
- [ ] Create product listing page with filters
- [ ] Build product detail page with variants

### Phase 3: E-commerce Features
- [ ] Implement cart (Zustand store)
- [ ] Build cart overlay and full cart page
- [ ] Create wishlist functionality
- [ ] Build search with overlay
- [ ] Implement category/collection pages

### Phase 4: Checkout & Payments
- [ ] Build checkout flow (2 steps)
- [ ] Integrate Paymob payment gateway
- [ ] Implement webhook handler
- [ ] Create order confirmation page
- [ ] Build order tracking page

### Phase 5: Admin Dashboard
- [ ] Build admin layout and navigation
- [ ] Create dashboard with metrics
- [ ] Implement product management (CRUD)
- [ ] Build variant/inventory management
- [ ] Create order management system
- [ ] Build category/collection editors
- [ ] Implement customer management
- [ ] Add promo code management

### Phase 6: Polish & Launch
- [ ] SEO optimization (metadata, sitemap)
- [ ] Performance audit and optimization
- [ ] Security audit
- [ ] Error handling and edge cases
- [ ] Production deployment
- [ ] Monitoring setup

---

## Critical Security Checklist

- [ ] RLS enabled on ALL tables
- [ ] Service role key NEVER in client code
- [ ] HMAC verification on Paymob webhooks
- [ ] Server-side price calculation only
- [ ] Input validation with Zod on all forms
- [ ] CSRF protection on mutations
- [ ] Rate limiting on auth endpoints
- [ ] Secure HTTP headers (CSP, etc.)
- [ ] Environment variables in `.env.local` only
- [ ] Admin routes protected by middleware
