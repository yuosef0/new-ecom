"use client";

import { useState, useEffect } from "react";
import { getFaqItems, createFaqItem, updateFaqItem, deleteFaqItem } from "@/app/actions/pages";
import { useRouter } from "next/navigation";

type FaqItem = {
    id: string;
    question: string;
    answer: string;
    category: string;
    sort_order: number;
};

export default function AdminFaqsPage() {
    const router = useRouter();
    const [faqs, setFaqs] = useState<FaqItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<FaqItem | null>(null);
    const [isNew, setIsNew] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        question: "",
        answer: "",
        category: "Orders & Shipping",
        sort_order: 0,
    });

    async function loadFaqs() {
        setLoading(true);
        try {
            const data = await getFaqItems();
            setFaqs(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadFaqs();
    }, []);

    const handleEdit = (item: FaqItem) => {
        setEditing(item);
        setIsNew(false);
        setFormData({
            question: item.question,
            answer: item.answer,
            category: item.category,
            sort_order: item.sort_order,
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleNew = () => {
        setEditing({ id: "", question: "", answer: "", category: "Orders & Shipping", sort_order: 0 });
        setIsNew(true);
        setFormData({
            question: "",
            answer: "",
            category: "Orders & Shipping",
            sort_order: 0,
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCancel = () => {
        setEditing(null);
        setIsNew(false);
        setError("");
        setSuccess("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            if (isNew) {
                await createFaqItem(formData);
                setSuccess("✅ FAQ item created successfully!");
            } else if (editing) {
                await updateFaqItem(editing.id, formData);
                setSuccess("✅ FAQ item updated successfully!");
            }
            setEditing(null);
            setIsNew(false);
            loadFaqs();
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Error saving FAQ item");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this FAQ item?")) return;
        try {
            await deleteFaqItem(id);
            setSuccess("✅ FAQ item deleted successfully!");
            loadFaqs();
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Error deleting item");
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">FAQ Management</h1>
                    <p className="mt-2 text-gray-600">Manage Frequently Asked Questions displayed on the FAQs page.</p>
                </div>
                <button
                    onClick={handleNew}
                    className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary hover:bg-brand-dark text-white font-medium rounded-lg transition-colors"
                >
                    <span className="material-icons-outlined text-xl">add</span>
                    Add New Item
                </button>
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

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Form Column - Left Side */}
                <div className="lg:col-span-1">
                    {editing || isNew ? (
                        <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                {isNew ? "Add New FAQ" : "Edit FAQ Item"}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="Orders & Shipping">Orders & Shipping</option>
                                        <option value="Returns & Refunds">Returns & Refunds</option>
                                        <option value="Products & Sizing">Products & Sizing</option>
                                        <option value="General">General</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                                        value={formData.sort_order}
                                        onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                                        value={formData.question}
                                        onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Answer</label>
                                    <textarea
                                        required
                                        rows={5}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none resize-none"
                                        value={formData.answer}
                                        onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2.5 bg-brand-primary hover:bg-brand-dark text-white rounded-lg transition-colors font-medium"
                                    >
                                        {isNew ? "Create" : "Update"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500 sticky top-6">
                            <span className="material-icons-outlined text-5xl text-gray-300 mb-2">quiz</span>
                            <p>Select an item to edit or click "Add New Item"</p>
                        </div>
                    )}
                </div>

                {/* List Column - Right Side */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">All FAQ Items ({faqs.length})</h2>
                        </div>

                        {faqs.length === 0 ? (
                            <div className="px-6 py-12 text-center text-gray-500">
                                <span className="material-icons-outlined text-5xl text-gray-300 mb-4">quiz</span>
                                <p>No FAQs found. Add one to get started.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {faqs.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`p-4 hover:bg-gray-50 transition-colors ${editing?.id === item.id ? "bg-blue-50" : ""
                                            }`}
                                    >
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs font-semibold uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-2 py-1 rounded">
                                                        {item.category}
                                                    </span>
                                                    <span className="text-xs text-gray-400">Sort: {item.sort_order}</span>
                                                </div>
                                                <h3 className="font-semibold text-gray-900 mb-1">{item.question}</h3>
                                                <p className="text-sm text-gray-600 line-clamp-2">{item.answer}</p>
                                            </div>
                                            <div className="flex gap-2 shrink-0">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <span className="material-icons-outlined text-lg">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
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
