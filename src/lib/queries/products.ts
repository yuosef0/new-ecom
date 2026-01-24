import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/database";

export interface ProductWithImages extends Product {
  primary_image?: string | null;
  images?: Array<{ url: string; alt_text: string | null }>;
  category?: { name: string; slug: string } | null;
  in_stock?: boolean;
  variants?: Array<{
    id: string;
    sku?: string | null;
    price_adjustment?: number;
    stock_quantity?: number;
    size?: { id: string; name: string } | null;
    color?: { id: string; name: string; hex_code: string } | null;
  }>;
}

export interface ProductDetailWithVariants extends ProductWithImages { }

/**
 * Get featured products for homepage
 */
export async function getFeaturedProducts(limit: number = 8): Promise<ProductWithImages[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      product_images!inner(url, alt_text, is_primary),
      categories(name, slug),
      product_variants(id, stock_quantity, sizes(id, name))
    `
    )
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }

  return data.map((product: any) => ({
    ...product,
    primary_image: product.product_images?.find((img: any) => img.is_primary)?.url || product.product_images?.[0]?.url || null,
    images: product.product_images || [],
    category: product.categories,
    variants: product.product_variants?.map((v: any) => ({
      id: v.id,
      stock_quantity: v.stock_quantity,
      size: v.sizes
    })) || [],
    in_stock: true, // TODO: Calculate from variants
  }));
}

/**
 * Get all products with optional filtering
 */
export async function getProducts(params?: {
  categorySlug?: string;
  collectionSlug?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<ProductWithImages[]> {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(
      `
      *,
      product_images(url, alt_text, is_primary, sort_order),
      categories!inner(name, slug),
      product_variants(id, stock_quantity, sizes(id, name))
    `
    )
    .eq("is_active", true);

  // Filter by category
  if (params?.categorySlug) {
    query = query.eq("categories.slug", params.categorySlug);
  }

  // Search
  if (params?.search) {
    query = query.ilike("name", `%${params.search}%`);
  }

  // Pagination
  const limit = params?.limit || 20;
  const offset = params?.offset || 0;
  query = query.range(offset, offset + limit - 1);

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  // If no data and we have category filter, return empty array
  if (!data) {
    return [];
  }

  return data.map((product: any) => ({
    ...product,
    primary_image: product.product_images?.find((img: any) => img.is_primary)?.url || product.product_images?.[0]?.url || null,
    images: product.product_images || [],
    category: product.categories,
    variants: product.product_variants?.map((v: any) => ({
      id: v.id,
      stock_quantity: v.stock_quantity,
      size: v.sizes
    })) || [],
    in_stock: true,
  }));
}

/**
 * Get a single product by slug with all details
 */
export async function getProductBySlug(slug: string): Promise<ProductDetailWithVariants | null> {
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select(
      `
      *,
      product_images(url, alt_text, is_primary, sort_order),
      categories(name, slug),
      product_variants(
        id,
        sku,
        price_adjustment,
        stock_quantity,
        is_active,
        sizes(id, name),
        colors(id, name, hex_code)
      )
    `
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !product) {
    console.error("Error fetching product:", error);
    return null;
  }

  return {
    ...product,
    primary_image: product.product_images?.find((img: any) => img.is_primary)?.url || product.product_images?.[0]?.url || null,
    images: product.product_images?.sort((a: any, b: any) => a.sort_order - b.sort_order) || [],
    category: product.categories,
    variants: product.product_variants
      ?.filter((v: any) => v.is_active)
      .map((v: any) => ({
        id: v.id,
        sku: v.sku,
        price_adjustment: v.price_adjustment,
        stock_quantity: v.stock_quantity,
        size: v.sizes,
        color: v.colors,
      })),
    in_stock: product.product_variants?.some((v: any) => v.stock_quantity > 0) || false,
  };
}

/**
 * Get categories
 */
export async function getCategories() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return data;
}
