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
  images: Array<{ url: string; is_primary: boolean }>;
  category?: { name: string; slug: string };
  type: 'product' | 'category';
}

export function SearchOverlay() {
  const router = useRouter();
  const { searchOpen, toggleSearch } = useUIStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Handle Mount/Unmount Animations
  useEffect(() => {
    if (searchOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        setIsVisible(true);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      });
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setQuery("");
        setResults([]);
      }, 300);
      return () => clearTimeout(timer);
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

    // Search products
    const { data: products } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        slug,
        base_price,
        compare_at_price,
        images:product_images(url, is_primary),
        category:categories(name, slug)
      `
      )
      .eq("is_active", true)
      .ilike("name", `%${searchQuery}%`)
      .limit(4);

    // Search categories
    const { data: categories } = await supabase
      .from("categories")
      .select("id, name, slug")
      .eq("is_active", true)
      .ilike("name", `%${searchQuery}%`)
      .limit(2);

    const results: SearchResult[] = [];

    // Add categories first
    if (categories) {
      categories.forEach((cat) => {
        results.push({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          base_price: 0,
          compare_at_price: null,
          images: [],
          type: 'category',
        });
      });
    }

    // Add products
    if (products) {
      products.forEach((prod: any) => {
        results.push({
          ...prod,
          type: 'product',
        });
      });
    }

    setResults(results);
  };

  const handleResultClick = (result: SearchResult) => {
    toggleSearch();
    // Animation handles exit

    if (result.type === 'category') {
      router.push(`/products?category=${result.slug}`);
    } else {
      router.push(`/products/${result.slug}`);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
  };

  if (!shouldRender) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40 transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"
          }`}
        onClick={toggleSearch}
      />

      {/* Search Overlay */}
      <div
        className={`fixed inset-x-0 top-0 bg-brand-burgundy text-brand-cream z-50 max-h-screen flex flex-col shadow-2xl transition-all duration-300 ease-in-out ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-50"
          }`}
      >
        {/* Search Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="flex-1 relative group">
              <Icon
                name="search"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-cream/50 transition-colors group-focus-within:text-brand-primary"
              />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-lg text-brand-cream placeholder:text-brand-cream/50 focus:outline-none focus:border-brand-primary focus:bg-white/15 transition-all shadow-sm"
              />
              {query && (
                <button
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10"
                >
                  <Icon name="close" className="text-brand-cream/70 hover:text-brand-cream" />
                </button>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={toggleSearch}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors hover:rotate-90 duration-300"
            >
              <Icon name="close" className="text-2xl" />
            </button>
          </div>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto max-h-[80vh]">
          {/* Loading State */}
          {isSearching && (
            <div className="p-8 text-center animate-pulse">
              <div className="text-brand-cream/70">Searching...</div>
            </div>
          )}

          {/* No Query State */}
          {!query && !isSearching && (
            <div className="p-8 text-center">
              <Icon name="search" className="text-6xl text-brand-cream/30 mb-4 animate-bounce-slow" />
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
                {results.map((result) => {
                  if (result.type === 'category') {
                    return (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        className="w-full flex gap-3 bg-brand-primary/20 hover:bg-brand-primary/30 rounded-lg p-3 transition-colors text-left border border-brand-primary/30 hover:shadow-md transform hover:-translate-y-0.5 duration-200"
                      >
                        {/* Category Icon */}
                        <div className="w-20 h-20 bg-brand-primary/20 rounded flex-shrink-0 flex items-center justify-center">
                          <Icon name="category" className="text-3xl text-brand-cream" />
                        </div>

                        {/* Category Info */}
                        <div className="flex-1 min-w-0 flex items-center">
                          <div>
                            <p className="text-xs text-brand-cream/70 mb-1">Category</p>
                            <h3 className="text-brand-cream font-bold text-sm">
                              {result.name}
                            </h3>
                          </div>
                        </div>

                        {/* Arrow Icon */}
                        <div className="flex items-center">
                          <Icon name="chevron_right" className="text-brand-cream/50" />
                        </div>
                      </button>
                    );
                  }

                  // Product result
                  const primaryImage =
                    result.images.find((img) => img.is_primary) || result.images[0];
                  const discount = result.compare_at_price
                    ? Math.round(
                      ((result.compare_at_price - result.base_price) /
                        result.compare_at_price) *
                      100
                    )
                    : 0;

                  return (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full flex gap-3 bg-white/5 hover:bg-white/10 rounded-lg p-3 transition-colors text-left hover:shadow-md transform hover:-translate-y-0.5 duration-200"
                    >
                      {/* Product Image */}
                      <div className="relative w-20 h-20 bg-white/10 rounded flex-shrink-0 overflow-hidden">
                        {primaryImage ? (
                          <Image
                            src={primaryImage.url}
                            alt={result.name}
                            fill
                            className="object-cover transition-transform hover:scale-110 duration-500"
                            sizes="80px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon name="image" className="text-2xl text-brand-cream/30" />
                          </div>
                        )}
                        {discount > 0 && (
                          <div className="absolute -top-1 -right-1 bg-brand-primary text-white text-xs font-bold px-1.5 py-0.5 rounded shadow-sm z-10">
                            -{discount}%
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-brand-cream font-medium text-sm mb-1 line-clamp-2">
                          {result.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-brand-cream font-bold">
                            {formatPrice(result.base_price)}
                          </span>
                          {result.compare_at_price && (
                            <span className="text-brand-cream/50 text-xs line-through">
                              {formatPrice(result.compare_at_price)}
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
