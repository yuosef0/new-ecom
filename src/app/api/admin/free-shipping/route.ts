import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "free_shipping")
      .single();

    if (error) {
      console.error("Error fetching free shipping settings:", error);
      return NextResponse.json(
        { error: "Failed to fetch settings" },
        { status: 500 }
      );
    }

    return NextResponse.json(data?.value || { is_active: false, min_order_amount: 500 });
  } catch (error) {
    console.error("Error in GET /api/admin/free-shipping:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get request body
    const body = await request.json();
    const { is_active, min_order_amount } = body;

    // Validate input
    if (typeof is_active !== "boolean") {
      return NextResponse.json(
        { error: "is_active must be a boolean" },
        { status: 400 }
      );
    }

    if (typeof min_order_amount !== "number" || min_order_amount < 0) {
      return NextResponse.json(
        { error: "min_order_amount must be a positive number" },
        { status: 400 }
      );
    }

    // Update settings
    const { error } = await supabaseAdmin
      .from("site_settings")
      .upsert({
        key: "free_shipping",
        value: {
          is_active,
          min_order_amount,
        },
      });

    if (error) {
      console.error("Error updating free shipping settings:", error);
      return NextResponse.json(
        { error: "Failed to update settings" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in PUT /api/admin/free-shipping:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
