import { createClient } from "@/lib/supabase/server";
import type { CartItem, CartItemWithProduct } from "@/types/cart";

/**
 * Validate cart items and get full product details with current prices
 */
export async function validateCartItems(
  items: Omit<CartItem, "id">[]
): Promise<{
  valid: boolean;
  items: CartItemWithProduct[];
  subtotal: number;
  errors: Array<{
    productId: string;
    variantId: string | null;
    error: "not_found" | "out_of_stock" | "insufficient_stock" | "inactive";
  }>;
}> {
  const supabase = await createClient();
  const validatedItems: CartItemWithProduct[] = [];
  const errors: any[] = [];

  for (const item of items) {
    // Get product details
    const { data: product, error: productError } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        slug,
        base_price,
        compare_at_price,
        is_active,
        product_images!inner(url, alt_text, is_primary)
      `
      )
      .eq("id", item.productId)
      .eq("is_active", true)
      .single();

    if (productError || !product) {
      errors.push({
        productId: item.productId,
        variantId: item.variantId,
        error: "not_found",
      });
      continue;
    }

    if (!product.is_active) {
      errors.push({
        productId: item.productId,
        variantId: item.variantId,
        error: "inactive",
      });
      continue;
    }

    let variantData = null;

    // If variant specified, get variant details
    if (item.variantId) {
      const { data: variant, error: variantError } = await supabase
        .from("product_variants")
        .select(
          `
          id,
          price_adjustment,
          stock_quantity,
          is_active,
          sizes(id, name),
          colors(id, name, hex_code)
        `
        )
        .eq("id", item.variantId)
        .eq("product_id", item.productId)
        .eq("is_active", true)
        .single();

      if (variantError || !variant) {
        errors.push({
          productId: item.productId,
          variantId: item.variantId,
          error: "not_found",
        });
        continue;
      }

      if (variant.stock_quantity === 0) {
        errors.push({
          productId: item.productId,
          variantId: item.variantId,
          error: "out_of_stock",
        });
        continue;
      }

      if (variant.stock_quantity < item.quantity) {
        errors.push({
          productId: item.productId,
          variantId: item.variantId,
          error: "insufficient_stock",
        });
        continue;
      }

      const sizeData = Array.isArray(variant.sizes) ? variant.sizes[0] : variant.sizes;
      const colorData = Array.isArray(variant.colors) ? variant.colors[0] : variant.colors;

      variantData = {
        size_name: sizeData?.name || null,
        color_name: colorData?.name || null,
        color_hex: colorData?.hex_code || null,
        price_adjustment: variant.price_adjustment,
        stock_quantity: variant.stock_quantity,
      };
    }

    validatedItems.push({
      id: crypto.randomUUID(),
      ...item,
      product: {
        name: product.name,
        slug: product.slug,
        base_price: product.base_price,
        compare_at_price: product.compare_at_price,
        images: product.product_images.map((img: any) => ({
          url: img.url,
          alt_text: img.alt_text,
        })),
      },
      variant: variantData,
    });
  }

  // Calculate subtotal
  const subtotal = validatedItems.reduce((sum, item) => {
    const price =
      item.product.base_price + (item.variant?.price_adjustment || 0);
    return sum + price * item.quantity;
  }, 0);

  return {
    valid: errors.length === 0,
    items: validatedItems,
    subtotal,
    errors,
  };
}

/**
 * Get shipping cost based on method and subtotal
 * Returns 0 if free shipping threshold is met
 */
export async function getShippingCost(
  method: "standard" | "express",
  subtotal?: number
): Promise<number> {
  const supabase = await createClient();

  // Check free shipping settings
  if (subtotal !== undefined) {
    const { data: freeShippingData } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "free_shipping")
      .single();

    if (freeShippingData) {
      const freeShippingConfig = freeShippingData.value as any;
      if (
        freeShippingConfig.is_active &&
        subtotal >= freeShippingConfig.min_order_amount
      ) {
        return 0; // Free shipping!
      }
    }
  }

  // Get regular shipping cost
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "shipping")
    .single();

  if (error || !data) {
    // Default fallback
    return method === "express" ? 100 : 50;
  }

  const shippingConfig = data.value as any;
  return shippingConfig[method]?.price || (method === "express" ? 100 : 50);
}

/**
 * Validate and apply promo code
 */
export async function validatePromoCode(code: string, subtotal: number): Promise<{
  valid: boolean;
  discount: number;
  error?: string;
}> {
  const supabase = await createClient();

  const { data: promo, error } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("is_active", true)
    .single();

  if (error || !promo) {
    return { valid: false, discount: 0, error: "Invalid promo code" };
  }

  // Check if expired
  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    return { valid: false, discount: 0, error: "Promo code has expired" };
  }

  // Check if started
  if (promo.starts_at && new Date(promo.starts_at) > new Date()) {
    return { valid: false, discount: 0, error: "Promo code not yet active" };
  }

  // Check minimum order amount
  if (promo.min_order_amount && subtotal < promo.min_order_amount) {
    return {
      valid: false,
      discount: 0,
      error: `Minimum order amount is ${promo.min_order_amount} EGP`,
    };
  }

  // Check max uses
  if (promo.max_uses && promo.used_count >= promo.max_uses) {
    return {
      valid: false,
      discount: 0,
      error: "Promo code has reached maximum uses",
    };
  }

  // Calculate discount
  let discount = 0;
  if (promo.discount_type === "percentage") {
    discount = (subtotal * promo.discount_value) / 100;
  } else {
    discount = promo.discount_value;
  }

  // Ensure discount doesn't exceed subtotal
  discount = Math.min(discount, subtotal);

  return { valid: true, discount };
}
