import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { OrderStatusUpdate } from "@/components/admin/orders/OrderStatusUpdate";

async function getOrder(orderId: string) {
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items(*)
    `
    )
    .eq("id", orderId)
    .single();

  if (error || !order) {
    return null;
  }

  return order;
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await getOrder(params.id);

  if (!order) {
    notFound();
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/orders"
            className="text-sm text-brand-primary hover:underline mb-2 inline-block"
          >
            ← Back to Orders
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Order {order.order_number}
          </h1>
          <p className="mt-2 text-gray-600">
            Placed on {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <span
            className={`px-3 py-1 text-sm font-medium rounded-full ${
              order.status === "delivered"
                ? "bg-green-100 text-green-800"
                : order.status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : order.status === "cancelled"
                ? "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {order.status}
          </span>
          <span
            className={`px-3 py-1 text-sm font-medium rounded-full ${
              order.payment_status === "paid"
                ? "bg-green-100 text-green-800"
                : order.payment_status === "failed"
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {order.payment_status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order Items
            </h2>
            <div className="space-y-4">
              {order.order_items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {item.product_name}
                    </div>
                    {item.variant_name && (
                      <div className="text-sm text-gray-600">
                        {item.variant_name}
                      </div>
                    )}
                    <div className="text-sm text-gray-500">
                      Qty: {item.quantity} × {formatPrice(item.price)}
                    </div>
                  </div>
                  <div className="font-medium text-gray-900">
                    {formatPrice(item.total)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary & Info */}
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Summary
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">
                  {formatPrice(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900">
                  {formatPrice(order.shipping_cost)}
                </span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-green-600">
                    -{formatPrice(order.discount_amount)}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex justify-between font-semibold text-base">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Status Update */}
          <OrderStatusUpdate
            orderId={order.id}
            currentStatus={order.status}
            currentPaymentStatus={order.payment_status}
          />

          {/* Shipping Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Shipping Address
            </h2>
            <div className="text-sm space-y-1 text-gray-600">
              <div className="font-medium text-gray-900">
                {order.shipping_name}
              </div>
              <div>{order.shipping_phone}</div>
              <div>{order.shipping_address}</div>
              <div>
                {order.shipping_city}, {order.shipping_governorate}
              </div>
            </div>
          </div>

          {/* Payment Info */}
          {order.paymob_transaction_id && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Details
              </h2>
              <div className="text-sm space-y-1 text-gray-600">
                <div className="flex justify-between">
                  <span>Method</span>
                  <span className="text-gray-900">{order.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transaction ID</span>
                  <span className="text-gray-900 font-mono text-xs">
                    {order.paymob_transaction_id}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Notes
              </h2>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
