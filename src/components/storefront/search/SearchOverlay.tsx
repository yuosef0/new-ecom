"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/stores/ui";
import { Icon } from "../ui/Icon";
import { formatPrice } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  compare_at_price: number | null;
  images: Array<{ image_url: string; is_primary: boolean }>;
}

export function SearchOverlay() {
  const router = useRouter();
  const { searchOpen, toggleSearch } = useUIStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when overlay opens
  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      await performSearch(query);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        slug,
        base_price,
        compare_at_price,
        images:product_images(image_url, is_primary)
      `
      )
      .eq("is_active", true)
      .ilike("name", `%${searchQuery}%`)
      .limit(6);

    if (!error && data) {
      setResults(data as SearchResult[]);
    }
  };

  const handleProductClick = (slug: string) => {
    toggleSearch();
    setQuery("");
    setResults([]);
    router.push(`/products/${slug}`);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
  };

  if (!searchOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40"
        onClick={toggleSearch}
      />

      {/* Search Overlay */}
      <div className="fixed inset-x-0 top-0 bg-brand-burgundy text-brand-cream z-50 max-h-screen flex flex-col animate-slide-down">
        {/* Search Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Icon
                name="search"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-cream/50"
              />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-lg text-brand-cream placeholder:text-brand-cream/50 focus:outline-none focus:border-brand-primary"
              />
              {query && (
                <button
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <Icon name="close" className="text-brand-cream/70 hover:text-brand-cream" />
                </button>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={toggleSearch}
              className="p-2 hover:bg-white/10 rounded-lg"
            >
              <Icon name="close" className="text-2xl" />
            </button>
          </div>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto">
          {/* Loading State */}
          {isSearching && (
            <div className="p-8 text-center">
              <div className="text-brand-cream/70">Searching...</div>
            </div>
          )}

          {/* No Query State */}
          {!query && !isSearching && (
            <div className="p-8 text-center">
              <Icon name="search" className="text-6xl text-brand-cream/30 mb-4" />
              <p className="text-brand-cream/70">
                Start typing to search for products
              </p>
            </div>
          )}

          {/* No Results State */}
          {query && !isSearching && results.length === 0 && (
            <div className="p-8 text-center">
              <Icon name="search_off" className="text-6xl text-brand-cream/30 mb-4" />
              <p className="text-brand-cream/70">
                No products found for &quot;{query}&quot;
              </p>
              <Link
                href="/products"
                onClick={toggleSearch}
                className="inline-block mt-4 text-brand-primary hover:underline"
              >
                Browse all products
              </Link>
            </div>
          )}

          {/* Results List */}
          {results.length > 0 && !isSearching && (
            <div className="p-4">
              <p className="text-brand-cream/70 text-sm mb-4">
                Found {results.length} {results.length === 1 ? "product" : "products"}
              </p>
              <div className="space-y-3">
                {results.map((product) => {
                  const primaryImage =
                    product.images.find((img) => img.is_primary) || product.images[0];
                  const discount = product.compare_at_price
                    ? Math.round(
                        ((product.compare_at_price - product.base_price) /
                          product.compare_at_price) *
                          100
                      )
                    : 0;

                  return (
                    <button
                      key={product.id}
                      onClick={() => handleProductClick(product.slug)}
                      className="w-full flex gap-3 bg-white/5 hover:bg-white/10 rounded-lg p-3 transition-colors text-left"
                    >
                      {/* Product Image */}
                      <div className="relative w-20 h-20 bg-white/10 rounded flex-shrink-0">
                        {primaryImage ? (
                          <Image
                            src={primaryImage.image_url}
                            alt={product.name}
                            fill
                            className="object-cover rounded"
                            sizes="80px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon name="image" className="text-2xl text-brand-cream/30" />
                          </div>
                        )}
                        {discount > 0 && (
                          <div className="absolute -top-1 -right-1 bg-brand-primary text-white text-xs font-bold px-1.5 py-0.5 rounded">
                            -{discount}%
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-brand-cream font-medium text-sm mb-1 line-clamp-2">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-brand-cream font-bold">
                            {formatPrice(product.base_price)}
                          </span>
                          {product.compare_at_price && (
                            <span className="text-brand-cream/50 text-xs line-through">
                              {formatPrice(product.compare_at_price)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Arrow Icon */}
                      <div className="flex items-center">
                        <Icon name="chevron_right" className="text-brand-cream/50" />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* View All Link */}
              {results.length >= 6 && (
                <Link
                  href={`/products?search=${encodeURIComponent(query)}`}
                  onClick={toggleSearch}
                  className="block text-center mt-4 text-brand-primary hover:underline"
                >
                  View all results →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
