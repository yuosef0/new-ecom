# 🔗 روابط سريعة لـ Paymob Portal

استخدم هذه الروابط للوصول المباشر:

---

## 🌐 الروابط الأساسية

### 1. تسجيل الدخول
**https://accept.paymob.com/portal2/en/login**

### 2. إنشاء حساب جديد
**https://accept.paymob.com/portal2/en/register**

### 3. Dashboard
**https://accept.paymob.com/portal2/en/dashboard**

---

## ⚙️ روابط Developer Settings

### 1. API Keys
**https://accept.paymob.com/portal2/en/developer/api-keys**

### 2. Payment Integrations
**https://accept.paymob.com/portal2/en/developer/payment-integrations**

### 3. iFrames
**https://accept.paymob.com/portal2/en/developer/iframes**

### 4. Webhooks
**https://accept.paymob.com/portal2/en/developer/webhooks**

### 5. HMAC
**https://accept.paymob.com/portal2/en/developer/hmac**

---

## 📋 خطوات سريعة

### للوصول لإعدادات Callback:

1. **افتح:** https://accept.paymob.com/portal2/en/login
2. **سجل دخول** بحسابك
3. **اذهب إلى:** https://accept.paymob.com/portal2/en/developer/iframes
4. **اختر iFrame ID:** 858127
5. **أضف Callback URL** في الحقل المخصص

---

## 🆕 إذا لم يكن لديك حساب

### خطوات إنشاء حساب:

1. **افتح:** https://accept.paymob.com/portal2/en/register

2. **املأ البيانات:**
   - Business Name: اسم متجرك
   - Email: بريدك الإلكتروني
   - Phone: رقم هاتفك
   - Password: كلمة مرور قوية

3. **فعّل الحساب** من البريد الإلكتروني

4. **احصل على Test API Keys:**
   - اذهب إلى: https://accept.paymob.com/portal2/en/developer/api-keys
   - انسخ Test API Key
   - انسخ Test Integration ID
   - انسخ Test iFrame ID
   - انسخ HMAC Secret

5. **حدّث `.env.local`** بالبيانات الجديدة

---

## 💡 نصيحة

إذا كنت تستخدم البيانات الاختبارية العامة الموجودة في المشروع:
- لن تستطيع تحديث Callback URL
- ستحتاج لحساب خاص بك

**الحل:** أنشئ حساب جديد واحصل على بياناتك الخاصة!

---

## 🚀 بعد إنشاء الحساب

1. حدّث `.env.local` ببياناتك الجديدة
2. أعد تشغيل السيرفر: `npm run dev`
3. اختبر الدفع بـ COD أولاً
4. عند النشر، حدّث Callback URL في Portal

---

**افتح الروابط أعلاه مباشرة من المتصفح!** 🌐
