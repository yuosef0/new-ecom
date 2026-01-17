import Link from "next/link";
import Image from "next/image";
import { getFeaturedProducts } from "@/lib/queries/products";
import { getFeaturedCollections } from "@/lib/queries/collections";
import { ProductGrid } from "@/components/storefront/product/ProductGrid";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts(8);
  const collections = await getFeaturedCollections();

  // Debug: Log collections to check image_url
  console.log('=== DEBUG: Collections ===');
  collections.forEach((col, index) => {
    console.log(`Collection ${index + 1}:`, {
      name: col.name,
      slug: col.slug,
      image_url: col.image_url,
      has_image: !!col.image_url,
      display_type: col.display_type,
      is_featured: col.is_featured
    });
  });
  console.log('=========================');

  // Split collections by display_type
  const largeCollections = collections.filter(col => col.display_type === "large");
  const scrollableCollections = collections.filter(col => col.display_type === "small");

  // Default fallback image
  const defaultImage = "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=600&fit=crop";

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

      {/* Collections Sections */}
      {collections.length > 0 && (
        <div className="py-4 sm:py-6 md:py-8 px-4 sm:px-6 md:px-8 space-y-4 sm:space-y-5 md:space-y-6 bg-brand-burgundy">
          {/* DEBUG INFO - Remove after fixing */}
          <div className="bg-yellow-100 border-2 border-yellow-500 p-4 rounded-lg text-black text-xs">
            <h3 className="font-bold mb-2">🐛 DEBUG: Collections Status</h3>
            {collections.map((col, idx) => (
              <div key={idx} className="mb-1">
                <strong>{col.name}:</strong> {col.image_url ? `✅ Has image (${col.image_url.substring(0, 50)}...)` : '❌ No image'}
              </div>
            ))}
          </div>

          {/* Large Collections - Full Width Cards */}
          {largeCollections.map((collection) => (
            <div key={collection.id} className="relative rounded-lg overflow-hidden shadow-lg h-[180px] sm:h-[220px] md:h-[280px] bg-black">
              {collection.image_url && (
                <>
                  <Image
                    alt={collection.name}
                    className="object-cover"
                    src={collection.image_url}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                </>
              )}
              <div className="absolute inset-0 flex justify-center items-center">
                <Link
                  href={`/collections/${collection.slug}`}
                  className="bg-brand-cream text-brand-charcoal py-2 sm:py-2.5 md:py-3 px-6 sm:px-8 md:px-10 rounded-lg font-bold text-sm sm:text-base hover:bg-white transition-all shadow-md"
                >
                  {collection.name}
                </Link>
              </div>
            </div>
          ))}

          {/* Small Collections - Horizontal Scrollable */}
          {scrollableCollections.length > 0 && (
            <div className="flex gap-3 sm:gap-4 md:gap-5 overflow-x-auto no-scrollbar pb-2 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8">
              {scrollableCollections.map((collection) => (
                <div key={collection.id} className="relative rounded-lg overflow-hidden shadow-lg flex-shrink-0 w-[45%] sm:w-[48%] md:w-[30%] h-[140px] sm:h-[180px] md:h-[220px] bg-black">
                  {collection.image_url && (
                    <>
                      <Image
                        alt={collection.name}
                        className="object-cover"
                        src={collection.image_url}
                        fill
                        sizes="(max-width: 640px) 45vw, (max-width: 768px) 48vw, 30vw"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                    </>
                  )}
                  <div className="absolute inset-0 flex justify-center items-end pb-3 sm:pb-4 md:pb-5">
                    <Link
                      href={`/collections/${collection.slug}`}
                      className="bg-brand-cream text-brand-charcoal py-1.5 sm:py-2 md:py-2.5 px-4 sm:px-6 md:px-8 rounded-lg font-bold text-xs sm:text-sm md:text-base hover:bg-white transition-all shadow-md"
                    >
                      {collection.name}
                    </Link>
                  </div>
                </div>
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
