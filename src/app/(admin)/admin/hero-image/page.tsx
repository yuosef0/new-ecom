"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

interface HeroSettings {
  image_url: string;
  title: string;
  button_text: string;
  button_link: string;
}

export default function HeroImagePage() {
  const [settings, setSettings] = useState<HeroSettings>({
    image_url: "",
    title: "",
    button_text: "Shop Now",
    button_link: "/products",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "hero_image")
        .single();

      if (error) throw error;
      if (data?.value) {
        setSettings(data.value as HeroSettings);
        setPreviewUrl((data.value as HeroSettings).image_url);
      }
    } catch (err: any) {
      console.error("Error loading settings:", err);
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

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const supabase = createClient();
      let imageUrl = settings.image_url;

      // Upload new image if selected
      if (selectedFile) {
        setUploading(true);
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `hero/hero-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, selectedFile, { upsert: true });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(fileName);

        imageUrl = publicUrl;
        setUploading(false);
      }

      // Update settings
      const updatedSettings = {
        ...settings,
        image_url: imageUrl,
      };

      const { error: updateError } = await supabase
        .from("site_settings")
        .update({ value: updatedSettings })
        .eq("key", "hero_image");

      if (updateError) throw updateError;

      setSettings(updatedSettings);
      setSelectedFile(null);
      setSuccess("✅ تم حفظ الإعدادات بنجاح");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
      setUploading(false);
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
        <h1 className="text-3xl font-bold text-gray-900">صورة البداية (Hero)</h1>
        <p className="mt-2 text-gray-600">
          تحكم في الصورة الرئيسية التي تظهر في أول الصفحة الرئيسية
        </p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preview */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">معاينة</h2>
          <div className="relative w-full h-64 sm:h-80 rounded-lg overflow-hidden bg-gray-100">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Hero preview"
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-gray-400">لا توجد صورة</span>
              </div>
            )}
            {settings.title && (
              <div className="absolute inset-0 flex items-center justify-center">
                <h2 className="text-white text-3xl font-bold drop-shadow-lg">
                  {settings.title}
                </h2>
              </div>
            )}
            {settings.button_text && (
              <div className="absolute inset-x-0 bottom-6 flex justify-center">
                <div className="bg-brand-primary text-white py-3 px-8 rounded-lg font-bold">
                  {settings.button_text}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Settings Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">الإعدادات</h2>

          <div className="space-y-4">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الصورة
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="hero-upload"
                />
                <label
                  htmlFor="hero-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <span className="material-icons-outlined text-gray-400 text-4xl mb-2">
                    image
                  </span>
                  <span className="text-sm text-gray-600">
                    {selectedFile ? selectedFile.name : "اضغط لاختيار صورة جديدة"}
                  </span>
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
                value={settings.title}
                onChange={(e) =>
                  setSettings({ ...settings, title: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                placeholder="مثال: مجموعة الشتاء"
              />
            </div>

            {/* Button Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نص الزر
              </label>
              <input
                type="text"
                value={settings.button_text}
                onChange={(e) =>
                  setSettings({ ...settings, button_text: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                placeholder="Shop Now"
              />
            </div>

            {/* Button Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رابط الزر
              </label>
              <input
                type="text"
                value={settings.button_link}
                onChange={(e) =>
                  setSettings({ ...settings, button_link: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                placeholder="/products"
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving || uploading}
              className="w-full px-4 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {uploading
                ? "جارٍ رفع الصورة..."
                : saving
                ? "جارٍ الحفظ..."
                : "حفظ التغييرات"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
