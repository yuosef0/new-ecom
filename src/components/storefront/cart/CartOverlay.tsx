"use client";

import Link from "next/link";
import { useCartStore } from "@/stores/cart";
import { Icon } from "../ui/Icon";
import { CartItem } from "./CartItem";
import { formatPrice } from "@/lib/utils";

export function CartOverlay() {
  const { isOpen, closeCart, items, updateQuantity, removeItem } = useCartStore();

  // Mock cart items (in production, fetch real product data)
  const cartItems = items.map((item) => ({
    ...item,
    product: {
      name: "Sample Product",
      slug: "sample-product",
      base_price: 899,
      images: [],
    },
    variant: null,
  }));

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.base_price * item.quantity, 0);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-brand-burgundy text-brand-cream flex flex-col z-50 transform transition-transform duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-bold">Your Cart ({items.length})</h2>
          <button onClick={closeCart} className="p-1">
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
            <div className="flex-1 overflow-y-auto px-4 divide-y divide-white/10">
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={(qty) => updateQuantity(item.id, qty)}
                  onRemove={() => removeItem(item.id)}
                  compact
                />
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 p-4 space-y-4">
              {/* Subtotal */}
              <div className="flex justify-between items-center">
                <span className="text-brand-cream font-medium">Subtotal</span>
                <span className="text-brand-cream font-bold text-xl">
                  {formatPrice(subtotal)}
                </span>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                onClick={closeCart}
                className="block w-full py-3 bg-brand-primary text-white font-bold text-center rounded-lg hover:bg-brand-primary/90"
              >
                PROCEED TO CHECKOUT
              </Link>

              {/* View Cart Link */}
              <Link
                href="/cart"
                onClick={closeCart}
                className="block text-center text-brand-cream/70 text-sm hover:text-brand-cream"
              >
                View Full Cart
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
