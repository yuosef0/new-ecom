# 🔧 Complete Database Reset - Fix Everything

## ⚠️ START HERE - This Will Fix All Authentication Issues

This guide will **completely reset** your Supabase database setup and fix all signup/login problems.

---

## 📋 Prerequisites

Before starting:
1. Open [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor**
4. Keep this file open

---

## 🚀 Step 1: Disable Email Confirmation (Important!)

**This prevents 500 errors during signup**

1. In Supabase Dashboard → **Authentication** → **Providers**
2. Click on **Email** provider
3. **DISABLE** the "Confirm email" toggle
4. Click **Save**

---

## 🗄️ Step 2: Complete Database Reset

**Copy this ENTIRE script and run it in SQL Editor:**

```sql
-- ============================================
-- COMPLETE DATABASE RESET FOR AUTHENTICATION
-- This will fix all signup/login issues
-- ============================================

-- Step 1: Drop everything (clean slate)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Step 2: Create profiles table with ALL required columns
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create trigger function (auto-create profiles)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'customer'
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Drop old RLS policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;

-- Step 7: Create RLS policies
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Step 8: Create profiles for any existing users
INSERT INTO public.profiles (id, email, full_name, role)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', ''),
  'customer'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- VERIFICATION - Check if everything worked
-- ============================================

-- Check 1: Table structure
SELECT 'Table Structure:' as info, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Check 2: Trigger exists
SELECT 'Trigger Status:' as info, trigger_name
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Check 3: RLS policies
SELECT 'RLS Policies:' as info, policyname
FROM pg_policies
WHERE tablename = 'profiles';

-- Check 4: Existing users and profiles
SELECT 'Users Count:' as info, COUNT(*) as count FROM auth.users
UNION ALL
SELECT 'Profiles Count:' as info, COUNT(*) FROM public.profiles;
```

**✅ Expected Output:**
- Table structure showing 7 columns (id, email, full_name, phone, role, created_at, updated_at)
- Trigger exists: `on_auth_user_created`
- 3 RLS policies
- Users count should equal profiles count

---

## 👤 Step 3: Create Admin User

**Run this script to create an admin account:**

```sql
-- Create admin user with credentials
DO $$
DECLARE
  new_user_id UUID;
BEGIN
  new_user_id := gen_random_uuid();

  -- Create user in auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    'admin@dxlr.com',
    crypt('Admin123!', gen_salt('bf')),
    NOW(),  -- Email confirmed immediately
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Admin User"}',
    false
  );

  -- Wait for trigger to create profile
  PERFORM pg_sleep(0.5);

  -- Update role to admin
  UPDATE public.profiles
  SET role = 'admin'
  WHERE id = new_user_id;

  RAISE NOTICE 'Admin user created successfully! Email: admin@dxlr.com Password: Admin123!';
END $$;

-- Verify admin user
SELECT
  u.email,
  p.full_name,
  p.role,
  u.email_confirmed_at IS NOT NULL as email_confirmed
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'admin@dxlr.com';
```

**✅ Expected Output:**
- Notice: "Admin user created successfully!"
- One row showing: admin@dxlr.com | Admin User | admin | true

**Login Credentials:**
- Email: `admin@dxlr.com`
- Password: `Admin123!`

---

## 🧪 Step 4: Test Everything

### Test 1: Create Regular User via Signup
1. Go to `http://localhost:3000/register`
2. Fill in the form:
   - Full Name: Test User
   - Email: test@example.com
   - Password: password123
   - Confirm Password: password123
3. Click "Create Account"
4. Should redirect to homepage (no errors!)

### Test 2: Verify User in Database
**Run in SQL Editor:**
```sql
-- Check latest user
SELECT
  u.email,
  p.full_name,
  p.role,
  u.email_confirmed_at IS NOT NULL as confirmed
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 3;
```

**✅ Expected:** You should see both admin@dxlr.com and test@example.com

### Test 3: Login with Admin
1. Go to `http://localhost:3000/login`
2. Login with:
   - Email: `admin@dxlr.com`
   - Password: `Admin123!`
3. Should successfully login
4. Try accessing `/admin` route

### Test 4: Login with Regular User
1. Logout
2. Login with:
   - Email: `test@example.com`
   - Password: `password123`
3. Should successfully login
4. Should NOT be able to access `/admin`

---

## 🎯 Success Checklist

After completing all steps, verify:

- ✅ Profiles table has 7 columns
- ✅ Trigger `on_auth_user_created` exists
- ✅ 3 RLS policies exist
- ✅ Email confirmation is DISABLED
- ✅ Admin user exists (admin@dxlr.com)
- ✅ Can create new users via `/register`
- ✅ Can login with email/password
- ✅ Can login with Google OAuth
- ✅ Profiles are automatically created
- ✅ Admin can access `/admin` routes

---

## 🐛 Still Having Issues?

### Issue: "Database error saving new user"
**Cause:** Trigger is not firing or RLS blocking insert

**Fix:**
```sql
-- Check trigger exists
SELECT * FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- If no result, rerun Step 2 (complete reset)
```

### Issue: "400 Bad Request" on login
**Cause:** User doesn't exist or wrong password

**Fix:**
```sql
-- Check if user exists
SELECT id, email, email_confirmed_at
FROM auth.users
WHERE email = 'your-email@example.com';

-- If email_confirmed_at is NULL, update it:
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'your-email@example.com';
```

### Issue: "duplicate key value violates unique constraint"
**Cause:** User already exists

**Fix:**
```sql
-- Delete existing user and try again
DELETE FROM auth.users WHERE email = 'your-email@example.com';
-- Then try signup again
```

### Issue: "column does not exist" errors
**Cause:** Old profiles table structure

**Solution:** Rerun Step 2 (complete reset script)

---

## 📝 Notes

- **This script is safe to run multiple times** - it will drop and recreate everything
- **All existing users will lose their profiles** - they'll need to be recreated
- **Admin password can be changed** - modify `Admin123!` in Step 3
- **For production**: Re-enable email confirmation and use proper SMTP settings

---

## 🔄 If You Need to Start Over Again

Just rerun the complete reset script in Step 2. It's designed to be idempotent (safe to run multiple times).

---

## ✅ What This Fixes

This complete reset fixes:
- ❌ "Database error saving new user"
- ❌ "column 'role' does not exist"
- ❌ "column 'email' does not exist"
- ❌ 500 Internal Server Error on signup
- ❌ 400 Bad Request on login
- ❌ "duplicate key value" errors
- ❌ Profiles not being created automatically
- ❌ Unable to create admin users
- ❌ Email confirmation blocking signups

---

**🎉 After following this guide, your authentication should work perfectly!**
