"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/storefront/product/ProductGrid";
import { ProductFilters } from "@/components/storefront/product/ProductFilters";
import { Icon } from "@/components/storefront/ui/Icon";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { ProductWithImages } from "@/lib/queries/products";

interface FilterState {
  minPrice: number | null;
  maxPrice: number | null;
  categories: string[];
}

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name';

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ProductWithImages[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    minPrice: null,
    maxPrice: null,
    categories: []
  });

  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const categorySlug = searchParams.get('category') || undefined;
  const searchQuery = searchParams.get('search') || undefined;

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      const supabase = createClient();

      let query = supabase
        .from("products")
        .select(
          `
          *,
          product_images(url, alt_text, is_primary, sort_order),
          categories!inner(name, slug),
          product_variants(id, stock_quantity, sizes(id, name))
        `
        )
        .eq("is_active", true);

      // Apply category filter from URL
      if (categorySlug) {
        query = query.eq("categories.slug", categorySlug);
      }

      // Apply category filters from filter panel
      if (filters.categories.length > 0) {
        query = query.in("categories.slug", filters.categories);
      }

      // Apply price filters
      if (filters.minPrice !== null) {
        query = query.gte("base_price", filters.minPrice);
      }
      if (filters.maxPrice !== null) {
        query = query.lte("base_price", filters.maxPrice);
      }

      // Apply search
      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      // Apply sorting
      switch (sortBy) {
        case 'price-asc':
          query = query.order("base_price", { ascending: true });
          break;
        case 'price-desc':
          query = query.order("base_price", { ascending: false });
          break;
        case 'name':
          query = query.order("name", { ascending: true });
          break;
        case 'newest':
        default:
          query = query.order("created_at", { ascending: false });
          break;
      }

      query = query.limit(50);

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } else if (data) {
        const mappedProducts = data.map((product: any) => ({
          ...product,
          primary_image: product.product_images?.find((img: any) => img.is_primary)?.url || product.product_images?.[0]?.url || null,
          images: product.product_images || [],
          category: product.categories,
          variants: product.product_variants?.map((v: any) => ({
            id: v.id,
            stock_quantity: v.stock_quantity,
            size: v.sizes
          })) || [],
          in_stock: true,
        }));
        setProducts(mappedProducts);
      }

      setIsLoading(false);
    };

    fetchProducts();
  }, [categorySlug, searchQuery, filters, sortBy]);

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const activeFilterCount =
    (filters.minPrice !== null ? 1 : 0) +
    (filters.maxPrice !== null ? 1 : 0) +
    filters.categories.length;

  // Format category name for display
  const getCategoryName = (slug?: string) => {
    if (!slug) return "All Products";
    return slug
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const pageTitle = getCategoryName(categorySlug);

  return (
    <div className="px-4 sm:px-6 py-4 sm:py-6 pb-24">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-cream">{pageTitle}</h1>
        <p className="text-brand-cream/70 text-sm sm:text-base mt-1">
          {isLoading ? "Loading..." : `${products.length} ${products.length === 1 ? "product" : "products"}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      </div>

      {/* Back to All Products Link */}
      {categorySlug && (
        <div className="mb-4">
          <Link
            href="/products"
            className="inline-flex items-center text-brand-cream/70 hover:text-brand-cream text-sm transition-colors"
          >
            <span className="material-icons-outlined text-base mr-1">arrow_back</span>
            <span>View All Products</span>
          </Link>
        </div>
      )}

      {/* Filter Bar */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <button
          onClick={() => setIsFilterOpen(true)}
          className="px-3 py-2 sm:px-4 sm:py-2.5 bg-white/10 text-brand-cream rounded-md text-xs sm:text-sm flex items-center space-x-2 hover:bg-white/20 transition-colors relative"
        >
          <Icon name="tune" className="text-sm sm:text-base" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-brand-primary text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="px-3 py-2 sm:px-4 sm:py-2.5 bg-white/10 text-brand-cream rounded-md text-xs sm:text-sm border-0 hover:bg-white/20 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary"
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name">Name: A-Z</option>
        </select>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin h-12 w-12 border-4 border-brand-primary border-t-transparent rounded-full mb-4"></div>
          <p className="text-brand-cream/50">Loading products...</p>
        </div>
      ) : products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <div className="text-center py-12 sm:py-16">
          <div className="mb-4">
            <span className="material-icons-outlined text-6xl text-brand-cream/30">
              inventory_2
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-brand-cream mb-2">
            No Products Found
          </h2>
          <p className="text-brand-cream/70 text-sm sm:text-base mb-6">
            {categorySlug
              ? `There are no products in the ${pageTitle} category yet.`
              : activeFilterCount > 0
                ? "No products match your filters. Try adjusting your criteria."
                : "There are no products available yet."}
          </p>
          {(categorySlug || activeFilterCount > 0) && (
            <Link
              href="/products"
              onClick={() => setFilters({ minPrice: null, maxPrice: null, categories: [] })}
              className="inline-flex items-center px-6 py-3 bg-brand-primary text-white rounded-lg font-bold text-sm hover:bg-brand-dark transition-colors"
            >
              <span>View All Products</span>
              <span className="material-icons-outlined ml-2 text-base">arrow_forward</span>
            </Link>
          )}
        </div>
      )}

      {/* Filter Overlay */}
      <ProductFilters
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApply={handleApplyFilters}
      />
    </div>
  );
}
