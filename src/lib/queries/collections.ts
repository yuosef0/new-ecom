import { createClient } from "@/lib/supabase/server";
import type { Collection } from "@/types/database";
import type { ProductWithImages } from "./products";

/**
 * Get all active collections
 */
export async function getCollections(): Promise<Collection[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("is_active", true)
    .order("display_type", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching collections:", error);
    return [];
  }

  return data;
}

/**
 * Get featured collections
 */
export async function getFeaturedCollections(): Promise<Collection[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("display_type", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching featured collections:", error);
    return [];
  }

  return data;
}

/**
 * Get collection by slug
 */
export async function getCollectionBySlug(
  slug: string
): Promise<Collection | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("Error fetching collection:", error);
    return null;
  }

  return data;
}

/**
 * Get products in a collection
 */
export async function getCollectionProducts(
  collectionId: string
): Promise<ProductWithImages[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("product_collections")
    .select(
      `
      products!inner(
        *,
        product_images(url, alt_text, is_primary, sort_order),
        categories(name, slug)
      )
    `
    )
    .eq("collection_id", collectionId)
    .eq("products.is_active", true);

  if (error) {
    console.error("Error fetching collection products:", error);
    return [];
  }

  return data.map((item: any) => {
    const product = item.products;
    return {
      ...product,
      primary_image:
        product.product_images?.find((img: any) => img.is_primary)?.url ||
        product.product_images?.[0]?.url ||
        null,
      images: product.product_images || [],
      category: product.categories,
      in_stock: true,
    };
  });
}
