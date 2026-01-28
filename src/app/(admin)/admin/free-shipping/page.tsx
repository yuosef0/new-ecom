"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/storefront/ui/Icon";

interface FreeShippingSettings {
    is_active: boolean;
    min_order_amount: number;
}

export default function FreeShippingPage() {
    const [settings, setSettings] = useState<FreeShippingSettings>({
        is_active: false,
        min_order_amount: 500,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    // Fetch current settings
    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await fetch("/api/admin/free-shipping");
            const data = await response.json();

            if (response.ok) {
                setSettings(data);
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setNotification(null);

        try {
            const response = await fetch("/api/admin/free-shipping", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(settings),
            });

            if (response.ok) {
                setNotification({
                    type: "success",
                    message: "Settings saved successfully!",
                });
            } else {
                const data = await response.json();
                setNotification({
                    type: "error",
                    message: data.error || "Failed to save settings",
                });
            }
        } catch (error) {
            setNotification({
                type: "error",
                message: "An error occurred while saving",
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin h-8 w-8 border-4 border-brand-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Free Shipping Settings</h1>
                <p className="mt-2 text-gray-600">
                    Configure free shipping threshold for your store
                </p>
            </div>

            {/* Notification */}
            {notification && (
                <div
                    className={`p-4 rounded-lg border ${notification.type === "success"
                            ? "bg-green-50 border-green-200 text-green-800"
                            : "bg-red-50 border-red-200 text-red-800"
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <Icon
                            name={notification.type === "success" ? "check_circle" : "error"}
                            className="text-xl"
                        />
                        <p className="font-medium">{notification.message}</p>
                    </div>
                </div>
            )}

            {/* Settings Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
                {/* Enable/Disable Toggle */}
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={settings.is_active}
                                    onChange={(e) =>
                                        setSettings({ ...settings, is_active: e.target.checked })
                                    }
                                    className="sr-only peer"
                                />
                                <div className="w-14 h-8 bg-gray-300 rounded-full peer peer-checked:bg-brand-primary transition-colors"></div>
                                <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Enable Free Shipping</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Automatically apply free shipping when customers reach the minimum order amount
                                </p>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Minimum Order Amount */}
                <div>
                    <label className="block mb-2">
                        <span className="text-sm font-medium text-gray-700">
                            Minimum Order Amount (EGP)
                        </span>
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            min="0"
                            step="10"
                            value={settings.min_order_amount}
                            onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    min_order_amount: parseFloat(e.target.value) || 0,
                                })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                            placeholder="500"
                        />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                        Customers will get free shipping when their cart subtotal reaches this amount
                    </p>
                </div>

                {/* Preview */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <Icon name="info" className="text-blue-600 text-xl mt-0.5" />
                        <div className="flex-1">
                            <h4 className="font-semibold text-blue-900 mb-1">Preview</h4>
                            {settings.is_active ? (
                                <p className="text-sm text-blue-800">
                                    Free shipping will be applied when cart subtotal is{" "}
                                    <span className="font-bold">{settings.min_order_amount} EGP</span> or more
                                </p>
                            ) : (
                                <p className="text-sm text-blue-800">
                                    Free shipping is currently disabled. Standard shipping rates will apply.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-3 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Icon name="save" className="text-lg" />
                                Save Settings
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <Icon name="lightbulb" className="text-yellow-600 text-xl mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-semibold text-yellow-900 mb-1">Tips</h4>
                        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                            <li>Set the threshold based on your average order value to encourage larger purchases</li>
                            <li>Free shipping is calculated on the subtotal before any discount coupons</li>
                            <li>Consider your actual shipping costs when setting the minimum amount</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
