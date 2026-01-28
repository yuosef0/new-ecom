"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/stores/cart";
import { CartItem } from "@/components/storefront/cart/CartItem";
import { CartSummary } from "@/components/storefront/cart/CartSummary";
import { createClient } from "@/lib/supabase/client";

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCartStore();
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

    fetchProductDetails();
  }, [items]);

  const subtotal = enrichedItems.reduce((sum, item) => {
    const price = item.product.base_price + (item.variant?.price_adjustment || 0);
    return sum + (price * item.quantity);
  }, 0);

  const shipping = subtotal > 0 ? 50 : 0;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="px-4 sm:px-6 py-6 min-h-[60vh] flex flex-col items-center justify-center pb-10">
        <div className="text-center">
          <span className="material-icons-outlined text-6xl text-brand-cream/30 mb-4">
            shopping_cart
          </span>
          <h2 className="text-2xl font-bold text-brand-cream mb-2">Your cart is empty</h2>
          <p className="text-brand-cream/70 mb-6">
            Start adding some products to your cart
          </p>
          <Link
            href="/products"
            className="inline-block px-6 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary/90"
          >
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-4 sm:py-6 pb-10">
      {/* Page Header */}
      <h1 className="text-2xl font-bold text-brand-cream mb-6">Shopping Cart</h1>

      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-brand-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-brand-cream/50">Loading your cart...</p>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="mb-6 divide-y divide-white/10">
            {enrichedItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={(qty) => updateQuantity(item.id, qty)}
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </div>

          {/* Cart Summary */}
          <CartSummary
            subtotal={subtotal}
            shipping={shipping}
            total={total}
          />

          {/* Checkout Button */}
          <Link
            href="/checkout"
            className="block w-full mt-6 py-3 bg-brand-primary text-white font-bold text-center rounded-lg hover:bg-brand-primary/90"
          >
            PROCEED TO CHECKOUT
          </Link>

          {/* Continue Shopping */}
          <Link
            href="/products"
            className="block text-center text-brand-cream/70 text-sm mt-4 hover:text-brand-cream"
          >
            ← Continue Shopping
          </Link>
        </>
      )}
    </div>
  );
}
