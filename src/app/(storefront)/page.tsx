import Link from "next/link";
import { getFeaturedProducts } from "@/lib/queries/products";
import { ProductGrid } from "@/components/storefront/product/ProductGrid";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts(8);

  return (
    <div className="pb-20 sm:pb-24 md:pb-28">
      {/* Free Shipping Banner */}
      <div className="bg-brand-cream py-2 sm:py-3 text-center px-4">
        <p className="text-brand-charcoal font-bold text-xs sm:text-sm tracking-wider">
          FREE SHIPPING ON All Orders
        </p>
      </div>

      {/* Hero Section */}
      <div className="relative">
        <img
          alt="Winter Collection Hero"
          className="w-full h-auto min-h-[240px] sm:min-h-[300px] md:min-h-[400px] object-cover"
          src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=600&fit=crop"
        />
        <div className="absolute inset-x-0 bottom-4 sm:bottom-6 md:bottom-8 flex justify-center px-4">
          <Link
            href="/products"
            className="bg-brand-primary text-white py-2 sm:py-2.5 md:py-3 px-6 sm:px-8 md:px-10 rounded-lg font-bold flex items-center space-x-2 shadow-lg text-sm sm:text-base hover:bg-brand-primary/90 transition-all"
          >
            <span>Shop Now</span>
            <span className="material-icons-outlined" style={{ fontSize: '20px' }}>
              arrow_forward
            </span>
          </Link>
        </div>
      </div>

      {/* Countdown Timer */}
      <div className="bg-brand-burgundy text-brand-cream py-4 sm:py-6 px-4 sm:px-6 md:px-8">
        <h2 className="text-base sm:text-lg md:text-xl font-bold tracking-wider text-center mb-3 sm:mb-4">
          SALE ENDS SOON
        </h2>
        <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 max-w-md mx-auto">
          <div className="border border-brand-muted rounded-lg p-2 sm:p-3 md:p-4">
            <p className="text-xl sm:text-2xl md:text-3xl font-bold">0</p>
            <p className="text-xs sm:text-sm mt-1">Days</p>
          </div>
          <div className="border border-brand-muted rounded-lg p-2 sm:p-3 md:p-4">
            <p className="text-xl sm:text-2xl md:text-3xl font-bold">23</p>
            <p className="text-xs sm:text-sm mt-1">Hours</p>
          </div>
          <div className="border border-brand-muted rounded-lg p-2 sm:p-3 md:p-4">
            <p className="text-xl sm:text-2xl md:text-3xl font-bold">24</p>
            <p className="text-xs sm:text-sm mt-1">Mins</p>
          </div>
          <div className="border border-brand-muted rounded-lg p-2 sm:p-3 md:p-4">
            <p className="text-xl sm:text-2xl md:text-3xl font-bold">52</p>
            <p className="text-xs sm:text-sm mt-1">Secs</p>
          </div>
        </div>
      </div>

      {/* Category Sections */}
      <div className="py-4 sm:py-6 md:py-8 px-4 sm:px-6 md:px-8 space-y-4 sm:space-y-5 md:space-y-6 bg-brand-burgundy">
        {/* Track Suits */}
        <div className="relative rounded-lg overflow-hidden shadow-lg">
          <img
            alt="Track Suits Collection"
            className="w-full h-auto min-h-[180px] sm:min-h-[220px] md:min-h-[280px] object-cover"
            src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=400&fit=crop"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          <div className="absolute inset-0 flex justify-center items-center">
            <Link
              href="/products?category=track-suits"
              className="bg-brand-cream text-brand-charcoal py-2 sm:py-2.5 md:py-3 px-6 sm:px-8 md:px-10 rounded-lg font-bold text-sm sm:text-base hover:bg-white transition-all shadow-md"
            >
              Track Suits
            </Link>
          </div>
        </div>

        {/* Blankets */}
        <div className="relative rounded-lg overflow-hidden shadow-lg">
          <img
            alt="Blankets Collection"
            className="w-full h-auto min-h-[180px] sm:min-h-[220px] md:min-h-[280px] object-cover"
            src="https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=800&h=400&fit=crop"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          <div className="absolute inset-0 flex justify-center items-center">
            <Link
              href="/products?category=blankets"
              className="bg-brand-cream text-brand-charcoal py-2 sm:py-2.5 md:py-3 px-6 sm:px-8 md:px-10 rounded-lg font-bold text-sm sm:text-base hover:bg-white transition-all shadow-md"
            >
              Blanket
            </Link>
          </div>
        </div>

        {/* Sweatpants & Sets Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
          <div className="relative rounded-lg overflow-hidden shadow-lg">
            <img
              alt="Sweatpants Collection"
              className="w-full h-auto min-h-[140px] sm:min-h-[180px] md:min-h-[220px] object-cover"
              src="https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=300&fit=crop"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            <div className="absolute inset-0 flex justify-center items-end pb-3 sm:pb-4 md:pb-5">
              <Link
                href="/products?category=sweatpants"
                className="bg-brand-cream text-brand-charcoal py-1.5 sm:py-2 md:py-2.5 px-4 sm:px-6 md:px-8 rounded-lg font-bold text-xs sm:text-sm md:text-base hover:bg-white transition-all shadow-md"
              >
                Sweatpants
              </Link>
            </div>
          </div>
          <div className="relative rounded-lg overflow-hidden shadow-lg">
            <img
              alt="Sets Collection"
              className="w-full h-auto min-h-[140px] sm:min-h-[180px] md:min-h-[220px] object-cover"
              src="https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=300&fit=crop"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            <div className="absolute inset-0 flex justify-center items-end pb-3 sm:pb-4 md:pb-5">
              <Link
                href="/products?category=sets"
                className="bg-brand-cream text-brand-charcoal py-1.5 sm:py-2 md:py-2.5 px-4 sm:px-6 md:px-8 rounded-lg font-bold text-xs sm:text-sm md:text-base hover:bg-white transition-all shadow-md"
              >
                Sets
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="bg-brand-burgundy py-6 sm:py-8 md:py-10 px-4 sm:px-6 md:px-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-brand-cream mb-4 sm:mb-6 md:mb-8">
          Winter Collection
        </h2>

        {featuredProducts.length > 0 ? (
          <ProductGrid products={featuredProducts} />
        ) : (
          <div className="text-center py-12 sm:py-16 md:py-20">
            <p className="text-brand-cream/70 text-sm sm:text-base">
              No products available yet
            </p>
            <p className="text-brand-cream/50 text-xs sm:text-sm mt-2">
              Products will appear here once added to the database
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
