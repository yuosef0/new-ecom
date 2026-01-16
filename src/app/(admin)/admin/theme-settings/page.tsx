"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface ThemeSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_label: string;
  setting_description: string | null;
  created_at: string;
  updated_at: string;
}

const DEFAULT_SETTINGS = {
  primary_color: "#e60000",
  primary_hover: "#cc0000",
  top_bar_bg: "#e60000",
  button_text: "#ffffff",
  price_color: "#e60000",
  product_card_bg: "#ffffff",
};

export default function ThemeSettingsPage() {
  const [settings, setSettings] = useState<ThemeSetting[]>([]);
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
        .from("theme_settings")
        .select("*")
        .order("setting_key", { ascending: true });

      if (error) throw error;
      setSettings(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleColorChange = (key: string, value: string) => {
    setSettings(
      settings.map((setting) =>
        setting.setting_key === key
          ? { ...setting, setting_value: value }
          : setting
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const supabase = createClient();

      for (const setting of settings) {
        const { error: updateError } = await supabase
          .from("theme_settings")
          .update({
            setting_value: setting.setting_value,
            updated_at: new Date().toISOString(),
          })
          .eq("id", setting.id);

        if (updateError) throw updateError;
      }

      setSuccess("✅ تم حفظ الإعدادات بنجاح");
      loadSettings();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("هل أنت متأكد من إعادة تعيين جميع الألوان للإعدادات الافتراضية؟")) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const supabase = createClient();

      for (const setting of settings) {
        const defaultValue =
          DEFAULT_SETTINGS[setting.setting_key as keyof typeof DEFAULT_SETTINGS];

        if (defaultValue) {
          const { error: updateError } = await supabase
            .from("theme_settings")
            .update({
              setting_value: defaultValue,
              updated_at: new Date().toISOString(),
            })
            .eq("id", setting.id);

          if (updateError) throw updateError;
        }
      }

      setSuccess("✅ تم إعادة تعيين الإعدادات بنجاح");
      loadSettings();
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
        <h1 className="text-3xl font-bold text-gray-900">إعدادات الألوان والثيم</h1>
        <p className="mt-2 text-gray-600">تخصيص ألوان الموقع والثيم العام</p>
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
        {/* Settings Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">إعدادات الألوان</h2>

            {settings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">لا توجد إعدادات متاحة</p>
                <p className="text-sm text-gray-500">
                  تأكد من تشغيل SQL scripts من ملف ADMIN_DASHBOARD_SQL_SETUP.md
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {settings.map((setting) => (
                  <div key={setting.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Label and Description */}
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-900">
                          {setting.setting_label}
                        </label>
                        {setting.setting_description && (
                          <p className="text-xs text-gray-500 mt-1">
                            {setting.setting_description}
                          </p>
                        )}
                      </div>

                      {/* Color Picker and Input */}
                      <div className="flex items-center gap-3">
                        {/* Color Preview Box */}
                        <div
                          className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm cursor-pointer"
                          style={{ backgroundColor: setting.setting_value }}
                          onClick={() => {
                            const input = document.getElementById(
                              `color-${setting.setting_key}`
                            ) as HTMLInputElement;
                            input?.click();
                          }}
                        />

                        {/* Hidden Color Input */}
                        <input
                          type="color"
                          id={`color-${setting.setting_key}`}
                          value={setting.setting_value}
                          onChange={(e) =>
                            handleColorChange(setting.setting_key, e.target.value)
                          }
                          className="hidden"
                        />

                        {/* Hex Input */}
                        <input
                          type="text"
                          value={setting.setting_value}
                          onChange={(e) =>
                            handleColorChange(setting.setting_key, e.target.value)
                          }
                          className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                          placeholder="#000000"
                          maxLength={7}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            {settings.length > 0 && (
              <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "جارٍ الحفظ..." : "حفظ الإعدادات"}
                </button>
                <button
                  onClick={handleReset}
                  disabled={saving}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  إعادة تعيين
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">معاينة مباشرة</h2>

            <div className="space-y-4">
              {/* Primary Button Preview */}
              <div>
                <p className="text-xs text-gray-500 mb-2">الأزرار الأساسية</p>
                <button
                  style={{
                    backgroundColor: settings.find((s) => s.setting_key === "primary_color")
                      ?.setting_value,
                    color: settings.find((s) => s.setting_key === "button_text")?.setting_value,
                  }}
                  className="w-full px-4 py-2 rounded-lg transition-colors"
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor =
                      settings.find((s) => s.setting_key === "primary_hover")?.setting_value ||
                      "";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor =
                      settings.find((s) => s.setting_key === "primary_color")?.setting_value ||
                      "";
                  }}
                >
                  اضغط هنا
                </button>
              </div>

              {/* Top Bar Preview */}
              <div>
                <p className="text-xs text-gray-500 mb-2">الشريط العلوي</p>
                <div
                  style={{
                    backgroundColor: settings.find((s) => s.setting_key === "top_bar_bg")
                      ?.setting_value,
                  }}
                  className="w-full px-4 py-2 rounded-lg text-white text-sm text-center"
                >
                  رسالة الشريط العلوي
                </div>
              </div>

              {/* Product Card Preview */}
              <div>
                <p className="text-xs text-gray-500 mb-2">بطاقة المنتج</p>
                <div
                  style={{
                    backgroundColor: settings.find((s) => s.setting_key === "product_card_bg")
                      ?.setting_value,
                  }}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="bg-gray-200 h-32 rounded-lg mb-3"></div>
                  <p className="text-sm text-gray-900 mb-2">اسم المنتج</p>
                  <p
                    style={{
                      color: settings.find((s) => s.setting_key === "price_color")?.setting_value,
                    }}
                    className="text-lg font-bold"
                  >
                    999 ج.م
                  </p>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                <p className="text-xs text-blue-800">
                  <strong>ملاحظة:</strong> التغييرات ستظهر بعد الحفظ وإعادة تحميل الموقع
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Color Guide */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">دليل الألوان</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <span className="material-icons-outlined text-brand-primary">palette</span>
            <div>
              <p className="text-sm font-medium text-gray-900">اللون الأساسي</p>
              <p className="text-xs text-gray-600">يستخدم في الأزرار والروابط الرئيسية</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="material-icons-outlined text-brand-primary">touch_app</span>
            <div>
              <p className="text-sm font-medium text-gray-900">لون الـ Hover</p>
              <p className="text-xs text-gray-600">يظهر عند تمرير الماوس فوق الأزرار</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="material-icons-outlined text-brand-primary">notifications</span>
            <div>
              <p className="text-sm font-medium text-gray-900">الشريط العلوي</p>
              <p className="text-xs text-gray-600">لون خلفية شريط الإشعارات العلوي</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="material-icons-outlined text-brand-primary">text_fields</span>
            <div>
              <p className="text-sm font-medium text-gray-900">نص الأزرار</p>
              <p className="text-xs text-gray-600">لون النص داخل الأزرار الرئيسية</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="material-icons-outlined text-brand-primary">attach_money</span>
            <div>
              <p className="text-sm font-medium text-gray-900">لون الأسعار</p>
              <p className="text-xs text-gray-600">لون عرض أسعار المنتجات</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="material-icons-outlined text-brand-primary">shopping_bag</span>
            <div>
              <p className="text-sm font-medium text-gray-900">بطاقة المنتج</p>
              <p className="text-xs text-gray-600">لون خلفية بطاقات المنتجات</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
