import { getProducts } from "@/lib/queries/products";
import { ProductGrid } from "@/components/storefront/product/ProductGrid";
import { Header } from "@/components/storefront/layout/Header";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await getProducts({ limit: 20 });

  return (
    <>
      <Header />
      <div className="px-4 pt-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-brand-cream">All Products</h1>
          <p className="text-brand-cream/70 text-sm mt-1">
            {products.length} {products.length === 1 ? "product" : "products"}
          </p>
        </div>

        {/* Filter Bar - Simplified for now */}
        <div className="mb-6 flex items-center justify-between">
          <button className="px-4 py-2 bg-white/10 text-brand-cream rounded-md text-sm flex items-center space-x-2">
            <span className="material-icons-outlined text-sm">tune</span>
            <span>Filters</span>
          </button>

          <select className="px-4 py-2 bg-white/10 text-brand-cream rounded-md text-sm border-0">
            <option>Newest</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
        </div>

        {/* Product Grid */}
        <ProductGrid products={products} />
      </div>
    </>
  );
}
