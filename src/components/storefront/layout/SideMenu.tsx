"use client";

import Link from "next/link";
import { Icon } from "../ui/Icon";
import { useUIStore } from "@/stores/ui";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface Collection {
  id: string;
  name: string;
  slug: string;
  display_type: "small" | "large";
}

export function SideMenu() {
  const { menuOpen, toggleMenu, toggleSearch } = useUIStore();
  const { user, profile, loading, signOut, isAuthenticated } = useAuth();
  const [expandedCategory, setExpandedCategory] = useState<string | null>("winter");
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("collections")
        .select("id, name, slug, display_type")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (data) {
        setCollections(data);
      }
    } catch (err) {
      console.error("Error loading collections:", err);
    }
  };

  const categories = [
    {
      id: "winter",
      name: "Winter Collection",
      items: [
        { name: "Track Suits", slug: "track-suits" },
        { name: "Sets", slug: "sets" },
        { name: "Sweatpants", slug: "sweatpants" },
        { name: "Blankets", slug: "blankets" },
        { name: "Hoodies", slug: "hoodies-collection" },
        { name: "Winter Sale", slug: "winter-sale" },
        // إضافة الكوليكشنات الديناميكية من قاعدة البيانات
        ...collections.map((col) => ({
          name: `${col.name} ${col.display_type === "large" ? "🟦" : "🟨"}`,
          slug: col.slug,
        })),
      ],
    },
  ];

  if (!menuOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40"
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
                      <li key={item.slug}>
                        <Link href={`/collections/${item.slug}`} onClick={toggleMenu}>
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="border-t border-white/20 mt-2"></div>
              </li>
            ))}

            <li>
              <Link href="/#about" className="block py-2" onClick={toggleMenu}>
                About us
              </Link>
            </li>
            <li className="border-t border-white/20"></li>

            <li>
              <Link href="/#contact" className="block py-2" onClick={toggleMenu}>
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
                toggleSearch();
              }}
            >
              <Icon name="search" className="!text-lg mr-1" />
              <span>Search</span>
            </button>
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="flex-shrink-0 space-y-3">
          {loading ? (
            <div className="w-full bg-brand-cream/20 text-brand-cream py-2 px-4 rounded flex items-center justify-center text-sm">
              <span>Loading...</span>
            </div>
          ) : isAuthenticated ? (
            <>
              {/* User Info */}
              <div className="bg-brand-cream/10 p-3 rounded">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="person" className="!text-lg text-brand-cream" />
                  <span className="text-sm font-medium text-brand-cream">
                    {profile?.full_name || user?.email?.split("@")[0] || "User"}
                  </span>
                </div>
                <div className="text-xs text-brand-cream/70">{user?.email}</div>
              </div>

              {/* Account Links */}
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/account"
                  className="bg-brand-cream/20 text-brand-cream py-2 px-3 rounded flex items-center justify-center text-xs"
                  onClick={toggleMenu}
                >
                  <Icon name="settings" className="!text-base mr-1" />
                  <span>Account</span>
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    toggleMenu();
                  }}
                  className="bg-brand-cream/20 text-brand-cream py-2 px-3 rounded flex items-center justify-center text-xs"
                >
                  <Icon name="logout" className="!text-base mr-1" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="w-full bg-brand-cream text-brand-burgundy py-2 px-4 rounded flex items-center justify-center text-sm font-medium"
              onClick={toggleMenu}
            >
              <Icon name="person_outline" className="!text-lg mr-1" />
              <span>Login</span>
            </Link>
          )}

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
