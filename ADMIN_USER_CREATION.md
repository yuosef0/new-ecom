# Fixed: Admin User Creation

## The Problem
The `profiles` table doesn't have an `email` column, so we need to use the user ID instead.

---

## Solution 1: Create Admin User (Correct Way)

Run this complete script in **Supabase Dashboard → SQL Editor**:

```sql
-- Step 1: Create the user in auth.users
DO $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Generate a new UUID for the user
  new_user_id := gen_random_uuid();

  -- Insert into auth.users
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

  -- The trigger should automatically create the profile
  -- But let's make sure and update the role

  -- Wait a moment for trigger to fire
  PERFORM pg_sleep(0.5);

  -- Update the role to admin
  UPDATE public.profiles
  SET role = 'admin'
  WHERE id = new_user_id;

  -- Show the result
  RAISE NOTICE 'Admin user created with ID: %', new_user_id;

END $$;

-- Verify the admin user was created
SELECT
  u.email,
  p.full_name,
  p.role,
  u.email_confirmed_at IS NOT NULL as email_confirmed
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'admin@dxlr.com';
```

**Login with:**
- Email: `admin@dxlr.com`
- Password: `Admin123!`

---

## Solution 2: Make Existing User Admin

If you already created a user and want to make them admin:

```sql
-- Find your user ID first
SELECT id, email, full_name, role
FROM public.profiles
ORDER BY created_at DESC
LIMIT 5;

-- Copy the ID of your user, then update:
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'YOUR-USER-ID-HERE';  -- Replace with actual UUID

-- Verify
SELECT id, full_name, role
FROM public.profiles
WHERE role = 'admin';
```

---

## Solution 3: Quick Admin Creation (Alternative)

```sql
-- Create admin user (simpler version)
WITH new_user AS (
  INSERT INTO auth.users (
    instance_id, id, aud, role, email,
    encrypted_password, email_confirmed_at,
    created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated', 'authenticated',
    'admin@dxlr.com',
    crypt('Admin123!', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Admin User"}'
  )
  RETURNING id, email
)
SELECT
  'User created: ' || email || ' (ID: ' || id || ')' as result
FROM new_user;

-- Wait a moment, then make them admin
DO $$
BEGIN
  PERFORM pg_sleep(0.5);

  UPDATE public.profiles
  SET role = 'admin'
  WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'admin@dxlr.com'
  );

  RAISE NOTICE 'User updated to admin role';
END $$;
```

---

## Check What Columns Exist

To see what columns your profiles table actually has:

```sql
-- Check profiles table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
ORDER BY ordinal_position;
```

---

## If Email Column is Missing

If you need to add the email column to profiles:

```sql
-- Add email column if missing
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email TEXT;

-- Populate email from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
AND p.email IS NULL;

-- Make it NOT NULL after populating
ALTER TABLE public.profiles
ALTER COLUMN email SET NOT NULL;
```

---

## Verify Everything Works

```sql
-- Check all admin users
SELECT
  u.email,
  p.full_name,
  p.role,
  u.created_at,
  u.email_confirmed_at IS NOT NULL as confirmed
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.role = 'admin'
ORDER BY u.created_at DESC;

-- Check if trigger is working
SELECT
  COUNT(*) as users_count,
  (SELECT COUNT(*) FROM public.profiles) as profiles_count
FROM auth.users;
-- These numbers should match!
```

---

## Test Login

After creating the admin user:

1. Go to `http://localhost:3000/login`
2. Enter:
   - Email: `admin@dxlr.com`
   - Password: `Admin123!`
3. Click "Sign In"
4. You should be redirected to homepage
5. Try to access `/admin` - it should work!

---

## Troubleshooting

**If you can't log in:**
- Check if user exists: `SELECT * FROM auth.users WHERE email = 'admin@dxlr.com';`
- Check if profile exists: `SELECT * FROM public.profiles WHERE id IN (SELECT id FROM auth.users WHERE email = 'admin@dxlr.com');`
- Check if email is confirmed: The user needs `email_confirmed_at` to be set

**If still having issues:**
Delete and recreate:
```sql
-- Delete the user (careful!)
DELETE FROM auth.users WHERE email = 'admin@dxlr.com';

-- Then run Solution 1 again
```
