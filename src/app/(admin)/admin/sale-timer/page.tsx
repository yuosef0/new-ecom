"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";

interface SaleSettings {
  is_active: boolean;
  end_date: string;
  title: string;
}

export default function SaleTimerPage() {
  const [settings, setSettings] = useState<SaleSettings>({
    is_active: false,
    end_date: "",
    title: "SALE ENDS SOON",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "sale_timer")
        .single();

      if (data && !error) {
        setSettings(data.value as SaleSettings);
      }
    } catch (err) {
      console.error("Error loading settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("site_settings")
        .upsert({
          key: "sale_timer",
          value: settings,
        });

      if (error) throw error;

      setMessage("Sale timer settings saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
      setMessage("Error saving settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="text-center">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 md:p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
            Sale Countdown Timer
          </h1>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.includes("Error")
                  ? "bg-red-100 text-red-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {message}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            {/* Active Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-lg font-semibold">Enable Sale Timer</label>
                <p className="text-sm text-gray-600 mt-1">
                  Show countdown timer on homepage
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.is_active}
                  onChange={(e) =>
                    setSettings({ ...settings, is_active: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Sale Title
              </label>
              <input
                type="text"
                value={settings.title}
                onChange={(e) =>
                  setSettings({ ...settings, title: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="SALE ENDS SOON"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Sale End Date & Time
              </label>
              <input
                type="datetime-local"
                value={settings.end_date}
                onChange={(e) =>
                  setSettings({ ...settings, end_date: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-600 mt-1">
                The countdown will automatically hide when this date is reached
              </p>
            </div>

            {/* Preview */}
            {settings.is_active && settings.end_date && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-semibold mb-2">Preview:</p>
                <div className="bg-brand-burgundy text-brand-cream py-4 px-6 rounded-lg">
                  <h2 className="text-lg font-bold tracking-wider text-center mb-3">
                    {settings.title}
                  </h2>
                  <div className="text-center text-sm text-brand-cream/70">
                    Ends on: {new Date(settings.end_date).toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
