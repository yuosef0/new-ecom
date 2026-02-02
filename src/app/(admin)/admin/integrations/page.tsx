"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface PixelSettings {
    pixel_id: string;
    is_active: boolean;
}

export default function IntegrationsPage() {
    const [settings, setSettings] = useState<PixelSettings>({
        pixel_id: "",
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
                .eq("key", "facebook_pixel")
                .single();

            if (error && error.code !== "PGRST116") throw error;
            if (data?.value) {
                setSettings(data.value as PixelSettings);
            }
        } catch (err: any) {
            console.error("Error loading settings:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const supabase = createClient();

            // Check if setting exists
            const { data: existing } = await supabase
                .from("site_settings")
                .select("id")
                .eq("key", "facebook_pixel")
                .single();

            if (existing) {
                // Update existing
                const { error: updateError } = await supabase
                    .from("site_settings")
                    .update({ value: settings })
                    .eq("key", "facebook_pixel");

                if (updateError) throw updateError;
            } else {
                // Insert new
                const { error: insertError } = await supabase
                    .from("site_settings")
                    .insert({ key: "facebook_pixel", value: settings });

                if (insertError) throw insertError;
            }

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
                <h1 className="text-3xl font-bold text-gray-900">الربط والتكامل</h1>
                <p className="mt-2 text-gray-600">
                    إدارة الربط مع الخدمات الخارجية مثل ميتا بيكسل (Facebook Pixel)
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
                {/* Settings Form */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        ميتا بيكسل (Meta Pixel)
                    </h2>

                    <div className="space-y-4">
                        {/* Pixel ID Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                معرف البيكسل (Pixel ID)
                            </label>
                            <input
                                type="text"
                                value={settings.pixel_id}
                                onChange={(e) =>
                                    setSettings({ ...settings, pixel_id: e.target.value })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                                placeholder="123456789012345"
                                dir="ltr"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                يمكنك الحصول على هذا الرقم من حساب فيسبوك Business Manager
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
                                نشط (تفعيل التتبع)
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

                {/* Info Panel */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        معلومات
                    </h2>
                    <div className="space-y-3 text-sm text-gray-600">
                        <p>
                            <strong>ميتا بيكسل</strong> هو أداة تتبع من فيسبوك تساعدك على:
                        </p>
                        <ul className="list-disc list-inside space-y-2 mr-4">
                            <li>قياس فعالية الإعلانات</li>
                            <li>تتبع التحويلات والمبيعات</li>
                            <li>إنشاء جماهير مخصصة</li>
                            <li>تحسين الحملات الإعلانية</li>
                        </ul>
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-xs">
                                💡 <strong>ملاحظة:</strong> بعد حفظ الإعدادات، سيتم تتبع الأحداث التالية تلقائياً:
                            </p>
                            <ul className="list-disc list-inside text-xs mt-2 mr-4 space-y-1">
                                <li>PageView - زيارة الصفحات</li>
                                <li>ViewContent - مشاهدة المنتجات</li>
                                <li>AddToCart - الإضافة للسلة</li>
                                <li>InitiateCheckout - بدء الدفع</li>
                                <li>Purchase - إتمام الشراء</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
