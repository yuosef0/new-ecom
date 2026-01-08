"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "../ui/Icon";
import { formatPrice } from "@/lib/utils";

interface CartItemProps {
  item: {
    id: string;
    productId: string;
    quantity: number;
    product: {
      name: string;
      slug: string;
      base_price: number;
      images: Array<{ url: string; alt_text: string | null }>;
    };
    variant?: {
      size_name: string | null;
      color_name: string | null;
      price_adjustment: number;
    } | null;
  };
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
  compact?: boolean;
}

export function CartItem({ item, onUpdateQuantity, onRemove, compact = false }: CartItemProps) {
  const price = item.product.base_price + (item.variant?.price_adjustment || 0);
  const total = price * item.quantity;
  const imageUrl = item.product.images[0]?.url;

  return (
    <div className={`flex gap-3 ${compact ? "py-2" : "py-4"}`}>
      {/* Product Image */}
      <Link href={`/products/${item.product.slug}`} className="flex-shrink-0">
        <div className={`relative ${compact ? "w-16 h-16" : "w-20 h-20"} bg-white dark:bg-gray-800 rounded-lg overflow-hidden`}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={item.product.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700" />
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <Link href={`/products/${item.product.slug}`}>
          <h3 className={`font-semibold text-brand-cream ${compact ? "text-sm" : "text-base"} line-clamp-1`}>
            {item.product.name}
          </h3>
        </Link>

        {/* Variant Info */}
        {item.variant && (item.variant.color_name || item.variant.size_name) && (
          <p className="text-xs text-brand-cream/70 mt-1">
            {[item.variant.color_name, item.variant.size_name].filter(Boolean).join(" / ")}
          </p>
        )}

        {/* Price */}
        <p className={`text-green-500 font-bold ${compact ? "text-sm" : "text-base"} mt-1`}>
          {formatPrice(price)}
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center border border-white/20 rounded-md">
            <button
              onClick={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
              className="px-2 py-1 text-brand-cream hover:bg-white/10"
              aria-label="Decrease quantity"
            >
              <Icon name="remove" className="text-sm" />
            </button>
            <span className="px-3 py-1 text-brand-cream text-sm font-medium">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              className="px-2 py-1 text-brand-cream hover:bg-white/10"
              aria-label="Increase quantity"
            >
              <Icon name="add" className="text-sm" />
            </button>
          </div>

          {!compact && (
            <span className="text-brand-cream font-semibold">
              {formatPrice(total)}
            </span>
          )}
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="flex-shrink-0 text-red-400 hover:text-red-300 p-1"
        aria-label="Remove item"
      >
        <Icon name="delete" className="text-xl" />
      </button>
    </div>
  );
}
