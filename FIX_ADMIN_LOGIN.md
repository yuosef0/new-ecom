# 🔧 حل مشكلة Invalid login credentials للأدمن

## المشكلة
بعد إنشاء مستخدم الأدمن، عند محاولة تسجيل الدخول بتظهر رسالة:
- **Error**: `400 Bad Request`
- **Message**: `Invalid login credentials`

---

## ✅ الحل السريع

### الطريقة 1: إعادة إنشاء المستخدم بطريقة صحيحة

**اتبع الخطوات دي:**

#### 1️⃣ احذف المستخدم القديم أولاً

افتح **SQL Editor** في Supabase Dashboard وشغّل:

```sql
-- Delete existing admin user
DELETE FROM auth.users WHERE email = 'admin@dxlr.com';
```

#### 2️⃣ أنشئ المستخدم بطريقة مختلفة

**استخدم السكريبت ده:**

```sql
-- Create admin user with proper password encryption
DO $$
DECLARE
  new_user_id UUID;
  encrypted_pw TEXT;
BEGIN
  -- Generate new user ID
  new_user_id := gen_random_uuid();

  -- Encrypt password properly
  encrypted_pw := crypt('Admin123!', gen_salt('bf'));

  -- Insert into auth.users
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
    new_user_id,
    'authenticated',
    'authenticated',
    'admin@dxlr.com',
    encrypted_pw,
    NOW(),
    '',
    '',
    '',
    '',
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Admin User"}',
    false,
    NOW()
  );

  -- Wait for trigger
  PERFORM pg_sleep(1);

  -- Update profile to admin role
  UPDATE public.profiles
  SET role = 'admin', full_name = 'Admin User'
  WHERE id = new_user_id;

  -- Verify
  RAISE NOTICE 'Admin created: admin@dxlr.com / Admin123!';

END $$;

-- Check the user
SELECT
  u.id,
  u.email,
  u.email_confirmed_at,
  u.encrypted_password IS NOT NULL as has_password,
  p.role,
  p.full_name
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'admin@dxlr.com';
```

#### 3️⃣ تأكد من النتيجة

هتشوف في الـ Results:
- ✅ `email`: admin@dxlr.com
- ✅ `email_confirmed_at`: وقت حالي (مش NULL)
- ✅ `has_password`: true
- ✅ `role`: admin
- ✅ `full_name`: Admin User

#### 4️⃣ جرب تسجل الدخول تاني

1. اذهب إلى: `http://localhost:3000/login`
2. أدخل:
   - Email: `admin@dxlr.com`
   - Password: `Admin123!`
3. المفروض تدخل بنجاح ✅

---

## 🎯 الطريقة 2: إنشاء المستخدم من Supabase Dashboard

إذا الطريقة الأولى مش شغالة، استخدم هذه الطريقة الأسهل:

#### 1️⃣ إنشاء المستخدم من Dashboard

1. افتح **Supabase Dashboard**
2. اذهب إلى **Authentication** → **Users**
3. اضغط على **Add user** → **Create new user**
4. املأ البيانات:
   - **Email**: `admin@dxlr.com`
   - **Password**: `Admin123!`
   - **Auto Confirm User**: ✅ **فعّلها** (مهم جداً!)
5. اضغط **Create user**

#### 2️⃣ تحديث الـ Role لـ admin

شغّل السكريبت ده في SQL Editor:

```sql
-- Update the user to admin role
UPDATE public.profiles
SET role = 'admin', full_name = 'Admin User'
WHERE email = 'admin@dxlr.com';

-- Verify
SELECT
  u.email,
  p.role,
  p.full_name,
  u.email_confirmed_at IS NOT NULL as confirmed
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'admin@dxlr.com';
```

#### 3️⃣ جرب تسجل الدخول

استخدم:
- Email: `admin@dxlr.com`
- Password: `Admin123!`

---

## 🔍 الطريقة 3: إذا عايز تستخدم إيميل وباسورد مختلفين

#### إنشاء مستخدم جديد من Dashboard

1. **Supabase Dashboard** → **Authentication** → **Users**
2. **Add user** → **Create new user**
3. استخدم الإيميل والباسورد اللي انت عايزهم
4. **Auto Confirm User**: ✅ فعّل
5. **Create user**

#### تحديث الـ Role

```sql
-- Replace with your email
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';

-- Verify
SELECT email, role FROM public.profiles
WHERE email = 'your-email@example.com';
```

---

## ⚠️ نصائح مهمة

### 1. تأكد من تفعيل "Auto Confirm User"
لو عملت المستخدم من Dashboard، **لازم** تفعّل "Auto Confirm User" وإلا مش هتقدر تسجل دخول.

### 2. تأكد من تعطيل Email Confirmation
في **Authentication** → **Providers** → **Email**:
- ✅ تأكد إن "Confirm email" **معطّل** (Disabled)

### 3. تحقق من الـ Trigger
لو المستخدم اتعمل بس الـ profile مش موجود:

```sql
-- Check if profile exists
SELECT * FROM public.profiles
WHERE email = 'admin@dxlr.com';

-- If not exists, create manually
INSERT INTO public.profiles (id, email, full_name, role)
SELECT id, email, 'Admin User', 'admin'
FROM auth.users
WHERE email = 'admin@dxlr.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin', full_name = 'Admin User';
```

---

## 🧪 اختبار نهائي

بعد ما تعمل أي طريقة من فوق، شغّل السكريبت ده للتحقق:

```sql
-- Complete verification
SELECT
  u.id,
  u.email,
  u.created_at,
  u.email_confirmed_at IS NOT NULL as email_confirmed,
  u.encrypted_password IS NOT NULL as has_password,
  LENGTH(u.encrypted_password) as password_length,
  p.role,
  p.full_name,
  p.created_at as profile_created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'admin@dxlr.com';
```

**النتيجة المفروضة:**
- ✅ `email_confirmed`: true
- ✅ `has_password`: true
- ✅ `password_length`: 60 (bcrypt hash length)
- ✅ `role`: admin
- ✅ `full_name`: Admin User

---

## 🎉 بعد النجاح

بعد ما تسجل دخول بنجاح:
1. جرب تدخل على `/admin`
2. تأكد إن عندك صلاحيات الأدمن
3. جرب تعمل مستخدم عادي من `/register`
4. تأكد إن المستخدم العادي مش بيقدر يدخل `/admin`

---

**💡 لو لسه عندك مشكلة، قولي إيه الرسالة اللي بتظهر بالضبط!**
