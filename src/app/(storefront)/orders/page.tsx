import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Icon } from "@/components/storefront/ui/Icon";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

async function getCustomerOrders() {
    const supabase = await createClient();

    // Get current user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Get user's orders
    const { data: orders, error } = await supabase
        .from("orders")
        .select(`
      id,
      order_number,
      status,
      payment_status,
      payment_method,
      subtotal,
      shipping_cost,
      total,
      created_at,
      shipping_name,
      shipping_phone,
      shipping_address_line_1,
      shipping_city
    `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching orders:", error);
        return [];
    }

    return orders || [];
}

export default async function OrdersPage() {
    const orders = await getCustomerOrders();

    return (
        <div className="min-h-screen bg-brand-dark py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-brand-cream mb-2">My Orders</h1>
                    <p className="text-brand-cream/70">View and track your orders</p>
                </div>

                {/* Orders List */}
                {orders.length === 0 ? (
                    <div className="bg-white/5 border border-white/10 rounded-lg p-12 text-center">
                        <Icon name="shopping_bag" className="text-6xl text-brand-cream/30 mb-4" />
                        <h2 className="text-xl font-semibold text-brand-cream mb-2">No Orders Yet</h2>
                        <p className="text-brand-cream/70 mb-6">
                            You haven't placed any orders yet.
                        </p>
                        <Link
                            href="/products"
                            className="inline-block px-6 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary/90"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order: any) => (
                            <div
                                key={order.id}
                                className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:bg-white/10 transition-colors"
                            >
                                <div className="p-6">
                                    {/* Order Header */}
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-brand-cream mb-1">
                                                Order {order.order_number}
                                            </h3>
                                            <p className="text-sm text-brand-cream/60">
                                                Placed on {new Date(order.created_at).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </p>
                                        </div>
                                        <div className="mt-3 md:mt-0">
                                            <span className="text-2xl font-bold text-brand-cream">
                                                {formatPrice(order.total)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Order Details Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        {/* Status */}
                                        <div>
                                            <p className="text-xs text-brand-cream/60 mb-1">Order Status</p>
                                            <span
                                                className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${order.status === "delivered"
                                                        ? "bg-green-500/20 text-green-400"
                                                        : order.status === "confirmed"
                                                            ? "bg-blue-500/20 text-blue-400"
                                                            : order.status === "pending"
                                                                ? "bg-yellow-500/20 text-yellow-400"
                                                                : order.status === "cancelled"
                                                                    ? "bg-red-500/20 text-red-400"
                                                                    : "bg-gray-500/20 text-gray-400"
                                                    }`}
                                            >
                                                {order.status.toUpperCase()}
                                            </span>
                                        </div>

                                        {/* Payment Status */}
                                        <div>
                                            <p className="text-xs text-brand-cream/60 mb-1">Payment Status</p>
                                            <span
                                                className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${order.payment_status === "paid"
                                                        ? "bg-green-500/20 text-green-400"
                                                        : order.payment_status === "failed"
                                                            ? "bg-red-500/20 text-red-400"
                                                            : "bg-gray-500/20 text-gray-400"
                                                    }`}
                                            >
                                                {order.payment_status.toUpperCase()}
                                            </span>
                                        </div>

                                        {/* Payment Method */}
                                        <div>
                                            <p className="text-xs text-brand-cream/60 mb-1">Payment Method</p>
                                            <p className="text-sm text-brand-cream font-medium">
                                                {order.payment_method === "cod" ? "Cash on Delivery" : "Card Payment"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Shipping Info */}
                                    <div className="bg-white/5 rounded-lg p-4 mb-4">
                                        <p className="text-xs text-brand-cream/60 mb-2">Shipping Address</p>
                                        <p className="text-sm text-brand-cream">
                                            <strong>{order.shipping_name}</strong>
                                        </p>
                                        <p className="text-sm text-brand-cream/80">
                                            {order.shipping_address_line_1}
                                        </p>
                                        <p className="text-sm text-brand-cream/80">
                                            {order.shipping_city}
                                        </p>
                                        <p className="text-sm text-brand-cream/80">
                                            {order.shipping_phone}
                                        </p>
                                    </div>

                                    {/* Order Summary */}
                                    <div className="border-t border-white/10 pt-4">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-brand-cream/70">Subtotal</span>
                                            <span className="text-brand-cream">{formatPrice(order.subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-brand-cream/70">Shipping</span>
                                            <span className="text-brand-cream">{formatPrice(order.shipping_cost)}</span>
                                        </div>
                                        <div className="flex justify-between text-base font-bold">
                                            <span className="text-brand-cream">Total</span>
                                            <span className="text-brand-cream">{formatPrice(order.total)}</span>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        <Link
                                            href={`/orders/${order.id}`}
                                            className="inline-flex items-center gap-2 text-brand-primary hover:text-brand-primary/80 font-medium"
                                        >
                                            View Details
                                            <Icon name="arrow_forward" className="text-lg" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Back to Home */}
                <div className="mt-8 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-brand-cream/70 hover:text-brand-cream"
                    >
                        <Icon name="arrow_back" className="text-lg" />
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
