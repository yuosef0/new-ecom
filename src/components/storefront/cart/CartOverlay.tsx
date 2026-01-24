"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/stores/cart";
import { Icon } from "../ui/Icon";
import { CartItem } from "./CartItem";
import { formatPrice } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export function CartOverlay() {
  const { isOpen, closeCart, items, updateQuantity, removeItem } = useCartStore();
  const [enrichedItems, setEnrichedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch product details for items in cart
  useEffect(() => {
    if (items.length === 0) {
      setEnrichedItems([]);
      return;
    }

    const fetchProductDetails = async () => {
      setLoading(true);
      const supabase = createClient();

      try {
        // Fetch all products
        const productIds = items.map(item => item.productId);
        const { data: products } = await supabase
          .from("products")
          .select("id, name, slug, base_price, product_images(url, is_primary)")
          .in("id", productIds);

        // Fetch variants if needed
        const variantIds = items
          .filter(item => item.variantId)
          .map(item => item.variantId);

        let variants: any[] = [];
        if (variantIds.length > 0) {
          const { data: variantsData } = await supabase
            .from("product_variants")
            .select("id, price_adjustment, sizes(name), colors(name)")
            .in("id", variantIds);
          variants = variantsData || [];
        }

        if (products) {
          const enriched = items.map(item => {
            const product = products.find(p => p.id === item.productId);
            const variant = item.variantId ? variants.find(v => v.id === item.variantId) : null;

            if (!product) return null;

            return {
              ...item,
              product: {
                name: product.name,
                slug: product.slug,
                base_price: product.base_price,
                images: product.product_images?.map((img: any) => ({ url: img.url, alt_text: "" })) || []
              },
              variant: variant ? {
                size_name: variant.sizes?.name || null,
                color_name: variant.colors?.name || null,
                price_adjustment: variant.price_adjustment || 0
              } : null
            };
          }).filter(Boolean);

          setEnrichedItems(enriched);
        }
      } catch (err) {
        console.error("Error loading cart details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchProductDetails();
    }
  }, [items, isOpen]);

  const subtotal = enrichedItems.reduce((sum, item) => {
    const price = item.product.base_price + (item.variant?.price_adjustment || 0);
    return sum + (price * item.quantity);
  }, 0);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-brand-burgundy shadow-2xl flex flex-col z-50 transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-xl font-semibold text-brand-cream">Shopping cart</h2>
          <button
            onClick={closeCart}
            className="p-1 rounded-full hover:bg-white/10 text-brand-cream transition-colors"
          >
            <Icon name="close" className="text-2xl" />
          </button>
        </div>

        {/* Cart Items */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <Icon name="shopping_cart" className="text-6xl text-brand-cream/30 mb-4" />
            <p className="text-brand-cream/70 text-center mb-4">
              Your cart is empty
            </p>
            <button
              onClick={closeCart}
              className="px-6 py-2 bg-brand-primary text-white font-semibold rounded-lg"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {loading ? (
                <div className="text-center py-10">
                  <div className="animate-spin h-8 w-8 border-4 border-brand-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-brand-cream/50">Loading cart...</p>
                </div>
              ) : (
                enrichedItems.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={(qty) => updateQuantity(item.id, qty)}
                    onRemove={() => removeItem(item.id)}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 bg-brand-dark p-5 pb-8 shadow-[0_-5px_15px_rgba(0,0,0,0.25)]">
              {/* Note Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-brand-muted">
                  <Icon name="edit_note" className="text-xl" />
                </div>
              </div>

              {/* Subtotal */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-medium text-brand-cream">Subtotal</span>
                <span className="text-lg font-bold text-brand-cream">
                  {formatPrice(subtotal)} EGP
                </span>
              </div>

              <p className="text-xs text-brand-muted mb-6">
                Tax included. <a href="#" className="underline hover:text-brand-cream">Shipping</a> calculated at checkout.
              </p>

              {/* Buttons */}
              <div className="space-y-3">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="w-full py-3.5 px-4 rounded-md border border-brand-cream bg-brand-cream text-brand-charcoal font-medium text-sm hover:bg-opacity-90 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-brand-cream text-center block"
                >
                  View cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full py-3.5 px-4 rounded-md bg-brand-primary text-white font-bold text-sm shadow-md hover:bg-red-700 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary flex items-center justify-center"
                >
                  Check out
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
