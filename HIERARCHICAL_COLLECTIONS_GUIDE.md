# 📚 دليل نظام الـ Collections الهرمي

## نظرة عامة

تم إضافة نظام Collections هرمي يسمح بإنشاء:
- **Parent Collections** (كوليكشنات رئيسية) - مثل "Winter Collection"
- **Child Collections** (كوليكشنات فرعية) - مثل "Track Suits", "Sets", "Sweatpants"

---

## 🎯 المميزات

### 1. صفحة الـ Admin (`/admin/collections`)

**الإضافات الجديدة:**
- ✅ Dropdown لاختيار Parent Collection عند إنشاء/تعديل collection
- ✅ خيار "لا يوجد (كوليكشن رئيسي)" لإنشاء parent collection
- ✅ يعرض فقط Parent Collections في القائمة
- ✅ يمنع الـ circular dependencies

**كيفية الاستخدام:**
```
1. اذهب إلى /admin/collections
2. لإنشاء Parent Collection:
   - اسم الكوليكشن: "Winter Collection"
   - الكوليكشن الأساسي: "لا يوجد (كوليكشن رئيسي)"
   - اختر نوع العرض والإعدادات الأخرى
   - احفظ

3. لإنشاء Child Collection:
   - اسم الكوليكشن: "Track Suits"
   - الكوليكشن الأساسي: "Winter Collection"
   - احفظ
```

---

### 2. السايد بار (Sidebar)

**التحديثات:**
- ✅ يعرض Parent Collections كفئات قابلة للتوسيع
- ✅ يعرض Child Collections تحت الـ Parent
- ✅ ديناميكي بالكامل من قاعدة البيانات
- ✅ تم إزالة الـ "Winter Collection" الثابتة

**الشكل الجديد:**
```
Home
────────────
All Products
────────────
Winter Collection  [+]
  ├─ Track Suits
  ├─ Sets
  ├─ Sweatpants
  └─ Blankets
────────────
Summer Collection  [+]
  ├─ T-Shirts
  └─ Shorts
```

---

### 3. الصفحة الرئيسية (Homepage)

**التحديثات الكبيرة:**
- ✅ كل Parent Collection يعرض **4 منتجات** من كل الـ Child Collections
- ✅ زرار **"View All"** أسفل كل قسم
- ✅ المنتجات تُجمع من جميع الـ Child Collections
- ✅ إزالة التكرارات تلقائياً

**الشكل:**
```
┌─────────────────────────────────────┐
│       Winter Collection             │
├─────────────────────────────────────┤
│  [Product 1] [Product 2]           │
│  [Product 3] [Product 4]           │
│                                     │
│     [View All Winter Collection]   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│       Summer Collection             │
├─────────────────────────────────────┤
│  [Product 1] [Product 2]           │
│  [Product 3] [Product 4]           │
│                                     │
│     [View All Summer Collection]   │
└─────────────────────────────────────┘
```

---

## 🔄 سير العمل (User Flow)

### إنشاء Collection جديد كامل:

**الخطوة 1: إنشاء Parent Collection**
```
اسم: Winter Collection
Parent: لا يوجد (كوليكشن رئيسي)
نوع العرض: كارد كبير
مميز: ✓
نشط: ✓
```

**الخطوة 2: إنشاء Child Collections**
```
Collection 1:
  اسم: Track Suits
  Parent: Winter Collection
  مميز: ✓
  نشط: ✓

Collection 2:
  اسم: Sets
  Parent: Winter Collection
  مميز: ✓
  نشط: ✓

Collection 3:
  اسم: Sweatpants
  Parent: Winter Collection
  مميز: ✓
  نشط: ✓
```

**الخطوة 3: إضافة منتجات**
```
1. اذهب إلى /admin/products/new
2. أضف منتج جديد
3. في قسم "Collections":
   - ✓ Track Suits
   - ✓ Sets
4. احفظ المنتج
```

**النتيجة:**
- ✅ السايد بار يعرض "Winter Collection" مع الـ children تحتها
- ✅ الهوم بيج يعرض قسم "Winter Collection" مع 4 منتجات
- ✅ زرار "View All Winter Collection" يودي لصفحة بها كل المنتجات

---

## 📊 Database Schema

