import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all customers using admin client (bypasses RLS)
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name, phone, created_at, role")
      .eq("role", "customer")
      .order("created_at", { ascending: false });

    if (profilesError) {
      console.error("Error fetching customers:", profilesError);
      return NextResponse.json(
        { error: "Failed to fetch customers" },
        { status: 500 }
      );
    }

    // Get order counts for each customer (only delivered orders)
    const { data: orderCounts, error: ordersError } = await supabaseAdmin
      .from("orders")
      .select("user_id")
      .eq("status", "delivered");

    if (ordersError) {
      console.error("Error fetching orders:", ordersError);
    }

    // Count orders per customer
    const orderCountMap: { [key: string]: number } = {};
    orderCounts?.forEach((order) => {
      orderCountMap[order.user_id] = (orderCountMap[order.user_id] || 0) + 1;
    });

    // Combine data
    const customersWithOrders = (profiles || []).map((profile) => ({
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      phone: profile.phone,
      created_at: profile.created_at,
      total_orders: orderCountMap[profile.id] || 0,
    }));

    return NextResponse.json({ customers: customersWithOrders });
  } catch (error) {
    console.error("Error in customers API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
