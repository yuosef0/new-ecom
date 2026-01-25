"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface TopBarMessage {
  id: string;
  message_ar: string;
  message_en: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export default function TopBarMessagesPage() {
  const [messages, setMessages] = useState<TopBarMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    message_ar: "",
    message_en: "",
    is_active: true,
  });

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("top_bar_messages")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message_ar.trim()) {
      setError("الرجاء إدخال الرسالة بالعربية");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const supabase = createClient();

      if (formData.is_active) {
        // Deactivate all active messages
        await supabase
          .from("top_bar_messages")
          .update({ is_active: false })
          .neq("id", "00000000-0000-0000-0000-000000000000"); // Update all rows
      }

      if (editingId) {
        // Update existing message
        const { error: updateError } = await supabase
          .from("top_bar_messages")
          .update({
            message_ar: formData.message_ar,
            message_en: formData.message_en || null,
            is_active: formData.is_active,
          })
          .eq("id", editingId);

        if (updateError) throw updateError;
        setSuccess("✅ تم تحديث الرسالة بنجاح");
      } else {
        // Create new message
        const maxOrder = Math.max(...messages.map(m => m.display_order), 0);

        const { error: insertError } = await supabase
          .from("top_bar_messages")
          .insert({
            message_ar: formData.message_ar,
            message_en: formData.message_en || null,
            is_active: formData.is_active,
            display_order: maxOrder + 1,
          });

        if (insertError) throw insertError;
        setSuccess("✅ تمت إضافة الرسالة بنجاح");
      }

      setFormData({ message_ar: "", message_en: "", is_active: true });
      setEditingId(null);
      loadMessages();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const editMessage = (message: TopBarMessage) => {
    setFormData({
      message_ar: message.message_ar,
      message_en: message.message_en || "",
      is_active: message.is_active,
    });
    setEditingId(message.id);
  };

  const cancelEdit = () => {
    setFormData({ message_ar: "", message_en: "", is_active: true });
    setEditingId(null);
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const supabase = createClient();
      const newStatus = !currentStatus;

      if (newStatus) {
        // If activating, deactivate others first
        await supabase
          .from("top_bar_messages")
          .update({ is_active: false })
          .neq("id", id);
      }

      const { error } = await supabase
        .from("top_bar_messages")
        .update({ is_active: newStatus })
        .eq("id", id);

      if (error) throw error;
      loadMessages();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const moveMessage = async (id: string, direction: "up" | "down") => {
    const currentIndex = messages.findIndex(m => m.id === id);
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === messages.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const updatedMessages = [...messages];
    [updatedMessages[currentIndex], updatedMessages[targetIndex]] =
      [updatedMessages[targetIndex], updatedMessages[currentIndex]];

    try {
      const supabase = createClient();
      for (let i = 0; i < updatedMessages.length; i++) {
        await supabase
          .from("top_bar_messages")
          .update({ display_order: i + 1 })
          .eq("id", updatedMessages[i].id);
      }
      loadMessages();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الرسالة؟")) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("top_bar_messages")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setSuccess("✅ تم حذف الرسالة بنجاح");
      loadMessages();
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
        <h1 className="text-3xl font-bold text-gray-900">رسائل الشريط العلوي</h1>
        <p className="mt-2 text-gray-600">إدارة الرسائل التي تظهر في الشريط العلوي</p>
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
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingId ? "تعديل رسالة" : "إضافة رسالة جديدة"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Arabic Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الرسالة بالعربية *
                </label>
                <textarea
                  rows={3}
                  value={formData.message_ar}
                  onChange={(e) => setFormData({ ...formData, message_ar: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  placeholder="أدخل الرسالة بالعربية"
                  required
                />
              </div>

              {/* English Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الرسالة بالإنجليزية (اختياري)
                </label>
                <textarea
                  rows={3}
                  value={formData.message_en}
                  onChange={(e) => setFormData({ ...formData, message_en: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  placeholder="Enter message in English"
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
                  نشط (يظهر في الشريط)
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
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
                    onClick={cancelEdit}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    إلغاء
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Messages List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                الرسائل ({messages.length})
              </h2>
            </div>

            {messages.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                لا توجد رسائل
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className="p-6 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-gray-500">
                            الترتيب: {message.display_order}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${message.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                              }`}
                          >
                            {message.is_active ? "نشط" : "غير نشط"}
                          </span>
                        </div>
                        <p className="text-gray-900 font-medium">{message.message_ar}</p>
                        {message.message_en && (
                          <p className="text-gray-600 text-sm mt-1" dir="ltr">
                            {message.message_en}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => moveMessage(message.id, "up")}
                          disabled={index === 0}
                          className="p-2 rounded-md hover:bg-gray-200 text-gray-600 disabled:opacity-30"
                          title="تحريك لأعلى"
                        >
                          <span className="material-icons-outlined text-lg">arrow_upward</span>
                        </button>

                        <button
                          onClick={() => moveMessage(message.id, "down")}
                          disabled={index === messages.length - 1}
                          className="p-2 rounded-md hover:bg-gray-200 text-gray-600 disabled:opacity-30"
                          title="تحريك لأسفل"
                        >
                          <span className="material-icons-outlined text-lg">arrow_downward</span>
                        </button>

                        <button
                          onClick={() => toggleActive(message.id, message.is_active)}
                          className="p-2 rounded-md hover:bg-gray-200 text-gray-600"
                          title={message.is_active ? "إلغاء التفعيل" : "تفعيل"}
                        >
                          <span className="material-icons-outlined text-lg">
                            {message.is_active ? "visibility_off" : "visibility"}
                          </span>
                        </button>

                        <button
                          onClick={() => editMessage(message)}
                          className="p-2 rounded-md hover:bg-gray-200 text-gray-600"
                          title="تعديل"
                        >
                          <span className="material-icons-outlined text-lg">edit</span>
                        </button>

                        <button
                          onClick={() => deleteMessage(message.id)}
                          className="p-2 rounded-md hover:bg-red-100 text-red-600"
                          title="حذف"
                        >
                          <span className="material-icons-outlined text-lg">delete</span>
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
    </div>
  );
}
