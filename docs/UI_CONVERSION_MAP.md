# UI Conversion Map

> **Purpose:** Exact mapping from HTML files in `/ui` to React components
> **Rule:** Preserve ALL visual styling. Extract Tailwind classes exactly as-is.

---

## Conversion Principles

### DO:
- Copy Tailwind classes exactly from HTML
- Preserve the color scheme (brand colors defined in tailwind.config.ts)
- Keep Material Icons references
- Maintain responsive classes (`max-w-sm`, etc.)
- Extract repeated patterns into components

### DO NOT:
- Change colors, spacing, or layout
- Add new visual elements
- Refactor CSS/Tailwind classes
- Remove any styling
- Use different icons

---

## Global Elements (Extract First)

These elements appear across multiple screens. Extract them once.

### Header Navigation
**Source:** `ui/home_page_-_winter_collection/code.html` (lines 15-45 approx)
**Target:** `components/storefront/layout/Header.tsx`

```
Structure:
├── Announcement Bar ("Free shipping over 999 EGP")
├── Main Nav Bar
│   ├── Menu Icon (hamburger)
│   ├── Logo ("DXLR")
│   ├── Search Icon
│   ├── Wishlist Icon (with badge)
│   └── Cart Icon (with badge)
```

**Key Classes to Preserve:**
- Background: `bg-[#F3EDE7]` or cream color
- Icons: Material Icons Outlined
- Badges: small red circles with white text

---

### Bottom Navigation
**Source:** `ui/home_page_-_winter_collection/code.html` (bottom fixed nav)
**Target:** `components/storefront/layout/BottomNav.tsx`

```
Structure:
├── Shop tab (icon + label)
├── Account tab (icon + label)
├── Wishlist tab (icon + label)
└── Cart tab (icon + label + badge)
```

**Key Classes:**
- Fixed bottom positioning
- Active state styling
- Icon + text vertical layout

---

## Screen-by-Screen Conversion

---

### Screen 1: Homepage
**Source:** `ui/home_page_-_winter_collection/code.html`
**Target:** `app/(storefront)/page.tsx`

#### Component Breakdown:

| Section | Component | Notes |
|---------|-----------|-------|
| Hero banner | `HeroSection.tsx` | Full-width image, overlay text, CTA button |
| Category carousel | `CategoryCarousel.tsx` | Horizontal scroll, circular images |
| Product grid | `ProductGrid.tsx` + `ProductCard.tsx` | 2-column grid |
| Collection promo | `FeaturedCollection.tsx` | Banner with CTA |

#### ProductCard Structure:
```
ProductCard
├── Image container (relative)
│   ├── Product image
│   ├── Discount badge (absolute, top-left) - e.g., "-18%"
│   └── Quick add button (absolute, bottom-right)
├── Product name
├── Price row
│   ├── Current price (bold)
│   └── Compare price (strikethrough, muted)
└── Size/color indicators (optional)
```

**Data Props:**
```typescript
interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    base_price: number;
    compare_at_price: number | null;
    primary_image: string;
  };
  onQuickAdd?: () => void;
}
```

---

### Screen 2: All Products
**Source:** `ui/all_products_screen/code.html`
**Target:** `app/(storefront)/products/page.tsx`

#### Component Breakdown:

| Section | Component | Notes |
|---------|-----------|-------|
| Header | Shared Header | Same as homepage |
| Filter bar | `FilterBar.tsx` | Filter button + sort dropdown |
| Product count | Inline text | "X products" |
| Product grid | `ProductGrid.tsx` | Reuse from homepage |
| Load more | Button | "Load more" or infinite scroll |

#### FilterBar Structure:
```
FilterBar
├── Filter button (opens FilterPanel)
├── Product count text
└── Sort dropdown
    ├── Newest
    ├── Price: Low to High
    ├── Price: High to Low
    └── Best Selling
```

---

### Screen 3: Product Details
**Source:** `ui/product_details_screen_(colorized_replica)_/code.html`
**Target:** `app/(storefront)/products/[slug]/page.tsx`

#### Component Breakdown:

| Section | Component | Notes |
|---------|-----------|-------|
| Back button | Link | Arrow left + "Back" |
| Image gallery | `ProductGallery.tsx` | Main image + thumbnails |
| Product info | Inline | Name, price, description |
| Color selector | `ColorSelector.tsx` | Color swatches |
| Size selector | `SizeSelector.tsx` | Size buttons |
| Quantity | `QuantitySelector.tsx` | +/- buttons |
| Add to cart | `AddToCartButton.tsx` | Full-width button |
| Description accordion | Collapsible | Product details |
| Related products | `RelatedProducts.tsx` | Horizontal scroll |

#### ProductGallery Structure:
```
ProductGallery
├── Main image (large)
└── Thumbnail row
    ├── Thumb 1 (active state)
    ├── Thumb 2
    └── Thumb 3
```

