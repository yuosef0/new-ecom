"use client";

import { useState, useEffect } from "react";
import { updatePage, getPage } from "@/app/actions/pages";
import { useRouter } from "next/navigation";

export default function PrivacyPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [page, setPage] = useState<{ title: string; content: string } | null>(null);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        async function load() {
            const data = await getPage('privacy');
            if (data) {
                setPage({ title: data.title, content: data.content || "" });
            }
            setLoading(false);
        }
        load();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!page) return;

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            await updatePage('privacy', page);
            setSuccess("✅ Page updated successfully!");
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

    if (!page) {
        return (
            <div className="p-8 text-center">
                <span className="material-icons-outlined text-5xl text-gray-300 mb-4">error</span>
                <p className="text-gray-500">Page not found in database</p>
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
                            <span className="material-icons-outlined text-brand-primary text-2xl">privacy_tip</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy Page</h1>
                            <p className="mt-1 text-gray-600">Manage your Privacy Policy page content</p>
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
                        <h2 className="text-lg font-semibold text-gray-900">Page Content</h2>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <span className="material-icons-outlined text-lg">title</span>
                            Page Title
                        </label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all"
                            value={page.title}
                            onChange={(e) => setPage({ ...page, title: e.target.value })}
                            placeholder="Enter page title"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <span className="material-icons-outlined text-lg">code</span>
                            Content (HTML Support)
                        </label>
                        <p className="text-xs text-gray-500 mb-3 flex items-start gap-2">
                            <span className="material-icons-outlined text-sm">info</span>
                            <span>You can use basic HTML tags like &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;, &lt;strong&gt;, etc.</span>
                        </p>
                        <textarea
                            required
                            rows={15}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all font-mono text-sm leading-relaxed"
                            value={page.content}
                            onChange={(e) => setPage({ ...page, content: e.target.value })}
                            placeholder="Enter page content with HTML formatting"
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
