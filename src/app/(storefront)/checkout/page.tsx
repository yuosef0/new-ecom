"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart";
import { CheckoutForm } from "@/components/storefront/checkout/CheckoutForm";
import { Icon } from "@/components/storefront/ui/Icon";
import { formatPrice } from "@/lib/utils";
import type { ShippingFormData } from "@/lib/validations/checkout";

type CheckoutStep = "shipping" | "payment" | "review";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const [step, setStep] = useState<CheckoutStep>("shipping");
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod">("card");
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect if cart is empty
  if (items.length === 0 && !isProcessing) {
    router.push("/cart");
    return null;
  }

  // Mock cart items with product data
  const cartItems = items.map((item) => ({
    ...item,
    product: {
      name: "Sample Product",
      slug: "sample-product",
      base_price: 899,
      images: [],
    },
    variant: null,
  }));

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.base_price * item.quantity,
    0
  );
  const shipping = 50;
  const total = subtotal + shipping;

  const handleShippingSubmit = (data: ShippingFormData) => {
    setShippingData(data);
    setStep("payment");
  };

  const handlePlaceOrder = async () => {
    if (!shippingData) return;

    setIsProcessing(true);

    try {
      // TODO: Create order via API route
      // const response = await fetch("/api/checkout", {
      //   method: "POST",
      //   body: JSON.stringify({
      //     shipping: shippingData,
      //     payment_method: paymentMethod,
      //     items: items,
      //   }),
      // });

      // Mock success - wait 2 seconds
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Clear cart and redirect to confirmation
      clearCart();
      router.push("/checkout/confirmation?order=ORD-123456");
    } catch (error) {
      console.error("Order failed:", error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="px-4 pt-6 pb-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-cream mb-2">Checkout</h1>
          <div className="flex items-center gap-2 text-sm">
            <div
              className={`flex items-center gap-1 ${
                step === "shipping" ? "text-brand-primary" : "text-brand-cream"
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs font-bold">
                1
              </span>
              <span>Shipping</span>
            </div>
            <Icon name="chevron_right" className="text-brand-cream/50" />
            <div
              className={`flex items-center gap-1 ${
                step === "payment" ? "text-brand-primary" : "text-brand-cream/50"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full ${
                  step === "payment" ? "bg-brand-primary text-white" : "bg-white/10 text-brand-cream/50"
                } flex items-center justify-center text-xs font-bold`}
              >
                2
              </span>
              <span>Payment</span>
            </div>
          </div>
        </div>

        {/* Step 1: Shipping Information */}
        {step === "shipping" && (
          <div>
            <h2 className="text-lg font-bold text-brand-cream mb-4">Shipping Information</h2>
            <CheckoutForm onSubmit={handleShippingSubmit} />
          </div>
        )}

        {/* Step 2: Payment Method & Review */}
        {step === "payment" && shippingData && (
          <div className="space-y-6">
            {/* Shipping Address Summary */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-brand-cream">Shipping Address</h3>
                <button
                  onClick={() => setStep("shipping")}
                  className="text-brand-primary text-sm hover:underline"
                >
                  Edit
                </button>
              </div>
              <div className="text-brand-cream/80 text-sm space-y-1">
                <p className="font-medium">{shippingData.full_name}</p>
                <p>{shippingData.phone}</p>
                <p>{shippingData.address_line_1}</p>
                {shippingData.address_line_2 && <p>{shippingData.address_line_2}</p>}
                <p>
                  {shippingData.city}, {shippingData.governorate}
                </p>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <h3 className="font-bold text-brand-cream mb-4">Payment Method</h3>
              <div className="space-y-3">
                {/* Credit/Debit Card */}
                <label className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg p-4 cursor-pointer hover:border-brand-primary">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={(e) => setPaymentMethod(e.target.value as "card")}
                    className="w-5 h-5 accent-brand-primary"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icon name="credit_card" className="text-brand-cream" />
                      <span className="font-medium text-brand-cream">Credit/Debit Card</span>
                    </div>
                    <p className="text-brand-cream/60 text-xs mt-1">
                      Secure payment via Paymob
                    </p>
                  </div>
                </label>

                {/* Cash on Delivery */}
                <label className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg p-4 cursor-pointer hover:border-brand-primary">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value as "cod")}
                    className="w-5 h-5 accent-brand-primary"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icon name="local_shipping" className="text-brand-cream" />
                      <span className="font-medium text-brand-cream">Cash on Delivery</span>
                    </div>
                    <p className="text-brand-cream/60 text-xs mt-1">
                      Pay when you receive your order
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h3 className="font-bold text-brand-cream mb-4">Order Summary</h3>

              {/* Items */}
              <div className="space-y-3 mb-4 border-b border-white/10 pb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-brand-cream/80">
                      {item.product.name} x {item.quantity}
                    </span>
                    <span className="text-brand-cream font-medium">
                      {formatPrice(item.product.base_price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-brand-cream/80">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-brand-cream/80">
                  <span>Shipping</span>
                  <span>{formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-brand-cream font-bold text-lg pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="w-full py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? "PROCESSING..." : "PLACE ORDER"}
            </button>

            {/* Back Button */}
            <button
              onClick={() => setStep("shipping")}
              className="w-full text-center text-brand-cream/70 text-sm hover:text-brand-cream"
            >
              ← Back to Shipping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
