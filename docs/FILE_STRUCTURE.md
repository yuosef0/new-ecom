# Complete File Structure

> **Purpose:** Every file that must be created, with exact paths and descriptions.
> Files marked with `[FROM UI]` are converted from existing HTML in `/ui`.

---

## Root Directory

```
/
├── .env.local                    # Environment variables (DO NOT COMMIT)
├── .env.example                  # Example env file (commit this)
├── .gitignore                    # Git ignore rules
├── middleware.ts                 # Next.js middleware (auth gating)
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind with brand colors
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies
└── README.md                     # Project documentation
```

---

## /app Directory (Next.js App Router)

### Root Layout & Global Files

```
/app
├── layout.tsx                    # Root layout (fonts, providers)
├── globals.css                   # Global styles + Tailwind imports
├── not-found.tsx                 # 404 page
├── error.tsx                     # Error boundary
├── loading.tsx                   # Global loading state
└── sitemap.ts                    # Dynamic sitemap generation
```

### Storefront Routes (Customer-Facing)

```
/app/(storefront)
├── layout.tsx                    # Storefront layout (header, footer, overlays)
├── page.tsx                      # Homepage [FROM UI: home_page_-_winter_collection]
│
├── /products
│   ├── page.tsx                  # All products [FROM UI: all_products_screen]
│   └── /[slug]
│       └── page.tsx              # Product detail [FROM UI: product_details_screen]
│
├── /collections
│   └── /[slug]
│       └── page.tsx              # Collection page (reuse product grid)
│
├── /categories
│   └── /[slug]
│       └── page.tsx              # Category page (reuse product grid)
│
├── /cart
│   └── page.tsx                  # Full cart page [FROM UI: shopping_cart_screen]
│
├── /checkout
│   └── page.tsx                  # Checkout flow [FROM UI: checkout_screen_1, checkout_screen_2]
│
├── /order-confirmation
│   └── /[id]
│       └── page.tsx              # Order success [FROM UI: order_confirmation_screen_1]
│
├── /track-order
│   └── page.tsx                  # Order tracking [FROM UI: track_order_screen]
│
├── /wishlist
│   └── page.tsx                  # Wishlist [FROM UI: your_wishlist_screen]
│
├── /search
│   └── page.tsx                  # Search results page
│
└── /account
    ├── page.tsx                  # Account overview
    ├── /orders
    │   └── page.tsx              # Order history
    └── /addresses
        └── page.tsx              # Saved addresses
```

### Auth Routes

```
/app/(auth)
├── layout.tsx                    # Auth layout (centered, minimal)
├── /login
│   └── page.tsx                  # Login form
├── /register
│   └── page.tsx                  # Registration form
└── /forgot-password
    └── page.tsx                  # Password reset
```

### Admin Routes

```
/app/(admin)/admin
├── layout.tsx                    # Admin layout (sidebar, header)
├── page.tsx                      # Dashboard (stats, recent orders)
│
├── /products
│   ├── page.tsx                  # Product list table
│   ├── /new
│   │   └── page.tsx              # Create product form
│   └── /[id]
│       └── page.tsx              # Edit product form
│
├── /orders
│   ├── page.tsx                  # Orders table
│   └── /[id]
│       └── page.tsx              # Order detail view
│
├── /customers
│   ├── page.tsx                  # Customer list
│   └── /[id]
│       └── page.tsx              # Customer detail
│
├── /categories
│   └── page.tsx                  # Category management
│
├── /collections
│   ├── page.tsx                  # Collection list
│   └── /[id]
│       └── page.tsx              # Edit collection
│
├── /promo-codes
│   └── page.tsx                  # Promo code management
│
└── /settings
    └── page.tsx                  # Site settings
```

### API Routes

```
/app/api
├── /auth
│   └── /callback
│       └── route.ts              # Supabase auth callback
│
├── /checkout
│   └── route.ts                  # POST: Create order, initiate payment
│
├── /webhooks
│   └── /paymob
│       └── route.ts              # POST: Paymob payment webhook
│
├── /cart
│   └── /validate
│       └── route.ts              # POST: Validate cart items & stock
│
├── /products
│   └── /search
│       └── route.ts              # GET: Search products
│
└── /admin
    ├── /products
    │   └── route.ts              # CRUD operations
    ├── /orders
    │   └── /[id]
    │       └── /status
    │           └── route.ts      # PATCH: Update order status
    ├── /upload
    │   └── route.ts              # POST: Upload images to Supabase Storage
    └── /analytics
        └── route.ts              # GET: Dashboard stats
```

---

## /components Directory

### Storefront Components

