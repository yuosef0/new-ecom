import { StatCard } from "@/components/admin/dashboard/StatCard";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

async function getAnalytics() {
  try {
    // Check authentication server-side
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      redirect("/");
    }

    // Get stats using database function
    const { data: stats, error: statsError } = await supabaseAdmin.rpc(
      "get_admin_stats"
    );

    if (statsError) {
      console.error("Error fetching stats:", statsError);
      throw new Error(`Failed to fetch stats: ${statsError.message}`);
    }

    // Get recent orders
    const { data: recentOrders } = await supabaseAdmin
      .from("orders")
      .select("id, order_number, total, status, created_at, shipping_name")
      .order("created_at", { ascending: false })
      .limit(10);

    // Get low stock products
    const { data: allVariants } = await supabaseAdmin
      .from("product_variants")
      .select(
        `
        id,
        stock_quantity,
        low_stock_threshold,
        products!inner(id, name, slug)
      `
      )
      .gt("stock_quantity", 0);

    const lowStockProducts = (allVariants || [])
      .filter((v: any) => v.stock_quantity <= v.low_stock_threshold)
      .slice(0, 10);

    return {
      stats,
      recentOrders: recentOrders || [],
      lowStockProducts: lowStockProducts || [],
    };
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
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export default async function AdminDashboard() {
  const { stats, recentOrders, lowStockProducts, error } = await getAnalytics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back! Here's what's happening with your store.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="material-icons-outlined text-red-600 text-xl">error</span>
            <div>
              <h3 className="font-semibold text-red-900">Error Loading Analytics</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <p className="text-xs text-red-600 mt-2">
                Please check the console for more details or refer to SETUP_ADMIN_ANALYTICS.md
              </p>
            </div>
          </div>
        </div>
      )}

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
