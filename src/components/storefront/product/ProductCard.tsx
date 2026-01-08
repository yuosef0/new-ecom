import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    base_price: number;
    compare_at_price: number | null;
    primary_image?: string | null;
    in_stock?: boolean;
  };
  onQuickAdd?: () => void;
}

export function ProductCard({ product, onQuickAdd }: ProductCardProps) {
  const discountPercentage = product.compare_at_price
    ? Math.round(
        ((product.compare_at_price - product.base_price) / product.compare_at_price) * 100
      )
    : null;

  const isSoldOut = product.in_stock === false;

  return (
    <div className="group">
      {/* Product Image */}
      <Link href={`/products/${product.slug}`}>
        <div className="relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden aspect-square">
          {product.primary_image ? (
            <Image
              src={product.primary_image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-gray-400 text-sm">No image</span>
            </div>
          )}

          {/* Discount Badge */}
          {discountPercentage && discountPercentage > 0 && !isSoldOut && (
            <span className="absolute top-2 right-2 bg-green-200 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
              -{discountPercentage}%
            </span>
          )}

          {/* Sold Out Overlay */}
          {isSoldOut && (
            <div className="absolute inset-0 bg-white/70 dark:bg-black/70 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-gray-900 dark:text-gray-100 font-semibold text-sm">
                  Sold Out
                </span>
              </div>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="mt-2">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-sm text-brand-cream dark:text-brand-cream line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline space-x-2 mt-1">
          {product.compare_at_price && (
            <p className="text-brand-muted dark:text-brand-muted text-xs line-through">
              {formatPrice(product.compare_at_price)}
            </p>
          )}
          <p className="text-green-500 font-bold text-sm">
            {formatPrice(product.base_price)}
          </p>
        </div>

        {/* Quick Add Button */}
        {!isSoldOut && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onQuickAdd?.();
            }}
            className="mt-2 w-full bg-brand-primary text-white text-xs font-bold py-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-brand-primary/90 transition-colors"
          >
            QUICK ADD
          </button>
        )}

        {isSoldOut && (
          <button
            disabled
            className="mt-2 w-full bg-gray-400 text-white text-xs font-bold py-2 rounded-md cursor-not-allowed"
          >
            VIEW PRODUCT
          </button>
        )}
      </div>
    </div>
  );
}
