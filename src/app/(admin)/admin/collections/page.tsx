"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_type: "small" | "large";
  sort_order: number;
  is_featured: boolean;
  is_active: boolean;
  parent_id: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export default function CollectionsManagementPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    display_type: "small" as "small" | "large",
    parent_id: "",
    is_featured: true,
    is_active: true,
  });

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCollections(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedFile) return null;

    setUploading(true);
    try {
      const supabase = createClient();
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `collections/${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(fileName);

      return publicUrl;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("الرجاء إدخال اسم الكوليكشن");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const supabase = createClient();
      let imageUrl = editingId
        ? collections.find((c) => c.id === editingId)?.image_url || null
        : null;

      if (selectedFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) imageUrl = uploadedUrl;
      }

      const collectionData = {
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description || null,
        display_type: formData.display_type,
        parent_id: formData.parent_id || null,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
        image_url: imageUrl,
      };

      if (editingId) {
        const { error: updateError } = await supabase
          .from("collections")
          .update(collectionData)
          .eq("id", editingId);

        if (updateError) throw updateError;
        setSuccess("✅ تم تحديث الكوليكشن بنجاح");
      } else {
        const { error: insertError } = await supabase
          .from("collections")
          .insert(collectionData);

        if (insertError) throw insertError;
        setSuccess("✅ تمت إضافة الكوليكشن بنجاح");
      }

      resetForm();
      loadCollections();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const editCollection = (collection: Collection) => {
    setFormData({
      name: collection.name,
      slug: collection.slug,
      description: collection.description || "",
      display_type: collection.display_type,
      parent_id: collection.parent_id || "",
      is_featured: collection.is_featured,
      is_active: collection.is_active,
    });
    setEditingId(collection.id);
    setPreviewUrl(collection.image_url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteCollection = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الكوليكشن؟")) {
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.from("collections").delete().eq("id", id);

      if (error) throw error;
      setSuccess("✅ تم حذف الكوليكشن بنجاح");
      loadCollections();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("collections")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      loadCollections();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("collections")
        .update({ is_featured: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      loadCollections();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      display_type: "small",
      parent_id: "",
      is_featured: true,
      is_active: true,
    });
    setEditingId(null);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2 text-gray-500 text-sm">جارٍ التحميل...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">إدارة الكوليكشن</h1>
        <p className="mt-2 text-gray-600">إدارة كوليكشن المنتجات والعروض</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add/Edit Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingId ? "تعديل كوليكشن" : "إضافة كوليكشن جديد"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Collection Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  صورة الكوليكشن *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="collection-image"
                  />
                  <label htmlFor="collection-image" className="cursor-pointer flex flex-col items-center">
                    {previewUrl ? (
                      <div className="relative w-full h-32">
                        <Image
                          src={previewUrl}
                          alt="Preview"
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    ) : (
                      <>
                        <span className="material-icons-outlined text-gray-400 text-4xl mb-2">
                          add_photo_alternate
                        </span>
                        <span className="text-sm text-gray-600">اضغط لاختيار صورة</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Collection Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم الكوليكشن *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: editingId ? formData.slug : generateSlug(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  placeholder="اسم الكوليكشن"
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  placeholder="collection-slug"
                />
                <p className="text-xs text-gray-500 mt-1">يتم إنشاؤه تلقائياً من الاسم</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوصف (اختياري)
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  placeholder="وصف الكوليكشن"
                />
              </div>

              {/* Display Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع العرض في الصفحة الرئيسية
                </label>
                <select
                  value={formData.display_type}
                  onChange={(e) => setFormData({ ...formData, display_type: e.target.value as "small" | "large" })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                >
                  <option value="small">كارد صغير (سكرول أفقي)</option>
                  <option value="large">كارد كبير (كامل العرض)</option>
                </select>
              </div>

              {/* Parent Collection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الكوليكشن الأساسي (اختياري)
                </label>
                <select
                  value={formData.parent_id}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                >
                  <option value="">لا يوجد (كوليكشن رئيسي)</option>
                  {collections
                    .filter((c) => c.id !== editingId && !c.parent_id)
                    .map((collection) => (
                      <option key={collection.id} value={collection.id}>
                        {collection.name}
                      </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  اختر كوليكشن رئيسي لجعل هذا كوليكشن فرعي تابع له
                </p>
              </div>

              {/* Featured Toggle */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
                />
                <label htmlFor="is_featured" className="mr-2 text-sm text-gray-700">
                  مميز (يظهر في الكاردات بالصفحة الرئيسية)
                </label>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
                />
                <label htmlFor="is_active" className="mr-2 text-sm text-gray-700">
                  نشط (يظهر في السايد بار)
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex-1 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving || uploading
                    ? "جارٍ الحفظ..."
                    : editingId
                      ? "تحديث"
                      : "إضافة"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    إلغاء
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Collections Grid */}
        <div className="lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              الكوليكشن ({collections.length})
            </h2>
          </div>

          {collections.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500">
              <span className="material-icons-outlined text-5xl text-gray-300 mb-4">
                collections
              </span>
              <p>لا توجد كوليكشن</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {collections.map((collection) => (
                <div key={collection.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  {/* Collection Image */}
                  {collection.image_url && (
                    <div className="relative w-full h-40 mb-3 rounded-lg overflow-hidden">
                      <Image
                        src={collection.image_url}
                        alt={collection.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {collection.name}
                      </h3>
                      <div className="flex gap-1 flex-shrink-0">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${collection.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                            }`}
                        >
                          {collection.is_active ? "نشط" : "غير نشط"}
                        </span>
                      </div>
                    </div>

                    {collection.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {collection.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {collection.is_featured && (
                        <span className="text-xs px-3 py-1 rounded-full font-medium bg-yellow-100 text-yellow-800">
                          ⭐ مميز
                        </span>
                      )}
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${collection.display_type === "large"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                        }`}>
                        {collection.display_type === "large" ? "كارد كبير" : "كارد صغير"}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 sm:flex gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => toggleActive(collection.id, collection.is_active)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        title={collection.is_active ? "إلغاء التفعيل" : "تفعيل"}
                      >
                        <span className="material-icons-outlined text-sm">
                          {collection.is_active ? "visibility_off" : "visibility"}
                        </span>
                        {collection.is_active ? "إخفاء" : "إظهار"}
                      </button>

                      <button
                        onClick={() => toggleFeatured(collection.id, collection.is_featured)}
                        className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-lg transition-colors ${collection.is_featured
                            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        title={collection.is_featured ? "إزالة من المميزة" : "جعله مميزاً"}
                      >
                        <span className="material-icons-outlined text-sm">
                          {collection.is_featured ? "star" : "star_border"}
                        </span>
                        {collection.is_featured ? "مميز" : "تمييز"}
                      </button>

                      <button
                        onClick={() => editCollection(collection)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        title="تعديل"
                      >
                        <span className="material-icons-outlined text-sm">edit</span>
                        تعديل
                      </button>

                      <button
                        onClick={() => deleteCollection(collection.id)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        title="حذف"
                      >
                        <span className="material-icons-outlined text-sm">delete</span>
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
