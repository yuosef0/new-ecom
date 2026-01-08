"use client";

import Link from "next/link";
import { Icon } from "../ui/Icon";
import { useUIStore } from "@/stores/ui";
import { useState } from "react";

export function SideMenu() {
  const { menuOpen, toggleMenu } = useUIStore();
  const [expandedCategory, setExpandedCategory] = useState<string | null>("winter");

  const categories = [
    {
      id: "winter",
      name: "Winter Collection",
      items: ["Track Suits", "Sets", "Sweatpants", "Blanket", "Hoodies", "Quarter Zippers"],
    },
  ];

  if (!menuOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={toggleMenu}
      />

      {/* Side Drawer */}
      <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-brand-burgundy text-brand-cream flex flex-col z-50 p-4 space-y-3 transform transition-transform duration-300">
        {/* Close Button */}
        <div className="flex justify-start pb-2">
          <button onClick={toggleMenu} className="text-brand-cream">
            <Icon name="close" className="text-2xl" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-grow overflow-y-auto">
          <ul className="space-y-2 text-base">
            <li>
              <Link href="/" className="block py-2" onClick={toggleMenu}>
                Home
              </Link>
            </li>
            <li className="border-t border-white/20"></li>

            <li>
              <Link href="/products" className="block py-2" onClick={toggleMenu}>
                All Products
              </Link>
            </li>
            <li className="border-t border-white/20"></li>

            {/* Expandable Categories */}
            {categories.map((category) => (
              <li key={category.id}>
                <div
                  className="flex justify-between items-center py-2 cursor-pointer"
                  onClick={() =>
                    setExpandedCategory(expandedCategory === category.id ? null : category.id)
                  }
                >
                  <span>{category.name}</span>
                  <Icon
                    name={expandedCategory === category.id ? "remove" : "add"}
                    className="!text-lg"
                  />
                </div>

                {expandedCategory === category.id && (
                  <ul className="pl-4 space-y-2 pt-2 text-sm font-light">
                    {category.items.map((item) => (
                      <li key={item}>
                        <Link href={`/products?category=${item.toLowerCase().replace(/\s+/g, "-")}`} onClick={toggleMenu}>
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="border-t border-white/20 mt-2"></div>
              </li>
            ))}

            <li>
              <Link href="/about" className="block py-2" onClick={toggleMenu}>
                About us
              </Link>
            </li>
            <li className="border-t border-white/20"></li>

            <li>
              <Link href="/contact" className="block py-2" onClick={toggleMenu}>
                Contact us
              </Link>
            </li>
          </ul>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2 pt-6">
            <Link
              href="/wishlist"
              className="bg-brand-primary text-white py-2 px-3 rounded flex items-center justify-center text-sm"
              onClick={toggleMenu}
            >
              <Icon name="favorite_border" className="!text-lg mr-1" />
              <span>Wishlist</span>
            </Link>
            <button
              className="bg-brand-primary text-white py-2 px-3 rounded flex items-center justify-center text-sm"
              onClick={() => {
                toggleMenu();
                // TODO: Open search overlay
              }}
            >
              <Icon name="search" className="!text-lg mr-1" />
              <span>Search</span>
            </button>
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="flex-shrink-0 space-y-3">
          <Link
            href="/login"
            className="w-full bg-brand-cream text-brand-burgundy py-2 px-4 rounded flex items-center justify-center text-sm font-medium"
            onClick={toggleMenu}
          >
            <Icon name="person_outline" className="!text-lg mr-1" />
            <span>Login</span>
          </Link>

          <div className="border-t border-white/20"></div>

          <div className="flex items-center space-x-2 text-brand-cream text-sm">
            <span>🇪🇬</span>
            <span>EGP</span>
            <Icon name="expand_more" className="!text-base" />
          </div>
        </div>
      </div>
    </>
  );
}
