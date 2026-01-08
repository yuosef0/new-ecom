import Link from "next/link";
import { getFeaturedProducts } from "@/lib/queries/products";
import { ProductGrid } from "@/components/storefront/product/ProductGrid";
import { Header } from "@/components/storefront/layout/Header";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts(8);

  return (
    <>
      <Header />
      <div className="px-4 pt-6">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-cream mb-2">
            Winter Collection
          </h1>
          <p className="text-brand-cream/80 text-sm">
            Discover our latest premium fashion pieces
          </p>
        </div>

        {/* Featured Products */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-brand-cream">
              Featured Products
            </h2>
            <Link
              href="/products"
              className="text-sm text-brand-primary hover:underline"
            >
              View All
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <ProductGrid products={featuredProducts} />
          ) : (
            <div className="text-center py-12">
              <p className="text-brand-cream/70 text-sm">
                No products available yet
              </p>
              <p className="text-brand-cream/50 text-xs mt-2">
                Products will appear here once added to the database
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
