# Fix: Profiles Table Missing Columns

## The Problem
The `profiles` table doesn't have all required columns (like `role`, `email`, etc.)

## Complete Fix

Run this **COMPLETE SCRIPT** in **Supabase Dashboard → SQL Editor**:

```sql
-- ============================================
-- STEP 1: Check if profiles table exists
-- ============================================
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
  ) THEN
    -- Table exists, let's check its structure
    RAISE NOTICE 'Profiles table exists, checking structure...';
  ELSE
    RAISE NOTICE 'Profiles table does not exist';
  END IF;
END $$;

-- ============================================
-- STEP 2: Drop and recreate profiles table
-- ============================================

-- Drop existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop existing table (this will delete all data!)
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table with ALL required columns
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: Create trigger function
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 4: Create trigger
-- ============================================
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 5: Add RLS policies
-- ============================================
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Policy for reading
CREATE POLICY "Users can read own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Policy for inserting
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy for updating
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- ============================================
-- STEP 6: Create profiles for existing users
-- ============================================
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
-- STEP 7: Verify everything
-- ============================================
-- Check table structure
SELECT
  'Table columns' as check_type,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'

UNION ALL

-- Check if trigger exists
SELECT
  'Trigger exists' as check_type,
  trigger_name::text as column_name,
  'trigger'::text as data_type
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created'

UNION ALL

-- Check policies
SELECT
  'RLS Policies' as check_type,
  policyname::text as column_name,
  'policy'::text as data_type
FROM pg_policies
WHERE tablename = 'profiles';
```

---

## After Running the Script

### Create Admin User

Now you can create an admin user:

```sql
-- Create admin user
DO $$
DECLARE
  new_user_id UUID;
BEGIN
  new_user_id := gen_random_uuid();

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
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Admin User"}',
    false
  );

  PERFORM pg_sleep(0.5);

  UPDATE public.profiles
  SET role = 'admin'
  WHERE id = new_user_id;

  RAISE NOTICE 'Admin user created successfully!';
END $$;

-- Verify
SELECT u.email, p.full_name, p.role
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'admin@dxlr.com';
```

**Login credentials:**
- Email: `admin@dxlr.com`
- Password: `Admin123!`

---

## Quick Verification

Run this to verify everything is set up correctly:

```sql
-- 1. Check table structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Check if trigger exists
SELECT trigger_name
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 3. Check existing profiles
SELECT
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.created_at
FROM public.profiles p
ORDER BY p.created_at DESC
LIMIT 5;

-- 4. Check users without profiles (should be none)
SELECT u.id, u.email
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;
```

---

## Important Notes

⚠️ **WARNING:** The script above will **DELETE ALL EXISTING PROFILES**!

If you have existing users you want to keep, use this alternative:

```sql
-- Add missing columns to existing table (safer)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin'));

-- Populate email column from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- Make email NOT NULL after populating
ALTER TABLE public.profiles
ALTER COLUMN email SET NOT NULL;

-- Set default role for existing users
UPDATE public.profiles
SET role = 'customer'
WHERE role IS NULL;
```

---

## Test Signup After Fix

1. Go to `/register`
2. Create a new account
3. Check if profile was created:
```sql
SELECT * FROM public.profiles ORDER BY created_at DESC LIMIT 1;
```

---

## Make Any User Admin

```sql
-- List all users
SELECT id, email, full_name, role
FROM public.profiles
ORDER BY created_at DESC;

-- Make specific user admin (replace the ID)
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'USER-ID-HERE';
```

---

## Success Checklist

After running the fix, verify:

- ✅ Profiles table has all columns (id, email, full_name, phone, role, created_at, updated_at)
- ✅ Trigger `on_auth_user_created` exists
- ✅ RLS policies exist
- ✅ Can sign up new users
- ✅ Profiles are automatically created
- ✅ Admin user can be created
- ✅ Admin user can access `/admin` routes
