"use client";

import { useState, useEffect } from "react";
import { updatePage, getPage } from "@/app/actions/pages";
import { useRouter } from "next/navigation";

export default function ContactPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Default structure
    const [contactData, setContactData] = useState({
        whatsapp: "",
        email: "",
        address: ""
    });

    // Page metadata
    const [title, setTitle] = useState("");
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        async function load() {
            const data = await getPage('contact');
            if (data) {
                setTitle(data.title);
                try {
                    // Try parsing content as JSON, fallback to empty strings if specific keys missing
                    // If content is plain string (legacy), we treat it as empty or handle appropriately.
                    // Here we assume if it starts with { it might be JSON.
                    if (data.content && data.content.trim().startsWith('{')) {
                        const parsed = JSON.parse(data.content);
                        setContactData({
                            whatsapp: parsed.whatsapp || "",
                            email: parsed.email || "",
                            address: parsed.address || ""
                        });
                    } else {
                        // Legacy HTML content or empty, start fresh
                        setContactData({ whatsapp: "", email: "", address: "" });
                    }
                } catch (e) {
                    // JSON parse error, ignore
                    setContactData({ whatsapp: "", email: "", address: "" });
                }
            }
            setLoading(false);
        }
        load();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            // Store as JSON string in content field
            const contentJson = JSON.stringify(contactData);

            await updatePage('contact', {
                title: title,
                content: contentJson
            });

            setSuccess("✅ Contact info updated successfully!");
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Failed to update page");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 text-center">
                <div className="inline-block w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-2 text-gray-500 text-sm">Loading...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                            <span className="material-icons-outlined text-brand-primary text-2xl">contact_mail</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Contact Settings</h1>
                            <p className="mt-1 text-gray-600">Manage your contact information</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alerts */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-start gap-3">
                    <span className="material-icons-outlined text-red-600">error</span>
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 flex items-start gap-3">
                    <span className="material-icons-outlined text-green-600">check_circle</span>
                    <span>{success}</span>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSave} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2">
                        <span className="material-icons-outlined text-brand-primary">edit_note</span>
                        <h2 className="text-lg font-semibold text-gray-900">Contact Details</h2>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <span className="material-icons-outlined text-lg opacity-50">title</span>
                            Page Title
                        </label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Get in Touch"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <span className="material-icons-outlined text-lg opacity-50 md:text-green-600">phone</span>
                                WhatsApp / Phone
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all"
                                value={contactData.whatsapp}
                                onChange={(e) => setContactData({ ...contactData, whatsapp: e.target.value })}
                                placeholder="e.g. +20 100 000 0000"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <span className="material-icons-outlined text-lg opacity-50 md:text-blue-500">email</span>
                                Email Address
                            </label>
                            <input
                                type="email"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all"
                                value={contactData.email}
                                onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                                placeholder="e.g. support@riliks.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <span className="material-icons-outlined text-lg opacity-50 md:text-purple-500">location_on</span>
                            Physical Address
                        </label>
                        <textarea
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all resize-none"
                            value={contactData.address}
                            onChange={(e) => setContactData({ ...contactData, address: e.target.value })}
                            placeholder="e.g. 123 Fashion Street, Cairo, Egypt"
                        />
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 bg-brand-primary hover:bg-brand-dark text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow-md"
                    >
                        {saving ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving Changes...
                            </>
                        ) : (
                            <>
                                <span className="material-icons-outlined text-lg">save</span>
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