#### VariantSelector Structure:
```
VariantSelector
├── Color section
│   ├── Label ("Color: Black")
│   └── Swatch row (clickable circles)
└── Size section
    ├── Label ("Size")
    ├── Size buttons (S, M, L, XL)
    └── Size guide link
```

**Key Interactions:**
- Clicking color/size updates selected state
- Out-of-stock variants show as disabled/crossed
- Price updates if variant has price adjustment

---

### Screen 4: Shopping Cart (Full Page)
**Source:** `ui/shopping_cart_screen/code.html`
**Target:** `app/(storefront)/cart/page.tsx`

#### Component Breakdown:

| Section | Component | Notes |
|---------|-----------|-------|
| Header | "Shopping Cart" title | |
| Cart items | `CartItem.tsx` (map) | Each item row |
| Recommendations | `RelatedProducts.tsx` | "You may also like" |
| Summary | `CartSummary.tsx` | Subtotal, shipping, total |
| Checkout button | Link/Button | Goes to checkout |

#### CartItem Structure:
```
CartItem
├── Product image (thumbnail)
├── Details column
│   ├── Product name
│   ├── Variant info ("Black / L")
│   └── Price
├── Quantity selector (+/-)
└── Remove button (trash icon)
```

---

### Screen 5: Cart Overlay (Slide-out)
**Source:** `ui/shopping_cart_overlay_screen/code.html`
**Target:** `components/storefront/cart/CartOverlay.tsx`

#### Structure:
```
CartOverlay (Drawer from right)
├── Header
│   ├── "Your Cart" title
│   └── Close button (X)
├── Items list (scrollable)
│   └── CartItem (compact version)
├── Subtotal row
└── Checkout button (fixed bottom)
```

**Behavior:**
- Opens when cart icon clicked or item added
- Closes on X, outside click, or continue shopping
- Shows empty state if no items

---

### Screen 6: Checkout Step 1 (Shipping)
**Source:** `ui/checkout_screen_1/code.html`
**Target:** `app/(storefront)/checkout/page.tsx` (step 1 state)

#### Component Breakdown:

| Section | Component | Notes |
|---------|-----------|-------|
| Progress stepper | `CheckoutStepper.tsx` | Steps: Shipping → Payment → Confirm |
| Shipping form | `ShippingForm.tsx` | Address fields |
| Shipping method | `ShippingMethodSelector.tsx` | Radio buttons |
| Order summary | `OrderSummary.tsx` | Sidebar on desktop |
| Continue button | Button | Goes to step 2 |

#### ShippingForm Fields:
```
- Full name (required)
- Phone number (required)
- Email (required)
- Address line 1 (required)
- Address line 2 (optional)
- City (required)
- Governorate (dropdown, required)
- Postal code (optional)
```

#### ShippingMethodSelector:
```
Radio options:
├── Standard Delivery (50 EGP, 3-7 days)
└── Express Delivery (100 EGP, 1-2 days)
```

---

### Screen 7: Checkout Step 2 (Payment)
**Source:** `ui/checkout_screen_2/code.html`
**Target:** `app/(storefront)/checkout/page.tsx` (step 2 state)

#### Component Breakdown:

| Section | Component | Notes |
|---------|-----------|-------|
| Progress stepper | Same, step 2 active | |
| Order review | `OrderReview.tsx` | Items summary |
| Promo code | `PromoCodeInput.tsx` | Input + Apply button |
| Payment section | `PaymentSection.tsx` | Paymob iframe or redirect |
| Price breakdown | `PriceBreakdown.tsx` | Subtotal, shipping, discount, total |
| Pay button | Button | Initiates payment |

**Payment Integration:**
- Shows Paymob iframe for card entry
- Or redirects to Paymob hosted page
- Total calculated server-side

---

### Screen 8: Order Confirmation
**Source:** `ui/order_confirmation_screen_1/code.html`
**Target:** `app/(storefront)/order-confirmation/[id]/page.tsx`

#### Component Breakdown:

| Section | Component | Notes |
|---------|-----------|-------|
| Success icon | Checkmark animation | Green circle with check |
| Message | "Thank you for your order!" | |
| Order number | Display | "Order #ORD-2024-XXXXX" |
| Delivery estimate | Text | "Estimated delivery: Jan 15-18" |
| Order summary | `OrderDetails.tsx` | Items, totals |
| Actions | Buttons | "Track Order", "Continue Shopping" |

---

### Screen 9: Track Order
**Source:** `ui/track_order_screen/code.html`
**Target:** `app/(storefront)/track-order/page.tsx`

#### Component Breakdown:

| Section | Component | Notes |
|---------|-----------|-------|
| Order lookup | Form | Order number + email input |
| OR | | |
| Tracking display | `OrderTracker.tsx` | If order found |

