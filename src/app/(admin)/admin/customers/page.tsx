import { createClient } from "@/lib/supabase/server";

async function getCustomers() {
  const supabase = await createClient();

  const { data: customers, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "customer")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Error fetching customers:", error);
    return [];
  }

  return customers;
}

export default async function AdminCustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        <p className="mt-2 text-gray-600">
          View and manage your customers
        </p>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        {customers.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <span className="material-icons-outlined text-4xl text-gray-300 mb-2">
              people
            </span>
            <p>No customers yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer: any) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center text-white font-medium">
                          {customer.full_name?.[0]?.toUpperCase() || customer.email[0].toUpperCase()}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {customer.full_name || "No name"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.phone || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(customer.created_at).toLocaleDateString()}
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