```
/components/storefront
├── /layout
│   ├── Header.tsx                # [FROM UI] Top navigation bar
│   ├── BottomNav.tsx             # [FROM UI] Bottom tab navigation
│   ├── SideMenu.tsx              # [FROM UI: side_navigation_menu] Drawer menu
│   ├── AnnouncementBar.tsx       # [FROM UI] "Free shipping" banner
│   └── Footer.tsx                # Footer content (if separate from BottomNav)
│
├── /product
│   ├── ProductCard.tsx           # [FROM UI] Product grid item
│   ├── ProductGrid.tsx           # Grid wrapper for product cards
│   ├── ProductGallery.tsx        # [FROM UI] Image gallery with thumbnails
│   ├── VariantSelector.tsx       # [FROM UI] Size/color picker
│   ├── AddToCartButton.tsx       # Add to cart with quantity
│   ├── PriceDisplay.tsx          # Price with optional compare-at
│   ├── StockBadge.tsx            # In stock / Low stock / Out of stock
│   └── RelatedProducts.tsx       # "You may also like" section
│
├── /cart
│   ├── CartOverlay.tsx           # [FROM UI: shopping_cart_overlay_screen] Slide-out cart
│   ├── CartItem.tsx              # [FROM UI] Single cart item row
│   ├── CartSummary.tsx           # [FROM UI] Subtotal, shipping, total
│   ├── CartEmpty.tsx             # Empty cart state
│   └── QuantitySelector.tsx      # +/- quantity buttons
│
├── /checkout
│   ├── CheckoutStepper.tsx       # [FROM UI] Step indicator (1, 2, 3)
│   ├── ShippingForm.tsx          # [FROM UI: checkout_screen_1] Address form
│   ├── ShippingMethodSelector.tsx # Standard/Express selection
│   ├── PaymentSection.tsx        # [FROM UI: checkout_screen_2] Payment form
│   ├── OrderReview.tsx           # Order summary before payment
│   └── PromoCodeInput.tsx        # Promo code field
│
├── /search
│   ├── SearchOverlay.tsx         # [FROM UI: search_overlay_screen] Search modal
│   ├── SearchInput.tsx           # Search input with icon
│   ├── SearchResults.tsx         # Results list
│   ├── TrendingTags.tsx          # Trending search tags
│   └── RecentSearches.tsx        # Recent search history
│
├── /filter
│   ├── FilterPanel.tsx           # [FROM UI: filter_&_categories_screen] Filter drawer
│   ├── CategoryFilter.tsx        # Category checkbox list
│   ├── PriceRangeFilter.tsx      # Price range slider
│   ├── ColorFilter.tsx           # Color swatches
│   ├── SizeFilter.tsx            # Size buttons
│   └── SortDropdown.tsx          # Sort by dropdown
│
├── /order
│   ├── OrderSuccess.tsx          # [FROM UI: order_confirmation] Success message
│   ├── OrderDetails.tsx          # Order items summary
│   ├── OrderTracker.tsx          # [FROM UI: track_order_screen] Tracking timeline
│   └── OrderStatusBadge.tsx      # Status pill
│
├── /wishlist
│   ├── WishlistGrid.tsx          # [FROM UI: your_wishlist_screen] Wishlist items
│   ├── WishlistItem.tsx          # Single wishlist item
│   └── WishlistButton.tsx        # Heart icon button
│
├── /home
│   ├── HeroSection.tsx           # [FROM UI] Hero banner with CTA
│   ├── CategoryCarousel.tsx      # [FROM UI] Horizontal category scroll
│   ├── FeaturedCollection.tsx    # [FROM UI] Featured products section
│   └── CountdownTimer.tsx        # [FROM UI] Sale countdown (if present)
│
└── /ui
    ├── Button.tsx                # Reusable button (primary, secondary, outline)
    ├── Input.tsx                 # Form input with label
    ├── Badge.tsx                 # Small badge/pill
    ├── Modal.tsx                 # Modal wrapper
    ├── Drawer.tsx                # Side drawer wrapper
    ├── Skeleton.tsx              # Loading skeleton
    ├── Icon.tsx                  # Material icon wrapper
    └── Container.tsx             # Max-width container
```

### Admin Components

