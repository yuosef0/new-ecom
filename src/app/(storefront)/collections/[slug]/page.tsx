import { getCollectionBySlug, getCollectionProducts, getParentCollectionProducts } from "@/lib/queries/collections";
import { ProductGrid } from "@/components/storefront/product/ProductGrid";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  // Check if this is a parent collection (has child collections)
  const supabase = await createClient();
  const { data: childCollections } = await supabase
    .from("collections")
    .select("id, name, slug")
    .eq("parent_id", collection.id)
    .eq("is_active", true);

  // If it's a parent collection, get products from all child collections
  // Otherwise, get products from this collection directly
  const products = childCollections && childCollections.length > 0
    ? await getParentCollectionProducts(collection.id)
    : await getCollectionProducts(collection.id);

  const hasChildren = childCollections && childCollections.length > 0;

  return (
    <div className="px-4 sm:px-6 py-4 sm:py-6 pb-24">
      {/* Back Link */}
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center text-brand-cream/70 hover:text-brand-cream text-sm transition-colors"
        >
          <span className="material-icons-outlined text-base mr-1">arrow_back</span>
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Collection Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-cream">{collection.name}</h1>
        {collection.description && (
          <p className="text-brand-cream/70 text-sm sm:text-base mt-2">
            {collection.description}
          </p>
        )}
        <p className="text-brand-cream/70 text-sm sm:text-base mt-1">
          {products.length} {products.length === 1 ? "product" : "products"}
        </p>
      </div>

      {/* Collection Image */}
      {collection.image_url && (
        <div className="mb-6 rounded-lg overflow-hidden">
          <img
            src={collection.image_url}
            alt={collection.name}
            className="w-full h-auto max-h-[300px] object-cover"
          />
        </div>
      )}

      {/* Child Collections (if parent) */}
      {hasChildren && childCollections && childCollections.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-brand-cream mb-4">Shop by Category</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {childCollections.map((child) => (
              <Link
                key={child.id}
                href={`/collections/${child.slug}`}
                className="flex-shrink-0 px-4 py-2 bg-brand-cream/10 hover:bg-brand-cream/20 text-brand-cream rounded-lg text-sm font-semibold transition-colors border border-brand-muted"
              >
                {child.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid */}
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
            No Products Yet
          </h2>
          <p className="text-brand-cream/70 text-sm sm:text-base mb-6">
            This collection doesn't have any products yet. Check back soon!
          </p>
          <Link
            href="/products"
            className="inline-flex items-center px-6 py-3 bg-brand-primary text-white rounded-lg font-bold text-sm hover:bg-brand-dark transition-colors"
          >
            <span>Browse All Products</span>
            <span className="material-icons-outlined ml-2 text-base">arrow_forward</span>
          </Link>
        </div>
      )}
    </div>
  );
}
