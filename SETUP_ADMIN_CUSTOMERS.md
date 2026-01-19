# Setup Admin Customers Page

## Issue
Admin customers page was only showing logged-in users instead of all registered customers.

## Solution
The admin page now uses a server-side API route with admin privileges to fetch all customers.

## Required Environment Variable

You need to add the **Service Role Key** to your `.env.local` file:

### Steps:

1. **Go to Supabase Dashboard**:
   - Visit [https://app.supabase.com](https://app.supabase.com)
   - Open your project
   - Click **Settings** (⚙️) in the sidebar
   - Click **API**

2. **Find Service Role Key**:
   - Scroll down to **Project API keys**
   - Look for **service_role** (this is the secret key)
   - **⚠️ WARNING**: This key has full access - never expose it in client code!

3. **Add to `.env.local`**:
   ```bash
   # Supabase Admin (Service Role Key)
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

4. **Restart Dev Server**:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

### Example `.env.local` File:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
```

## How It Works

1. Admin visits `/admin/customers`
2. Page calls `/api/admin/customers` API route
3. API route verifies user is admin
4. API route uses `supabaseAdmin` (with service role key) to fetch **ALL** customers
5. Returns customer data with order counts

## Security

- ✅ API route checks if user is authenticated admin
- ✅ Service role key is only used server-side
- ✅ Never exposed to browser/client
- ✅ Bypasses RLS policies safely for admin operations

## Troubleshooting

**If you see "Unauthorized" or "Forbidden":**
- Make sure you're logged in as an admin user
- Check your profile has `role = 'admin'` in the database

**If customers still don't show:**
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Restart the dev server
- Check browser console for errors
- Check server terminal for API errors