```
/components/admin
├── /layout
│   ├── AdminSidebar.tsx          # Sidebar navigation
│   ├── AdminHeader.tsx           # Top header with user menu
│   ├── AdminContainer.tsx        # Main content wrapper
│   └── PageHeader.tsx            # Page title + actions
│
├── /dashboard
│   ├── StatCard.tsx              # Metric card (revenue, orders, etc.)
│   ├── RevenueChart.tsx          # Revenue line chart
│   ├── RecentOrdersTable.tsx     # Last 5 orders
│   └── LowStockAlert.tsx         # Low stock warnings
│
├── /products
│   ├── ProductForm.tsx           # Create/Edit product form
│   ├── VariantMatrix.tsx         # Size x Color inventory grid
│   ├── ImageUploader.tsx         # Drag & drop image upload
│   ├── ProductTable.tsx          # Products data table
│   └── ProductFilters.tsx        # Search/filter for products
│
├── /orders
│   ├── OrderTable.tsx            # Orders data table
│   ├── OrderDetail.tsx           # Full order view
│   ├── OrderTimeline.tsx         # Order status history
│   ├── StatusUpdater.tsx         # Change order status
│   └── OrderFilters.tsx          # Filter by status/date
│
├── /categories
│   ├── CategoryTree.tsx          # Nested category view
│   ├── CategoryForm.tsx          # Create/Edit category
│   └── CategoryRow.tsx           # Single category item
│
├── /collections
│   ├── CollectionForm.tsx        # Create/Edit collection
│   ├── CollectionTable.tsx       # Collections list
│   └── ProductSelector.tsx       # Add products to collection
│
├── /customers
│   ├── CustomerTable.tsx         # Customer list
│   └── CustomerDetail.tsx        # Customer profile + orders
│
├── /promo
│   ├── PromoCodeForm.tsx         # Create/Edit promo code
│   └── PromoCodeTable.tsx        # Promo codes list
│
└── /shared
    ├── DataTable.tsx             # Generic sortable/filterable table
    ├── Pagination.tsx            # Table pagination
    ├── ConfirmDialog.tsx         # Delete confirmation modal
    ├── FormField.tsx             # Form field wrapper
    ├── StatusBadge.tsx           # Order/payment status badge
    ├── DateRangePicker.tsx       # Date range selection
    └── EmptyState.tsx            # No data placeholder
```

---

## /lib Directory

```
/lib
├── /supabase
│   ├── client.ts                 # Browser Supabase client
│   ├── server.ts                 # Server Component client
│   └── admin.ts                  # Service role client (API only)
│
├── /paymob
│   ├── client.ts                 # Paymob API functions
│   ├── types.ts                  # Paymob request/response types
│   └── webhook.ts                # Webhook verification & handling
│
├── /queries
│   ├── products.ts               # Product data fetching
│   ├── categories.ts             # Category data fetching
│   ├── collections.ts            # Collection data fetching
│   ├── orders.ts                 # Order data fetching
│   ├── cart.ts                   # Cart validation & pricing
│   └── search.ts                 # Search queries
│
├── /validations
│   ├── checkout.ts               # Checkout form schemas
│   ├── product.ts                # Product form schemas (admin)
│   ├── auth.ts                   # Login/register schemas
│   └── address.ts                # Address form schemas
│
└── /utils
    ├── index.ts                  # General utilities
    ├── format.ts                 # Formatting functions
    └── constants.ts              # App constants
```

---

## /hooks Directory

```
/hooks
├── useAuth.ts                    # Auth state hook
├── useCart.ts                    # Cart operations hook
├── useWishlist.ts                # Wishlist operations hook
├── useDebounce.ts                # Debounce utility hook
├── useMediaQuery.ts              # Responsive breakpoint hook
└── useOutsideClick.ts            # Click outside detection
```

---

## /stores Directory

```
/stores
├── cart.ts                       # Cart Zustand store
└── ui.ts                         # UI state Zustand store
```

---

## /types Directory

```
/types
├── database.ts                   # Database table types
├── cart.ts                       # Cart-specific types
├── api.ts                        # API request/response types
└── paymob.ts                     # Paymob-specific types
```

---

## /supabase Directory

```
/supabase
├── /migrations
│   ├── 001_initial_schema.sql    # Tables creation
│   ├── 002_rls_policies.sql      # Row Level Security
│   ├── 003_indexes.sql           # Performance indexes
│   └── 004_functions.sql         # Database functions
│
└── seed.sql                      # Sample data for development
```

---

## /ui Directory (Reference Only - DO NOT MODIFY)

```
/ui (existing - read-only reference)
├── home_page_-_winter_collection/
├── product_showcase_screen_1/
├── product_showcase_screen_2/
├── product_showcase_screen_3/
├── product_details_screen_(colorized_replica)_/
├── all_products_screen/
├── shopping_cart_screen/
├── shopping_cart_overlay_screen/
├── checkout_screen_1/
├── checkout_screen_2/
├── order_confirmation_screen_1/
├── order_confirmation_screen_2/
├── track_order_screen/
├── your_wishlist_screen/
├── side_navigation_menu/
├── search_overlay_screen/
└── filter_&_categories_screen/
```

---

## File Count Summary

| Directory | File Count |
|-----------|------------|
| /app | ~45 files |
| /components | ~75 files |
| /lib | ~15 files |
| /hooks | ~6 files |
| /stores | ~2 files |
| /types | ~4 files |
| /supabase | ~5 files |
| Root | ~8 files |
| **Total** | **~160 files** |
