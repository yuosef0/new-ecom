# Setup Phone Requirement

## Problem
Getting "Database error saving new user" when trying to register.

## Solution

Run this SQL in Supabase SQL Editor:

### Step 1: Update the profile creation trigger

```sql
-- Drop the existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update the function to handle phone number
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Step 2: Verify RLS policies exist

```sql
-- Check current policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- If they don't exist, create them:

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON profiles;

-- Recreate policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Allow profile creation"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow service role to insert (for the trigger)
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  TO service_role
  WITH CHECK (true);
```

### Step 3: Test the trigger

```sql
-- Check if the function exists
SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';

-- Check if the trigger exists
SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

## After Running SQL

1. Clear browser cache or use incognito mode
2. Try registering a new user
3. Should work without errors

## Troubleshooting

If still getting errors, check the Supabase logs:
1. Go to Supabase Dashboard
2. Click "Logs" in sidebar
3. Look for errors related to "profiles" or "handle_new_user"
