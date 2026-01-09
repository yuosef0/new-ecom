"use client";

import Link from "next/link";
import { useCartStore } from "@/stores/cart";
import { CartItem } from "@/components/storefront/cart/CartItem";
import { CartSummary } from "@/components/storefront/cart/CartSummary";

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCartStore();

  // Mock cart items with product data (in production, this would come from an API)
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
  const shipping = subtotal > 0 ? 50 : 0;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="px-4 sm:px-6 py-6 min-h-[60vh] flex flex-col items-center justify-center pb-24">
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
    <div className="px-4 sm:px-6 py-4 sm:py-6 pb-24">
        {/* Page Header */}
        <h1 className="text-2xl font-bold text-brand-cream mb-6">Shopping Cart</h1>

        {/* Cart Items */}
        <div className="mb-6 divide-y divide-white/10">
          {cartItems.map((item) => (
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
    </div>
  );
}
