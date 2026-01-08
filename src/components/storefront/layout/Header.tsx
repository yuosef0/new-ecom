"use client";

import { Icon } from "../ui/Icon";
import { useUIStore } from "@/stores/ui";
import { useCartStore } from "@/stores/cart";

export function Header() {
  const { toggleMenu, toggleSearch } = useUIStore();
  const totalItems = useCartStore((state) => state.getTotalItems());
  const toggleCart = useCartStore((state) => state.toggleCart);

  return (
    <header className="sticky top-0 z-20 bg-brand-burgundy dark:bg-black border-b border-gray-600/50">
      <div className="max-w-sm mx-auto px-4 py-3 flex items-center justify-between">
        {/* Menu Icon */}
        <button
          onClick={toggleMenu}
          className="text-brand-cream p-2 -ml-2"
          aria-label="Open menu"
        >
          <Icon name="menu" className="text-2xl" />
        </button>

        {/* Logo */}
        <h1 className="text-brand-cream text-xl font-bold tracking-wide">DXLR</h1>

        {/* Right Actions */}
        <div className="flex items-center space-x-1">
          {/* Search */}
          <button
            onClick={toggleSearch}
            className="text-brand-cream p-2"
            aria-label="Search"
          >
            <Icon name="search" className="text-xl" />
          </button>

          {/* Wishlist */}
          <button
            className="text-brand-cream p-2 relative"
            aria-label="Wishlist"
          >
            <Icon name="favorite_border" className="text-xl" />
          </button>

          {/* Cart */}
          <button
            onClick={toggleCart}
            className="text-brand-cream p-2 relative"
            aria-label="Cart"
          >
            <Icon name="shopping_cart" className="text-xl" />
            {totalItems > 0 && (
              <span className="absolute top-1 right-1 bg-green-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
