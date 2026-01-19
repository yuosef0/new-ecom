"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface Customer {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  total_orders: number;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    // Filter customers based on search query
    if (!searchQuery.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = customers.filter((customer) => {
      const name = customer.full_name?.toLowerCase() || "";
      const email = customer.email.toLowerCase();
      const phone = customer.phone?.toLowerCase() || "";

      return name.includes(query) || email.includes(query) || phone.includes(query);
    });

    setFilteredCustomers(filtered);
  }, [searchQuery, customers]);

  const loadCustomers = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }

      const supabase = createClient();

      // Get all customers
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name, phone, created_at, role")
        .eq("role", "customer")
        .order("created_at", { ascending: false });

      if (profilesError) {
        console.error("Error fetching customers:", profilesError);
        setLoading(false);
        return;
      }

      // Get order counts for each customer
      const { data: orderCounts, error: ordersError } = await supabase
        .from("orders")
        .select("user_id");

      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
      }

      // Count orders per customer
      const orderCountMap: { [key: string]: number } = {};
      orderCounts?.forEach((order) => {
        orderCountMap[order.user_id] = (orderCountMap[order.user_id] || 0) + 1;
      });

      // Combine data
      const customersWithOrders: Customer[] = (profiles || []).map((profile) => ({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        phone: profile.phone,
        created_at: profile.created_at,
        total_orders: orderCountMap[profile.id] || 0,
      }));

      setCustomers(customersWithOrders);
      setFilteredCustomers(customersWithOrders);
    } catch (error) {
      console.error("Error loading customers:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadCustomers(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="mt-2 text-gray-600">View and manage your customers</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="mt-2 text-gray-600">
            View and manage your customers ({customers.length} total)
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span className={`material-icons-outlined text-xl ${refreshing ? 'animate-spin' : ''}`}>
            refresh
          </span>
          <span className="font-medium">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            search
          </span>
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          />
        </div>
        {searchQuery && (
          <p className="mt-2 text-sm text-gray-600">
            Found {filteredCustomers.length} customer(s) matching "{searchQuery}"
          </p>
        )}
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        {filteredCustomers.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <span className="material-icons-outlined text-4xl text-gray-300 mb-2">
              people
            </span>
            <p>
              {searchQuery ? "No customers found matching your search" : "No customers yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center text-white font-medium">
                          {customer.full_name?.[0]?.toUpperCase() ||
                            customer.email[0].toUpperCase()}
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
                      {customer.phone || (
                        <span className="text-gray-400 italic">No phone</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-sm font-semibold text-brand-primary bg-brand-primary/10 rounded-full">
                        {customer.total_orders} {customer.total_orders === 1 ? "order" : "orders"}
                      </span>
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
