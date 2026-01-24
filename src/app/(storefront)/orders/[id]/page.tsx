import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Icon } from "@/components/storefront/ui/Icon";
import Image from "next/image";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

async function getOrderDetails(orderId: string) {
    const supabase = await createClient();

    // Get current user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Get order details
    const { data: order, error } = await supabase
        .from("orders")
        .select(`
      *,
      order_items (
        id,
        quantity,
        price,
        variant_id,
        product_variants (
          id,
          sku,
          size,
          color,
          products (
            id,
            name,
            slug,
            product_images (
              url,
              alt_text,
              is_primary
            )
          )
        )
      ),
      order_tracking (
        id,
        status,
        description,
        created_at
      )
    `)
        .eq("id", orderId)
        .eq("user_id", user.id)
        .single();

    if (error || !order) {
        notFound();
    }

    return order;
}

export default async function OrderDetailsPage({
    params,
}: {
    params: { id: string };
}) {
    const order = await getOrderDetails(params.id);

    return (
        <div className="min-h-screen bg-brand-dark py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <Link
                    href="/orders"
                    className="inline-flex items-center gap-2 text-brand-cream/70 hover:text-brand-cream mb-6"
                >
                    <Icon name="arrow_back" className="text-lg" />
                    Back to Orders
                </Link>

                {/* Order Header */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-brand-cream mb-2">
                                Order {order.order_number}
                            </h1>
                            <p className="text-sm text-brand-cream/60">
                                Placed on {new Date(order.created_at).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0 flex gap-3">
                            <span
                                className={`px-4 py-2 text-sm font-semibold rounded-lg ${order.status === "delivered"
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
                            <span
                                className={`px-4 py-2 text-sm font-semibold rounded-lg ${order.payment_status === "paid"
                                        ? "bg-green-500/20 text-green-400"
                                        : order.payment_status === "failed"
                                            ? "bg-red-500/20 text-red-400"
                                            : "bg-gray-500/20 text-gray-400"
                                    }`}
                            >
                                {order.payment_status.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Items */}
                        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                            <h2 className="text-lg font-bold text-brand-cream mb-4">Order Items</h2>
                            <div className="space-y-4">
                                {order.order_items.map((item: any) => {
                                    const product = item.product_variants?.products;
                                    const variant = item.product_variants;
                                    const primaryImage = product?.product_images?.find((img: any) => img.is_primary) || product?.product_images?.[0];

                                    return (
                                        <div key={item.id} className="flex gap-4 pb-4 border-b border-white/10 last:border-0">
                                            {/* Product Image */}
                                            {primaryImage && (
                                                <div className="relative w-20 h-20 bg-white/10 rounded-lg overflow-hidden flex-shrink-0">
                                                    <Image
                                                        src={primaryImage.url}
                                                        alt={primaryImage.alt_text || product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            )}

                                            {/* Product Details */}
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-brand-cream mb-1">
                                                    {product?.name || "Product"}
                                                </h3>
                                                {variant && (
                                                    <p className="text-sm text-brand-cream/60">
                                                        {variant.size && `Size: ${variant.size}`}
                                                        {variant.size && variant.color && " • "}
                                                        {variant.color && `Color: ${variant.color}`}
                                                    </p>
                                                )}
                                                <p className="text-sm text-brand-cream/60">
                                                    Quantity: {item.quantity}
                                                </p>
                                            </div>

                                            {/* Price */}
                                            <div className="text-right">
                                                <p className="font-semibold text-brand-cream">
                                                    {formatPrice(item.price * item.quantity)}
                                                </p>
                                                <p className="text-xs text-brand-cream/60">
                                                    {formatPrice(item.price)} each
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Order Tracking */}
                        {order.order_tracking && order.order_tracking.length > 0 && (
                            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                                <h2 className="text-lg font-bold text-brand-cream mb-4">Order Tracking</h2>
                                <div className="space-y-4">
                                    {order.order_tracking
                                        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                        .map((track: any, index: number) => (
                                            <div key={track.id} className="flex gap-4">
                                                {/* Timeline Dot */}
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-3 h-3 rounded-full ${index === 0 ? "bg-brand-primary" : "bg-white/30"
                                                        }`} />
                                                    {index !== order.order_tracking.length - 1 && (
                                                        <div className="w-0.5 h-full bg-white/20 mt-1" />
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 pb-4">
                                                    <p className="font-semibold text-brand-cream capitalize">
                                                        {track.status.replace("_", " ")}
                                                    </p>
                                                    <p className="text-sm text-brand-cream/70 mt-1">
                                                        {track.description}
                                                    </p>
                                                    <p className="text-xs text-brand-cream/50 mt-1">
                                                        {new Date(track.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Order Summary */}
                        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                            <h2 className="text-lg font-bold text-brand-cream mb-4">Order Summary</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-brand-cream/70">Subtotal</span>
                                    <span className="text-brand-cream">{formatPrice(order.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-brand-cream/70">Shipping</span>
                                    <span className="text-brand-cream">{formatPrice(order.shipping_cost)}</span>
                                </div>
                                {order.discount_amount > 0 && (
                                    <div className="flex justify-between text-sm text-green-400">
                                        <span>Discount</span>
                                        <span>-{formatPrice(order.discount_amount)}</span>
                                    </div>
                                )}
                                <div className="border-t border-white/10 pt-3 flex justify-between font-bold">
                                    <span className="text-brand-cream">Total</span>
                                    <span className="text-brand-cream text-lg">{formatPrice(order.total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                            <h2 className="text-lg font-bold text-brand-cream mb-4">Shipping Address</h2>
                            <div className="text-sm text-brand-cream/80 space-y-1">
                                <p className="font-semibold text-brand-cream">{order.shipping_name}</p>
                                <p>{order.shipping_address_line_1}</p>
                                {order.shipping_address_line_2 && <p>{order.shipping_address_line_2}</p>}
                                <p>{order.shipping_city}, {order.shipping_postal_code}</p>
                                <p className="pt-2">{order.shipping_phone}</p>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                            <h2 className="text-lg font-bold text-brand-cream mb-4">Payment Information</h2>
                            <div className="text-sm text-brand-cream/80 space-y-2">
                                <div className="flex justify-between">
                                    <span>Method:</span>
                                    <span className="font-medium text-brand-cream">
                                        {order.payment_method === "cod" ? "Cash on Delivery" : "Card Payment"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Status:</span>
                                    <span className={`font-medium ${order.payment_status === "paid" ? "text-green-400" : "text-yellow-400"
                                        }`}>
                                        {order.payment_status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
