# Troubleshooting: 500 Error on User Signup

## Problem
When trying to create a new user account, you get:
```
POST https://[your-project].supabase.co/auth/v1/signup 500 (Internal Server Error)
```

## Common Causes & Solutions

### 1. Email Confirmation Disabled ⚠️ (Most Common)

By default, Supabase requires email confirmation which can cause issues in development.

**Solution:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication → Providers → Email**
4. **Disable** "Confirm email" option
5. Click **Save**

This allows users to sign up without email verification (useful for development).

---

### 2. Database Trigger Not Created

The `handle_new_user()` trigger creates a profile automatically when a user signs up.

**Check if trigger exists:**
1. Go to Supabase Dashboard → **SQL Editor**
2. Run this query:
```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

**If no results, create the trigger:**
```sql
-- Create the function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

### 3. Profiles Table Doesn't Exist

**Check if table exists:**
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'profiles';
```

**If no results, create the table:**
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 4. RLS (Row Level Security) Blocking Insert

**Check RLS policies:**
```sql
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

**If policies are too restrictive, add this:**
```sql
-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Allow users to read their own profile
CREATE POLICY "Users can read their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);
```

---

### 5. Apply All Migrations

Make sure all migrations have been applied:

**Option A: Using Supabase CLI**
```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref [your-project-ref]

# Push migrations
supabase db push
```

**Option B: Manual SQL Execution**
1. Go to Supabase Dashboard → **SQL Editor**
2. Copy contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and run
4. Repeat for `002_rls_policies.sql` and `003_indexes.sql`

---

### 6. Check Supabase Logs

1. Go to Supabase Dashboard → **Logs** → **Postgres Logs**
2. Try to sign up again
3. Look for error messages in the logs
4. The error will tell you exactly what's wrong

---

## Quick Fix (Development Only)

If you want to quickly test without dealing with email confirmation:

1. **Disable Email Confirmation** (see solution #1 above)
2. **Run this SQL to create a test user manually:**
```sql
-- This bypasses the signup endpoint
-- Replace with your email/password
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_sent_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'test@example.com',  -- Change this
  crypt('password123', gen_salt('bf')),  -- Change this
  NOW(),
  '',
  '',
  '',
  '',
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Test User"}',  -- Change this
  false,
  NOW()
);
```

Then you can login with:
- Email: `test@example.com`
- Password: `password123`

---

## Testing

After applying fixes:

1. Clear browser cache/cookies
2. Try registering with a new email
3. Check Supabase Dashboard → **Authentication → Users** to see if user was created
4. Check **Table Editor → profiles** to see if profile was created

---

## Still Not Working?

**Check these:**
- ✅ Supabase project is active (not paused)
- ✅ Environment variables in `.env.local` are correct
- ✅ You're using the correct Supabase URL and anon key
- ✅ Your Supabase project has the free tier limit available
- ✅ Check browser console for more detailed error messages

**Get the full error:**
Update register page to log the full error:
```typescript
if (error) {
  console.error('Signup error:', error);
  setError(error.message);
}
```

Then check the browser console for more details.
