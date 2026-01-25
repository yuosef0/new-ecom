import { createClient } from "@/lib/supabase/client";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { code, subtotal } = await request.json();

        if (!code || typeof subtotal !== "number") {
            return NextResponse.json(
                { error: "Missing code or subtotal" },
                { status: 400 }
            );
        }

        // Fetch promo code
        // Using admin client to see all coupons, though client with RLS would be safer if configured
        // For now assuming public readable or admin-only
        const { data: promoCode, error } = await supabaseAdmin
            .from("promo_codes")
            .select("*")
            .eq("code", code)
            .single();

        if (error || !promoCode) {
            return NextResponse.json(
                { error: "Invalid promo code" },
                { status: 404 }
            );
        }

        // 1. Check if active
        if (!promoCode.is_active) {
            return NextResponse.json(
                { error: "Promo code is inactive" },
                { status: 400 }
            );
        }

        // 2. Check dates
        const now = new Date();
        if (promoCode.starts_at && new Date(promoCode.starts_at) > now) {
            return NextResponse.json(
                { error: "Promo code not yet active" },
                { status: 400 }
            );
        }

        if (promoCode.expires_at && new Date(promoCode.expires_at) < now) {
            return NextResponse.json(
                { error: "Promo code expired" },
                { status: 400 }
            );
        }

        // 3. Check usage limits
        if (promoCode.max_uses !== null && promoCode.used_count >= promoCode.max_uses) {
            return NextResponse.json(
                { error: "Promo code usage limit reached" },
                { status: 400 }
            );
        }

        // 4. Check minimum order amount
        if (promoCode.min_order_amount && subtotal < promoCode.min_order_amount) {
            return NextResponse.json(
                {
                    error: `Minimum order amount is ${promoCode.min_order_amount} EGP`,
                    minAmount: promoCode.min_order_amount
                },
                { status: 400 }
            );
        }

        // Calculate discount
        let discountAmount = 0;
        if (promoCode.discount_type === "percentage") {
            discountAmount = (subtotal * promoCode.discount_value) / 100;
        } else {
            discountAmount = promoCode.discount_value;
        }

        // Prevent discount > subtotal
        discountAmount = Math.min(discountAmount, subtotal);

        return NextResponse.json({
            valid: true,
            code: promoCode.code,
            discountAmount,
            discountType: promoCode.discount_type,
            discountValue: promoCode.discount_value
        });

    } catch (error) {
        console.error("Error validating promo code:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
