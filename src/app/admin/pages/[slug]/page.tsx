"use client";

import { useState, useEffect } from "react";
import { updatePage, getPage } from "@/app/actions/pages";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditPage({ params }: { params: { slug: string } }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [page, setPage] = useState<{ title: string; content: string } | null>(null);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        async function load() {
            const data = await getPage(params.slug);
            if (data) {
                setPage({ title: data.title, content: data.content || "" });
            }
            setLoading(false);
        }
        load();
    }, [params.slug]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!page) return;

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            await updatePage(params.slug, page);
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
                <p className="text-gray-500">Page not found</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/pages"
                    className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <span className="material-icons-outlined text-xl">arrow_back</span>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Page: {params.slug}</h1>
                    <p className="mt-2 text-gray-600">Update the content for this page</p>
                </div>
            </div>

            {/* Alerts */}
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

            {/* Form */}
            <form onSubmit={handleSave} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Page Title</label>
                    <input
                        type="text"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all"
                        value={page.title}
                        onChange={(e) => setPage({ ...page, title: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content (HTML Support)
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                        You can use basic HTML tags like &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;, &lt;strong&gt;, etc.
                    </p>
                    <textarea
                        required
                        rows={15}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all font-mono text-sm"
                        value={page.content}
                        onChange={(e) => setPage({ ...page, content: e.target.value })}
                    />
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                    <Link
                        href="/admin/pages"
                        className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 bg-brand-primary hover:bg-brand-dark text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
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
