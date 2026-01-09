import Link from "next/link";
import { getFeaturedProducts } from "@/lib/queries/products";
import { ProductGrid } from "@/components/storefront/product/ProductGrid";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts(8);

  return (
    <div className="pb-24">
      {/* Free Shipping Banner */}
      <div className="bg-brand-cream py-2 text-center">
        <p className="text-brand-charcoal font-bold text-xs tracking-wider">
          FREE SHIPPING ON All Orders
        </p>
      </div>

      {/* Hero Section */}
      <div className="relative">
        <img
          alt="Winter Collection Hero"
          className="w-full h-auto"
          src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=600&fit=crop"
        />
        <div className="absolute inset-x-0 bottom-6 flex justify-center">
          <Link
            href="/products"
            className="bg-brand-primary text-white py-2 px-8 rounded-lg font-bold flex items-center space-x-2 shadow-lg text-sm"
          >
            <span>Shop Now</span>
            <span className="material-icons-outlined" style={{ fontSize: '20px' }}>
              arrow_forward
            </span>
          </Link>
        </div>
      </div>

      {/* Countdown Timer */}
      <div className="bg-brand-burgundy text-brand-cream p-4">
        <h2 className="text-lg font-bold tracking-wider text-center mb-4">
          SALE ENDS SOON
        </h2>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="border border-brand-muted rounded-lg p-2">
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs">Days</p>
          </div>
          <div className="border border-brand-muted rounded-lg p-2">
            <p className="text-2xl font-bold">23</p>
            <p className="text-xs">Hours</p>
          </div>
          <div className="border border-brand-muted rounded-lg p-2">
            <p className="text-2xl font-bold">24</p>
            <p className="text-xs">Mins</p>
          </div>
          <div className="border border-brand-muted rounded-lg p-2">
            <p className="text-2xl font-bold">52</p>
            <p className="text-xs">Secs</p>
          </div>
        </div>
      </div>

      {/* Category Sections */}
      <div className="p-4 space-y-4 bg-brand-burgundy">
        {/* Track Suits */}
        <div className="relative rounded-lg overflow-hidden">
          <img
            alt="Track Suits Collection"
            className="w-full h-auto"
            src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=400&fit=crop"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          <div className="absolute inset-0 flex justify-center items-center">
            <Link
              href="/products?category=track-suits"
              className="bg-brand-cream text-brand-charcoal py-2 px-6 rounded-lg font-bold text-sm hover:bg-white transition-colors"
            >
              Track Suits
            </Link>
          </div>
        </div>

        {/* Blankets */}
        <div className="relative rounded-lg overflow-hidden">
          <img
            alt="Blankets Collection"
            className="w-full h-auto"
            src="https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=800&h=400&fit=crop"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          <div className="absolute inset-0 flex justify-center items-center">
            <Link
              href="/products?category=blankets"
              className="bg-brand-cream text-brand-charcoal py-2 px-6 rounded-lg font-bold text-sm hover:bg-white transition-colors"
            >
              Blanket
            </Link>
          </div>
        </div>

        {/* Sweatpants & Sets Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative rounded-lg overflow-hidden">
            <img
              alt="Sweatpants Collection"
              className="w-full h-auto"
              src="https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=300&fit=crop"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            <div className="absolute inset-0 flex justify-center items-end pb-4">
              <Link
                href="/products?category=sweatpants"
                className="bg-brand-cream text-brand-charcoal py-2 px-6 rounded-lg font-bold text-sm hover:bg-white transition-colors"
              >
                Sweatpants
              </Link>
            </div>
          </div>
          <div className="relative rounded-lg overflow-hidden">
            <img
              alt="Sets Collection"
              className="w-full h-auto"
              src="https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=300&fit=crop"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            <div className="absolute inset-0 flex justify-center items-end pb-4">
              <Link
                href="/products?category=sets"
                className="bg-brand-cream text-brand-charcoal py-2 px-6 rounded-lg font-bold text-sm hover:bg-white transition-colors"
              >
                Sets
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="bg-brand-burgundy p-4">
        <h2 className="text-2xl font-bold text-center text-brand-cream mb-4">
          Winter Collection
        </h2>

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
  );
}
