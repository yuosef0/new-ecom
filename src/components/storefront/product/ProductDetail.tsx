"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/stores/cart";
import { formatPrice } from "@/lib/utils";
import { ProductGrid } from "./ProductGrid";
import { trackViewContent, trackAddToCart } from "@/components/analytics/FacebookPixel";
import type { ProductWithImages, ProductDetailWithVariants } from "@/lib/queries/products";

interface ProductDetailProps {
  product: ProductDetailWithVariants;
  recommendedProducts: ProductWithImages[];
}

export function ProductDetail({ product, recommendedProducts }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [sizeQuantities, setSizeQuantities] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState("description");

  const { addItem, openCart } = useCartStore();

  // Track ViewContent event when product is viewed
  useEffect(() => {
    trackViewContent(
      product.id,
      product.name,
      product.base_price,
      "EGP"
    );
  }, [product.id, product.name, product.base_price]);

  const discountPercentage = product.compare_at_price
    ? Math.round(
      ((product.compare_at_price - product.base_price) / product.compare_at_price) * 100
    )
    : null;

  const images = product.images && product.images.length > 0
    ? product.images
    : product.primary_image
      ? [{ url: product.primary_image, alt_text: product.name }]
      : [];

  // Get unique sizes from variants
  const availableSizes = product.variants
    ? Array.from(new Set(product.variants.filter((v) => v.size).map((v) => v.size!.name)))
    : [];

  // Helper to get stock for a size
  const getSizeStock = (sizeName: string) => {
    const variant = product.variants?.find(v => v.size?.name === sizeName);
    return variant?.stock_quantity || 0;
  };

  // Helper to get variant by size
  const getVariantBySize = (sizeName: string) => {
    return product.variants?.find(v => v.size?.name === sizeName);
  };

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
    if (availableSizes.length > 0 && getTotalItems() === 0) {
      alert("Please select at least one size");
      return;
    }

    if (availableSizes.length > 0) {
      // Add each selected size to cart
      Object.entries(sizeQuantities).forEach(([sizeName, qty]) => {
        if (qty > 0) {
          const variant = getVariantBySize(sizeName);
          if (variant) {
            addItem(product.id, variant.id, qty);
          }
        }
      });
    } else {
      // No variants, add product directly
      addItem(product.id, null, 1);
    }

    // Track AddToCart event
    trackAddToCart(
      product.id,
      product.name,
      product.base_price,
      getTotalItems() || 1,
      "EGP"
    );

    openCart();
  };

  const handleBuyNow = () => {
    if (availableSizes.length > 0 && getTotalItems() === 0) {
      alert("Please select at least one size");
      return;
    }

    if (availableSizes.length > 0) {
      Object.entries(sizeQuantities).forEach(([sizeName, qty]) => {
        if (qty > 0) {
          const variant = getVariantBySize(sizeName);
          if (variant) {
            addItem(product.id, variant.id, qty);
          }
        }
      });
    } else {
      addItem(product.id, null, 1);
    }

    // Track AddToCart event
    trackAddToCart(
      product.id,
      product.name,
      product.base_price,
      getTotalItems() || 1,
      "EGP"
    );

    window.location.href = "/checkout";
  };

  const totalItems = getTotalItems();
  const hasSelection = totalItems > 0;

  return (
    <main className="pb-24">
      <div className="p-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Product Images */}
          <div className="w-full lg:w-1/2">
            {/* Main Image */}
            <div className="relative w-full aspect-[4/5] bg-gray-200 rounded-lg overflow-hidden mb-3">
              <img
                alt={product.name}
                className="w-full h-full object-cover"
                src={images[selectedImage]?.url || product.primary_image || "https://via.placeholder.com/400x500"}
              />
              <button className="absolute top-4 right-4 bg-brand-white/80 p-2 rounded-full text-brand-dark">
                <span className="material-icons-outlined">fullscreen</span>
              </button>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                {images.map((image, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-1/5 min-w-[60px] aspect-[3/4] rounded overflow-hidden cursor-pointer ${selectedImage === index
                      ? "border-2 border-brand-white"
                      : "border border-transparent opacity-70"
                      }`}
                  >
                    <img
                      alt={`Thumb ${index + 1}`}
                      className="w-full h-full object-cover"
                      src={image.url}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="w-full lg:w-1/2 text-brand-cream">
            <h1 className="text-xl font-bold text-[#F3EDE7] mb-2">{product.name}</h1>

            {/* Price */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl font-bold text-[#F3EDE7]">
                {formatPrice(product.base_price)}
              </span>
              {product.compare_at_price && (
                <>
                  <span className="text-sm line-through text-brand-gray opacity-60">
                    {formatPrice(product.compare_at_price)}
                  </span>
                  {discountPercentage && (
                    <span className="bg-brand-cream text-brand-dark text-xs font-bold px-2 py-0.5 rounded-sm">
                      {discountPercentage}% OFF
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Size Selection with Quantities */}
            {availableSizes.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-brand-gray">
                    Select Sizes & Quantities
                  </p>
                  {hasSelection && (
                    <span className="text-[#F3EDE7] text-xs font-bold bg-white/10 px-2 py-1 rounded">
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
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${isSelected
                          ? "border-[#F3EDE7] bg-[#F3EDE7]/10"
                          : "border-brand-gray/30 bg-transparent hover:border-brand-gray"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateSizeQuantity(size, isSelected ? 0 : 1)}
                            className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${isSelected
                              ? "border-[#F3EDE7] bg-[#F3EDE7]"
                              : "border-brand-gray/50"
                              }`}
                          >
                            {isSelected && (
                              <span className="material-icons-outlined text-brand-dark text-sm">check</span>
                            )}
                          </button>
                          <span className={`font-bold text-sm ${isSelected
                            ? "text-[#F3EDE7]"
                            : "text-brand-gray"
                            }`}>
                            {size}
                          </span>
                          {isOutOfStock && (
                            <span className="text-[10px] text-yellow-500 font-medium">(Pre-order)</span>
                          )}
                          {!isOutOfStock && (
                            <span className="text-[10px] text-brand-gray/50">
                              ({stock} in stock)
                            </span>
                          )}
                        </div>

                        {isSelected && (
                          <div className="flex items-center border border-brand-gray/30 rounded bg-brand-dark/50">
                            <button
                              onClick={() => updateSizeQuantity(size, Math.max(0, quantity - 1))}
                              className="px-3 py-1 text-brand-white hover:bg-white/10 transition-colors"
                            >
                              <span className="material-icons-outlined text-sm">remove</span>
                            </button>
                            <span className="px-3 py-1 text-brand-white text-sm font-bold min-w-[32px] text-center">
                              {quantity}
                            </span>
                            <button
                              onClick={() => updateSizeQuantity(size, quantity + 1)}
                              className="px-3 py-1 text-brand-white hover:bg-white/10 transition-colors"
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

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mb-4">
              <button
                onClick={handleAddToCart}
                disabled={availableSizes.length > 0 && !hasSelection}
                className={`w-full font-bold py-4 px-6 rounded-lg transition-all duration-200 uppercase text-sm flex items-center justify-center gap-2 shadow-lg ${availableSizes.length > 0 && !hasSelection
                  ? "bg-brand-gray/30 text-brand-gray cursor-not-allowed opacity-50"
                  : "bg-brand-cream hover:bg-brand-cream/90 text-brand-charcoal hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                  }`}
              >
                <span className="material-icons-outlined text-xl">shopping_cart</span>
                {hasSelection
                  ? `Add ${totalItems} ${totalItems === 1 ? 'item' : 'items'} - ${formatPrice(getTotalPrice())}`
                  : `Add to cart - ${formatPrice(product.base_price)}`
                }
              </button>
              <button
                onClick={handleBuyNow}
                disabled={availableSizes.length > 0 && !hasSelection}
                className={`w-full font-bold py-4 px-6 rounded-lg transition-all duration-200 uppercase text-sm shadow-lg flex items-center justify-center gap-2 ${availableSizes.length > 0 && !hasSelection
                  ? "bg-brand-gray/30 text-brand-gray cursor-not-allowed opacity-50"
                  : "bg-brand-cream hover:bg-brand-cream/90 text-brand-charcoal hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] border-2 border-brand-charcoal/10"
                  }`}
              >
                <span className="material-icons-outlined text-xl">bolt</span>
                Buy it now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Tabs */}
      <div className="mt-4 px-4">
        <div className="flex border-b border-brand-gray/20 gap-6 text-sm font-bold text-brand-gray">
          <button
            onClick={() => setActiveTab("description")}
            className={`pb-2 ${activeTab === "description"
              ? "border-b-2 border-brand-white text-brand-white"
              : "hover:text-brand-white transition"
              }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={`pb-2 ${activeTab === "details"
              ? "border-b-2 border-brand-white text-brand-white"
              : "hover:text-brand-white transition"
              }`}
          >
            Details
          </button>
        </div>
        <div className="py-6 text-brand-cream/90 text-sm leading-relaxed border border-brand-gray/20 rounded mt-4 p-4 bg-brand-dark/20">
          {activeTab === "description" && (
            <p>{product.description || product.short_description || "No description available."}</p>
          )}
          {activeTab === "details" && (
            <div>
              <p className="font-bold mb-2 text-[#F3EDE7]">Details:</p>
              <ul className="list-disc pl-5 space-y-2 marker:text-brand-gray">
                <li>Premium quality materials</li>
                <li>Machine wash cold / hang to dry (recommended)</li>
                <li>Available in multiple sizes</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Recommended Products */}
      {recommendedProducts.length > 0 && (
        <div className="mt-8 px-4">
          <h3 className="text-center text-xl font-bold text-brand-cream mb-6">
            Recommended products
          </h3>
          <ProductGrid products={recommendedProducts} />
        </div>
      )}
    </main>
  );
}
