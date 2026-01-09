"use client";

import { useCartStore } from "@/stores/cart";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNav() {
  const pathname = usePathname();
  const { getTotalItems } = useCartStore();
  const totalItems = getTotalItems();

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-brand-dark border-t border-brand-burgundy z-50">
      <div className="flex justify-around items-center h-16 text-xs text-brand-muted">
        {/* Shop */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center ${
            isActive("/") ? "text-brand-primary" : ""
          }`}
        >
          <span
            className="material-icons-outlined"
            style={{ fontVariationSettings: isActive("/") ? "'FILL' 1" : "'FILL' 0" }}
          >
            apps
          </span>
          <span>Shop</span>
        </Link>

        {/* Account */}
        <Link
          href="/account"
          className={`flex flex-col items-center justify-center ${
            isActive("/account") ? "text-brand-primary" : ""
          }`}
        >
          <span className="material-icons-outlined">person_outline</span>
          <span>Account</span>
        </Link>

        {/* Wishlist */}
        <Link
          href="/wishlist"
          className={`flex flex-col items-center justify-center relative ${
            isActive("/wishlist") ? "text-brand-primary" : ""
          }`}
        >
          <span className="material-icons-outlined">favorite_border</span>
          <span>Wishlist</span>
        </Link>

        {/* Cart */}
        <Link
          href="/cart"
          className={`flex flex-col items-center justify-center relative ${
            isActive("/cart") ? "text-brand-primary" : ""
          }`}
        >
          <span className="material-icons-outlined">shopping_bag</span>
          {totalItems > 0 && (
            <span className="absolute -top-0.5 right-1.5 bg-brand-primary text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
              {totalItems}
            </span>
          )}
          <span>Cart</span>
        </Link>
      </div>
    </footer>
  );
}
