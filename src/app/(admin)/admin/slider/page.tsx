"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

interface SliderImage {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export default function SliderManagementPage() {
  const [images, setImages] = useState<SliderImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    is_active: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("slider_images")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("الرجاء اختيار صورة");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const supabase = createClient();

      // Upload image to storage
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `slider/${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      // Get next display order
      const maxOrder = Math.max(...images.map(img => img.display_order), 0);

      // Insert slider record
      const { error: insertError } = await supabase
        .from("slider_images")
        .insert({
          image_url: publicUrl,
          title: formData.title || null,
          description: formData.description || null,
          display_order: maxOrder + 1,
          is_active: formData.is_active,
        });

      if (insertError) throw insertError;

      setSuccess("✅ تمت إضافة الصورة بنجاح");
      setFormData({ title: "", description: "", is_active: true });
      setSelectedFile(null);
      setPreviewUrl(null);
      loadImages();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("slider_images")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      loadImages();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const moveImage = async (id: string, direction: "up" | "down") => {
    const currentIndex = images.findIndex(img => img.id === id);
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === images.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const updatedImages = [...images];
    [updatedImages[currentIndex], updatedImages[targetIndex]] =
    [updatedImages[targetIndex], updatedImages[currentIndex]];

    try {
      const supabase = createClient();

      // Update display orders
      for (let i = 0; i < updatedImages.length; i++) {
        await supabase
          .from("slider_images")
          .update({ display_order: i + 1 })
          .eq("id", updatedImages[i].id);
      }

      loadImages();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteImage = async (id: string, imageUrl: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الصورة؟")) return;

    try {
      const supabase = createClient();

      // Delete from database
      const { error: dbError } = await supabase
        .from("slider_images")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      // Delete from storage
      const path = imageUrl.split("/").slice(-2).join("/");
      await supabase.storage.from("product-images").remove([path]);

      setSuccess("✅ تم حذف الصورة بنجاح");
      loadImages();
    } catch (err: any) {
      setError(err.message);
    }
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
        <h1 className="text-3xl font-bold text-gray-900">إدارة السلايدر</h1>
        <p className="mt-2 text-gray-600">إدارة صور السلايدر الرئيسي</p>
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
        {/* Add New Slider Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              إضافة صورة جديدة
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الصورة *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="slider-upload"
                  />
                  <label
                    htmlFor="slider-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    {previewUrl ? (
                      <div className="relative w-full h-40">
                        <Image
                          src={previewUrl}
                          alt="Preview"
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    ) : (
                      <>
                        <span className="material-icons-outlined text-gray-400 text-5xl mb-2">
                          image
                        </span>
                        <span className="text-sm text-gray-600">
                          اضغط لاختيار صورة
                        </span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العنوان (اختياري)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  placeholder="عنوان الصورة"
                />
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
                  placeholder="وصف الصورة"
                />
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
                  نشط (يظهر في السلايدر)
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={uploading}
                className="w-full px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? "جارٍ الرفع..." : "إضافة صورة"}
              </button>
            </form>
          </div>
        </div>

        {/* Slider Images List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                صور السلايدر ({images.length})
              </h2>
            </div>

            {images.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                لا توجد صور في السلايدر
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {images.map((image, index) => (
                  <div key={image.id} className="p-6 hover:bg-gray-50">
                    <div className="flex gap-4">
                      {/* Image Preview */}
                      <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                        <Image
                          src={image.image_url}
                          alt={image.title || "Slider image"}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {image.title || "بدون عنوان"}
                            </h3>
                            {image.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {image.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-gray-500">
                                الترتيب: {image.display_order}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  image.is_active
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {image.is_active ? "نشط" : "غير نشط"}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            {/* Move Up */}
                            <button
                              onClick={() => moveImage(image.id, "up")}
                              disabled={index === 0}
                              className="p-2 rounded-md hover:bg-gray-200 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="تحريك لأعلى"
                            >
                              <span className="material-icons-outlined text-lg">
                                arrow_upward
                              </span>
                            </button>

                            {/* Move Down */}
                            <button
                              onClick={() => moveImage(image.id, "down")}
                              disabled={index === images.length - 1}
                              className="p-2 rounded-md hover:bg-gray-200 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="تحريك لأسفل"
                            >
                              <span className="material-icons-outlined text-lg">
                                arrow_downward
                              </span>
                            </button>

                            {/* Toggle Active */}
                            <button
                              onClick={() => toggleActive(image.id, image.is_active)}
                              className="p-2 rounded-md hover:bg-gray-200 text-gray-600"
                              title={image.is_active ? "إلغاء التفعيل" : "تفعيل"}
                            >
                              <span className="material-icons-outlined text-lg">
                                {image.is_active ? "visibility_off" : "visibility"}
                              </span>
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => deleteImage(image.id, image.image_url)}
                              className="p-2 rounded-md hover:bg-red-100 text-red-600"
                              title="حذف"
                            >
                              <span className="material-icons-outlined text-lg">
                                delete
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
