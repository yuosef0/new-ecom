# Technical Execution Plan - Amendments & Clarifications

> **Document Type:** Amendment to `TECHNICAL_PLAN.md`
> **Date:** January 2026
> **Purpose:** Targeted updates for Next.js 16, security hardening, and stability improvements

---

## Amendment 1: Framework Version Update

**Affected Section:** `Phase 1: Project Setup & Infrastructure → 1.2 Technology Versions`

### Previous Specification
| Technology | Version |
|------------|---------|
| Next.js | 15.x |

### Updated Specification
| Technology | Version | Notes |
|------------|---------|-------|
| Next.js | **16.x (latest stable)** | App Router only |
| React | 19.x | Concurrent features enabled |
| TypeScript | 5.x | Strict mode required |
| Node.js | **20+ (LTS required)** | Runtime requirement |
| Tailwind CSS | 4.x (stable features only) | No experimental APIs |

### Rationale
- **Security:** Node.js 20 LTS includes latest security patches and native fetch
- **Stability:** Next.js 16 stable ensures production-ready features only
- **Performance:** Improved bundling and reduced cold starts in Next.js 16

---

## Amendment 2: Next.js 16-Specific Architectural Notes

**Affected Section:** `Phase 1: Project Setup & Infrastructure` (new subsection)

### Add New Section: 1.4 Next.js 16 Configuration

```
### 1.4 Next.js 16 Architectural Guidelines

**App Router Only:**
- All routes use the App Router (`/app` directory)
- No `/pages` directory exists in this project
- No legacy `getServerSideProps` or `getStaticProps` patterns

**Turbopack Handling:**
- Turbopack is used in development ONLY (`next dev --turbo`)
- Production builds use the stable Webpack bundler
- No Turbopack-specific features are relied upon for production

**Explicit Caching Control:**
- All data fetching uses explicit cache directives
- NO implicit caching behavior is assumed
- Fetch requests include explicit cache options:

  | Data Type | Cache Strategy |
  |-----------|---------------|
  | Products (listing) | `revalidate: 60` |
  | Product (detail) | `revalidate: 60` |
  | Categories | `revalidate: 300` |
  | Cart/Checkout | `cache: 'no-store'` |
  | Admin data | `cache: 'no-store'` |

- Route segment config is explicit:
  ```
  export const dynamic = 'force-dynamic' // for checkout, admin
  export const revalidate = 60 // for product pages
  ```

**Deprecated Patterns Avoided:**
- No `next/legacy/image` usage
- No `next/head` (use Metadata API)
- No `getInitialProps`
- No `_app.tsx` or `_document.tsx`
- No experimental features or flags
```

### Rationale
- **Stability:** Explicit caching prevents stale data bugs and unpredictable behavior
- **Security:** No-store for sensitive routes prevents data leakage
- **Performance:** ISR for catalog pages reduces database load

---

## Amendment 3: Middleware Safety Clarification

**Affected Section:** `Phase 4: Authentication & Authorization → 4.2 Middleware Protection`

### Updated Section: 4.2 Middleware Protection

