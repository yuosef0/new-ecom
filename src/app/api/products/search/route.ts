import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  collection: z.string().optional(),
  min_price: z.coerce.number().optional(),
  max_price: z.coerce.number().optional(),
  in_stock: z.coerce.boolean().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "name"]).optional().default("newest"),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(50).optional().default(20),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = searchSchema.safeParse(searchParams);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid parameters",
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const { q, category, collection, min_price, max_price, in_stock, sort, page, limit } =
      parsed.data;

    const supabase = await createClient();

    // Build query
    let query = supabase
      .from("products")
      .select(
        `
        id,
        name,
        slug,
        base_price,
        compare_at_price,
        product_images!inner(url, alt_text, is_primary),
        categories(name, slug)
      `,
        { count: "exact" }
      )
      .eq("is_active", true);

    // Search query
    if (q) {
      query = query.textSearch("name", q, { type: "websearch" });
    }

    // Category filter
    if (category) {
      query = query.eq("categories.slug", category);
    }

    // Collection filter
    if (collection) {
      // Need to join through product_collections
      const { data: collectionData } = await supabase
        .from("collections")
        .select("id")
        .eq("slug", collection)
        .single();

      if (collectionData) {
        const { data: productIds } = await supabase
          .from("product_collections")
          .select("product_id")
          .eq("collection_id", collectionData.id);

        if (productIds && productIds.length > 0) {
          query = query.in(
            "id",
            productIds.map((p) => p.product_id)
          );
        } else {
          // No products in collection
          return NextResponse.json({
            products: [],
            pagination: {
              page,
              limit,
              total: 0,
              total_pages: 0,
            },
          });
        }
      }
    }

    // Price filter
    if (min_price !== undefined) {
      query = query.gte("base_price", min_price);
    }
    if (max_price !== undefined) {
      query = query.lte("base_price", max_price);
    }

    // Sorting
    switch (sort) {
      case "price_asc":
        query = query.order("base_price", { ascending: true });
        break;
      case "price_desc":
        query = query.order("base_price", { ascending: false });
        break;
      case "name":
        query = query.order("name", { ascending: true });
        break;
      case "newest":
      default:
        query = query.order("created_at", { ascending: false });
        break;
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error searching products:", error);
      return NextResponse.json(
        { error: "Failed to search products" },
        { status: 500 }
      );
    }

    // Format response
    const products = data.map((product: any) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      base_price: product.base_price,
      compare_at_price: product.compare_at_price,
      primary_image:
        product.product_images?.find((img: any) => img.is_primary)?.url ||
        product.product_images?.[0]?.url ||
        null,
      category: product.categories,
      in_stock: true, // TODO: Check variants
    }));

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
      },
    });
  } catch (error) {
    console.error("Error in product search:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
