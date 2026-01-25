"use client";

import { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/stores/cart";
import { useWishlistStore } from "@/stores/wishlist";
import { formatPrice } from "@/lib/utils";
import type { ProductWithImages } from "@/lib/queries/products";
import { ProductQuickAddModal } from "./ProductQuickAddModal";

interface ProductCardProps {
  product: ProductWithImages;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addItem, openCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const inWishlist = isInWishlist(product.id);

  const hasDiscount = Boolean(product.compare_at_price && product.compare_at_price > product.base_price);
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_at_price! - product.base_price) / product.compare_at_price!) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      id: product.id,
      name: product.name,
      slug: product.slug,
      base_price: product.base_price,
      images: product.images || [],
    });
  };

  return (
    <div className="flex flex-col">
      <div className="relative">
        <Link href={`/products/${product.slug}`}>
          {/* Product Image */}
          <div className="relative bg-brand-cream rounded-lg overflow-hidden">
            <img
              alt={product.name}
              className="w-full h-48 object-cover"
              src={product.primary_image || "https://via.placeholder.com/400x300"}
            />

            {/* Wishlist Button */}
            <button
              onClick={handleWishlistToggle}
              className="absolute top-2 left-2 p-1 transition-all duration-200 hover:scale-110"
              aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <span className={`${inWishlist ? 'material-icons' : 'material-icons-outlined'} text-2xl drop-shadow-lg ${inWishlist ? 'text-red-500' : 'text-white'
                }`}>
                favorite
              </span>
            </button>

            {hasDiscount && (
              <span className="absolute top-2 right-2 bg-green-200 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                -{discountPercent}%
              </span>
            )}
            {!product.in_stock && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
                  <span className="text-brand-charcoal font-bold text-sm text-center leading-tight">
                    SOLD<br />OUT
                  </span>
                </div>
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Product Info */}
      <div className="mt-2 space-y-1">
        <h3 className="font-semibold text-sm text-brand-cream truncate">
          {product.name}
        </h3>
        <div className="flex items-baseline space-x-2">
          {hasDiscount && (
            <p className="text-brand-muted line-through text-xs">
              {formatPrice(product.compare_at_price!)}
            </p>
          )}
          <p className="text-green-500 font-bold text-sm">
            {formatPrice(product.base_price)}
          </p>
        </div>

        {/* Add to Cart Button */}
        {product.in_stock ? (
          <button
            onClick={handleQuickAdd}
            className="mt-2 w-full bg-brand-primary hover:bg-red-700 text-white text-xs font-bold py-2.5 rounded uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
          >
            <span className="material-icons-outlined text-base">shopping_cart</span>
            <span>ADD TO CART</span>
          </button>
        ) : (
          <Link
            href={`/products/${product.slug}`}
            className="mt-2 w-full bg-gray-600 hover:bg-gray-700 text-white text-xs font-bold py-2.5 rounded uppercase tracking-wider transition-colors text-center block flex items-center justify-center gap-1.5"
          >
            <span className="material-icons-outlined text-base">visibility</span>
            <span>VIEW PRODUCT</span>
          </Link>
        )}
      </div>

      {/* Quick Add Modal */}
      <ProductQuickAddModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
