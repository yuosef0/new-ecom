# اختبار Paymob Integration

هذا الملف يحتوي على أمثلة عملية لاختبار تكامل Paymob.

## 🧪 سيناريوهات الاختبار

### 1️⃣ اختبار الدفع الناجح

**الخطوات:**
1. افتح المتصفح على `http://localhost:3000`
2. أضف منتج إلى السلة
3. اذهب إلى `/checkout`
4. أدخل بيانات الشحن:
   ```
   Email: test@example.com
   Full Name: Ahmed Mohamed
   Phone: 01012345678
   Governorate: Cairo
   City: Nasr City
   Address: 123 Test Street
   ```
5. اختر **Credit/Debit Card**
6. استخدم بطاقة الاختبار:
   ```
   Card Number: 4987654321098769
   CVV: 123
   Expiry: 12/25
   ```
7. أكمل الدفع

**النتيجة المتوقعة:**
- ✅ يتم تحويلك إلى صفحة Paymob
- ✅ الدفع يتم بنجاح
- ✅ يتم تحويلك إلى صفحة التأكيد
- ✅ السلة تفرغ تلقائياً

---

### 2️⃣ اختبار الدفع الفاشل

**الخطوات:**
1. كرر نفس الخطوات أعلاه
2. استخدم بطاقة فاشلة:
   ```
   Card Number: 4000000000000002
   CVV: 123
   Expiry: 12/25
   ```

**النتيجة المتوقعة:**
- ❌ الدفع يفشل
- ❌ تظهر رسالة خطأ
- ❌ الطلب يبقى في حالة "pending"

---

### 3️⃣ اختبار الدفع عند الاستلام (COD)

**الخطوات:**
1. أضف منتج إلى السلة
2. اذهب إلى `/checkout`
3. أدخل بيانات الشحن
4. اختر **Cash on Delivery**
5. اضغط على "PLACE ORDER"

**النتيجة المتوقعة:**
- ✅ يتم إنشاء الطلب مباشرة
- ✅ لا يتم التحويل إلى Paymob
- ✅ يتم التحويل إلى صفحة التأكيد

---

## 🔍 فحص البيانات

### فحص الطلب في قاعدة البيانات

```sql
-- عرض آخر 10 طلبات
SELECT 
  order_number,
  status,
  payment_status,
  payment_method,
  total,
  created_at
FROM orders
ORDER BY created_at DESC
LIMIT 10;

-- عرض تفاصيل طلب معين
SELECT 
  o.*,
  oi.product_name,
  oi.quantity,
  oi.price
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.order_number = 'ORD-XXXXXX';
```

### فحص Paymob Order ID

```sql
-- عرض الطلبات مع Paymob Order ID
SELECT 
  order_number,
  paymob_order_id,
  payment_status,
  total
FROM orders
WHERE paymob_order_id IS NOT NULL
ORDER BY created_at DESC;
```

---

## 🐛 Debug Mode

### تفعيل Console Logs

أضف هذا الكود في `src/lib/paymob/client.ts` للحصول على معلومات تفصيلية:

```typescript
// في بداية كل دالة
console.log('[Paymob] Function called:', { params });

// بعد كل API call
console.log('[Paymob] Response:', response);
```

### مراقبة Network Requests

1. افتح Developer Tools (F12)
2. اذهب إلى تبويب **Network**
3. ابحث عن requests إلى:
   - `/api/checkout`
   - `accept.paymob.com`

---

## 📊 حالات الاختبار

| # | السيناريو | البطاقة | النتيجة المتوقعة |
|---|-----------|---------|------------------|
| 1 | دفع ناجح | `4987654321098769` | ✅ Success |
| 2 | دفع فاشل | `4000000000000002` | ❌ Failed |
| 3 | 3D Secure | `4012001037141112` | 🔐 Requires password |
| 4 | COD | - | ✅ Direct order |
| 5 | سلة فارغة | - | ⚠️ Redirect to cart |
| 6 | منتج غير متوفر | - | ❌ Validation error |

---

## 🔄 اختبار Webhook

### استخدام ngrok

```bash
# تثبيت ngrok
npm install -g ngrok

# تشغيل ngrok
ngrok http 3000

# ستحصل على رابط مثل:
# https://abc123.ngrok.io
```

### إعداد Webhook في Paymob

1. اذهب إلى [Paymob Portal](https://accept.paymob.com/portal2/en/developer/webhooks)
2. أضف Webhook URL:
   ```
   https://abc123.ngrok.io/api/webhooks/paymob
   ```
3. احفظ التغييرات

### اختبار Webhook

```bash
# مراقبة logs
npm run dev

# في terminal آخر، راقب ngrok requests
ngrok http 3000 --log=stdout
```

---

## 📝 Webhook Payload Example

عند نجاح الدفع، ستستقبل payload مثل:

```json
{
  "obj": {
    "id": 123456,
    "pending": false,
    "amount_cents": 100000,
    "success": true,
    "order": {
      "id": 789012
    },
    "created_at": "2026-01-24T12:00:00Z",
    "currency": "EGP"
  },
  "type": "TRANSACTION",
  "hmac": "abc123..."
}
```

---

## 🎯 Checklist قبل الإطلاق

- [ ] تم اختبار الدفع الناجح
- [ ] تم اختبار الدفع الفاشل
- [ ] تم اختبار COD
- [ ] تم اختبار Webhook
- [ ] تم التحقق من HMAC validation
- [ ] تم اختبار على أجهزة مختلفة
- [ ] تم اختبار على متصفحات مختلفة
- [ ] تم مراجعة Security best practices
- [ ] تم إعداد Error handling
- [ ] تم إعداد Logging

---

## 🚨 مشاكل شائعة وحلولها

### مشكلة: "CORS Error"

**السبب:** Paymob لا يسمح بـ CORS من localhost

**الحل:** استخدم ngrok أو deploy على staging server

### مشكلة: "Invalid HMAC"

**السبب:** HMAC Secret غير صحيح

**الحل:** تحقق من `PAYMOB_HMAC_SECRET` في `.env.local`

### مشكلة: "Order not found"

**السبب:** Paymob Order ID لم يتم حفظه

**الحل:** تحقق من الكود في `/api/checkout/route.ts` السطر 224-229

---

## 📞 الحصول على المساعدة

إذا واجهت مشاكل:

1. **راجع Logs:**
   ```bash
   # في terminal
   npm run dev
   
   # في Browser Console
   F12 → Console
   ```

2. **راجع Paymob Portal:**
   - [Transactions](https://accept.paymob.com/portal2/en/transactions)
   - [Logs](https://accept.paymob.com/portal2/en/logs)

3. **تواصل مع الدعم:**
   - [Paymob Support](https://accept.paymob.com/portal2/en/support)
   - Email: support@paymob.com

---

**آخر تحديث:** 2026-01-24
