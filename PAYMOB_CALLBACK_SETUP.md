# 🔧 إعداد Paymob Portal للـ Callback

لكي يعمل Callback بشكل صحيح، يجب إعداد Paymob Portal.

---

## 📝 الخطوات المطلوبة

### 1. تسجيل الدخول إلى Paymob Portal

اذهب إلى: [https://accept.paymob.com/portal2/en/login](https://accept.paymob.com/portal2/en/login)

---

### 2. إعداد Callback URL في iFrame Settings

#### الخطوة 1: اذهب إلى iFrames
1. من القائمة الجانبية، اختر **Developers**
2. اختر **iFrames**
3. اختر الـ iFrame الذي تستخدمه (ID: `858127`)

#### الخطوة 2: إضافة Callback URL
في إعدادات iFrame:

**للتطوير المحلي (مع ngrok):**
```
https://YOUR-NGROK-URL.ngrok.io/api/paymob/callback
```

**للإنتاج:**
```
https://yourdomain.com/api/paymob/callback
```

> **⚠️ ملاحظة:** Paymob لا يقبل `http://localhost:3000`

---

### 3. إعداد Webhook URL (اختياري - كـ backup)

#### الخطوة 1: اذهب إلى Webhooks
1. من القائمة الجانبية، اختر **Developers**
2. اختر **Webhooks**

#### الخطوة 2: إضافة Webhook URL
**للتطوير المحلي (مع ngrok):**
```
https://YOUR-NGROK-URL.ngrok.io/api/webhooks/paymob
```

**للإنتاج:**
```
https://yourdomain.com/api/webhooks/paymob
```

---

## 🔄 كيف يعمل Callback

### Flow الكامل:

```
1. المستخدم يضغط "PLACE ORDER"
   ↓
2. يتم إنشاء الطلب (status: pending)
   ↓
3. يتم التحويل لصفحة Paymob
   ↓
4. المستخدم يدفع
   ↓
5. ✅ Paymob يحول المستخدم إلى:
   /api/paymob/callback?success=true&order=123&id=456&...
   ↓
6. Callback Handler يقوم بـ:
   - التحقق من HMAC
   - تحديث حالة الطلب (pending → confirmed)
   - تحديث payment_status (pending → paid)
   - خصم المخزون
   - إضافة tracking entry
   ↓
7. يتم تحويل المستخدم إلى:
   /checkout/confirmation?order=ORD-123&status=success
```

---

## 🧪 اختبار Callback محلياً مع ngrok

### الخطوة 1: تثبيت ngrok

```bash
npm install -g ngrok
```

### الخطوة 2: تشغيل ngrok

```bash
ngrok http 3000
```

ستحصل على رابط مثل:
```
https://abc123.ngrok.io
```

### الخطوة 3: تحديث Paymob Portal

في iFrame Settings، أضف:
```
https://abc123.ngrok.io/api/paymob/callback
```

### الخطوة 4: الاختبار

1. افتح الموقع على `http://localhost:3000`
2. أضف منتج للسلة
3. اذهب للـ Checkout
4. اختر Card payment
5. استخدم بطاقة الاختبار: `4987654321098769`
6. أكمل الدفع

**النتيجة المتوقعة:**
- ✅ يتم تحويلك لصفحة التأكيد
- ✅ حالة الطلب تتحدث إلى "confirmed"
- ✅ payment_status يتحدث إلى "paid"

---

## 📊 التحقق من النتيجة

### في قاعدة البيانات:

```sql
-- التحقق من الطلب
SELECT 
  order_number,
  status,
  payment_status,
  paymob_transaction_id,
  created_at
FROM orders
WHERE order_number = 'ORD-XXXXXX';

-- التحقق من Tracking
SELECT 
  status,
  description,
  created_at
FROM order_tracking
WHERE order_id = 'order-id-here'
ORDER BY created_at DESC;
```

**النتيجة المتوقعة:**
```
status: "confirmed"
payment_status: "paid"
paymob_transaction_id: "123456"
```

---

## ⚠️ مشاكل شائعة

### المشكلة: "Callback not called"

**الأسباب:**
1. Callback URL غير مُعد في Paymob Portal
2. ngrok غير مشغل
3. Callback URL خاطئ

**الحل:**
1. تأكد من إضافة Callback URL في iFrame Settings
2. تأكد من أن ngrok يعمل
3. تأكد من أن الرابط صحيح

---

### المشكلة: "Invalid HMAC signature"

**السبب:** HMAC Secret خاطئ

**الحل:**
1. تحقق من `PAYMOB_HMAC_SECRET` في `.env.local`
2. تأكد من أنه يطابق HMAC في Paymob Portal

---

### المشكلة: "Order not found"

**السبب:** Paymob Order ID غير موجود في قاعدة البيانات

**الحل:**
1. تحقق من أن الطلب تم إنشاؤه بنجاح
2. تحقق من أن `paymob_order_id` تم حفظه

---

## 🚀 الانتقال للإنتاج

عند الاستعداد للإطلاق:

### 1. تحديث Callback URL

في Paymob Portal → iFrame Settings:
```
https://yourdomain.com/api/paymob/callback
```

### 2. تحديث Webhook URL

في Paymob Portal → Webhooks:
```
https://yourdomain.com/api/webhooks/paymob
```

### 3. استخدام Live API Keys

في `.env.production`:
```bash
PAYMOB_API_KEY=your_live_api_key
PAYMOB_INTEGRATION_ID=your_live_integration_id
PAYMOB_IFRAME_ID=your_live_iframe_id
PAYMOB_HMAC_SECRET=your_live_hmac_secret
```

---

## 📝 ملاحظات هامة

> **💡 Callback vs Webhook**
> 
> - **Callback:** يحدث فوراً عندما يعود المستخدم (موصى به)
> - **Webhook:** يحدث في الخلفية (backup)
> 
> استخدم كليهما للحصول على أفضل تجربة!

> **🔒 الأمان**
> 
> - يتم التحقق من HMAC في كل callback
> - لا تثق في query parameters بدون تحقق
> - استخدم HTTPS في Production

> **⚡ السرعة**
> 
> - Callback أسرع من Webhook
> - المستخدم يرى التحديث فوراً
> - تجربة مستخدم أفضل

---

**تم إعداد Callback بنجاح! 🎉**

الآن يمكنك اختبار عملية الدفع الكاملة مع تحديث تلقائي لحالة الطلب.
