"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
    const [isAnimating, setIsAnimating] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const { addItem, openCart } = useCartStore();
    const router = useRouter();

    // Get variants if they exist
    const variants = 'variants' in product && product.variants ? product.variants : [];

    // Get unique sizes from variants
    const availableSizes = Array.from(new Set(variants.filter((v) => v.size).map((v) => v.size!.name)));

    // Determine if we need size selection
    const requiresSize = availableSizes.length > 0;

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setTimeout(() => setIsAnimating(true), 10); // Slight delay to trigger transition
            setSelectedSize(null);
            setQuantity(1);
        } else {
            setIsAnimating(false);
            setTimeout(() => setIsVisible(false), 300); // Wait for transition to finish
        }
    }, [isOpen]);

    // Close on escape
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
        if (requiresSize && !selectedSize) return;

        if (requiresSize) {
            const variant = variants.find(v => v.size?.name === selectedSize);
            if (variant) {
                addItem(product.id, variant.id, quantity);
            }
        } else {
            addItem(product.id, null, quantity);
        }

        openCart();
        onClose();
    };

    const handleBuyNow = () => {
        if (requiresSize && !selectedSize) return;

        if (requiresSize) {
            const variant = variants.find(v => v.size?.name === selectedSize);
            if (variant) {
                addItem(product.id, variant.id, quantity);
            }
        } else {
            addItem(product.id, null, quantity);
        }

        onClose();
        router.push("/checkout");
    };

    if (!isVisible) return null;

    const hasDiscount = product.compare_at_price && product.compare_at_price > product.base_price;
    const discountPercent = hasDiscount
        ? Math.round(((product.compare_at_price! - product.base_price) / product.compare_at_price!) * 100)
        : 0;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0"}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={`relative bg-[#1a2b2e] rounded-lg shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isAnimating ? "scale-100 translate-y-0 opacity-100" : "scale-90 translate-y-8 opacity-0"}`}
            >
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
                    {requiresSize && (
                        <div className="mb-5">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-white text-sm font-semibold">
                                    Size: <span className="text-pink-500">{selectedSize || "Select a size"}</span>
                                </p>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {availableSizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`py-2 px-3 text-sm font-bold text-center rounded transition-all transform hover:scale-105 ${selectedSize === size
                                            ? "bg-pink-600 text-white border-2 border-pink-500"
                                            : "bg-transparent text-gray-300 border border-gray-600 hover:border-gray-400"
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                            {/* Error Message if try to add without size */}
                            {!selectedSize && (
                                <p className="text-red-400 text-xs mt-2 hidden group-invalid:block">
                                    Please select a size
                                </p>
                            )}
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
                            disabled={!product.in_stock || (requiresSize && !selectedSize)}
                            className={`w-full font-bold py-3 px-4 rounded transition-all uppercase text-sm flex items-center justify-center gap-2 transform active:scale-95 ${!product.in_stock || (requiresSize && !selectedSize)
                                ? "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50"
                                : "bg-pink-600 hover:bg-pink-700 text-white shadow-lg hover:shadow-pink-500/30"
                                }`}
                        >
                            <span className="material-icons-outlined">shopping_cart</span>
                            Add to cart - {formatPrice(product.base_price * quantity)}
                        </button>
                        <button
                            onClick={handleBuyNow}
                            disabled={!product.in_stock || (requiresSize && !selectedSize)}
                            className={`w-full font-bold py-3 px-4 rounded transition-all uppercase text-sm transform active:scale-95 ${!product.in_stock || (requiresSize && !selectedSize)
                                ? "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50 border border-gray-500"
                                : "bg-lime-500 hover:bg-lime-600 text-[#1a2b2e] shadow-lg hover:shadow-lime-500/30"
                                }`}
                        >
                            BUY IT NOW
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
