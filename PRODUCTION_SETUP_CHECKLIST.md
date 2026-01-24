# ✅ قائمة إعداد الموقع المنشور

الموقع منشور على: **https://new-ecom-one.vercel.app/**

الآن تحتاج لإكمال هذه الخطوات:

---

## 1. ✅ تحديث Supabase - Google OAuth Redirect URLs

### المشكلة الحالية:
- Google OAuth لن يعمل لأن Supabase مُعد لـ `localhost` فقط

### الحل:

#### الخطوة 1: افتح Supabase Dashboard
```
https://supabase.com/dashboard/project/zocmwsbkjlbucrczzfor
```

#### الخطوة 2: اذهب إلى Authentication Settings
1. من القائمة الجانبية: **Authentication**
2. اختر **URL Configuration**

#### الخطوة 3: أضف Site URL
```
Site URL: https://new-ecom-one.vercel.app
```

#### الخطوة 4: أضف Redirect URLs
في حقل **Redirect URLs**، أضف:
```
https://new-ecom-one.vercel.app/auth/callback
https://new-ecom-one.vercel.app/**
```

**احتفظ بـ localhost للتطوير:**
```
http://localhost:3000/auth/callback
http://localhost:3000/**
```

#### الخطوة 5: احفظ التغييرات

---

## 2. ✅ تحديث Paymob Portal - Callback URLs

### الخطوة 1: افتح Paymob Portal
```
https://accept.paymob.com/portal2/en/login
```

### الخطوة 2: اذهب إلى Payment Integrations
```
Developers → Payment Integrations → Online Card
```

### الخطوة 3: حدّث Callbacks

**Processed Callback:**
```
https://new-ecom-one.vercel.app/api/webhooks/paymob
```

**Response Callback:**
```
https://new-ecom-one.vercel.app/api/paymob/callback
```

### الخطوة 4: احفظ

---

## 3. ✅ تحديث Environment Variables في Vercel

### الخطوة 1: افتح Vercel Dashboard
```
https://vercel.com/dashboard
```

### الخطوة 2: اختر المشروع
```
new-ecom
```

### الخطوة 3: اذهب إلى Settings → Environment Variables

### الخطوة 4: تأكد من وجود هذه المتغيرات:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://zocmwsbkjlbucrczzfor.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Paymob
PAYMOB_API_KEY=ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5...
PAYMOB_INTEGRATION_ID=4549597
PAYMOB_IFRAME_ID=858127
PAYMOB_HMAC_SECRET=4C8C5CE1F5F32D1E0A8C0F4B8E8A9D3F

# App URL (مهم جداً!)
NEXT_PUBLIC_APP_URL=https://new-ecom-one.vercel.app
```

### الخطوة 5: إذا أضفت أو عدلت متغيرات

أعد النشر:
```bash
vercel --prod
```

---

## 4. 🧪 الاختبار

### اختبار 1: تسجيل الدخول بـ Google

1. افتح: https://new-ecom-one.vercel.app/login
2. اضغط "Sign in with Google"
3. اختر حسابك
4. **النتيجة المتوقعة:** ✅ يتم تحويلك للصفحة الرئيسية

**إذا لم يعمل:**
- تأكد من تحديث Redirect URLs في Supabase

---

### اختبار 2: الدفع بـ COD

1. افتح: https://new-ecom-one.vercel.app/products
2. أضف منتج للسلة
3. اذهب للـ Checkout
4. اختر "Cash on Delivery"
5. أكمل الطلب
6. **النتيجة المتوقعة:** ✅ صفحة التأكيد تظهر

---

### اختبار 3: الدفع بـ Card (بعد تحديث Paymob)

1. افتح: https://new-ecom-one.vercel.app/products
2. أضف منتج للسلة
3. اذهب للـ Checkout
4. اختر "Credit/Debit Card"
5. استخدم بطاقة الاختبار: `4987654321098769`
6. أكمل الدفع في Paymob
7. **النتيجة المتوقعة:** 
   - ✅ يتم تحويلك لصفحة التأكيد
   - ✅ حالة الطلب تتحدث إلى "confirmed"

---

## 5. 📊 التحقق من الطلبات

### في Admin Dashboard

1. افتح: https://new-ecom-one.vercel.app/admin
2. سجل دخول كـ Admin
3. تحقق من الطلبات
4. تحقق من حالة الدفع

---

## 📝 ملخص الخطوات

### ✅ مطلوب الآن:

1. **Supabase:**
   - [ ] تحديث Site URL
   - [ ] إضافة Redirect URLs

2. **Paymob:**
   - [ ] تحديث Processed Callback
   - [ ] تحديث Response Callback

3. **Vercel:**
   - [ ] التأكد من Environment Variables
   - [ ] خصوصاً `NEXT_PUBLIC_APP_URL`

### ✅ بعد الإعداد:

1. **اختبر Google Login**
2. **اختبر COD Payment**
3. **اختبر Card Payment**

---

## 🆘 إذا واجهت مشاكل

### المشكلة: Google Login لا يعمل
**الحل:** تحقق من Redirect URLs في Supabase

### المشكلة: Card Payment لا يحول للتأكيد
**الحل:** تحقق من Callback URLs في Paymob

### المشكلة: "Internal Server Error"
**الحل:** تحقق من Environment Variables في Vercel

---

## 🎯 الخطوة التالية

**ابدأ بـ Supabase أولاً:**

1. افتح: https://supabase.com/dashboard/project/zocmwsbkjlbucrczzfor/auth/url-configuration
2. أضف Site URL و Redirect URLs
3. احفظ
4. اختبر Google Login

**ثم Paymob:**

1. افتح: https://accept.paymob.com/portal2/en/developer/payment-integrations
2. حدّث Callbacks
3. احفظ
4. اختبر Card Payment

---

**الموقع منشور ويعمل! 🎉**

الآن فقط أكمل الإعدادات أعلاه وسيعمل كل شيء بشكل مثالي.
