import { getProducts } from "@/lib/queries/products";
import { ProductGrid } from "@/components/storefront/product/ProductGrid";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface ProductsPageProps {
  searchParams: Promise<{ category?: string; search?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const categorySlug = params.category;
  const searchQuery = params.search;

  const products = await getProducts({
    categorySlug,
    search: searchQuery,
    limit: 50
  });

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
          {products.length} {products.length === 1 ? "product" : "products"}
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

      {/* Filter Bar - Simplified for now */}
      <div className="mb-6 flex items-center justify-between">
        <button className="px-3 py-2 sm:px-4 sm:py-2.5 bg-white/10 text-brand-cream rounded-md text-xs sm:text-sm flex items-center space-x-2 hover:bg-white/20 transition-colors">
          <span className="material-icons-outlined text-sm sm:text-base">tune</span>
          <span>Filters</span>
        </button>

        <select className="px-3 py-2 sm:px-4 sm:py-2.5 bg-white/10 text-brand-cream rounded-md text-xs sm:text-sm border-0 hover:bg-white/20 transition-colors">
          <option>Newest</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
        </select>
      </div>

      {/* Product Grid */}
      {products.length > 0 ? (
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
              : "There are no products available yet."}
          </p>
          {categorySlug && (
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-brand-primary text-white rounded-lg font-bold text-sm hover:bg-brand-dark transition-colors"
            >
              <span>View All Products</span>
              <span className="material-icons-outlined ml-2 text-base">arrow_forward</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
