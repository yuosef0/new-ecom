"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface MarqueeSettings {
  text: string;
  is_active: boolean;
}

export default function MarqueeBannerPage() {
  const [settings, setSettings] = useState<MarqueeSettings>({
    text: "",
    is_active: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "marquee_text")
        .single();

      if (error) throw error;
      if (data?.value) {
        setSettings(data.value as MarqueeSettings);
      }
    } catch (err: any) {
      console.error("Error loading settings:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings.text.trim()) {
      setError("الرجاء إدخال النص");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("site_settings")
        .update({ value: settings })
        .eq("key", "marquee_text");

      if (updateError) throw updateError;

      setSuccess("✅ تم حفظ التغييرات بنجاح");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
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
        <h1 className="text-3xl font-bold text-gray-900">الشريط المتحرك</h1>
        <p className="mt-2 text-gray-600">
          تحكم في النص الذي يظهر في الشريط المتحرك أسفل صورة البداية
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
          <div className="bg-brand-primary overflow-hidden py-3 rounded-lg">
            <div className="animate-marquee whitespace-nowrap">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className="text-white font-bold text-sm tracking-wider mx-8"
                >
                  {settings.text || "النص سيظهر هنا"}
                </span>
              ))}
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-600">
            {settings.is_active ? "✅ الشريط نشط ويظهر للزوار" : "⏸️ الشريط متوقف"}
          </p>
        </div>

        {/* Settings Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">الإعدادات</h2>

          <div className="space-y-4">
            {/* Text Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                النص *
              </label>
              <input
                type="text"
                value={settings.text}
                onChange={(e) =>
                  setSettings({ ...settings, text: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                placeholder="مثال: شحن مجاني على جميع الطلبات"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                هذا النص سيظهر متحركاً في الشريط
              </p>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={settings.is_active}
                onChange={(e) =>
                  setSettings({ ...settings, is_active: e.target.checked })
                }
                className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
              />
              <label htmlFor="is_active" className="mr-2 text-sm text-gray-700">
                نشط (يظهر للزوار)
              </label>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-4 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {saving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
