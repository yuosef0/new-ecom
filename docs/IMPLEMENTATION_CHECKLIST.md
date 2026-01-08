# Implementation Checklist

> **How to use this document:**
> - Execute tasks in order (dependencies are noted)
> - Mark each task complete before moving to the next
> - Each task specifies exact files, commands, and acceptance criteria
> - Do NOT skip tasks or change order unless explicitly noted as parallelizable

---

## Phase 1: Project Initialization

### Task 1.1: Initialize Next.js 16 Project
```
Command: npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
```
**Expected Result:**
- `package.json` exists with Next.js 16.x
- `app/` directory created
- `tailwind.config.ts` created
- `tsconfig.json` created

**Post-Command Actions:**
1. Verify Next.js version: `cat package.json | grep next`
2. Ensure version is 16.x (if not, run `npm install next@latest`)

---

### Task 1.2: Install Required Dependencies
```
Command: npm install @supabase/supabase-js @supabase/ssr zustand zod react-hook-form @hookform/resolvers
```

**Verification:**
- All packages in `package.json` dependencies

---

### Task 1.3: Install Dev Dependencies
```
Command: npm install -D @types/node
```

---

### Task 1.4: Create Environment File
**Create:** `.env.local`
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Paymob
PAYMOB_API_KEY=your_paymob_api_key
PAYMOB_INTEGRATION_ID=your_integration_id
PAYMOB_IFRAME_ID=your_iframe_id
PAYMOB_HMAC_SECRET=your_hmac_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Also Create:** `.env.example` (same structure, no real values)

---

