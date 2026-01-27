import Link from "next/link";
import { getFeaturedProducts } from "@/lib/queries/products";
import { getFeaturedCollections, getParentCollections, getParentCollectionProducts } from "@/lib/queries/collections";
import { ProductGrid } from "@/components/storefront/product/ProductGrid";
import { SaleCountdown } from "@/components/storefront/SaleCountdown";
import { HeroSection } from "@/components/storefront/HeroSection";
import { MarqueeBanner } from "@/components/storefront/MarqueeBanner";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts(8);
  const collections = await getFeaturedCollections();
  const parentCollections = await getParentCollections();

  // Get site settings
  const supabase = await createClient();

  // Get sale timer settings
  const { data: saleTimerData } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "sale_timer")
    .single();

  const saleTimer = saleTimerData?.value as { is_active: boolean; end_date: string; title: string } | null;

  // Get hero image settings
  const { data: heroData } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "hero_image")
    .single();

  const heroSettings = (heroData?.value as { image_url: string; title: string; button_text: string; button_link: string }) || {
    image_url: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=600&fit=crop",
    title: "Winter Collection",
    button_text: "Shop Now",
    button_link: "/products",
  };

  // Get marquee banner settings
  const { data: marqueeData } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "marquee_text")
    .single();

  const marqueeSettings = (marqueeData?.value as { text: string; is_active: boolean }) || {
    text: "FREE SHIPPING ON All Orders",
    is_active: true,
  };

  // Get products for each parent collection (limit to 4)
  const parentCollectionsWithProducts = await Promise.all(
    parentCollections.map(async (parent) => ({
      ...parent,
      products: await getParentCollectionProducts(parent.id, 4),
    }))
  );

  // Split collections by display_type
  const largeCollections = collections.filter(col => col.display_type === "large");
  const smallCollections = collections.filter(col => col.display_type === "small");

  return (
    <div className="pb-20 sm:pb-24 md:pb-28">
      {/* Hero Section - Dynamic */}
      <HeroSection settings={heroSettings} />

      {/* Animated Shipping Banner - Dynamic */}
      <MarqueeBanner settings={marqueeSettings} />

      {/* Countdown Timer */}
      {saleTimer?.is_active && saleTimer?.end_date && (
        <SaleCountdown endDate={saleTimer.end_date} title={saleTimer.title} />
      )}

      {/* Collections Section */}
      {collections.length > 0 && (
        <div className="bg-brand-burgundy py-6 px-4 sm:px-6 md:px-8 space-y-5">

          {/* Large Collections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {largeCollections.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.slug}`}
                className="block relative overflow-hidden group rounded-[5px]"
              >
                <img
                  src={collection.image_url || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04'}
                  alt={collection.name}
                  className="w-full h-64 md:h-96 object-cover"
                />
                <div className="absolute inset-0 flex items-end justify-center pb-6 bg-black/20 group-hover:bg-black/30 transition-colors">
                  <span className="bg-brand-cream text-brand-charcoal px-8 py-3 rounded-lg font-bold text-lg hover:bg-white transition-colors">
                    {collection.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Small Collections */}
          {smallCollections.length > 0 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {smallCollections.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.slug}`}
                  className="block relative overflow-hidden flex-shrink-0 w-40 group rounded-[5px]"
                >
                  <img
                    src={collection.image_url || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04'}
                    alt={collection.name}
                    className="w-full h-auto object-contain max-h-40"
                  />
                  <div className="absolute inset-0 flex items-end justify-center pb-3">
                    <span className="bg-brand-cream text-brand-charcoal px-4 py-1.5 rounded-lg font-bold text-xs hover:bg-white transition-colors">
                      {collection.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Parent Collections with Products */}
      {parentCollectionsWithProducts.map((parentCollection) => (
        <div key={parentCollection.id} className="bg-brand-burgundy py-4 sm:py-6 md:py-8 px-4 sm:px-6 md:px-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-brand-cream mb-4 sm:mb-6 md:mb-8">
            {parentCollection.name}
          </h2>

          {parentCollection.products.length > 0 ? (
            <>
              <ProductGrid products={parentCollection.products} />
              <div className="flex justify-center mt-6 sm:mt-8">
                <Link
                  href={`/collections/${parentCollection.slug}`}
                  className="bg-brand-cream text-brand-charcoal px-8 py-3 rounded-lg font-bold text-sm hover:bg-white transition-colors shadow-md"
                >
                  View All {parentCollection.name}
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12 sm:py-16 md:py-20">
              <p className="text-brand-cream/70 text-sm sm:text-base">
                No products available yet
              </p>
              <p className="text-brand-cream/50 text-xs sm:text-sm mt-2">
                Products will appear here once added to the collection
              </p>
            </div>
          )}
        </div>
      ))}

      {/* Fallback Featured Products (if no parent collections) */}
      {parentCollectionsWithProducts.length === 0 && (
        <div className="bg-brand-burgundy py-6 sm:py-8 md:py-10 px-4 sm:px-6 md:px-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-brand-cream mb-4 sm:mb-6 md:mb-8">
            Featured Products
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
      )}
    </div>
  );
}
