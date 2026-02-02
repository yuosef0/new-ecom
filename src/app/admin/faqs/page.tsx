"use client";

import { useState, useEffect } from "react";
import { getFaqItems, createFaqItem, updateFaqItem, deleteFaqItem } from "@/app/actions/pages";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/storefront/ui/Icon";

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
    };

    const handleNew = () => {
        setEditing({ id: "", question: "", answer: "", category: "Orders & Shipping", sort_order: 0 }); // Temp object
        setIsNew(true);
        setFormData({
            question: "",
            answer: "",
            category: "Orders & Shipping",
            sort_order: 0,
        });
    };

    const handleCancel = () => {
        setEditing(null);
        setIsNew(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isNew) {
                await createFaqItem(formData);
            } else if (editing) {
                await updateFaqItem(editing.id, formData);
            }
            setEditing(null);
            setIsNew(false);
            loadFaqs(); // Reload
            router.refresh();
        } catch (error) {
            alert("Error saving FAQ item");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this item?")) return;
        try {
            await deleteFaqItem(id);
            loadFaqs();
            router.refresh();
        } catch (error) {
            alert("Error deleting item");
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">FAQ Management</h1>
                    <p className="text-gray-500">Manage Frequently Asked Questions.</p>
                </div>
                <button
                    onClick={handleNew}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
                >
                    <Icon name="add" className="text-xl" />
                    Add New Item
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* List Column */}
                <div className="lg:col-span-2 space-y-4">
                    {faqs.length === 0 && (
                        <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
                            No FAQs found. Add one to get started.
                        </div>
                    )}
                    {faqs.map((item) => (
                        <div
                            key={item.id}
                            className={`bg-white p-4 rounded-xl border transition-all ${editing?.id === item.id ? "border-brand-primary ring-1 ring-brand-primary" : "border-gray-200 hover:border-brand-primary/50"
                                }`}
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded">
                                            {item.category}
                                        </span>
                                        <span className="text-xs text-gray-400">Sort: {item.sort_order}</span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-1">{item.question}</h3>
                                    <p className="text-sm text-gray-600 line-clamp-2">{item.answer}</p>
                                </div>
                                <div className="flex flex-col gap-2 shrink-0">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="p-1.5 text-gray-500 hover:text-brand-primary hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <Icon name="edit" className="text-lg" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Icon name="delete" className="text-lg" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Edit/Create Form Column - Sticky */}
                <div className="lg:col-span-1">
                    {editing || isNew ? (
                        <div className="bg-white p-6 rounded-xl border border-gray-200 sticky top-6 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                {isNew ? "Add New FAQ" : "Edit FAQ Item"}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                                        value={formData.sort_order}
                                        onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                                        value={formData.question}
                                        onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                                    <textarea
                                        required
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none resize-none"
                                        value={formData.answer}
                                        onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-brand-primary text-white hover:bg-brand-primary/90 rounded-lg transition-colors font-medium"
                                    >
                                        {isNew ? "Create" : "Update"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-500 sticky top-6">
                            <p>Select an item to edit or click "Add New Item"</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