### Task 1.5: Update Tailwind Configuration
**File:** `tailwind.config.ts`
**Action:** Replace entire contents with:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#B12A34",
          burgundy: "#6F1D2A",
          dark: "#5A1621",
          cream: "#F3EDE7",
          charcoal: "#1E1E1E",
          muted: "#CFC7BF",
        },
      },
      fontFamily: {
        sans: ["Roboto", "Inter", "system-ui", "sans-serif"],
        display: ["Plus Jakarta Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
```

---

### Task 1.6: Create Directory Structure
**Command:**
```bash
mkdir -p app/\(storefront\) app/\(admin\)/admin app/\(auth\) app/api/webhooks/paymob app/api/checkout app/api/admin
mkdir -p components/storefront/layout components/storefront/product components/storefront/cart components/storefront/checkout components/storefront/search components/storefront/ui
mkdir -p components/admin/layout components/admin/products components/admin/orders components/admin/shared
mkdir -p lib/supabase lib/paymob lib/queries lib/utils
mkdir -p hooks stores types
mkdir -p supabase/migrations
```

**Verification:** Run `ls -la` on each directory to confirm creation

---

### Task 1.7: Create Supabase Client - Browser
**Create:** `lib/supabase/client.ts`
```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

---

### Task 1.8: Create Supabase Client - Server
**Create:** `lib/supabase/server.ts`
```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component - ignore
          }
        },
      },
    }
  );
}
```

---

### Task 1.9: Create Supabase Client - Admin (Service Role)
**Create:** `lib/supabase/admin.ts`
```typescript
import { createClient } from "@supabase/supabase-js";

// WARNING: Only use in API routes and webhooks
// NEVER import this in client components or server components
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

---

### Task 1.10: Create Middleware
**Create:** `middleware.ts` (root directory)
```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/checkout", "/wishlist", "/account", "/orders"];
const adminRoutes = ["/admin"];
const authRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Redirect authenticated users away from auth pages
  if (user && authRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Protect routes that require authentication
  if (!user && protectedRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Admin routes - just check if logged in (role check happens server-side)
  if (!user && adminRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

---

### Task 1.11: Create TypeScript Types
**Create:** `types/database.ts`
```typescript
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: "customer" | "admin";
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  base_price: number;
  compare_at_price: number | null;
  category_id: string | null;
  is_active: boolean;
  is_featured: boolean;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
}

export interface Size {
  id: string;
  name: string;
  sort_order: number;
}

export interface Color {
  id: string;
  name: string;
  hex_code: string;
  sort_order: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size_id: string | null;
  color_id: string | null;
  sku: string | null;
  price_adjustment: number;
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  guest_email: string | null;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  total: number;
  currency: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_governorate: string;
  paymob_order_id: string | null;
  paymob_transaction_id: string | null;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  product_name: string;
  variant_name: string | null;
  price: number;
  quantity: number;
  total: number;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  variant_id: string | null;
  created_at: string;
}

export interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number | null;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string | null;
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  governorate: string;
  postal_code: string | null;
  is_default: boolean;
  created_at: string;
}
```

---

### Task 1.12: Create Cart Types
**Create:** `types/cart.ts`
```typescript
export interface CartItem {
  id: string; // unique cart item id (generated client-side)
  productId: string;
  variantId: string | null;
  quantity: number;
  // Note: NO price here - prices fetched from server
}

export interface CartItemWithProduct extends CartItem {
  product: {
    name: string;
    slug: string;
    base_price: number;
    compare_at_price: number | null;
    images: Array<{ url: string; alt_text: string | null }>;
  };
  variant: {
    size_name: string | null;
    color_name: string | null;
    color_hex: string | null;
    price_adjustment: number;
    stock_quantity: number;
  } | null;
}
```

---

### Task 1.13: Create Cart Store
**Create:** `stores/cart.ts`
```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types/cart";

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (productId: string, variantId: string | null, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // Computed
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (productId, variantId, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.productId === productId && item.variantId === variantId
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === existingItem.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }

          const newItem: CartItem = {
            id: crypto.randomUUID(),
            productId,
            variantId,
            quantity,
          };

          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ items: state.items }), // Only persist items
    }
  )
);
```

---

### Task 1.14: Create UI Store
**Create:** `stores/ui.ts`
```typescript
import { create } from "zustand";

interface UIState {
  searchOpen: boolean;
  filterOpen: boolean;
  menuOpen: boolean;

  toggleSearch: () => void;
  toggleFilter: () => void;
  toggleMenu: () => void;
  closeAll: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  searchOpen: false,
  filterOpen: false,
  menuOpen: false,

  toggleSearch: () =>
    set((state) => ({
      searchOpen: !state.searchOpen,
      filterOpen: false,
      menuOpen: false,
    })),

  toggleFilter: () =>
    set((state) => ({
      filterOpen: !state.filterOpen,
      searchOpen: false,
      menuOpen: false,
    })),

  toggleMenu: () =>
    set((state) => ({
      menuOpen: !state.menuOpen,
      searchOpen: false,
      filterOpen: false,
    })),

  closeAll: () =>
    set({
      searchOpen: false,
      filterOpen: false,
      menuOpen: false,
    }),
}));
```

---

### Task 1.15: Create Validation Schemas
**Create:** `lib/validations/checkout.ts`
```typescript
import { z } from "zod";

export const shippingSchema = z.object({
  full_name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  address_line_1: z.string().min(5, "Address is required"),
  address_line_2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  governorate: z.string().min(2, "Governorate is required"),
  postal_code: z.string().optional(),
});

export const checkoutSchema = z.object({
  email: z.string().email("Valid email required"),
  shipping: shippingSchema,
  shipping_method: z.enum(["standard", "express"]),
  payment_method: z.enum(["card", "wallet"]),
  promo_code: z.string().optional(),
  notes: z.string().optional(),
});

export type ShippingFormData = z.infer<typeof shippingSchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
```

---

### Task 1.16: Create Utility Functions
**Create:** `lib/utils/index.ts`
```typescript
export function formatPrice(amount: number, currency: string = "EGP"): string {
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency,
  }).format(amount);
}

export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${year}-${random}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
```

---

### Task 1.17: Verify Phase 1 Completion
**Run:**
```bash
npm run build
```

**Expected:** Build succeeds without errors

**If errors occur:** Fix each error before proceeding to Phase 2

---

## Phase 2: Database Setup

### Task 2.1: Create Migration - Initial Schema
**Create:** `supabase/migrations/001_initial_schema.sql`

See `docs/DATABASE_MIGRATIONS.md` for complete SQL content.

---

### Task 2.2: Create Migration - RLS Policies
**Create:** `supabase/migrations/002_rls_policies.sql`

See `docs/DATABASE_MIGRATIONS.md` for complete SQL content.

---

### Task 2.3: Create Migration - Indexes
**Create:** `supabase/migrations/003_indexes.sql`

See `docs/DATABASE_MIGRATIONS.md` for complete SQL content.

---

### Task 2.4: Create Migration - Functions
**Create:** `supabase/migrations/004_functions.sql`

See `docs/DATABASE_MIGRATIONS.md` for complete SQL content.

---

### Task 2.5: Apply Migrations to Supabase
**Action:**
1. Go to Supabase Dashboard → SQL Editor
2. Execute each migration file in order (001, 002, 003, 004)
3. Verify tables created in Table Editor

**Alternatively (if using Supabase CLI):**
```bash
supabase db push
```

---

### Task 2.6: Create Seed Data
**Create:** `supabase/seed.sql`

See `docs/DATABASE_MIGRATIONS.md` for seed data content.

---

## Phase 3: Storefront Layout Components

> **Reference:** See `docs/UI_CONVERSION_MAP.md` for HTML-to-component mapping

### Task 3.1: Create Header Component
**Create:** `components/storefront/layout/Header.tsx`
**Source UI:** Extract from `ui/home_page_-_winter_collection/code.html`
**Key Elements:** Logo, search icon, wishlist icon, cart icon with badge

---

### Task 3.2: Create Bottom Navigation
**Create:** `components/storefront/layout/BottomNav.tsx`
**Source UI:** Extract footer nav from `ui/home_page_-_winter_collection/code.html`
**Key Elements:** Shop, Account, Wishlist, Cart tabs

---

### Task 3.3: Create Side Menu
**Create:** `components/storefront/layout/SideMenu.tsx`
**Source UI:** `ui/side_navigation_menu/code.html`
**Full conversion** - this is a complete screen

---

### Task 3.4: Create Storefront Layout
**Create:** `app/(storefront)/layout.tsx`
**Combines:** Header, BottomNav, SideMenu, CartOverlay

---

### Task 3.5: Create Root Layout Updates
**Update:** `app/layout.tsx`
**Add:** Font imports, global providers

---

## Phase 4: Storefront Pages

### Task 4.1 - 4.17: Convert All Storefront Pages
See `docs/UI_CONVERSION_MAP.md` for complete page-by-page instructions.

---

## Phase 5: API Routes

### Task 5.1 - 5.12: Create All API Routes
See `docs/API_ROUTES.md` for complete endpoint specifications.

---

## Phase 6: Admin Dashboard

### Task 6.1: Create Admin Layout
**Create:** `app/(admin)/admin/layout.tsx`

### Task 6.2 - 6.15: Create Admin Pages
See detailed breakdown in `docs/FILE_STRUCTURE.md`

---

## Phase 7: Payment Integration

### Task 7.1: Create Paymob Client
**Create:** `lib/paymob/client.ts`

### Task 7.2: Create Paymob Types
**Create:** `lib/paymob/types.ts`

### Task 7.3: Create Webhook Handler
**Create:** `app/api/webhooks/paymob/route.ts`

### Task 7.4: Create Checkout API
**Create:** `app/api/checkout/route.ts`

---

## Phase 8: Testing & Deployment

### Task 8.1: Test All Flows
- [ ] User registration
- [ ] Product browsing
- [ ] Add to cart
- [ ] Checkout flow
- [ ] Payment processing
- [ ] Order confirmation
- [ ] Admin product CRUD
- [ ] Admin order management

### Task 8.2: Production Build
```bash
npm run build
```

### Task 8.3: Deploy to Vercel
```bash
vercel --prod
```

---

## Completion Criteria

**Phase 1 Complete When:**
- `npm run build` succeeds
- All directories exist
- All base files created

**Phase 2 Complete When:**
- All tables exist in Supabase
- RLS policies active
- Seed data inserted

**Phase 3-4 Complete When:**
- All storefront pages render
- Navigation works
- Cart functionality works

**Phase 5 Complete When:**
- All API routes respond correctly
- Authentication works

**Phase 6 Complete When:**
- Admin dashboard accessible
- CRUD operations work

**Phase 7 Complete When:**
- Test payment succeeds
- Webhook updates order

**Phase 8 Complete When:**
- Production deployment live
- All flows tested on production
