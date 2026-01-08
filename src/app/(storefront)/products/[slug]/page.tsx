import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getProductBySlug } from "@/lib/queries/products";
import { formatPrice } from "@/lib/utils";
import { Header } from "@/components/storefront/layout/Header";
import { Icon } from "@/components/storefront/ui/Icon";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const discountPercentage = product.compare_at_price
    ? Math.round(
        ((product.compare_at_price - product.base_price) / product.compare_at_price) * 100
      )
    : null;

  return (
    <>
      <Header />
      <div className="px-4 pt-4 pb-8">
        {/* Back Button */}
        <Link
          href="/products"
          className="inline-flex items-center text-brand-cream/80 hover:text-brand-cream mb-4"
        >
          <Icon name="arrow_back" className="mr-1" />
          <span className="text-sm">Back to Products</span>
        </Link>

        {/* Product Images */}
        <div className="mb-6">
          <div className="relative aspect-square bg-white dark:bg-gray-800 rounded-lg overflow-hidden mb-3">
            {product.primary_image ? (
              <Image
                src={product.primary_image}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-gray-400">No image</span>
              </div>
            )}

            {discountPercentage && discountPercentage > 0 && (
              <span className="absolute top-3 right-3 bg-green-200 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                -{discountPercentage}%
              </span>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {product.images.slice(0, 4).map((image, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-16 h-16 bg-white dark:bg-gray-800 rounded-lg overflow-hidden relative"
                >
                  <Image
                    src={image.url}
                    alt={image.alt_text || `${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-brand-cream mb-2">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline space-x-3 mb-4">
            <span className="text-2xl font-bold text-green-500">
              {formatPrice(product.base_price)}
            </span>
            {product.compare_at_price && (
              <span className="text-lg text-brand-muted line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center space-x-2 mb-4">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                product.in_stock ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-sm text-brand-cream/80">
              {product.in_stock ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          {/* Description */}
          {product.short_description && (
            <p className="text-brand-cream/70 text-sm mb-4">
              {product.short_description}
            </p>
          )}
        </div>

        {/* Variant Selection - Simplified */}
        {product.variants && product.variants.length > 0 && (
          <div className="mb-6 space-y-4">
            {/* Colors */}
            {product.variants.some((v) => v.color) && (
              <div>
                <label className="block text-sm font-medium text-brand-cream mb-2">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(product.variants.filter((v) => v.color).map((v) => v.color!.id)))
                    .map((colorId) => {
                      const variant = product.variants!.find((v) => v.color?.id === colorId);
                      const color = variant?.color;
                      if (!color) return null;
                      return (
                        <button
                          key={colorId}
                          className="w-8 h-8 rounded-full border-2 border-white/20"
                          style={{ backgroundColor: color.hex_code }}
                          title={color.name}
                        />
                      );
                    })}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.variants.some((v) => v.size) && (
              <div>
                <label className="block text-sm font-medium text-brand-cream mb-2">
                  Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(product.variants.filter((v) => v.size).map((v) => v.size!.name)))
                    .map((sizeName) => (
                      <button
                        key={sizeName}
                        className="px-4 py-2 bg-white/10 text-brand-cream rounded-md text-sm border border-white/20 hover:bg-white/20"
                      >
                        {sizeName}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add to Cart Button */}
        <button
          disabled={!product.in_stock}
          className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${
            product.in_stock
              ? "bg-brand-primary hover:bg-brand-primary/90"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {product.in_stock ? "ADD TO CART" : "OUT OF STOCK"}
        </button>

        {/* Full Description */}
        {product.description && (
          <div className="mt-8 border-t border-white/10 pt-6">
            <h2 className="text-lg font-semibold text-brand-cream mb-3">
              Product Details
            </h2>
            <p className="text-brand-cream/70 text-sm whitespace-pre-line">
              {product.description}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
