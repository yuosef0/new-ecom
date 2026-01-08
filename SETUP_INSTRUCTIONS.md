# DXLR E-Commerce - Setup Instructions

## Current Status

✅ **Completed:**
- Project structure and configuration
- Database schemas and migrations
- Supabase client setup (browser, server, admin)
- Authentication pages (login, register, forgot password)
- API routes (checkout, webhooks, cart validation, product search)
- Paymob payment integration
- Product queries and data fetching
- Cart and order management
- All storefront components and pages

⚠️ **TODO:**
- Apply database migrations to Supabase
- Update environment variables with actual values
- Create admin dashboard (optional for MVP)
- Add seed data to database
- Test full checkout flow

---

## Prerequisites

- Node.js 20+ installed
- A Supabase account and project
- A Paymob account (for payment processing)
- Git installed

---

## Step 1: Environment Variables Setup

1. Open `.env.local` file in the root directory
2. Update the following variables with your actual values:

### Supabase Configuration

Go to your Supabase project settings:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Where to find these:**
- Dashboard → Project Settings → API
- `NEXT_PUBLIC_SUPABASE_URL`: Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Project API keys → `anon` `public`
- `SUPABASE_SERVICE_ROLE_KEY`: Project API keys → `service_role` (⚠️ Keep this secret!)

### Paymob Configuration

Get these from your Paymob account:

```env
PAYMOB_API_KEY=your_paymob_api_key
PAYMOB_INTEGRATION_ID=your_integration_id
PAYMOB_IFRAME_ID=your_iframe_id
PAYMOB_HMAC_SECRET=your_hmac_secret
```

**Where to find these:**
- Dashboard → Developers → API Keys
- Integration ID: Dashboard → Integrations
- iFrame ID: Dashboard → iFrames
- HMAC Secret: Dashboard → Developers → HMAC Secret

---

## Step 2: Database Setup

### Apply Migrations

1. Go to your Supabase Dashboard → SQL Editor
2. Execute the migration files in order:

#### Migration 001: Initial Schema
```bash
Run: supabase/migrations/001_initial_schema.sql
```
This creates all database tables (products, orders, categories, etc.)

#### Migration 002: RLS Policies
```bash
Run: supabase/migrations/002_rls_policies.sql
```
This enables Row Level Security on all tables

#### Migration 003: Indexes
```bash
Run: supabase/migrations/003_indexes.sql
```
This adds performance indexes

#### Migration 004: Functions
```bash
Run: supabase/migrations/004_functions.sql
```
This creates database functions (stock management, search, etc.)

### Add Seed Data (Optional)

For testing purposes, run:
```bash
Run: supabase/seed.sql
```
This adds sample products, categories, and collections

---

## Step 3: Create Admin User

After running migrations, create an admin user:

1. Go to Supabase Dashboard → Authentication → Users
2. Add a new user with email and password
3. Go to SQL Editor and run:

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-admin-email@example.com';
```

---

## Step 4: Install Dependencies

```bash
npm install
```

---

## Step 5: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

---

## Step 6: Test the Application

### Test Storefront

1. Navigate to homepage → should show featured products
2. Click on a product → view product details
3. Add to cart → cart should update
4. Go to checkout → fill in shipping details
5. Complete payment (use Paymob test cards)

### Test Admin Dashboard

1. Login with your admin account
2. Navigate to `/admin` → should see dashboard (if implemented)

---

## Project Structure

```
/new-ecom
├── /src
│   ├── /app
│   │   ├── /(storefront)        # Customer-facing pages
│   │   ├── /(auth)              # Login/Register pages
│   │   └── /api                 # API routes
│   ├── /components
│   │   └── /storefront          # UI components
│   ├── /lib
│   │   ├── /supabase           # Supabase clients
│   │   ├── /paymob             # Payment integration
│   │   └── /queries            # Data fetching functions
│   ├── /stores                 # Zustand stores (cart, UI)
│   └── /types                  # TypeScript types
├── /supabase
│   ├── /migrations             # Database migrations
│   └── seed.sql               # Sample data
├── /ui                         # Original HTML/CSS designs
├── .env.local                 # Environment variables
└── README.md
```

---

## Available Routes

### Storefront
- `/` - Homepage
- `/products` - All products
- `/products/[slug]` - Product details
- `/cart` - Shopping cart
- `/checkout` - Checkout flow
- `/wishlist` - User wishlist
- `/login` - Login page
- `/register` - Register page

### API
- `POST /api/checkout` - Create order and initiate payment
- `POST /api/webhooks/paymob` - Paymob payment webhook
- `POST /api/cart/validate` - Validate cart items and get prices
- `GET /api/products/search` - Search products

---

## Common Issues & Solutions

### Issue: Build fails with "Invalid supabaseUrl"
**Solution:** Update `.env.local` with actual Supabase URL

### Issue: Products don't show on homepage
**Solution:**
1. Check database has seed data
2. Verify products have `is_active = true` and `is_featured = true`
3. Check Supabase connection

### Issue: Can't login
**Solution:**
1. Verify Supabase auth is enabled
2. Check email confirmation settings in Supabase
3. Ensure RLS policies are applied

### Issue: Payment fails
**Solution:**
1. Verify Paymob credentials are correct
2. Check webhook URL is configured in Paymob dashboard
3. Use test credit cards from Paymob documentation

---

## Next Steps

1. ✅ Set up environment variables
2. ✅ Apply database migrations
3. ✅ Create admin user
4. ✅ Add sample products
5. ⏳ Test full checkout flow
6. ⏳ Deploy to production (Vercel recommended)
7. ⏳ Configure custom domain
8. ⏳ Set up monitoring and analytics

---

## Production Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Important Production Checklist

- [ ] Update all environment variables
- [ ] Enable Supabase production mode
- [ ] Configure Paymob webhook URL (use production domain)
- [ ] Set up error monitoring (Sentry recommended)
- [ ] Enable rate limiting on API routes
- [ ] Review and test all RLS policies
- [ ] Backup database regularly

---

## Support & Documentation

- **Next.js Docs:** https://nextjs.org/docs
- **Supabase Docs:** https://supabase.com/docs
- **Paymob Docs:** https://docs.paymob.com
- **Tailwind CSS:** https://tailwindcss.com/docs

For issues, check:
1. `TECHNICAL_PLAN.md` - Architecture details
2. `docs/API_ROUTES.md` - API specifications
3. `docs/DATABASE_MIGRATIONS.md` - Database schema
4. `docs/IMPLEMENTATION_CHECKLIST.md` - Full task list
