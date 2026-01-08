import { StatCard } from "@/components/admin/dashboard/StatCard";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

async function getAnalytics() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/analytics`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch analytics");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return {
      stats: {
        total_revenue: 0,
        total_orders: 0,
        pending_orders: 0,
        total_customers: 0,
        total_products: 0,
        low_stock_count: 0,
        out_of_stock_count: 0,
      },
      recentOrders: [],
      lowStockProducts: [],
    };
  }
}

export default async function AdminDashboard() {
  const { stats, recentOrders, lowStockProducts } = await getAnalytics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back! Here's what's happening with your store.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatPrice(stats.total_revenue || 0)}
          icon="attach_money"
          iconBg="bg-green-500"
        />
        <StatCard
          title="Total Orders"
          value={stats.total_orders || 0}
          icon="shopping_bag"
          iconBg="bg-blue-500"
        />
        <StatCard
          title="Pending Orders"
          value={stats.pending_orders || 0}
          icon="pending"
          iconBg="bg-yellow-500"
        />
        <StatCard
          title="Customers"
          value={stats.total_customers || 0}
          icon="people"
          iconBg="bg-purple-500"
        />
      </div>

      {/* Alerts */}
      {(stats.low_stock_count > 0 || stats.out_of_stock_count > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats.low_stock_count > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="material-icons-outlined text-yellow-600 text-xl">
                  warning
                </span>
                <div>
                  <h3 className="font-semibold text-yellow-900">
                    Low Stock Alert
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    {stats.low_stock_count} product(s) running low on stock
                  </p>
                  <Link
                    href="/admin/products?filter=low_stock"
                    className="text-sm font-medium text-yellow-900 hover:underline mt-2 inline-block"
                  >
                    View Products →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {stats.out_of_stock_count > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="material-icons-outlined text-red-600 text-xl">
                  error
                </span>
                <div>
                  <h3 className="font-semibold text-red-900">
                    Out of Stock
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    {stats.out_of_stock_count} product(s) out of stock
                  </p>
                  <Link
                    href="/admin/products?filter=out_of_stock"
                    className="text-sm font-medium text-red-900 hover:underline mt-2 inline-block"
                  >
                    View Products →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-brand-primary hover:underline"
          >
            View All →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <span className="material-icons-outlined text-4xl text-gray-300 mb-2">
              shopping_bag
            </span>
            <p>No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-sm font-medium text-brand-primary hover:underline"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.shipping_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
