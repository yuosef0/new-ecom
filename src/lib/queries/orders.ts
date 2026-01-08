import { createClient } from "@/lib/supabase/server";
import type { Order, OrderItem } from "@/types/database";

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

/**
 * Get orders for the current user
 */
export async function getUserOrders(): Promise<OrderWithItems[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items(*)
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user orders:", error);
    return [];
  }

  return data as OrderWithItems[];
}

/**
 * Get single order by ID
 */
export async function getOrderById(orderId: string): Promise<OrderWithItems | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items(*)
    `
    )
    .eq("id", orderId)
    .single();

  if (error || !data) {
    console.error("Error fetching order:", error);
    return null;
  }

  // Check if user has access to this order
  if (user && data.user_id !== user.id) {
    return null;
  }

  return data as OrderWithItems;
}

/**
 * Get order by order number (for tracking)
 */
export async function getOrderByNumber(
  orderNumber: string,
  email: string
): Promise<OrderWithItems | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items(*)
    `
    )
    .eq("order_number", orderNumber.toUpperCase())
    .single();

  if (error || !data) {
    console.error("Error fetching order by number:", error);
    return null;
  }

  // Verify email matches
  const orderEmail = data.user_id ? null : data.guest_email;
  if (orderEmail && orderEmail.toLowerCase() !== email.toLowerCase()) {
    return null;
  }

  return data as OrderWithItems;
}

/**
 * Get order tracking history
 */
export async function getOrderTracking(orderId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("order_tracking")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching order tracking:", error);
    return [];
  }

  return data;
}
