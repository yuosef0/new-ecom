# Authentication Setup Guide

This guide explains how to set up authentication for the DXLR e-commerce platform.

## Features

- ✅ Email/Password Authentication
- ✅ Google OAuth Sign-in
- ✅ Protected Routes (Checkout, Wishlist, Account, Orders)
- ✅ Admin Dashboard Access
- ✅ Session Management

## Quick Start

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Get these values from:**
- Go to [Supabase Dashboard](https://app.supabase.com)
- Select your project
- Settings → API
- Copy "Project URL" and "anon public" key

### 2. Configure Google OAuth in Supabase

#### Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth client ID"
5. Choose "Web application"
6. Add Authorized redirect URIs:
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   ```
7. Copy the "Client ID" and "Client Secret"

#### Step 2: Configure in Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to Authentication → Providers
3. Enable "Google" provider
4. Paste your Google OAuth credentials:
   - Client ID
   - Client Secret
5. Click "Save"

#### Step 3: Configure Redirect URLs

In Supabase Dashboard → Authentication → URL Configuration:
- Add your site URL: `http://localhost:3000` (development)
- Add redirect URLs: `http://localhost:3000/auth/callback`

For production, update with your production domain.

### 3. Database Setup

The authentication tables are already created via migrations. Make sure you've run:

```bash
# If using Supabase CLI
supabase db push

# Or apply migrations manually in Supabase Dashboard
```

### 4. Admin Access

To make a user an admin:

1. Sign up/sign in to create an account
2. Go to Supabase Dashboard → Table Editor → `profiles`
3. Find your user record
4. Change the `role` field from `customer` to `admin`
5. Save changes

Now you can access `/admin` routes.

## Usage

### Sign In Page

Navigate to `/login` to access the sign-in page with:
- Email/Password form
- "Continue with Google" button
- Link to register page

### Testing Authentication

1. **Email/Password:**
   ```
   Email: test@example.com
   Password: yourpassword
   ```

2. **Google OAuth:**
   - Click "Continue with Google"
   - Select your Google account
   - Authorize the application
   - You'll be redirected back to the site

### Protected Routes

These routes require authentication:
- `/checkout` - Checkout process
- `/wishlist` - User's wishlist
- `/account` - User account settings
- `/orders` - Order history
- `/admin/*` - Admin dashboard (requires admin role)

## Troubleshooting

### "Invalid OAuth redirect_uri"

**Solution:** Make sure you added the correct redirect URI in Google Cloud Console:
```
https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
```

### "Auth failed" error

**Causes:**
1. Incorrect Supabase credentials in `.env.local`
2. Google OAuth not properly configured
3. Redirect URLs mismatch

**Solution:**
1. Double-check your environment variables
2. Verify Google OAuth credentials in Supabase
3. Check redirect URLs match exactly

### Can't access admin dashboard

**Solution:**
1. Make sure you're signed in
2. Check your user's `role` in the `profiles` table
3. It should be `admin` not `customer`

### Google sign-in doesn't redirect back

**Solution:**
1. Check Supabase Auth settings → URL Configuration
2. Make sure site URL and redirect URLs are set correctly
3. In development: `http://localhost:3000`
4. In production: `https://yourdomain.com`

## Security Notes

- ✅ Environment variables are never committed to git (`.env.local` in `.gitignore`)
- ✅ Supabase handles password hashing automatically
- ✅ OAuth tokens are managed securely by Supabase
- ✅ Admin routes are protected by middleware
- ✅ RLS (Row Level Security) policies are enabled in Supabase

## Next Steps

After authentication is set up:

1. Test email/password sign-in
2. Test Google OAuth sign-in
3. Create an admin user for yourself
4. Test protected routes
5. Configure email templates in Supabase (for password reset, etc.)

## Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs/guides/auth
- Review Next.js authentication: https://nextjs.org/docs/authentication
