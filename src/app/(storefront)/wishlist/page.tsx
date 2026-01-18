"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/storefront/ui/Icon";
import { useCartStore } from "@/stores/cart";
import { useWishlistStore } from "@/stores/wishlist";
import { formatPrice } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface WishlistProduct {
  id: string;
  product_id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    base_price: number;
    compare_at_price: number | null;
    in_stock: boolean;
    images: Array<{ url: string; is_primary: boolean }>;
  };
}

export default function WishlistPage() {
  const { addItem } = useCartStore();
  const { items: wishlistItemIds, removeFromWishlist: removeFromStore } = useWishlistStore();
  const [wishlistItems, setWishlistItems] = useState<WishlistProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    loadWishlist();
  }, [wishlistItemIds]); // Reload when wishlist items change

  const loadWishlist = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setIsAuthenticated(false);
      setIsLoading(false);
      setWishlistItems([]);
      return;
    }

    setIsAuthenticated(true);

    // Fetch full wishlist items with product details
    const { data, error } = await supabase
      .from("wishlist_items")
      .select(
        `
        id,
        product_id,
        products(
          id,
          name,
          slug,
          base_price,
          compare_at_price,
          in_stock,
          product_images(url, is_primary)
        )
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading wishlist:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      setWishlistItems([]);
    } else if (data) {
      console.log("Wishlist data loaded:", data.length, "items");
      const transformedData: WishlistProduct[] = data
        .filter((item: any) => {
          if (!item.products) {
            console.warn("Item has no product data:", item);
            return false;
          }
          return true;
        })
        .map((item: any) => ({
          id: item.id,
          product_id: item.product_id,
          product: {
            id: item.products.id,
            name: item.products.name,
            slug: item.products.slug,
            base_price: item.products.base_price,
            compare_at_price: item.products.compare_at_price,
            in_stock: item.products.in_stock,
            images: item.products.product_images || [],
          },
        }));
      setWishlistItems(transformedData);
    } else {
      console.log("No data and no error - wishlist might be empty");
      setWishlistItems([]);
    }

    setIsLoading(false);
  };

  const handleRemove = async (productId: string) => {
    // Remove from store (which updates database)
    await removeFromStore(productId);
    // Optimistically update local state
    setWishlistItems((prev) => prev.filter((item) => item.product_id !== productId));
  };

  const handleAddToCart = (productId: string) => {
    addItem(productId, null, 1);
  };

  // Not authenticated state
  if (!isLoading && !isAuthenticated) {
    return (
      <div className="px-4 sm:px-6 py-6 min-h-[60vh] flex flex-col items-center justify-center pb-24">
          <Icon name="favorite_border" className="text-6xl text-brand-cream/30 mb-4" />
          <h2 className="text-2xl font-bold text-brand-cream mb-2">Sign in to view wishlist</h2>
          <p className="text-brand-cream/70 mb-6 text-center">
            Create an account or sign in to save your favorite items
          </p>
          <Link
            href="/login"
            className="px-6 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary/90"
          >
            SIGN IN
          </Link>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 py-6 min-h-[60vh] flex items-center justify-center pb-24">
        <div className="text-brand-cream/70">Loading...</div>
      </div>
    );
  }

  // Empty wishlist state
  if (wishlistItems.length === 0) {
    return (
      <div className="px-4 sm:px-6 py-6 min-h-[60vh] flex flex-col items-center justify-center pb-24">
          <Icon name="favorite_border" className="text-6xl text-brand-cream/30 mb-4" />
          <h2 className="text-2xl font-bold text-brand-cream mb-2">Your wishlist is empty</h2>
          <p className="text-brand-cream/70 mb-6 text-center">
            Start adding products you love to your wishlist
          </p>
          <Link
            href="/products"
            className="px-6 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary/90"
          >
            SHOP NOW
          </Link>
      </div>
    );
  }

  // Wishlist with items
  return (
    <div className="px-4 sm:px-6 py-4 sm:py-6 pb-24">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-brand-cream">My Wishlist</h1>
          <span className="text-brand-cream/70 text-sm">
            {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"}
          </span>
        </div>

        {/* Wishlist Items Grid */}
        <div className="grid grid-cols-2 gap-4">
          {wishlistItems.map((item) => {
            const primaryImage = item.product.images.find((img) => img.is_primary) || item.product.images[0];
            const discount = item.product.compare_at_price
              ? Math.round(
                  ((item.product.compare_at_price - item.product.base_price) /
                    item.product.compare_at_price) *
                    100
                )
              : 0;

            return (
              <div key={item.id} className="bg-white/5 rounded-lg overflow-hidden relative group">
                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(item.product_id)}
                  className="absolute top-2 right-2 z-10 w-8 h-8 bg-brand-burgundy/90 rounded-full flex items-center justify-center hover:bg-brand-burgundy"
                >
                  <Icon name="close" className="text-brand-cream text-lg" />
                </button>

                {/* Product Image */}
                <Link href={`/products/${item.product.slug}`}>
                  <div className="relative aspect-square bg-white/10">
                    {primaryImage ? (
                      <Image
                        src={primaryImage.url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, 200px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon name="image" className="text-4xl text-brand-cream/30" />
                      </div>
                    )}

                    {/* Discount Badge */}
                    {discount > 0 && (
                      <div className="absolute top-2 left-2 bg-brand-primary text-white text-xs font-bold px-2 py-1 rounded">
                        -{discount}%
                      </div>
                    )}

                    {/* Out of Stock Overlay */}
                    {!item.product.in_stock && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">SOLD OUT</span>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-3">
                  <Link href={`/products/${item.product.slug}`}>
                    <h3 className="text-brand-cream font-medium text-sm mb-2 line-clamp-2 hover:text-brand-primary">
                      {item.product.name}
                    </h3>
                  </Link>

                  {/* Price */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-brand-cream font-bold">
                        {formatPrice(item.product.base_price)}
                      </span>
                      {item.product.compare_at_price && (
                        <span className="text-brand-cream/50 text-sm line-through">
                          {formatPrice(item.product.compare_at_price)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(item.product.id)}
                    disabled={!item.product.in_stock}
                    className="w-full py-2 bg-brand-primary text-white text-sm font-bold rounded hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {item.product.in_stock ? "ADD TO CART" : "OUT OF STOCK"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Shopping */}
        <Link
          href="/products"
          className="block text-center text-brand-cream/70 text-sm mt-8 hover:text-brand-cream"
        >
          ← Continue Shopping
        </Link>
    </div>
  );
}
