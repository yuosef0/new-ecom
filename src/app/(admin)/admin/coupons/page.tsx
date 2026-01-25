"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number | null;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export default function CouponsManagementPage() {
  const [coupons, setCoupons] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: "",
    min_order_amount: "",
    max_uses: "",
    starts_at: new Date().toISOString().split("T")[0],
    expires_at: "",
    is_active: true,
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateCouponCode = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      setError("الرجاء إدخال رمز الكوبون");
      return;
    }

    if (!formData.discount_value) {
      setError("الرجاء إدخال قيمة الخصم");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const supabase = createClient();

      const couponData = {
        code: formData.code.toUpperCase().trim(),
        description: formData.description || null,
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        min_order_amount: formData.min_order_amount
          ? parseFloat(formData.min_order_amount)
          : null,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        starts_at: formData.starts_at ? new Date(formData.starts_at).toISOString() : null,
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
        is_active: formData.is_active,
      };

      if (editingId) {
        const { error: updateError } = await supabase
          .from("promo_codes")
          .update(couponData)
          .eq("id", editingId);

        if (updateError) throw updateError;
        setSuccess("✅ تم تحديث الكوبون بنجاح");
      } else {
        const { error: insertError } = await supabase.from("promo_codes").insert({
          ...couponData,
          used_count: 0,
        });

        if (insertError) throw insertError;
        setSuccess("✅ تمت إضافة الكوبون بنجاح");
      }

      resetForm();
      loadCoupons();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const editCoupon = (coupon: PromoCode) => {
    setFormData({
      code: coupon.code,
      description: coupon.description || "",
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      min_order_amount: coupon.min_order_amount?.toString() || "",
      max_uses: coupon.max_uses?.toString() || "",
      starts_at: coupon.starts_at ? coupon.starts_at.split("T")[0] : "",
      expires_at: coupon.expires_at ? coupon.expires_at.split("T")[0] : "",
      is_active: coupon.is_active,
    });
    setEditingId(coupon.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الكوبون؟")) return;

    try {
      const supabase = createClient();
      const { error } = await supabase.from("promo_codes").delete().eq("id", id);

      if (error) throw error;
      setSuccess("✅ تم حذف الكوبون بنجاح");
      loadCoupons();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("promo_codes")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      loadCoupons();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discount_type: "percentage",
      discount_value: "",
      min_order_amount: "",
      max_uses: "",
      starts_at: new Date().toISOString().split("T")[0],
      expires_at: "",
      is_active: true,
    });
    setEditingId(null);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "غير محدد";
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
        <h1 className="text-3xl font-bold text-gray-900">إدارة الكوبونات والخصومات</h1>
        <p className="mt-2 text-gray-600">إدارة أكواد الخصم والعروض الترويجية</p>
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

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي الكوبونات</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{coupons.length}</p>
            </div>
            <span className="material-icons-outlined text-3xl text-gray-400">local_offer</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">الكوبونات النشطة</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {coupons.filter((c) => c.is_active).length}
              </p>
            </div>
            <span className="material-icons-outlined text-3xl text-green-400">check_circle</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي الاستخدام</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {coupons.reduce((sum, c) => sum + c.used_count, 0)}
              </p>
            </div>
            <span className="material-icons-outlined text-3xl text-blue-400">receipt</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">منتهية الصلاحية</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {
                  coupons.filter(
                    (c) => c.expires_at && new Date(c.expires_at) < new Date()
                  ).length
                }
              </p>
            </div>
            <span className="material-icons-outlined text-3xl text-red-400">event_busy</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add/Edit Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingId ? "تعديل كوبون" : "إضافة كوبون جديد"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Coupon Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رمز الكوبون *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent uppercase"
                    placeholder="SUMMER2024"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, code: generateCouponCode() })}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    title="توليد رمز عشوائي"
                  >
                    <span className="material-icons-outlined text-lg">casino</span>
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوصف (اختياري)
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  placeholder="وصف العرض"
                />
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع الخصم *
                </label>
                <select
                  value={formData.discount_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discount_type: e.target.value as "percentage" | "fixed",
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                >
                  <option value="percentage">نسبة مئوية (%)</option>
                  <option value="fixed">مبلغ ثابت (ج.م)</option>
                </select>
              </div>

              {/* Discount Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  قيمة الخصم *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    placeholder="0"
                    required
                  />
                  <span className="absolute left-4 top-2.5 text-gray-500 text-sm">
                    {formData.discount_type === "percentage" ? "%" : "ج.م"}
                  </span>
                </div>
              </div>

              {/* Min Order Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحد الأدنى للشراء (ج.م)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.min_order_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, min_order_amount: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  placeholder="0"
                />
              </div>

              {/* Max Uses */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عدد مرات الاستخدام (اختياري)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.max_uses}
                  onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  placeholder="غير محدود"
                />
              </div>

              {/* Starts At */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  صالح من
                </label>
                <input
                  type="date"
                  value={formData.starts_at}
                  onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>

              {/* Expires At */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  صالح حتى (اختياري)
                </label>
                <input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  min={formData.starts_at}
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
                  نشط (يمكن استخدامه)
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "جارٍ الحفظ..." : editingId ? "تحديث" : "إضافة"}
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

        {/* Coupons List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                الكوبونات ({coupons.length})
              </h2>
            </div>

            {coupons.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <span className="material-icons-outlined text-5xl text-gray-300 mb-4">
                  local_offer
                </span>
                <p>لا توجد كوبونات</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {coupons.map((coupon) => {
                  const isExpired =
                    coupon.expires_at && new Date(coupon.expires_at) < new Date();
                  const isLimitReached =
                    coupon.max_uses && coupon.used_count >= coupon.max_uses;

                  return (
                    <div key={coupon.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{coupon.code}</h3>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${coupon.is_active && !isExpired && !isLimitReached
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                                }`}
                            >
                              {isExpired
                                ? "منتهي"
                                : isLimitReached
                                  ? "مكتمل"
                                  : coupon.is_active
                                    ? "نشط"
                                    : "غير نشط"}
                            </span>
                          </div>

                          {coupon.description && (
                            <p className="text-sm text-gray-600 mb-3">{coupon.description}</p>
                          )}

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">نوع الخصم</p>
                              <p className="font-medium text-gray-900">
                                {coupon.discount_type === "percentage"
                                  ? `${coupon.discount_value}%`
                                  : `${coupon.discount_value} ج.م`}
                              </p>
                            </div>

                            {coupon.min_order_amount && coupon.min_order_amount > 0 && (
                              <div>
                                <p className="text-gray-500">الحد الأدنى للشراء</p>
                                <p className="font-medium text-gray-900">
                                  {coupon.min_order_amount} ج.م
                                </p>
                              </div>
                            )}

                            <div>
                              <p className="text-gray-500">الاستخدام</p>
                              <p className="font-medium text-gray-900">
                                {coupon.used_count}
                                {coupon.max_uses ? ` / ${coupon.max_uses}` : " / غير محدود"}
                              </p>
                            </div>

                            <div>
                              <p className="text-gray-500">صالح حتى</p>
                              <p className="font-medium text-gray-900">
                                {formatDate(coupon.expires_at)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleActive(coupon.id, coupon.is_active)}
                            className="p-2 rounded-md hover:bg-gray-200 text-gray-600"
                            title={coupon.is_active ? "إلغاء التفعيل" : "تفعيل"}
                          >
                            <span className="material-icons-outlined text-lg">
                              {coupon.is_active ? "visibility_off" : "visibility"}
                            </span>
                          </button>

                          <button
                            onClick={() => editCoupon(coupon)}
                            className="p-2 rounded-md hover:bg-gray-200 text-gray-600"
                            title="تعديل"
                          >
                            <span className="material-icons-outlined text-lg">edit</span>
                          </button>

                          <button
                            onClick={() => deleteCoupon(coupon.id)}
                            className="p-2 rounded-md hover:bg-red-100 text-red-600"
                            title="حذف"
                          >
                            <span className="material-icons-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
