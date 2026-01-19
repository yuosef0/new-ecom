-- ============================================
-- FIX REGISTRATION ERROR
-- Run this in Supabase SQL Editor to fix "Database error saving new user"
-- ============================================

-- Step 1: Drop existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Update the function to handle phone number and prevent conflicts
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

-- Step 3: Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 4: Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop old policies (if they exist)
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;

-- Step 6: Create proper RLS policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Service role can manage profiles"
  ON profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Step 7: Verify the setup
DO $$
BEGIN
  RAISE NOTICE 'Setup complete! Trigger and policies updated.';
  RAISE NOTICE 'Function exists: %', (SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user'));
  RAISE NOTICE 'Trigger exists: %', (SELECT EXISTS(SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'));
  RAISE NOTICE 'RLS enabled: %', (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles');
END $$;