```
### 4.2 Middleware Protection (Lightweight Access Gating Only)

**CRITICAL CONSTRAINTS:**
Middleware in this application is STRICTLY LIMITED to:
1. Session verification (cookie check)
2. Route-based redirect logic
3. Early access denial for unauthenticated users

**Middleware MUST NOT:**
- ❌ Query the database directly
- ❌ Perform role/permission logic
- ❌ Access Supabase service role
- ❌ Handle business logic
- ❌ Validate payment or order data
- ❌ Contain more than ~20 lines of logic

**Middleware Implementation Pattern:**
```typescript
// middleware.ts - LIGHTWEIGHT ONLY
export async function middleware(request: NextRequest) {
  const session = request.cookies.get('sb-session')

  // Simple existence check - no DB calls
  if (!session && isProtectedRoute(request.pathname)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}
```

**Role Checks Happen Server-Side:**
- Admin role verification occurs in Server Components
- RLS policies enforce data access at database level
- API routes verify permissions before mutations

**Enforcement Layers:**
| Layer | Responsibility |
|-------|---------------|
| Middleware | Route access gating (session exists?) |
| Server Component | Role check (is admin?) |
| RLS Policy | Data access (can access this row?) |
| API Route | Mutation authorization |
```

### Rationale
- **Security:** Prevents middleware bypass attacks; real security is at DB level
- **Performance:** Lightweight middleware = faster edge response
- **Stability:** No database connection issues at edge runtime

---

## Amendment 4: Tailwind CSS Stability Note

**Affected Section:** `Phase 6: UI Integration Strategy → 6.4 Tailwind Configuration`

### Add Stability Constraints

```
### 6.4 Tailwind Configuration (Stability-First)

**STABILITY REQUIREMENTS:**
- Use ONLY stable, documented Tailwind CSS features
- NO experimental features or `@apply` in complex scenarios
- NO unstable plugins or community plugins without audit
- NO JIT-only features that may change

**Approved Plugins (Official Only):**
- `@tailwindcss/forms` - Form element normalization
- `@tailwindcss/typography` - Prose styling (if needed)

**Prohibited:**
- ❌ `@tailwindcss/container-queries` (evaluate stability first)
- ❌ Arbitrary third-party plugins
- ❌ `important: true` global override
- ❌ Complex custom variants

**Configuration Approach:**
- Extend theme with brand colors (as specified)
- Use semantic color names for maintainability
- Avoid arbitrary values `[#xyz]` when theme values exist
- Keep config minimal and auditable
```

### Rationale
- **Stability:** Prevents build issues from experimental features
- **Performance:** Smaller CSS output without unused plugins
- **Security:** No untrusted third-party code in build pipeline

---

## Amendment 5: Forms & Validation Clarification

**Affected Section:** `Phase 5: State Management` (expand forms handling)

### Add New Section: 5.4 Forms & Validation Strategy

```
### 5.4 Forms & Validation (Defense in Depth)

**CRITICAL PRINCIPLE:**
Client-side validation is for UX ONLY. Server-side validation is MANDATORY.

**Validation Architecture:**
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  React Hook     │────▶│  API Route      │────▶│  Database       │
│  Form + Zod     │     │  Zod Validation │     │  Constraints    │
│  (UX feedback)  │     │  (AUTHORITATIVE)│     │  (Final guard)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
      CLIENT                 SERVER                  DATABASE
   Never trusted          Source of truth         Type enforcement
```

**React Hook Form Usage:**
- Provides instant UX feedback
- Reduces server round-trips for typos
- NEVER trusted for security decisions

**Server-Side Zod Validation:**
- ALL API routes validate input with Zod
- Schemas are shared between client/server
- Invalid data returns 400 with safe error messages
- No raw user input touches database queries

**Example Pattern:**
```typescript
// Shared schema
const checkoutSchema = z.object({
  email: z.string().email(),
  shipping: addressSchema,
  items: z.array(cartItemSchema).min(1),
})

// API Route - ALWAYS validates
export async function POST(req: Request) {
  const body = await req.json()
  const result = checkoutSchema.safeParse(body)

  if (!result.success) {
    return Response.json({ error: 'Invalid data' }, { status: 400 })
  }

  // Now safe to use result.data
}
```

**Sensitive Field Handling:**
- Prices are NEVER accepted from client
- Stock is verified server-side before order
- User IDs come from session, not request body
```

### Rationale
- **Security:** Prevents injection and data manipulation attacks
- **Stability:** Consistent validation logic across stack
- **Performance:** Shared schemas = no duplication

---

## Amendment 6: State Management Safety

**Affected Section:** `Phase 5: State Management → 5.1 State Architecture`

### Add Security Constraints

```
### 5.1 State Architecture (Security Boundaries)

**CLIENT-SIDE STATE RESTRICTIONS:**

Zustand stores may contain:
- ✅ Cart items (product IDs, quantities, selected variants)
- ✅ UI state (modals open, filters selected, search query)
- ✅ User preferences (theme, locale)

Zustand stores MUST NOT contain:
- ❌ Authentication tokens or session data
- ❌ User roles or permissions
- ❌ Prices (authoritative prices come from server)
- ❌ Inventory/stock counts
- ❌ Payment information
- ❌ Admin privileges

**localStorage Usage:**
| Allowed | Prohibited |
|---------|-----------|
| Cart item IDs | Auth tokens |
| UI preferences | User PII |
| Recently viewed | Payment data |
| | Role/permission flags |

**Cart Price Handling:**
- Cart stores product IDs and quantities only
- Display prices are fetched fresh from server
- Final order total is calculated server-side
- Client cart is for UX convenience, not pricing authority

**Example Safe Cart Store:**
```typescript
interface CartStore {
  items: Array<{
    productId: string
    variantId: string
    quantity: number
    // NO price field - prices come from server
  }>
  // Actions that don't handle sensitive data
  addItem: (productId, variantId, qty) => void
  removeItem: (itemId) => void
}
```
```

### Rationale
- **Security:** Prevents price manipulation and privilege escalation
- **Stability:** Single source of truth for critical data (server)
- **Performance:** Smaller localStorage footprint

---

## Amendment 7: Supabase Security Reinforcement

**Affected Section:** `Phase 3: Security Model (RLS Policies)`

### Expand Section: 3.0 Security Model Fundamentals

```
### 3.0 Security Model Fundamentals (Mandatory)

**RLS COVERAGE REQUIREMENT:**
Row Level Security MUST be enabled on ALL tables, including:
- ✅ Primary tables (products, orders, profiles)
- ✅ Junction tables (product_collections, wishlist_items)
- ✅ Lookup tables (sizes, colors, categories)
- ✅ Settings tables (site_settings, promo_codes)

**No table may have RLS disabled in production.**

**Service Role Key Handling:**

| Environment | Location | Accessible To |
|-------------|----------|---------------|
| Server | `.env.local` | API routes, webhooks only |
| Client | NEVER | N/A |
| Edge/Middleware | NEVER | N/A |
| Build time | NEVER | N/A |

**Service Role Permitted Operations:**
- Webhook handlers (Paymob callback)
- Admin API routes (after role verification)
- Stock decrement after payment confirmation
- Order status updates from webhooks

**Service Role Prohibited Operations:**
- ❌ Any client-side code
- ❌ Server Components (use user's session instead)
- ❌ Middleware
- ❌ Build-time data fetching

**Defense in Depth Layers:**
```
1. Middleware     → Route exists? Session present?
2. Server Component → User role permitted for this page?
3. RLS Policy     → User can access this specific row?
4. API Route      → User authorized for this mutation?
5. Database       → Constraints prevent invalid state?
```

**Anon Key Usage:**
- Used for public read operations (active products)
- Combined with RLS for user-specific data
- Never bypasses RLS policies
```

### Rationale
- **Security:** Multiple layers prevent single-point failures
- **Stability:** RLS prevents accidental data exposure
- **Performance:** RLS filtering happens at database level (efficient)

---

## Amendment 8: Search & Indexing Safety

**Affected Section:** `Phase 2: Database Schema Design → 2.2 Database Indexes`

### Replace Search Index Section

```
### 2.2 Database Indexes (Including Safe Search)

**Performance Indexes:** (unchanged)

**Full-Text Search Configuration:**

⚠️ **Language Tokenization Consideration:**
The default `english` configuration is used as a baseline.
For Arabic/multilingual content, this requires evaluation:

**Option A: Simple Configuration (Recommended for MVP)**
```sql
-- Language-agnostic, works for mixed content
CREATE INDEX idx_products_search ON products
  USING GIN(to_tsvector('simple', name || ' ' || COALESCE(description, '')));
```

**Option B: Weighted Multi-Language (Future Enhancement)**
```sql
-- Separate columns for different language handling
-- Evaluate based on actual content patterns
```

**Search Safety Rules:**
- Search queries are parameterized (never concatenated)
- Search results respect RLS policies
- No sensitive fields in search index:
  - ❌ Internal notes
  - ❌ Cost prices
  - ❌ Supplier information
  - ❌ Customer data

**Indexed Fields (Safe for Search):**
- ✅ Product name
- ✅ Product description (public)
- ✅ Category names
- ✅ Collection names

**Search Query Sanitization:**
```typescript
// Safe search pattern
const searchProducts = async (query: string) => {
  const sanitized = query.trim().slice(0, 100) // Length limit

  return supabase
    .from('products')
    .select('id, name, slug, base_price')
    .textSearch('name', sanitized, { type: 'websearch' })
    .eq('is_active', true) // RLS also enforces this
    .limit(20)
}
```
```

### Rationale
- **Security:** Prevents search injection and data exposure
- **Stability:** Simple tokenizer works reliably across content types
- **Performance:** GIN index optimized for text search operations

---

## Summary of Amendments

| # | Section | Change Type | Primary Benefit |
|---|---------|-------------|-----------------|
| 1 | Technology Versions | Update | Stability (Next.js 16, Node 20) |
| 2 | Next.js Config | Addition | Stability (explicit caching) |
| 3 | Middleware | Clarification | Security (lightweight only) |
| 4 | Tailwind CSS | Addition | Stability (no experimental) |
| 5 | Forms/Validation | Addition | Security (server-side authority) |
| 6 | State Management | Clarification | Security (no sensitive client state) |
| 7 | Supabase RLS | Expansion | Security (mandatory on all tables) |
| 8 | Search Indexing | Replacement | Security (safe search patterns) |

---

## Implementation Note

These amendments should be applied to `TECHNICAL_PLAN.md` by:
1. Updating version numbers in Section 1.2
2. Adding Section 1.4 (Next.js 16 Guidelines)
3. Replacing Section 4.2 with amended middleware section
4. Adding stability note to Section 6.4
5. Adding Section 5.4 (Forms & Validation)
6. Adding security constraints to Section 5.1
7. Adding Section 3.0 before existing 3.1
8. Replacing search index content in Section 2.2

All other sections remain unchanged.
