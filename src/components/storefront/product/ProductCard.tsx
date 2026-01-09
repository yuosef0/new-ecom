"use client";

import Link from "next/link";
import { useCartStore } from "@/stores/cart";
import { formatPrice } from "@/lib/utils";
import type { ProductWithImages } from "@/lib/queries/products";

interface ProductCardProps {
  product: ProductWithImages;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, openCart } = useCartStore();

  const hasDiscount = product.compare_at_price && product.compare_at_price > product.base_price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_at_price! - product.base_price) / product.compare_at_price!) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product.id, null);
    openCart();
  };

  return (
    <div className="bg-brand-cream rounded-lg overflow-hidden">
      <Link href={`/products/${product.slug}`} className="block">
        {/* Product Image */}
        <div className="relative">
          <img
            alt={product.name}
            className="w-full h-48 object-cover"
            src={product.primary_image || "https://via.placeholder.com/400x300"}
          />
          {hasDiscount && (
            <span className="absolute top-2 right-2 bg-brand-primary text-white text-xs font-bold px-2 py-1 rounded">
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

        {/* Product Info */}
        <div className="p-2">
          <h3 className="text-brand-charcoal font-bold text-sm truncate">
            {product.name}
          </h3>
          <div className="flex items-center space-x-2 mt-1">
            {hasDiscount && (
              <p className="text-brand-muted line-through text-xs">
                {formatPrice(product.compare_at_price!)}
              </p>
            )}
            <p className="text-brand-primary font-bold text-sm">
              {formatPrice(product.base_price)}
            </p>
          </div>
        </div>
      </Link>

      {/* Quick Add Button */}
      <div className="px-2 pb-2">
        {product.in_stock ? (
          <button
            onClick={handleQuickAdd}
            className="w-full bg-brand-primary text-white text-xs font-bold py-2 rounded-md hover:bg-brand-dark transition-colors"
          >
            QUICK ADD
          </button>
        ) : (
          <Link
            href={`/products/${product.slug}`}
            className="block w-full bg-brand-primary text-white text-xs font-bold py-2 rounded-md hover:bg-brand-dark transition-colors text-center"
          >
            VIEW PRODUCT
          </Link>
        )}
      </div>
    </div>
  );
}
