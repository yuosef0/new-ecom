"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/stores/cart";
import { useUIStore } from "@/stores/ui";
import Link from "next/link";

export function Header() {
  const { getTotalItems, openCart } = useCartStore();
  const { toggleSearch, toggleMenu } = useUIStore();
  const [totalItems, setTotalItems] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTotalItems(getTotalItems());
  }, [getTotalItems]);

  useEffect(() => {
    if (!mounted) return;

    // Update total items when cart changes
    const unsubscribe = useCartStore.subscribe((state) => {
      setTotalItems(state.getTotalItems());
    });

    return unsubscribe;
  }, [mounted]);

  return (
    <header className="bg-brand-dark px-4 py-3 sm:px-6 sm:py-4 flex justify-between items-center sticky top-0 z-50 shadow-md relative">
      {/* Menu Icon */}
      <button
        onClick={toggleMenu}
        className="text-brand-cream hover:text-white transition-colors p-1 z-10"
        aria-label="Open menu"
      >
        <span className="material-icons-outlined text-2xl sm:text-[28px]">menu</span>
      </button>

      {/* Logo - Centered on mobile, left-aligned on desktop */}
      <Link
        href="/"
        className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 md:ml-4 text-2xl sm:text-3xl md:text-4xl font-bold text-brand-cream hover:text-white transition-colors"
      >
        RiLIKS
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 flex-1 justify-center">
        <Link href="/" className="text-brand-cream hover:text-white font-medium transition-colors">
          Home
        </Link>
        <Link href="/products" className="text-brand-cream hover:text-white font-medium transition-colors">
          Shop
        </Link>
        <div className="relative group">
          <button className="text-brand-cream hover:text-white font-medium transition-colors flex items-center">
            Collections
            <span className="material-icons-outlined text-sm ml-1">expand_more</span>
          </button>
          {/* Simple dropdown for desktop collections */}
          <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
            <Link href="/collections/winter-collection" className="block px-4 py-2 text-gray-800 hover:bg-gray-100 text-sm">
              Winter Collection
            </Link>
            <Link href="/collections/summer-vibes" className="block px-4 py-2 text-gray-800 hover:bg-gray-100 text-sm">
              Summer Vibes
            </Link>
          </div>
        </div>
        <Link href="/about" className="text-brand-cream hover:text-white font-medium transition-colors">
          About
        </Link>
      </nav>

      {/* Right Icons */}
      <div className="flex items-center space-x-3 sm:space-x-4 z-10">
        {/* Search */}
        <button
          onClick={toggleSearch}
          className="text-brand-cream hover:text-white transition-colors p-1"
          aria-label="Search products"
        >
          <span className="material-icons-outlined text-2xl sm:text-[28px]">search</span>
        </button>

        {/* Account */}
        <Link
          href="/account"
          className="text-brand-cream hover:text-white transition-colors p-1"
          aria-label="My Account"
        >
          <span className="material-icons-outlined text-2xl sm:text-[28px]">person_outline</span>
        </Link>

        {/* Cart */}
        <button
          onClick={openCart}
          className="relative p-1 text-brand-cream hover:text-white transition-colors"
          aria-label="Open cart"
        >
          <span className="material-icons-outlined text-2xl sm:text-[28px]">
            shopping_bag
          </span>
          {totalItems > 0 && (
            <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-brand-primary text-white text-[10px] sm:text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-bold shadow-sm">
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
