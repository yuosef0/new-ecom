"use client";

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
      stock_quantity?: number;
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

  // Get max quantity from stock (default to 99 if no variant/stock info)
  const maxQuantity = item.variant?.stock_quantity ?? 99;

  return (
    <div className="flex gap-4 group">
      {/* Product Image */}
      <div className="w-24 h-32 flex-shrink-0 bg-brand-cream/10 rounded-md overflow-hidden relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-start">
          <h3 className="text-sm font-medium text-brand-cream pr-2">
            {item.product.name}
          </h3>
        </div>

        {/* Variant Info */}
        {item.variant && (item.variant.size_name) && (
          <p className="text-xs text-brand-muted mt-1">
            {item.variant.size_name}
          </p>
        )}

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-sm font-semibold text-green-400">
            {formatPrice(price)}
          </span>
        </div>

        {/* Quantity Controls & Remove */}
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center border border-brand-muted/50 rounded bg-transparent">
            <button
              onClick={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
              className="px-2 py-1 text-brand-cream hover:bg-white/10 transition-colors"
            >
              <span className="text-lg leading-none">-</span>
            </button>
            <span className="px-2 py-1 text-sm font-medium text-brand-cream min-w-[20px] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => {
                if (item.quantity < maxQuantity) {
                  onUpdateQuantity(item.quantity + 1);
                }
              }}
              disabled={item.quantity >= maxQuantity}
              className={`px-2 py-1 text-brand-cream transition-colors ${item.quantity >= maxQuantity
                  ? 'opacity-30 cursor-not-allowed'
                  : 'hover:bg-white/10'
                }`}
            >
              <span className="text-lg leading-none">+</span>
            </button>
          </div>

          {/* Stock warning */}
          {item.variant?.stock_quantity !== undefined && item.quantity >= maxQuantity && (
            <span className="text-xs text-orange-400">Max</span>
          )}

          <button
            onClick={onRemove}
            className="text-xs text-brand-cream underline underline-offset-2 hover:text-white transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
