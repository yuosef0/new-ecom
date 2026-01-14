# Quick Fix: Database Error Saving New User

## The Problem
Error: `Database error saving new user`

This happens when the database trigger fails to create a profile for the new user.

## Quick Solution (SQL Scripts)

Copy these SQL commands and run them in **Supabase Dashboard → SQL Editor**

### Step 1: Check if profiles table exists
```sql
SELECT * FROM public.profiles LIMIT 1;
```

If you get an error "relation does not exist", run Step 2.
If it works, skip to Step 3.

---

### Step 2: Create profiles table (if missing)
```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
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
```

---

### Step 3: Drop existing trigger (if any)
```sql
-- Drop old trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop old function if exists
DROP FUNCTION IF EXISTS public.handle_new_user();
```

---

### Step 4: Create the trigger function
```sql
-- Create the function that will insert into profiles
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
    -- Log error but don't fail user creation
    RAISE WARNING 'Error creating profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### Step 5: Create the trigger
```sql
-- Create trigger that fires when new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

### Step 6: Add RLS policies
```sql
-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);
```

---

### Step 7: Test the trigger
```sql
-- Check if trigger exists
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

You should see one result showing the trigger is active.

---

## Alternative: Run Complete Setup

If you want to run everything at once, copy this entire script:

```sql
-- ============================================
-- COMPLETE PROFILES SETUP
-- ============================================

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing trigger/function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 4. Create function
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

-- 5. Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. Add RLS policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can read own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- 7. Verify setup
SELECT 'Profiles table exists' as status, COUNT(*) as count FROM public.profiles
UNION ALL
SELECT 'Trigger exists', COUNT(*) FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created'
UNION ALL
SELECT 'Policies exist', COUNT(*) FROM pg_policies WHERE tablename = 'profiles';
```

---

## After Running the Fix

1. **Clear any test users:**
```sql
-- Delete any incomplete users
DELETE FROM auth.users WHERE id NOT IN (SELECT id FROM public.profiles);
```

2. **Test signup again** at `/register`

3. **Verify user was created:**
```sql
-- Check recent users
SELECT u.id, u.email, p.full_name, p.role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 5;
```

---

## Still Having Issues?

### Check Supabase Logs
1. Go to Supabase Dashboard → **Logs**
2. Select **Postgres Logs**
3. Try to sign up again
4. Look for error messages

### Common Additional Fixes

**If you see "permission denied":**
```sql
-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
```

**If profiles table has wrong structure:**
```sql
-- Drop and recreate
DROP TABLE IF EXISTS public.profiles CASCADE;
-- Then run Step 2 again
```

---

## Success Check

After fixing, you should be able to:
- ✅ Sign up with email/password
- ✅ See user in Authentication → Users
- ✅ See profile in Table Editor → profiles
- ✅ Log in with the new account
