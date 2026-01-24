"use client";

import { useState, useEffect } from "react";
import { Icon } from "../ui/Icon";
import { createClient } from "@/lib/supabase/client";

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface FilterState {
    minPrice: number | null;
    maxPrice: number | null;
    categories: string[];
}

interface ProductFiltersProps {
    isOpen: boolean;
    onClose: () => void;
    filters: FilterState;
    onApply: (filters: FilterState) => void;
}

export function ProductFilters({ isOpen, onClose, filters, onApply }: ProductFiltersProps) {
    const [localFilters, setLocalFilters] = useState<FilterState>(filters);
    const [categories, setCategories] = useState<Category[]>([]);
    const [shouldRender, setShouldRender] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            const supabase = createClient();
            const { data } = await supabase
                .from("categories")
                .select("id, name, slug")
                .eq("is_active", true)
                .order("name");

            if (data) {
                setCategories(data);
            }
        };
        fetchCategories();
    }, []);

    // Sync local filters with props
    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    // Handle mount/unmount animations
    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            requestAnimationFrame(() => {
                setIsVisible(true);
            });
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    const handleClear = () => {
        const clearedFilters: FilterState = {
            minPrice: null,
            maxPrice: null,
            categories: []
        };
        setLocalFilters(clearedFilters);
        onApply(clearedFilters);
        onClose();
    };

    const toggleCategory = (slug: string) => {
        setLocalFilters(prev => ({
            ...prev,
            categories: prev.categories.includes(slug)
                ? prev.categories.filter(c => c !== slug)
                : [...prev.categories, slug]
        }));
    };

    const activeFilterCount =
        (localFilters.minPrice !== null ? 1 : 0) +
        (localFilters.maxPrice !== null ? 1 : 0) +
        localFilters.categories.length;

    if (!shouldRender) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"
                    }`}
                onClick={onClose}
            />

            {/* Filter Panel */}
            <div
                className={`fixed inset-y-0 left-0 w-full max-w-sm bg-brand-burgundy shadow-2xl flex flex-col z-50 transform transition-transform duration-300 ease-out ${isVisible ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold text-brand-cream">Filters</h2>
                        {activeFilterCount > 0 && (
                            <span className="bg-brand-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                                {activeFilterCount}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-white/10 text-brand-cream transition-colors hover:rotate-90 duration-300"
                    >
                        <Icon name="close" className="text-2xl" />
                    </button>
                </div>

                {/* Filter Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                    {/* Price Range */}
                    <div>
                        <h3 className="font-bold text-brand-cream mb-3 flex items-center gap-2">
                            <Icon name="payments" className="text-lg" />
                            Price Range
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-brand-cream/70 text-xs mb-1 block">Min Price</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={localFilters.minPrice || ""}
                                    onChange={(e) => setLocalFilters(prev => ({
                                        ...prev,
                                        minPrice: e.target.value ? parseInt(e.target.value) : null
                                    }))}
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-brand-cream placeholder:text-brand-cream/50 focus:outline-none focus:border-brand-primary"
                                />
                            </div>
                            <div>
                                <label className="text-brand-cream/70 text-xs mb-1 block">Max Price</label>
                                <input
                                    type="number"
                                    placeholder="10000"
                                    value={localFilters.maxPrice || ""}
                                    onChange={(e) => setLocalFilters(prev => ({
                                        ...prev,
                                        maxPrice: e.target.value ? parseInt(e.target.value) : null
                                    }))}
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-brand-cream placeholder:text-brand-cream/50 focus:outline-none focus:border-brand-primary"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="font-bold text-brand-cream mb-3 flex items-center gap-2">
                            <Icon name="category" className="text-lg" />
                            Categories
                        </h3>
                        <div className="space-y-2">
                            {categories.map((category) => (
                                <label
                                    key={category.id}
                                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        checked={localFilters.categories.includes(category.slug)}
                                        onChange={() => toggleCategory(category.slug)}
                                        className="w-5 h-5 accent-brand-primary rounded"
                                    />
                                    <span className="text-brand-cream text-sm">{category.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="border-t border-white/10 p-5 space-y-3">
                    <button
                        onClick={handleApply}
                        className="w-full py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-lg"
                    >
                        Apply Filters
                    </button>
                    <button
                        onClick={handleClear}
                        className="w-full py-3 bg-white/10 text-brand-cream font-medium rounded-lg hover:bg-white/20 transition-colors"
                    >
                        Clear All
                    </button>
                </div>
            </div>
        </>
    );
}
