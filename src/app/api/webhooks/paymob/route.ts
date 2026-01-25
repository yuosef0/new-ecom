import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyPaymobHMAC } from "@/lib/paymob/webhook";
import type { PaymobWebhookPayload } from "@/lib/paymob/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body: PaymobWebhookPayload = await request.json();

    // Verify HMAC signature
    const isValid = verifyPaymobHMAC(body, process.env.PAYMOB_HMAC_SECRET!);

    if (!isValid) {
      console.error("Invalid Paymob HMAC signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const transaction = body.obj;
    const paymobOrderId = transaction.order.id.toString();

    // Find order by Paymob order ID
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("paymob_order_id", paymobOrderId)
      .single();

    if (orderError || !order) {
      console.error("Order not found for Paymob order:", paymobOrderId);
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Check if already processed (idempotency)
    if (order.payment_status === "paid") {
      console.log("Webhook already processed for order:", order.order_number);
      return NextResponse.json({
        received: true,
        already_processed: true,
      });
    }

    // Process based on transaction status
    if (
      transaction.success &&
      !transaction.is_voided &&
      !transaction.is_refunded
    ) {
      // Payment successful
      const { error: updateError } = await supabaseAdmin
        .from("orders")
        .update({
          payment_status: "paid",
          status: "confirmed",
          paymob_transaction_id: transaction.id.toString(),
        })
        .eq("id", order.id);

      if (updateError) {
        console.error("Error updating order status:", updateError);
        return NextResponse.json(
          { error: "Failed to update order" },
          { status: 500 }
        );
      }

      // Decrement stock for each item
      const { data: items, error: itemsError } = await supabaseAdmin
        .from("order_items")
        .select("variant_id, quantity")
        .eq("order_id", order.id);

      if (!itemsError && items) {
        for (const item of items) {
          if (item.variant_id) {
            try {
              // Get current stock
              const { data: variant } = await supabaseAdmin
                .from("product_variants")
                .select("stock_quantity")
                .eq("id", item.variant_id)
                .single();

              if (variant) {
                const newStock = Math.max(0, (variant.stock_quantity || 0) - item.quantity);
                await supabaseAdmin
                  .from("product_variants")
                  .update({ stock_quantity: newStock })
                  .eq("id", item.variant_id);
              }
            } catch (error) {
              console.error("Error decrementing stock:", error);
              // Continue processing - don't fail the webhook
            }
          }
        }
      }

      // Add tracking entry
      await supabaseAdmin.from("order_tracking").insert({
        order_id: order.id,
        status: "confirmed",
        description: "Payment received, order confirmed",
      });

      console.log("Payment successful for order:", order.order_number);
    } else if (transaction.is_refunded) {
      // Payment refunded
      await supabaseAdmin
        .from("orders")
        .update({
          payment_status: "refunded",
          status: "refunded",
        })
        .eq("id", order.id);

      await supabaseAdmin.from("order_tracking").insert({
        order_id: order.id,
        status: "refunded",
        description: "Payment refunded",
      });

      console.log("Payment refunded for order:", order.order_number);
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
        description: "Payment failed",
      });

      console.log("Payment failed for order:", order.order_number);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing Paymob webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
