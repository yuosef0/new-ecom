"use client";

import { useWishlistStore } from "@/stores/wishlist";
import { useCartStore } from "@/stores/cart";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Icon } from "@/components/storefront/ui/Icon";

export default function WishlistPage() {
    const { items, removeFromWishlist, clearWishlist } = useWishlistStore();
    const { addItem } = useCartStore();

    const handleAddToCart = (item: any) => {
        addItem(item.id, null, 1);
    };

    return (
        <div className="min-h-screen bg-brand-dark py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-brand-cream mb-2">My Wishlist</h1>
                        <p className="text-brand-cream/70">
                            {items.length} {items.length === 1 ? "item" : "items"}
                        </p>
                    </div>
                    {items.length > 0 && (
                        <button
                            onClick={clearWishlist}
                            className="text-sm text-brand-cream/70 hover:text-red-400 transition-colors"
                        >
                            Clear All
                        </button>
                    )}
                </div>

                {/* Wishlist Items */}
                {items.length === 0 ? (
                    <div className="bg-white/5 border border-white/10 rounded-lg p-12 text-center">
                        <Icon name="favorite_border" className="text-6xl text-brand-cream/30 mb-4" />
                        <h2 className="text-xl font-semibold text-brand-cream mb-2">
                            Your Wishlist is Empty
                        </h2>
                        <p className="text-brand-cream/70 mb-6">
                            Save your favorite products here to buy them later
                        </p>
                        <Link
                            href="/products"
                            className="inline-block px-6 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary/90"
                        >
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {items.map((item) => {
                            const primaryImage = item.images?.find((img) => img.is_primary) || item.images?.[0];

                            return (
                                <div
                                    key={item.id}
                                    className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:bg-white/10 transition-colors group"
                                >
                                    {/* Product Image */}
                                    <Link href={`/products/${item.slug}`} className="block relative">
                                        <div className="relative bg-brand-cream aspect-square">
                                            {primaryImage ? (
                                                <Image
                                                    src={primaryImage.url}
                                                    alt={primaryImage.alt_text || item.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Icon name="image" className="text-6xl text-gray-300" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                removeFromWishlist(item.id);
                                            }}
                                            className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                            aria-label="Remove from wishlist"
                                        >
                                            <Icon name="close" className="text-white text-sm" />
                                        </button>
                                    </Link>

                                    {/* Product Info */}
                                    <div className="p-4">
                                        <Link href={`/products/${item.slug}`}>
                                            <h3 className="font-semibold text-brand-cream mb-2 hover:text-brand-primary transition-colors line-clamp-2">
                                                {item.name}
                                            </h3>
                                        </Link>
                                        <p className="text-brand-primary font-bold text-lg mb-3">
                                            {formatPrice(item.base_price)}
                                        </p>

                                        {/* Add to Cart Button */}
                                        <button
                                            onClick={() => handleAddToCart(item)}
                                            className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-bold py-2.5 rounded transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Icon name="shopping_cart" className="text-base" />
                                            <span>ADD TO CART</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Back to Home */}
                <div className="mt-8 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-brand-cream/70 hover:text-brand-cream"
                    >
                        <Icon name="arrow_back" className="text-lg" />
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
