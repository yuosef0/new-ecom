import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/queries/products";
import { ProductDetail } from "@/components/storefront/product/ProductDetail";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Get recommended products (same category)
  const recommendedProducts = await getProducts({
    categorySlug: product.category?.slug,
    limit: 4,
  });

  // Filter out current product
  const filteredRecommended = recommendedProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 2);

  return <ProductDetail product={product} recommendedProducts={filteredRecommended} />;
}

