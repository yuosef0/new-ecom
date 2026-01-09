"use client";

import { useCartStore } from "@/stores/cart";
import { useUIStore } from "@/stores/ui";
import Link from "next/link";

export function Header() {
  const { getTotalItems } = useCartStore();
  const { toggleSearch, toggleMenu } = useUIStore();
  const totalItems = getTotalItems();

  return (
    <header className="bg-brand-dark px-4 py-3 sm:px-6 sm:py-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
      {/* Menu Icon */}
      <button
        onClick={toggleMenu}
        className="text-brand-cream hover:text-white transition-colors p-1"
        aria-label="Open menu"
      >
        <span className="material-icons-outlined text-2xl sm:text-[28px]">menu</span>
      </button>

      {/* Logo - Centered */}
      <Link
        href="/"
        className="absolute left-1/2 -translate-x-1/2 text-2xl sm:text-3xl md:text-4xl font-bold text-brand-cream hover:text-white transition-colors"
      >
        DXLR
      </Link>

      {/* Right Icons */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Search */}
        <button
          onClick={toggleSearch}
          className="text-brand-cream hover:text-white transition-colors p-1"
          aria-label="Search products"
        >
          <span className="material-icons-outlined text-2xl sm:text-[28px]">search</span>
        </button>

        {/* Cart */}
        <Link href="/cart" className="relative p-1">
          <span className="material-icons-outlined text-brand-cream hover:text-white transition-colors text-2xl sm:text-[28px]">
            shopping_bag
          </span>
          {totalItems > 0 && (
            <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-brand-primary text-white text-[10px] sm:text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-bold shadow-sm">
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
