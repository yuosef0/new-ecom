"use client";

import Link from "next/link";
import { useCartStore } from "@/stores/cart";
import { useWishlistStore } from "@/stores/wishlist";
import { formatPrice } from "@/lib/utils";
import type { ProductWithImages } from "@/lib/queries/products";

interface ProductCardProps {
  product: ProductWithImages;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, openCart } = useCartStore();
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const inWishlist = useWishlistStore((state) => state.wishlistProductIds.has(product.id));

  const hasDiscount = product.compare_at_price && product.compare_at_price > product.base_price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_at_price! - product.base_price) / product.compare_at_price!) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product.id, null);
    openCart();
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    await toggleWishlist(product.id);
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
            {hasDiscount && (
              <span className="absolute top-2 right-2 bg-green-200 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                -{discountPercent}%
              </span>
            )}
            {!product.in_stock && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-brand-charcoal font-semibold text-sm">
                    Sold Out
                  </span>
                </div>
              </div>
            )}
          </div>
        </Link>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-2 left-2 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-md transition-all z-10"
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <span className={`material-icons-outlined text-xl ${inWishlist ? "text-red-500" : "text-gray-600"}`}>
            {inWishlist ? "favorite" : "favorite_border"}
          </span>
        </button>
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
            className="mt-2 w-full bg-gray-500 text-white text-xs font-bold py-2.5 rounded uppercase tracking-wider transition-colors text-center block opacity-60 cursor-not-allowed"
          >
            OUT OF STOCK
          </Link>
        )}
      </div>
    </div>
  );
}
