# 🚀 دليل النشر السريع على Vercel

---

## 📋 الخطوات

### 1. تثبيت Vercel CLI

```powershell
npm install -g vercel
```

### 2. تسجيل الدخول

```powershell
vercel login
```

سيفتح المتصفح لتسجيل الدخول.

### 3. النشر

```powershell
# تأكد أنك في مجلد المشروع
cd c:\Users\medor\Desktop\new-ecom

# النشر
vercel
```

**اتبع التعليمات:**
- `Set up and deploy "new-ecom"?` → اضغط **Y**
- `Which scope?` → اختر حسابك
- `Link to existing project?` → اضغط **N**
- `What's your project's name?` → اضغط Enter (سيستخدم new-ecom)
- `In which directory is your code located?` → اضغط Enter (./  )
- `Want to override the settings?` → اضغط **N**

**انتظر...**
سيتم رفع المشروع وبناؤه.

**ستحصل على:**
```
✅ Production: https://new-ecom-xxx.vercel.app
```

---

## ⚙️ إضافة Environment Variables

### الطريقة 1: من Dashboard (موصى بها)

1. **افتح:** https://vercel.com/dashboard
2. **اختر المشروع:** new-ecom
3. **اذهب إلى:** Settings → Environment Variables
4. **أضف المتغيرات:**

```
NEXT_PUBLIC_SUPABASE_URL
قيمة: https://zocmwsbkjlbucrczzfor.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
قيمة: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

SUPABASE_SERVICE_ROLE_KEY
قيمة: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

PAYMOB_API_KEY
قيمة: ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5...

PAYMOB_INTEGRATION_ID
قيمة: 4549597

PAYMOB_IFRAME_ID
قيمة: 858127

PAYMOB_HMAC_SECRET
قيمة: 4C8C5CE1F5F32D1E0A8C0F4B8E8A9D3F

NEXT_PUBLIC_APP_URL
قيمة: https://new-ecom-xxx.vercel.app
```

5. **اضغط Save** لكل متغير

### الطريقة 2: من Terminal

```powershell
# في مجلد المشروع
vercel env add NEXT_PUBLIC_SUPABASE_URL
# أدخل القيمة عندما يُطلب منك

# كرر لكل متغير
```

---

## 🔄 إعادة النشر

بعد إضافة Environment Variables:

```powershell
vercel --prod
```

---

## 🔗 تحديث Paymob Portal

### 1. افتح Paymob Portal

https://accept.paymob.com/portal2/en/login

### 2. اذهب إلى Payment Integrations

Developers → Payment Integrations → Online Card

### 3. أضف Callbacks

**Processed Callback:**
```
https://new-ecom-xxx.vercel.app/api/webhooks/paymob
```

**Response Callback:**
```
https://new-ecom-xxx.vercel.app/api/paymob/callback
```

(استبدل `new-ecom-xxx` برابطك الفعلي)

### 4. احفظ

---

## ✅ الاختبار

### 1. افتح الموقع

```
https://new-ecom-xxx.vercel.app
```

### 2. اختبر COD أولاً

- أضف منتج
- اذهب للـ Checkout
- اختر COD
- أكمل الطلب

**يجب أن يعمل!** ✅

### 3. اختبر Card Payment

- أضف منتج
- اذهب للـ Checkout
- اختر Card
- استخدم: `4987654321098769`
- أكمل الدفع

**النتيجة المتوقعة:**
- ✅ يتم التحويل لصفحة التأكيد
- ✅ حالة الطلب تتحدث

---

## 📊 مراقبة Logs

### في Vercel Dashboard

1. اذهب إلى Project
2. اختر **Deployments**
3. اضغط على آخر deployment
4. اختر **Functions**
5. اضغط على أي function لرؤية logs

---

## 🔄 التحديثات المستقبلية

عند تعديل الكود:

```powershell
# commit التغييرات
git add .
git commit -m "update"

# push (إذا كنت تستخدم git)
git push

# أو أعد النشر مباشرة
vercel --prod
```

Vercel سيبني ويرفع النسخة الجديدة تلقائياً!

---

## 🆘 المشاكل الشائعة

### المشكلة: "Build failed"

**الحل:**
```powershell
# اختبر البناء محلياً أولاً
npm run build

# إذا نجح، أعد النشر
vercel --prod
```

### المشكلة: "Environment variables not working"

**الحل:**
1. تأكد من إضافتها في Dashboard
2. أعد النشر: `vercel --prod`

### المشكلة: "Domain not working"

**الحل:**
- انتظر 1-2 دقيقة
- Vercel يحتاج وقت لنشر التغييرات

---

## 🎉 تم!

الآن موقعك منشور ويعمل على Vercel!

**الرابط:** https://new-ecom-xxx.vercel.app

**الخطوة التالية:** حدّث Paymob Portal بالرابط الجديد
