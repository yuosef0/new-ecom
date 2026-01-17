import Link from "next/link";
import { getFeaturedProducts } from "@/lib/queries/products";
import { getFeaturedCollections } from "@/lib/queries/collections";
import { ProductGrid } from "@/components/storefront/product/ProductGrid";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts(8);
  const collections = await getFeaturedCollections();

  // Split collections by display_type
  const largeCollections = collections.filter(col => col.display_type === "large");
  const smallCollections = collections.filter(col => col.display_type === "small");

  return (
    <div className="pb-20 sm:pb-24 md:pb-28">
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

      {/* Animated Shipping Banner */}
      <div className="bg-brand-primary overflow-hidden py-2 sm:py-3">
        <div className="animate-marquee whitespace-nowrap">
          <span className="text-white font-bold text-xs sm:text-sm tracking-wider mx-8">
            FREE SHIPPING ON All Orders
          </span>
          <span className="text-white font-bold text-xs sm:text-sm tracking-wider mx-8">
            FREE SHIPPING ON All Orders
          </span>
          <span className="text-white font-bold text-xs sm:text-sm tracking-wider mx-8">
            FREE SHIPPING ON All Orders
          </span>
          <span className="text-white font-bold text-xs sm:text-sm tracking-wider mx-8">
            FREE SHIPPING ON All Orders
          </span>
          <span className="text-white font-bold text-xs sm:text-sm tracking-wider mx-8">
            FREE SHIPPING ON All Orders
          </span>
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

      {/* Collections Section */}
      {collections.length > 0 && (
        <div className="bg-brand-burgundy py-6 px-4 sm:px-6 md:px-8 space-y-5">

          {/* Large Collections */}
          {largeCollections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.slug}`}
              className="block relative rounded-lg overflow-hidden h-64 group"
              style={{
                backgroundImage: `url(${collection.image_url || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-brand-cream text-brand-charcoal px-8 py-3 rounded-lg font-bold text-lg hover:bg-white transition-colors">
                  {collection.name}
                </span>
              </div>
            </Link>
          ))}

          {/* Small Collections */}
          {smallCollections.length > 0 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {smallCollections.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.slug}`}
                  className="block relative rounded-lg overflow-hidden flex-shrink-0 w-48 h-48 group"
                  style={{
                    backgroundImage: `url(${collection.image_url || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all"></div>
                  <div className="absolute inset-0 flex items-end justify-center pb-4">
                    <span className="bg-brand-cream text-brand-charcoal px-6 py-2 rounded-lg font-bold text-sm hover:bg-white transition-colors">
                      {collection.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

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
