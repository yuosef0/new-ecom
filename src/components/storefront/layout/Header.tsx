"use client";

import { useCartStore } from "@/stores/cart";
import { useUIStore } from "@/stores/ui";
import Link from "next/link";

export function Header() {
  const { getTotalItems } = useCartStore();
  const { toggleSearch, toggleMenu } = useUIStore();
  const totalItems = getTotalItems();

  return (
    <header className="bg-brand-dark p-4 flex justify-between items-center sticky top-0 z-50">
      {/* Menu Icon */}
      <button
        onClick={toggleMenu}
        className="text-brand-cream hover:text-white transition-colors"
      >
        <span className="material-icons-outlined">menu</span>
      </button>

      {/* Logo */}
      <Link href="/" className="text-3xl font-bold text-brand-cream hover:text-white transition-colors">
        DXLR
      </Link>

      {/* Right Icons */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <button
          onClick={toggleSearch}
          className="text-brand-cream hover:text-white transition-colors"
        >
          <span className="material-icons-outlined">search</span>
        </button>

        {/* Cart */}
        <Link href="/cart" className="relative">
          <span className="material-icons-outlined text-brand-cream hover:text-white transition-colors">
            shopping_bag
          </span>
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-2 bg-brand-primary text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
