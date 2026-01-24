import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import crypto from "crypto";

/**
 * Paymob Callback Handler
 * يتم استدعاؤه عندما يعود المستخدم من صفحة Paymob بعد الدفع
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        // Paymob sends these parameters
        const success = searchParams.get("success");
        const orderId = searchParams.get("order");
        const transactionId = searchParams.get("id");
        const amountCents = searchParams.get("amount_cents");
        const currency = searchParams.get("currency");
        const hmac = searchParams.get("hmac");

        console.log("[Paymob Callback] Received:", {
            success,
            orderId,
            transactionId,
            amountCents,
        });

        // Verify HMAC
        if (hmac && process.env.PAYMOB_HMAC_SECRET) {
            const hmacString = [
                amountCents,
                searchParams.get("created_at"),
                currency,
                searchParams.get("error_occured"),
                searchParams.get("has_parent_transaction"),
                transactionId,
                searchParams.get("integration_id"),
                searchParams.get("is_3d_secure"),
                searchParams.get("is_auth"),
                searchParams.get("is_capture"),
                searchParams.get("is_refunded"),
                searchParams.get("is_standalone_payment"),
                searchParams.get("is_voided"),
                orderId,
                searchParams.get("owner"),
                searchParams.get("pending"),
                searchParams.get("source_data_pan") || "NA",
                searchParams.get("source_data_sub_type"),
                searchParams.get("source_data_type"),
                success,
            ]
                .filter((v) => v !== null)
                .join("");

            const calculatedHMAC = crypto
                .createHmac("sha512", process.env.PAYMOB_HMAC_SECRET)
                .update(hmacString)
                .digest("hex");

            if (calculatedHMAC !== hmac) {
                console.error("[Paymob Callback] Invalid HMAC signature");
                return NextResponse.redirect(
                    `${process.env.NEXT_PUBLIC_APP_URL}/checkout?error=invalid_signature`
                );
            }
        }

        if (!orderId) {
            console.error("[Paymob Callback] Missing order ID");
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/checkout?error=missing_order`
            );
        }

        // Find order by Paymob order ID
        const { data: order, error: orderError } = await supabaseAdmin
            .from("orders")
            .select("*")
            .eq("paymob_order_id", orderId)
            .single();

        if (orderError || !order) {
            console.error("[Paymob Callback] Order not found:", orderId);
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/checkout?error=order_not_found`
            );
        }

        // Update order based on payment status
        if (success === "true") {
            // Payment successful
            const { error: updateError } = await supabaseAdmin
                .from("orders")
                .update({
                    payment_status: "paid",
                    status: "confirmed",
                    paymob_transaction_id: transactionId,
                })
                .eq("id", order.id);

            if (updateError) {
                console.error("[Paymob Callback] Error updating order:", updateError);
            } else {
                console.log("[Paymob Callback] Order updated successfully:", order.order_number);

                // Decrement stock for each item
                const { data: items, error: itemsError } = await supabaseAdmin
                    .from("order_items")
                    .select("variant_id, quantity")
                    .eq("order_id", order.id);

                if (!itemsError && items) {
                    for (const item of items) {
                        if (item.variant_id) {
                            try {
                                await supabaseAdmin.rpc("decrement_stock", {
                                    p_variant_id: item.variant_id,
                                    p_quantity: item.quantity,
                                });
                            } catch (error) {
                                console.error("[Paymob Callback] Error decrementing stock:", error);
                            }
                        }
                    }
                }

                // Add tracking entry
                await supabaseAdmin.from("order_tracking").insert({
                    order_id: order.id,
                    status: "confirmed",
                    description: "Payment received via Paymob, order confirmed",
                });
            }

            // Redirect to confirmation page
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/checkout/confirmation?order=${order.order_number}&status=success`
            );
        } else {
            // Payment failed
            await supabaseAdmin
                .from("orders")
                .update({
                    payment_status: "failed",
                })
                .eq("id", order.id);

            await supabaseAdmin.from("order_tracking").insert({
                order_id: order.id,
                status: "pending",
                description: "Payment failed via Paymob",
            });

            console.log("[Paymob Callback] Payment failed for order:", order.order_number);

            // Redirect to checkout with error
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/checkout?error=payment_failed&order=${order.order_number}`
            );
        }
    } catch (error) {
        console.error("[Paymob Callback] Error processing callback:", error);
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/checkout?error=callback_error`
        );
    }
}
