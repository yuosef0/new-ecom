export interface CartItem {
  id: string; // unique cart item id (generated client-side)
  productId: string;
  variantId: string | null;
  quantity: number;
  // Note: NO price here - prices fetched from server
}

export interface CartItemWithProduct extends CartItem {
  product: {
    name: string;
    slug: string;
    base_price: number;
    compare_at_price: number | null;
    images: Array<{ url: string; alt_text: string | null }>;
  };
  variant: {
    size_name: string | null;
    color_name: string | null;
    color_hex: string | null;
    price_adjustment: number;
    stock_quantity: number;
  } | null;
}
