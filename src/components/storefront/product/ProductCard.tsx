"use client";

import { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/stores/cart";
import { useWishlistStore } from "@/stores/wishlist";
import { formatPrice } from "@/lib/utils";
import type { ProductWithImages } from "@/lib/queries/products";
import { ProductQuickAddModal } from "./ProductQuickAddModal";
import { PreOrderModal } from "./PreOrderModal";

interface ProductCardProps {
  product: ProductWithImages;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreOrderModalOpen, setIsPreOrderModalOpen] = useState(false);
  const { addItem, openCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const inWishlist = isInWishlist(product.id);

  const hasDiscount = Boolean(product.compare_at_price && product.compare_at_price > product.base_price);
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_at_price! - product.base_price) / product.compare_at_price!) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!product.in_stock) {
      // Show pre-order modal for sold out products
      setIsPreOrderModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const handlePreOrderConfirm = () => {
    setIsPreOrderModalOpen(false);
    // Open the quick add modal to select variant/size
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
              <span className="absolute top-2 right-2 bg-[#F3EDE7] text-brand-charcoal text-xs font-semibold px-2 py-1 rounded-full">
                -{discountPercent}%
              </span>
            )}

            {/* Pre-order Badge instead of Sold Out */}
            {!product.in_stock && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-xl">
                  <div className="text-center">
                    <span className="material-icons-outlined text-white text-2xl mb-1">schedule</span>
                    <span className="text-white font-bold text-xs block leading-tight">
                      Pre-order
                    </span>
                    <span className="text-white/80 text-[10px] block">7-10 days</span>
                  </div>
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
          <p className="text-[#F3EDE7] font-bold text-sm">
            {formatPrice(product.base_price)}
          </p>
        </div>

        {/* Add to Cart / Pre-order Button */}
        <button
          onClick={handleQuickAdd}
          className={`mt-2 w-full ${product.in_stock
              ? 'bg-brand-primary hover:bg-red-700'
              : 'bg-yellow-500 hover:bg-yellow-600'
            } text-white text-xs font-bold py-2 rounded uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5`}
        >
          <span className="material-icons-outlined text-base">
            {product.in_stock ? 'shopping_cart' : 'schedule'}
          </span>
          <span>{product.in_stock ? 'QUICK ADD' : 'PRE-ORDER NOW'}</span>
        </button>
      </div>

      {/* Quick Add Modal */}
      <ProductQuickAddModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Pre-order Confirmation Modal */}
      <PreOrderModal
        isOpen={isPreOrderModalOpen}
        productName={product.name}
        onConfirm={handlePreOrderConfirm}
        onCancel={() => setIsPreOrderModalOpen(false)}
      />
    </div>
  );
}