```sql
collections table:
┌─────────────┬──────────────────┐
│ Column      │ Type             │
├─────────────┼──────────────────┤
│ id          │ UUID (PK)        │
│ name        │ TEXT             │
│ slug        │ TEXT (UNIQUE)    │
│ parent_id   │ UUID (FK) NULL   │  ← الإضافة الجديدة
│ is_active   │ BOOLEAN          │
│ is_featured │ BOOLEAN          │
│ ...         │ ...              │
└─────────────┴──────────────────┘

parent_id = NULL     → Parent Collection
parent_id = <uuid>   → Child Collection
```

---

## 🛠️ Functions الجديدة

### في `src/lib/queries/collections.ts`:

**1. getParentCollections()**
```typescript
// تجيب كل الـ Parent Collections (collections بدون parent_id)
const parents = await getParentCollections();
```

**2. getParentCollectionProducts(parentId, limit?)**
```typescript
// تجيب منتجات من كل الـ Child Collections
const products = await getParentCollectionProducts("winter-uuid", 4);
// المنتجات المكررة بتتشال تلقائياً
```

---

## ✨ مثال عملي كامل

### السيناريو: إنشاء "Winter Collection" مع منتجات

**1. إنشاء الهيكل:**
```
Winter Collection (Parent)
├── Track Suits (Child)
├── Sets (Child)
├── Sweatpants (Child)
└── Hoodies (Child)
```

**2. إضافة المنتجات:**
```
Product: "Black Track Suit"
  → Collections: [Track Suits]

Product: "Winter Set Red"
  → Collections: [Sets]

Product: "Cozy Sweatpants"
  → Collections: [Sweatpants]

Product: "Warm Hoodie"
  → Collections: [Hoodies, Track Suits]
```

**3. النتيجة في الهوم بيج:**
```
═══════════════════════════════════
        Winter Collection
───────────────────────────────────
[Black Track Suit] [Winter Set Red]
[Cozy Sweatpants]  [Warm Hoodie]

      [View All Winter Collection]
═══════════════════════════════════
```

**4. عند الضغط على "View All":**
- ينقلك لـ `/collections/winter-collection`
- يعرض **كل** المنتجات من كل الـ Child Collections
- الصفحة تعمل تلقائياً لأن الـ query بيجيب المنتجات من الـ children

---

## 🎨 الصفحات المتأثرة

| الصفحة | التغيير |
|--------|---------|
| `/admin/collections` | إضافة Parent dropdown |
| `/ `(Homepage) | عرض Parent Collections مع منتجات |
| Sidebar | عرض Parent/Child هرمي |
| `/collections/[slug]` | تعمل مع Parent Collections تلقائياً |

---

## 🔍 Troubleshooting

### المشكلة: Parent Collection مش ظاهر في السايد بار
**الحل:**
1. تأكد أن `is_active = true`
2. تأكد أن `parent_id = NULL`

### المشكلة: Child Collections مش ظاهرة تحت Parent
**الحل:**
1. تأكد أن `parent_id` صحيح
2. تأكد أن `is_active = true`

### المشكلة: لا توجد منتجات في قسم Parent Collection بالهوم
**الحل:**
1. تأكد أن الـ Child Collections فيها منتجات
2. تأكد أن المنتجات `is_active = true`
3. تأكد أن المنتجات مربوطة بـ Child Collections (في جدول `product_collections`)

---

## 📝 ملاحظات مهمة

1. ✅ **Parent Collections لا تحتوي على منتجات مباشرة**
   - المنتجات تُضاف للـ Child Collections فقط
   - الـ Parent يجمع المنتجات من كل الـ Children

2. ✅ **يمكن للمنتج أن يكون في أكثر من Child Collection**
   - مثال: Hoodie → في Track Suits و في Hoodies
   - لكن يظهر مرة واحدة فقط في Parent (deduplication)

3. ✅ **الـ Collections القديمة (بدون parent) لسه شغالة**
   - الـ Featured Collections cards لسه موجودة
   - النظام backward compatible

4. ✅ **الترتيب**
   - Parent Collections: حسب تاريخ الإنشاء (الأحدث أولاً)
   - Child Collections: حسب تاريخ الإنشاء

---

## 🚀 الخطوات التالية (للمستقبل)

- [ ] إضافة Drag & Drop لترتيب Collections
- [ ] إضافة Sort Order للـ Child Collections
- [ ] إضافة أيقونات للـ Parent Collections
- [ ] إضافة Breadcrumbs في صفحة Collection
- [ ] إضافة SEO metadata للـ Parent Collections

---

تم التطوير بواسطة Claude Code ✨
