# 📸 Setup Product Images Storage

## ⚠️ إعداد Supabase Storage للصور

قبل ما تقدر ترفع صور للمنتجات، لازم تعمل Storage Bucket في Supabase.

---

## 🗄️ خطوات الإعداد:

### 1️⃣ إنشاء Storage Bucket

1. افتح **Supabase Dashboard**: https://app.supabase.com
2. اختر مشروعك
3. من القائمة الجانبية → اضغط على **Storage**
4. اضغط **Create a new bucket**
5. املأ البيانات:
   - **Name**: `product-images`
   - **Public bucket**: ✅ **فعّل** (عشان الصور تكون متاحة للجميع)
   - **File size limit**: `5 MB` (أو أكبر حسب احتياجك)
   - **Allowed MIME types**: `image/*` (كل أنواع الصور)
6. اضغط **Create bucket**

---

### 2️⃣ إعداد Bucket Policies (RLS)

**اذهب لتاب Policies** في Storage → `product-images` bucket:

#### Policy 1: Allow Public Read (القراءة للجميع)

```sql
-- Allow anyone to read/view images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');
```

**أو من Dashboard:**
1. اضغط **New Policy**
2. **Policy name**: `Public Access`
3. **Allowed operation**: `SELECT`
4. **Target roles**: `public`
5. **USING expression**: `bucket_id = 'product-images'`
6. اضغط **Save**

#### Policy 2: Allow Authenticated Upload (الرفع للمستخدمين المسجلين)

```sql
-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
);
```

**أو من Dashboard:**
1. اضغط **New Policy**
2. **Policy name**: `Authenticated users can upload`
3. **Allowed operation**: `INSERT`
4. **Target roles**: `authenticated`
5. **WITH CHECK expression**: `bucket_id = 'product-images'`
6. اضغط **Save**

#### Policy 3: Allow Authenticated Delete (الحذف للمستخدمين المسجلين)

```sql
-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
);
```

**أو من Dashboard:**
1. اضغط **New Policy**
2. **Policy name**: `Authenticated users can delete`
3. **Allowed operation**: `DELETE`
4. **Target roles**: `authenticated`
5. **USING expression**: `bucket_id = 'product-images'`
6. اضغط **Save**

---

### 3️⃣ اختبار الرفع

بعد الإعداد:

1. اذهب إلى: `http://localhost:3000/admin/products/new`
2. املأ بيانات المنتج
3. اضغط **Add Images**
4. اختر صورة أو أكثر من جهازك
5. المفروض الصور ترفع بنجاح! ✅

---

## 🔧 Troubleshooting

### مشكلة: "Storage bucket not found"

**الحل:**
- تأكد إن اسم الـ bucket بالضبط: `product-images`
- تأكد إن الـ bucket موجود في Supabase Dashboard

### مشكلة: "Permission denied"

**الحل:**
- تأكد إن الـ RLS policies اتعملت صح
- تأكد إنك مسجل دخول كـ Admin

### مشكلة: "File too large"

**الحل:**
- في Bucket Settings، زوّد الـ File size limit
- أو صغّر حجم الصورة قبل الرفع

---

## 📝 هيكل المجلدات في Storage

بعد رفع الصور، هتلاقيها في:

```
product-images/
└── products/
    ├── abc123-1234567890.jpg
    ├── def456-1234567891.png
    └── ghi789-1234567892.webp
```

كل صورة ليها اسم unique (random string + timestamp) عشان نتجنب التعارض.

---

## 🎯 Features الصور:

✅ **رفع صور متعددة** - اختر أكثر من صورة مرة واحدة
✅ **Preview الصور** - شوف الصور قبل الحفظ
✅ **Set Primary Image** - اختار الصورة الرئيسية
✅ **Remove Images** - امسح أي صورة مش عايزها
✅ **Auto-save** - الصور بتترفع على Supabase مباشرة

---

## 🔒 Security Notes

- الصور **عامة** (Public) - أي حد يقدر يشوفها
- بس الـ Admin بس اللي يقدر يرفع ويحذف
- الـ file names عشوائية عشان الأمان
- الصور بتتحذف تلقائياً لما تحذف المنتج (CASCADE)

---

**🎉 بعد الخطوات دي، تقدر ترفع صور للمنتجات من Admin Panel مباشرة!**
