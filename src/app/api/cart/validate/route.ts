import { validateCartItems } from "@/lib/queries/cart";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const cartValidateSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        variantId: z.string().uuid().nullable(),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .min(1)
    .max(50),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = cartValidateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const result = await validateCartItems(parsed.data.items);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error validating cart:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
