"use client";

import { useState, useEffect } from "react";
import { updatePage, getPage } from "@/app/actions/pages";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/storefront/ui/Icon";
import Link from "next/link";

export default function EditPage({ params }: { params: { slug: string } }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [page, setPage] = useState<{ title: string; content: string } | null>(null);

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
        try {
            await updatePage(params.slug, page);
            router.refresh();
            alert("Page updated successfully!");
        } catch (error) {
            alert("Failed to update page");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!page) return <div className="p-10 text-center">Page not found</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link
                    href="/admin/pages"
                    className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <Icon name="arrow_back" className="text-xl" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Page: {params.slug}</h1>
                </div>
            </div>

            <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Page Title</label>
                    <input
                        type="text"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                        value={page.title}
                        onChange={(e) => setPage({ ...page, title: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content (HTML Support)
                    </label>
                    <p className="text-xs text-gray-500 mb-2">You can use basic HTML tags like &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;, etc.</p>
                    <textarea
                        required
                        rows={15}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all font-mono text-sm"
                        value={page.content}
                        onChange={(e) => setPage({ ...page, content: e.target.value })}
                    />
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Icon name="save" className="text-lg" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
