"use client";

import Link from "next/link";
import { Icon } from "../ui/Icon";
import { useCartStore } from "@/stores/cart";
import { useState } from "react";

export function BottomNav() {
  const totalItems = useCartStore((state) => state.getTotalItems());
  const [wishlistCount] = useState(0); // TODO: Connect to wishlist store

  return (
    <footer className="fixed bottom-0 left-0 right-0 max-w-sm mx-auto bg-brand-burgundy dark:bg-black border-t border-gray-600/50 dark:border-gray-400/20 z-30">
      <div className="flex justify-around items-center h-20 text-brand-cream dark:text-brand-cream">
        <Link href="/" className="flex flex-col items-center space-y-1">
          <Icon name="widgets" />
          <span className="text-xs font-medium">Shop</span>
        </Link>

        <Link href="/account" className="flex flex-col items-center space-y-1">
          <Icon name="person_outline" />
          <span className="text-xs font-medium">Account</span>
        </Link>

        <Link href="/wishlist" className="relative flex flex-col items-center space-y-1">
          <Icon name="favorite_border" />
          {wishlistCount > 0 && (
            <span className="absolute top-[-4px] right-2 bg-green-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {wishlistCount}
            </span>
          )}
          <span className="text-xs font-medium">Wishlist</span>
        </Link>

        <Link href="/cart" className="relative flex flex-col items-center space-y-1">
          <Icon name="shopping_cart_checkout" />
          {totalItems > 0 && (
            <span className="absolute top-[-4px] right-2 bg-green-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {totalItems}
            </span>
          )}
          <span className="text-xs font-medium">Cart</span>
        </Link>
      </div>
    </footer>
  );
}
