import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
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

    // Get stats using database function
    const { data: stats, error: statsError } = await supabaseAdmin.rpc(
      "get_admin_stats"
    );

    if (statsError) {
      console.error("Error fetching stats:", statsError);
      return NextResponse.json(
        {
          error: "Failed to fetch stats",
          details: statsError.message,
          hint: "Make sure get_admin_stats() function exists in database. Run the SQL script from SETUP_ADMIN_ANALYTICS.md"
        },
        { status: 500 }
      );
    }

    // Get recent orders
    const { data: recentOrders } = await supabaseAdmin
      .from("orders")
      .select("id, order_number, total, status, created_at, shipping_name")
      .order("created_at", { ascending: false })
      .limit(10);

    // Get low stock products
    // Note: Using a simple approach - fetch and filter
    // For production, consider using a database view or function
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
      .filter(
        (v: any) => v.stock_quantity <= v.low_stock_threshold
      )
      .slice(0, 10);

    return NextResponse.json({
      stats,
      recentOrders: recentOrders || [],
      lowStockProducts: lowStockProducts || [],
    });
  } catch (error) {
    console.error("Error in analytics API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
