import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  validateCartItems,
  getShippingCost,
  validatePromoCode,
} from "@/lib/queries/cart";
import { initializePaymobPayment } from "@/lib/paymob/client";
import { generateOrderNumber } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const checkoutSchema = z.object({
  email: z.string().email(),
  shipping: z.object({
    full_name: z.string().min(2).max(100),
    phone: z.string().min(10).max(20),
    address_line_1: z.string().min(5).max(200),
    address_line_2: z.string().max(200).optional(),
    city: z.string().min(2).max(100),
    governorate: z.string().min(2).max(100),
    postal_code: z.string().max(10).optional(),
  }),
  shipping_method: z.enum(["standard", "express"]),
  payment_method: z.enum(["card", "wallet", "cod"]),
  promo_code: z.string().max(50).optional(),
  notes: z.string().max(500).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        variantId: z.string().uuid().nullable(),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const { email, shipping, shipping_method, payment_method, promo_code, notes, items } =
      parsed.data;

    // Validate cart items and get current prices
    const cartValidation = await validateCartItems(items);

    if (!cartValidation.valid || cartValidation.errors.length > 0) {
      return NextResponse.json(
        {
          error: "Cart validation failed",
          details: cartValidation.errors,
        },
        { status: 400 }
      );
    }

    // Calculate shipping cost
    const shippingCost = await getShippingCost(shipping_method);

    // Calculate subtotal
    let subtotal = cartValidation.subtotal;
    let discountAmount = 0;

    // Apply promo code if provided
    if (promo_code) {
      const promoValidation = await validatePromoCode(promo_code, subtotal);
      if (promoValidation.valid) {
        discountAmount = promoValidation.discount;
      }
    }

    // Calculate total
    const total = subtotal + shippingCost - discountAmount;

    if (total <= 0) {
      return NextResponse.json(
        { error: "Invalid order total" },
        { status: 400 }
      );
    }

    // Get current user (if logged in)
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create order in database
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: user?.id || null,
        guest_email: user ? null : email,
        status: "pending",
        payment_status: "pending",
        subtotal,
        shipping_cost: shippingCost,
        discount_amount: discountAmount,
        total,
        currency: "EGP",
        shipping_name: shipping.full_name,
        shipping_phone: shipping.phone,
        shipping_address: `${shipping.address_line_1}${shipping.address_line_2 ? ", " + shipping.address_line_2 : ""
          }`,
        shipping_city: shipping.city,
        shipping_governorate: shipping.governorate,
        payment_method,
        notes,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("Error creating order:", orderError);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    // Create order items
    const orderItems = cartValidation.items.map((item) => {
      const price =
        item.product.base_price + (item.variant?.price_adjustment || 0);
      const variantName = item.variant
        ? [item.variant.color_name, item.variant.size_name]
          .filter(Boolean)
          .join(" / ")
        : null;

      return {
        order_id: order.id,
        product_id: item.productId,
        variant_id: item.variantId,
        product_name: item.product.name,
        variant_name: variantName,
        price,
        quantity: item.quantity,
        total: price * item.quantity,
      };
    });

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      // Rollback order
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      return NextResponse.json(
        { error: "Failed to create order items" },
        { status: 500 }
      );
    }

    // Add initial tracking entry
    await supabaseAdmin.from("order_tracking").insert({
      order_id: order.id,
      status: "pending",
      description: "Order created, awaiting payment",
    });

    // Increment promo code usage if applicable
    if (promo_code && discountAmount > 0) {
      // Get current usage count
      const { data: promo } = await supabaseAdmin
        .from("promo_codes")
        .select("used_count")
        .eq("code", promo_code)
        .single();

      if (promo) {
        await supabaseAdmin
          .from("promo_codes")
          .update({ used_count: (promo.used_count || 0) + 1 })
          .eq("code", promo_code);
      }
    }

    // For Cash on Delivery, no payment processing needed
    if (payment_method === "cod") {
      return NextResponse.json({
        order_id: order.id,
        order_number: order.order_number,
        payment_method: "cod",
      });
    }

    // Initialize Paymob payment for card/wallet
    const nameParts = shipping.full_name.split(" ");
    const firstName = nameParts[0] || shipping.full_name;
    const lastName = nameParts.slice(1).join(" ") || firstName;

    const paymentResult = await initializePaymobPayment({
      amount: total,
      orderNumber: order.order_number,
      customer: {
        email,
        firstName,
        lastName,
        phone: shipping.phone,
      },
      shipping: {
        address: shipping.address_line_1,
        city: shipping.city,
        country: "Egypt",
        postalCode: shipping.postal_code,
      },
      items: orderItems.map((item) => ({
        name: item.product_name,
        price: item.price,
        quantity: item.quantity,
      })),
    });

    // Update order with Paymob order ID
    await supabaseAdmin
      .from("orders")
      .update({
        paymob_order_id: paymentResult.paymobOrderId.toString(),
      })
      .eq("id", order.id);

    return NextResponse.json({
      order_id: order.id,
      order_number: order.order_number,
      payment_url: paymentResult.iframeUrl,
      payment_key: paymentResult.paymentToken,
    });
  } catch (error) {
    console.error("Error processing checkout:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
