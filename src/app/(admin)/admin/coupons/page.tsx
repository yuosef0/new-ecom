import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

async function getCoupons() {
  const supabase = await createClient();

  // Check if coupons table exists
  const { data: coupons, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching coupons:", error);
    return null;
  }

  return coupons;
}

export default async function AdminCouponsPage() {
  const coupons = await getCoupons();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coupons & Discounts</h1>
          <p className="mt-2 text-gray-600">
            Manage promotional codes and discounts
          </p>
        </div>
      </div>

      {/* Coupons Table or Empty State */}
      {coupons === null ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-12">
            <span className="material-icons-outlined text-6xl text-gray-300 mb-4">
              local_offer
            </span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Coupons System Not Set Up
            </h3>
            <p className="text-gray-600 mb-4">
              The coupons table doesn't exist yet in your database.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-left max-w-2xl mx-auto">
              <p className="text-sm font-medium text-gray-900 mb-2">
                To set up coupons, create a table in Supabase with:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>code (TEXT, unique) - Coupon code</li>
                <li>discount_type (TEXT) - 'percentage' or 'fixed'</li>
                <li>discount_value (DECIMAL) - Discount amount or percentage</li>
                <li>min_purchase (DECIMAL, optional) - Minimum purchase amount</li>
                <li>max_uses (INTEGER, optional) - Maximum number of uses</li>
                <li>used_count (INTEGER, default 0) - Times used</li>
                <li>valid_from (TIMESTAMPTZ) - Start date</li>
                <li>valid_until (TIMESTAMPTZ) - Expiry date</li>
                <li>is_active (BOOLEAN, default true)</li>
              </ul>
            </div>
          </div>
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 px-6 py-12 text-center text-gray-500">
          <span className="material-icons-outlined text-4xl text-gray-300 mb-2">
            local_offer
          </span>
          <p>No coupons created yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valid Until
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coupons.map((coupon: any) => (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {coupon.code}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {coupon.discount_type === "percentage"
                        ? `${coupon.discount_value}%`
                        : formatPrice(coupon.discount_value)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {coupon.used_count || 0}
                      {coupon.max_uses ? ` / ${coupon.max_uses}` : ""}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {coupon.valid_until
                        ? new Date(coupon.valid_until).toLocaleDateString()
                        : "No expiry"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          coupon.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {coupon.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Note */}
      {coupons && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <span className="material-icons-outlined text-blue-600 text-lg">info</span>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Managing Coupons</p>
              <p>
                For now, coupons can be added via Supabase dashboard. A full coupon
                management interface (add, edit, delete, generate codes) will be added in the next update.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
