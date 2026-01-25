"use client";

import { useState, useEffect } from "react";
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
    const [sizeQuantities, setSizeQuantities] = useState<Record<string, number>>({});
    const [isAnimating, setIsAnimating] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const { addItem, openCart } = useCartStore();
    const router = useRouter();

    // Get variants if they exist
    const variants = 'variants' in product && product.variants ? product.variants : [];

    // Get unique sizes from variants
    const availableSizes = Array.from(new Set(variants.filter((v) => v.size).map((v) => v.size!.name)));

    // Helper to get stock for a size
    const getSizeStock = (sizeName: string) => {
        const variant = variants.find(v => v.size?.name === sizeName);
        return variant?.stock_quantity || 0;
    };

    // Determine if we need size selection
    const requiresSize = availableSizes.length > 0;

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setTimeout(() => setIsAnimating(true), 10);
            setSizeQuantities({});
        } else {
            setIsAnimating(false);
            setTimeout(() => setIsVisible(false), 300);
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

    const updateSizeQuantity = (size: string, quantity: number) => {
        setSizeQuantities(prev => {
            const newQuantities = { ...prev };
            if (quantity <= 0) {
                delete newQuantities[size];
            } else {
                newQuantities[size] = quantity;
            }
            return newQuantities;
        });
    };

    const getTotalItems = () => {
        return Object.values(sizeQuantities).reduce((sum, qty) => sum + qty, 0);
    };

    const getTotalPrice = () => {
        return getTotalItems() * product.base_price;
    };

    const handleAddToCart = () => {
        if (requiresSize && getTotalItems() === 0) return;

        if (requiresSize) {
            Object.entries(sizeQuantities).forEach(([sizeName, qty]) => {
                if (qty > 0) {
                    const variant = variants.find(v => v.size?.name === sizeName);
                    if (variant) {
                        addItem(product.id, variant.id, qty);
                    }
                }
            });
        } else {
            addItem(product.id, null, 1);
        }

        openCart();
        onClose();
    };

    const handleBuyNow = () => {
        if (requiresSize && getTotalItems() === 0) return;

        if (requiresSize) {
            Object.entries(sizeQuantities).forEach(([sizeName, qty]) => {
                if (qty > 0) {
                    const variant = variants.find(v => v.size?.name === sizeName);
                    if (variant) {
                        addItem(product.id, variant.id, qty);
                    }
                }
            });
        } else {
            addItem(product.id, null, 1);
        }

        onClose();
        router.push("/checkout");
    };

    if (!isVisible) return null;

    const hasDiscount = product.compare_at_price && product.compare_at_price > product.base_price;
    const discountPercent = hasDiscount
        ? Math.round(((product.compare_at_price! - product.base_price) / product.compare_at_price!) * 100)
        : 0;

    const totalItems = getTotalItems();
    const hasSelection = totalItems > 0;

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

                <div className="relative">
                    <img
                        src={product.primary_image || "https://via.placeholder.com/400x300"}
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-t-lg"
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

                    {/* Size Selection with Quantities */}
                    {requiresSize && (
                        <div className="mb-5">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-white text-sm font-semibold">
                                    Select Sizes & Quantities
                                </p>
                                {hasSelection && (
                                    <span className="text-pink-500 text-xs font-bold">
                                        {totalItems} {totalItems === 1 ? 'item' : 'items'}
                                    </span>
                                )}
                            </div>
                            <div className="space-y-3">
                                {availableSizes.map((size) => {
                                    const quantity = sizeQuantities[size] || 0;
                                    const isSelected = quantity > 0;
                                    const stock = getSizeStock(size);
                                    const isOutOfStock = stock === 0;

                                    return (
                                        <div
                                            key={size}
                                            className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${isOutOfStock
                                                ? "border-gray-700 bg-gray-800/30 opacity-50"
                                                : isSelected
                                                    ? "border-pink-500 bg-pink-500/10"
                                                    : "border-gray-600 bg-transparent hover:border-gray-400"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => !isOutOfStock && updateSizeQuantity(size, isSelected ? 0 : 1)}
                                                    disabled={isOutOfStock}
                                                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${isOutOfStock
                                                        ? "border-gray-600 cursor-not-allowed"
                                                        : isSelected
                                                            ? "border-pink-500 bg-pink-500"
                                                            : "border-gray-500"
                                                        }`}
                                                >
                                                    {isSelected && (
                                                        <span className="material-icons-outlined text-white text-sm">check</span>
                                                    )}
                                                </button>
                                                <span className={`font-bold text-sm ${isOutOfStock
                                                    ? "text-gray-500 line-through"
                                                    : isSelected
                                                        ? "text-pink-500"
                                                        : "text-gray-300"
                                                    }`}>
                                                    {size}
                                                </span>
                                                {isOutOfStock && (
                                                    <span className="text-xs text-gray-500">(Out of Stock)</span>
                                                )}
                                            </div>

                                            {isSelected && !isOutOfStock && (
                                                <div className="flex items-center border border-gray-600 rounded bg-[#0f1a1c]">
                                                    <button
                                                        onClick={() => updateSizeQuantity(size, Math.max(0, quantity - 1))}
                                                        className="px-3 py-1 text-white hover:bg-white/10 transition-colors"
                                                    >
                                                        <span className="material-icons-outlined text-base">remove</span>
                                                    </button>
                                                    <span className="px-3 py-1 text-white text-sm font-bold min-w-[30px] text-center">
                                                        {quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateSizeQuantity(size, quantity + 1)}
                                                        className="px-3 py-1 text-white hover:bg-white/10 transition-colors"
                                                    >
                                                        <span className="material-icons-outlined text-base">add</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={handleAddToCart}
                            disabled={!product.in_stock || (requiresSize && !hasSelection)}
                            className={`w-full font-bold py-3 px-4 rounded transition-all uppercase text-sm flex items-center justify-center gap-2 transform active:scale-95 ${!product.in_stock || (requiresSize && !hasSelection)
                                ? "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50"
                                : "bg-pink-600 hover:bg-pink-700 text-white shadow-lg hover:shadow-pink-500/30"
                                }`}
                        >
                            <span className="material-icons-outlined">shopping_cart</span>
                            {requiresSize && hasSelection
                                ? `Add ${totalItems} ${totalItems === 1 ? 'item' : 'items'} - ${formatPrice(getTotalPrice())}`
                                : `Add to cart - ${formatPrice(product.base_price)}`
                            }
                        </button>
                        <button
                            onClick={handleBuyNow}
                            disabled={!product.in_stock || (requiresSize && !hasSelection)}
                            className={`w-full font-bold py-3 px-4 rounded transition-all uppercase text-sm transform active:scale-95 ${!product.in_stock || (requiresSize && !hasSelection)
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
