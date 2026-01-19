-- ============================================
-- SIMPLIFIED FIX FOR REGISTRATION
-- This removes the trigger completely and lets the app handle profile creation
-- ============================================

-- Step 1: Drop the trigger (we'll handle it in the app)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Keep the function but make it simpler (in case we need it later)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Try to insert, ignore if already exists
  INSERT INTO profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'customer')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the signup
    RAISE WARNING 'Could not create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: DO NOT recreate the trigger - let the app handle it
-- The app now creates profiles manually after signup

-- Step 4: Ensure RLS policies allow the app to create profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Recreate policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role can manage all profiles"
  ON profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Step 5: Verify
SELECT
  'Trigger dropped, app will handle profile creation' as status,
  (SELECT COUNT(*) FROM pg_trigger WHERE tgname = 'on_auth_user_created') as trigger_count,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles') as policy_count;
