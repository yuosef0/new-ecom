"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/stores/cart";
import { useWishlistStore } from "@/stores/wishlist";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNav() {
  const pathname = usePathname();
  const { getTotalItems, openCart } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const [totalItems, setTotalItems] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTotalItems(getTotalItems());
    setWishlistCount(wishlistItems.length);
  }, [getTotalItems, wishlistItems.length]);

  useEffect(() => {
    if (!mounted) return;

    // Update total items when cart changes
    const unsubscribe = useCartStore.subscribe((state) => {
      setTotalItems(state.getTotalItems());
    });

    // Update wishlist count when wishlist changes
    const unsubscribeWishlist = useWishlistStore.subscribe((state) => {
      setWishlistCount(state.items.length);
    });

    return () => {
      unsubscribe();
      unsubscribeWishlist();
    };
  }, [mounted]);

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-brand-dark border-t border-brand-burgundy z-50 shadow-lg">
      <div className="flex justify-around items-center h-14 sm:h-16 md:h-18 text-xs sm:text-sm text-brand-muted px-2">
        {/* Shop */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 py-2 px-2 sm:px-3 ${isActive("/") ? "text-brand-primary" : "hover:text-brand-cream transition-colors"
            }`}
        >
          <span
            className="material-icons-outlined text-xl sm:text-2xl"
            style={{ fontVariationSettings: isActive("/") ? "'FILL' 1" : "'FILL' 0" }}
          >
            apps
          </span>
          <span className="text-[10px] sm:text-xs">Shop</span>
        </Link>

        {/* Account */}
        <Link
          href="/account"
          className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 py-2 px-2 sm:px-3 ${isActive("/account") ? "text-brand-primary" : "hover:text-brand-cream transition-colors"
            }`}
        >
          <span className="material-icons-outlined text-xl sm:text-2xl">person_outline</span>
          <span className="text-[10px] sm:text-xs">Account</span>
        </Link>

        {/* Wishlist */}
        <Link
          href="/wishlist"
          className={`flex flex-col items-center justify-center relative gap-0.5 sm:gap-1 py-2 px-2 sm:px-3 ${isActive("/wishlist") ? "text-brand-primary" : "hover:text-brand-cream transition-colors"
            }`}
        >
          <span
            className="material-icons-outlined text-xl sm:text-2xl"
            style={{ fontVariationSettings: isActive("/wishlist") ? "'FILL' 1" : "'FILL' 0" }}
          >
            favorite
          </span>
          {wishlistCount > 0 && (
            <span className="absolute top-1 right-0.5 sm:right-1 bg-red-500 text-white text-[9px] sm:text-[10px] rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 flex items-center justify-center font-bold shadow-sm">
              {wishlistCount}
            </span>
          )}
          <span className="text-[10px] sm:text-xs">Wishlist</span>
        </Link>

        {/* Cart */}
        <button
          onClick={openCart}
          className="flex flex-col items-center justify-center relative gap-0.5 sm:gap-1 py-2 px-2 sm:px-3 hover:text-brand-cream transition-colors"
        >
          <span className="material-icons-outlined text-xl sm:text-2xl">shopping_bag</span>
          {totalItems > 0 && (
            <span className="absolute top-1 right-0.5 sm:right-1 bg-brand-primary text-white text-[9px] sm:text-[10px] rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 flex items-center justify-center font-bold shadow-sm">
              {totalItems}
            </span>
          )}
          <span className="text-[10px] sm:text-xs">Cart</span>
        </button>
      </div>
    </footer>
  );
}
