"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/stores/cart";
import { formatPrice } from "@/lib/utils";
import type { ProductWithImages, ProductDetailWithVariants } from "@/lib/queries/products";

interface ProductQuickAddModalProps {
    product: ProductWithImages | ProductDetailWithVariants;
    isOpen: boolean;
    onClose: () => void;
}

export function ProductQuickAddModal({ product, isOpen, onClose }: ProductQuickAddModalProps) {
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const { addItem, openCart } = useCartStore();

    // Get unique sizes from variants
    const availableSizes = 'variants' in product && product.variants
        ? Array.from(new Set(product.variants.filter((v) => v.size).map((v) => v.size!.name)))
        : [];

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedSize(null);
            setQuantity(1);
        }
    }, [isOpen]);

    // Close modal on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    const handleAddToCart = () => {
        addItem(product.id, null, quantity);
        openCart();
        onClose();
    };

    const handleBuyNow = () => {
        addItem(product.id, null, quantity);
        onClose();
        window.location.href = "/checkout";
    };

    if (!isOpen) return null;

    const hasDiscount = product.compare_at_price && product.compare_at_price > product.base_price;
    const discountPercent = hasDiscount
        ? Math.round(((product.compare_at_price! - product.base_price) / product.compare_at_price!) * 100)
        : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-[#1a2b2e] rounded-lg shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
                >
                    <span className="material-icons-outlined text-2xl">close</span>
                </button>

                {/* Product Image */}
                <div className="relative">
                    <img
                        src={product.primary_image || "https://via.placeholder.com/400x300"}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {hasDiscount && (
                        <span className="absolute top-3 right-3 bg-[#1a2b2e] text-white text-xs font-bold px-3 py-1 rounded">
                            -{discountPercent}% OFF
                        </span>
                    )}
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Product Title */}
                    <h2 className="text-white font-bold text-lg mb-3">
                        {product.name}
                    </h2>

                    {/* Price */}
                    <div className="flex items-center gap-3 mb-5">
                        <span className="text-lime-500 font-bold text-2xl">
                            {formatPrice(product.base_price)}
                        </span>
                        {hasDiscount && (
                            <span className="text-gray-400 line-through text-sm">
                                {formatPrice(product.compare_at_price!)}
                            </span>
                        )}
                    </div>

                    {/* Size Selection */}
                    {availableSizes.length > 0 && (
                        <div className="mb-5">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-white text-sm font-semibold">
                                    Size: <span className="text-pink-500">{selectedSize || "Select a size"}</span>
                                </p>
                                <button className="text-pink-500 text-xs font-semibold hover:underline">
                                    Find your size
                                </button>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {availableSizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`py-2 px-3 text-sm font-bold text-center rounded transition-all ${selectedSize === size
                                            ? "bg-pink-600 text-white border-2 border-pink-500"
                                            : "bg-transparent text-gray-300 border border-gray-600 hover:border-gray-400"
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quantity */}
                    <div className="mb-6">
                        <p className="text-white text-sm font-semibold mb-3">
                            Quantity ({quantity} in cart)
                        </p>
                        <div className="flex items-center border border-gray-600 rounded bg-[#0f1a1c] w-32">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="px-4 py-2 text-white hover:bg-white/10 transition-colors"
                            >
                                <span className="material-icons-outlined text-lg">remove</span>
                            </button>
                            <input
                                className="w-full bg-transparent text-center text-white border-none focus:ring-0 p-0 text-sm font-bold"
                                type="text"
                                value={quantity}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value) || 1;
                                    setQuantity(Math.max(1, val));
                                }}
                            />
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="px-4 py-2 text-white hover:bg-white/10 transition-colors"
                            >
                                <span className="material-icons-outlined text-lg">add</span>
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={handleAddToCart}
                            disabled={!product.in_stock}
                            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded transition-colors uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <span className="material-icons-outlined">favorite_border</span>
                            Add to cart - {formatPrice(product.base_price * quantity)}
                        </button>
                        <button
                            onClick={handleBuyNow}
                            disabled={!product.in_stock}
                            className="w-full bg-lime-500 hover:bg-lime-600 text-[#1a2b2e] font-bold py-3 px-4 rounded transition-colors uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            BUY IT NOW
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
