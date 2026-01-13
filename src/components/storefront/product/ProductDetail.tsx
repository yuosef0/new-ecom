"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/stores/cart";
import { useWishlistStore } from "@/stores/wishlist";
import { formatPrice } from "@/lib/utils";
import { ProductGrid } from "./ProductGrid";
import type { ProductWithImages } from "@/lib/queries/products";

interface ProductDetailProps {
  product: ProductWithImages;
  recommendedProducts: ProductWithImages[];
}

export function ProductDetail({ product, recommendedProducts }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  const { addItem, openCart } = useCartStore();
  const { toggleWishlist, isInWishlist, loadWishlist } = useWishlistStore();

  const isProductInWishlist = isInWishlist(product.id);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

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

  const handleAddToCart = () => {
    addItem(product.id, null, quantity);
    openCart();
  };

  const handleBuyNow = () => {
    addItem(product.id, null, quantity);
    // Redirect to checkout
    window.location.href = "/checkout";
  };

  const handleWishlistToggle = async () => {
    await toggleWishlist(product.id);
  };

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
                    className={`w-1/5 min-w-[60px] aspect-[3/4] rounded overflow-hidden cursor-pointer ${
                      selectedImage === index
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
            <h1 className="text-xl font-bold text-lime-400 mb-2">{product.name}</h1>

            {/* Price */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl font-bold text-lime-500">
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

            {/* Stock Status */}
            {product.in_stock && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse"></span>
                  <span className="text-sm font-medium text-brand-white">Low stock</span>
                </div>
                <div className="w-full h-1 bg-brand-dark rounded-full overflow-hidden">
                  <div className="h-full bg-lime-500 w-1/4 rounded-full"></div>
                </div>
              </div>
            )}

            {/* Size Selection */}
            {availableSizes.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-semibold mb-2 text-brand-gray">
                  Size: {selectedSize || "Select a size"}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 px-3 text-sm font-bold text-center rounded ${
                        selectedSize === size
                          ? "bg-primary text-white border border-primary"
                          : "bg-transparent text-brand-gray border border-brand-gray/30 hover:border-brand-gray"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <p className="text-sm font-semibold mb-2 text-brand-gray">Quantity</p>
              <div className="flex items-center border border-brand-gray/30 rounded bg-brand-dark/50 w-32">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-brand-white hover:bg-brand-white/10"
                >
                  -
                </button>
                <input
                  className="w-full bg-transparent text-center text-brand-white border-none focus:ring-0 p-0 text-sm font-bold"
                  type="text"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setQuantity(Math.max(1, val));
                  }}
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-brand-white hover:bg-brand-white/10"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mb-4">
              <div className="flex gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.in_stock}
                  className="flex-1 bg-primary hover:bg-red-700 text-white font-bold py-3 px-4 rounded transition uppercase text-sm disabled:opacity-50"
                >
                  Add to cart - {formatPrice(product.base_price * quantity)}
                </button>
                <button
                  onClick={handleWishlistToggle}
                  className={`border rounded p-3 transition ${
                    isProductInWishlist
                      ? "bg-red-500 border-red-500 text-white"
                      : "bg-transparent border-brand-gray/30 text-brand-white hover:bg-brand-white/10"
                  }`}
                >
                  <span className="material-icons-outlined">
                    {isProductInWishlist ? "favorite" : "favorite_border"}
                  </span>
                </button>
              </div>
              <button
                onClick={handleBuyNow}
                disabled={!product.in_stock}
                className="w-full bg-lime-500 hover:bg-lime-600 text-brand-dark font-bold py-3 px-4 rounded transition uppercase text-sm disabled:opacity-50"
              >
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
            className={`pb-2 ${
              activeTab === "description"
                ? "border-b-2 border-brand-white text-brand-white"
                : "hover:text-brand-white transition"
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={`pb-2 ${
              activeTab === "details"
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
              <p className="font-bold mb-2 text-lime-400">Details:</p>
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