#### OrderTracker Structure:
```
OrderTracker
├── Order header (number, date)
├── Status timeline (vertical)
│   ├── Order placed ✓
│   ├── Confirmed ✓
│   ├── Processing ✓
│   ├── Shipped (current) ●
│   └── Delivered ○
├── Shipping info
│   ├── Carrier
│   ├── Tracking number
│   └── Estimated delivery
└── Order items summary
```

---

### Screen 10: Wishlist
**Source:** `ui/your_wishlist_screen/code.html`
**Target:** `app/(storefront)/wishlist/page.tsx`

#### Component Breakdown:

| Section | Component | Notes |
|---------|-----------|-------|
| Header | "Your Wishlist" + count | |
| Grid | `WishlistGrid.tsx` | Similar to product grid |
| Empty state | If no items | "Your wishlist is empty" |

#### WishlistItem Structure:
```
WishlistItem
├── Product image
├── Remove button (heart filled → outline)
├── Product name
├── Price
└── Add to cart button
```

---

### Screen 11: Side Navigation Menu
**Source:** `ui/side_navigation_menu/code.html`
**Target:** `components/storefront/layout/SideMenu.tsx`

#### Structure:
```
SideMenu (Drawer from left)
├── Header
│   ├── Logo
│   └── Close button
├── User section
│   ├── If logged in: "Hi, [Name]"
│   └── If logged out: "Login" button
├── Navigation links
│   ├── Shop All
│   ├── Categories (expandable)
│   │   ├── Hoodies
│   │   ├── T-Shirts
│   │   └── ...
│   ├── Collections
│   ├── New Arrivals
│   └── Sale
├── Divider
└── Footer links
    ├── About Us
    ├── Contact
    ├── FAQ
    └── Track Order
```

---

### Screen 12: Search Overlay
**Source:** `ui/search_overlay_screen/code.html`
**Target:** `components/storefront/search/SearchOverlay.tsx`

#### Structure:
```
SearchOverlay (Full screen or modal)
├── Header
│   ├── Search input (with icon)
│   └── Close button
├── Recent searches (if any)
│   └── Clickable tags
├── Trending searches
│   └── Clickable tags
├── Results (when typing)
│   └── Product cards (compact)
└── "View all results" link
```

**Behavior:**
- Opens on search icon click
- Auto-focus input
- Debounced search (300ms)
- Show loading state while fetching

---

### Screen 13: Filter & Categories Panel
**Source:** `ui/filter_&_categories_screen/code.html`
**Target:** `components/storefront/filter/FilterPanel.tsx`

#### Structure:
```
FilterPanel (Drawer or slide-up)
├── Header
│   ├── "Filters" title
│   ├── Clear all button
│   └── Close button
├── Availability section
│   ├── In Stock (checkbox)
│   └── Out of Stock (checkbox)
├── Categories section
│   └── Category checkboxes
├── Price range section
│   ├── Min input
│   ├── Max input
│   └── Range slider (optional)
├── Colors section
│   └── Color swatches (multi-select)
├── Sizes section
│   └── Size buttons (multi-select)
└── Apply button (fixed bottom)
```

---

## Reusable UI Components

### Button Variants
**Target:** `components/storefront/ui/Button.tsx`

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

**Styles from UI:**
- Primary: `bg-[#B12A34] text-white`
- Secondary: `bg-[#6F1D2A] text-white`
- Outline: `border border-current bg-transparent`

---

### Input Component
**Target:** `components/storefront/ui/Input.tsx`

```typescript
interface InputProps {
  label?: string;
  error?: string;
  icon?: string; // Material icon name
  // ...standard input props
}
```

**Styles from UI:**
- Border: `border border-[#CFC7BF]`
- Focus: `focus:border-[#B12A34]`
- Error: `border-red-500`

---

### Badge Component
**Target:** `components/storefront/ui/Badge.tsx`

```typescript
interface BadgeProps {
  variant: 'discount' | 'new' | 'sold-out' | 'low-stock';
  children: React.ReactNode;
}
```

---

## Icon Usage

All icons use **Google Material Icons** (Outlined variant).

**Include in layout:**
```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet">
```

**Usage in components:**
```tsx
<span className="material-icons-outlined">shopping_cart</span>
```

**Common icons used:**
- `menu` - Hamburger
- `search` - Search
- `favorite` / `favorite_border` - Wishlist
- `shopping_cart` - Cart
- `close` - Close
- `arrow_back` - Back
- `add` / `remove` - Quantity
- `delete` - Remove item
- `check_circle` - Success
- `local_shipping` - Shipping

---

## Conversion Checklist

For each screen:

- [ ] Read source HTML completely
- [ ] Identify all Tailwind classes
- [ ] Note color values used
- [ ] Identify repeated patterns
- [ ] Create component file
- [ ] Copy structure and classes
- [ ] Add TypeScript props
- [ ] Connect to data/state
- [ ] Test visual match against `screen.png`
