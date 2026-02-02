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
                <div className="p-4">
                    {/* Product Title */}
                    <h2 className="text-white font-bold text-base mb-2">
                        {product.name}
                    </h2>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-brand-cream font-bold text-xl">
                            {formatPrice(product.base_price)}
                        </span>
                        {hasDiscount && (
                            <span className="text-gray-400 line-through text-xs">
                                {formatPrice(product.compare_at_price!)}
                            </span>
                        )}
                    </div>

                    {/* Size Selection with Quantities */}
                    {requiresSize && (
                        <div className="mb-3">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-white text-xs font-semibold">
                                    Select Sizes & Quantities
                                </p>
                                {hasSelection && (
                                    <span className="text-pink-500 text-[10px] font-bold">
                                        {totalItems} {totalItems === 1 ? 'item' : 'items'}
                                    </span>
                                )}
                            </div>
                            <div className="space-y-2">
                                {availableSizes.map((size) => {
                                    const quantity = sizeQuantities[size] || 0;
                                    const isSelected = quantity > 0;
                                    const stock = getSizeStock(size);
                                    const isOutOfStock = stock === 0;

                                    return (
                                        <div
                                            key={size}
                                            className={`flex items-center justify-between p-2 rounded-lg border transition-all ${isSelected
                                                ? isOutOfStock
                                                    ? "border-yellow-500 bg-yellow-500/10"
                                                    : "border-pink-500 bg-pink-500/10"
                                                : "border-gray-600 bg-transparent hover:border-gray-400"
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateSizeQuantity(size, isSelected ? 0 : 1)}
                                                    className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isSelected
                                                        ? isOutOfStock
                                                            ? "border-yellow-500 bg-yellow-500"
                                                            : "border-pink-500 bg-pink-500"
                                                        : "border-gray-500"
                                                        }`}
                                                >
                                                    {isSelected && (
                                                        <span className="material-icons-outlined text-white text-xs">check</span>
                                                    )}
                                                </button>
                                                <span className={`font-bold text-xs ${isSelected
                                                    ? isOutOfStock
                                                        ? "text-yellow-500"
                                                        : "text-pink-500"
                                                    : "text-gray-300"
                                                    }`}>
                                                    {size}
                                                </span>
                                                {isOutOfStock && (
                                                    <span className="text-[10px] text-yellow-500 font-medium">(Pre-order)</span>
                                                )}
                                            </div>

                                            {isSelected && (
                                                <div className="flex items-center border border-gray-600 rounded bg-[#0f1a1c]">
                                                    <button
                                                        onClick={() => updateSizeQuantity(size, Math.max(0, quantity - 1))}
                                                        className="px-2 py-0.5 text-white hover:bg-white/10 transition-colors"
                                                    >
                                                        <span className="material-icons-outlined text-sm">remove</span>
                                                    </button>
                                                    <span className="px-2 py-0.5 text-white text-xs font-bold min-w-[24px] text-center">
                                                        {quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateSizeQuantity(size, quantity + 1)}
                                                        className="px-2 py-0.5 text-white hover:bg-white/10 transition-colors"
                                                    >
                                                        <span className="material-icons-outlined text-sm">add</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Pre-order Notice */}
                    {!product.in_stock && (
                        <div className="mb-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                                <span className="material-icons-outlined text-yellow-500 text-sm mt-0.5">schedule</span>
                                <p className="text-yellow-500 text-[11px] font-medium">
                                    Pre-order: This item will be delivered in 7-10 business days
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-2">
                        <button
                            onClick={handleAddToCart}
                            disabled={requiresSize && !hasSelection}
                            className={`w-full font-bold py-2 px-3 rounded transition-all uppercase text-xs flex items-center justify-center gap-1.5 transform active:scale-95 ${requiresSize && !hasSelection
                                ? "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50"
                                : product.in_stock
                                    ? "bg-pink-600 hover:bg-pink-700 text-white shadow-lg hover:shadow-pink-500/30"
                                    : "bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg hover:shadow-yellow-500/30"
                                }`}
                        >
                            <span className="material-icons-outlined text-base">
                                {product.in_stock ? 'shopping_cart' : 'schedule'}
                            </span>
                            {requiresSize && hasSelection
                                ? `Add ${totalItems} ${totalItems === 1 ? 'item' : 'items'} - ${formatPrice(getTotalPrice())}`
                                : product.in_stock
                                    ? `Add to cart - ${formatPrice(product.base_price)}`
                                    : `Pre-order - ${formatPrice(product.base_price)}`
                            }
                        </button>
                        <button
                            onClick={handleBuyNow}
                            disabled={requiresSize && !hasSelection}
                            className={`w-full font-bold py-2 px-3 rounded transition-all uppercase text-xs transform active:scale-95 ${requiresSize && !hasSelection
                                ? "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50 border border-gray-500"
                                : "bg-brand-cream hover:bg-white text-brand-charcoal shadow-lg hover:shadow-white/20"
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
