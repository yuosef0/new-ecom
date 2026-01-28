"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart";
import { CheckoutForm } from "@/components/storefront/checkout/CheckoutForm";
import { Icon } from "@/components/storefront/ui/Icon";
import { formatPrice } from "@/lib/utils";
import type { ShippingFormData } from "@/lib/validations/checkout";
import { createClient } from "@/lib/supabase/client";

type CheckoutStep = "shipping" | "payment" | "review";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const [step, setStep] = useState<CheckoutStep>("shipping");
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod">("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [enrichedItems, setEnrichedItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Free shipping state
  const [freeShippingSettings, setFreeShippingSettings] = useState<{
    is_active: boolean;
    min_order_amount: number;
  } | null>(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    discountType: "percentage" | "fixed";
    discountValue: number;
  } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Fetch free shipping settings
  useEffect(() => {
    const fetchFreeShippingSettings = async () => {
      try {
        const response = await fetch("/api/admin/free-shipping");
        if (response.ok) {
          const data = await response.json();
          setFreeShippingSettings(data);
        }
      } catch (error) {
        console.error("Error fetching free shipping settings:", error);
      }
    };
    fetchFreeShippingSettings();
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !isProcessing) {
      router.push("/cart");
    }
  }, [items.length, isProcessing, router]);

  // Fetch product details
  useEffect(() => {
    if (items.length === 0) {
      setEnrichedItems([]);
      setIsLoading(false);
      return;
    }

    const fetchProductDetails = async () => {
      setIsLoading(true);
      const supabase = createClient();

      try {
        // Fetch all products
        const productIds = items.map(item => item.productId);
        const { data: products } = await supabase
          .from("products")
          .select("id, name, slug, base_price, product_images(url, is_primary)")
          .in("id", productIds);

        // Fetch variants if needed
        const variantIds = items
          .filter(item => item.variantId)
          .map(item => item.variantId);

        let variants: any[] = [];
        if (variantIds.length > 0) {
          const { data: variantsData } = await supabase
            .from("product_variants")
            .select("id, price_adjustment, sizes(name), colors(name)")
            .in("id", variantIds);
          variants = variantsData || [];
        }

        if (products) {
          const enriched = items.map(item => {
            const product = products.find(p => p.id === item.productId);
            const variant = item.variantId ? variants.find(v => v.id === item.variantId) : null;

            if (!product) return null;

            return {
              ...item,
              product: {
                name: product.name,
                slug: product.slug,
                base_price: product.base_price,
                images: product.product_images?.map((img: any) => ({ url: img.url, alt_text: "" })) || []
              },
              variant: variant ? {
                size_name: variant.sizes?.name || null,
                color_name: variant.colors?.name || null,
                price_adjustment: variant.price_adjustment || 0
              } : null
            };
          }).filter(Boolean);

          setEnrichedItems(enriched);
        }
      } catch (err) {
        console.error("Error loading cart details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetails();
  }, [items]);

  const subtotal = enrichedItems.reduce((sum, item) => {
    const price = item.product.base_price + (item.variant?.price_adjustment || 0);
    return sum + price * item.quantity;
  }, 0);

  // Calculate shipping (free if threshold met)
  const shipping =
    freeShippingSettings?.is_active &&
      subtotal >= freeShippingSettings.min_order_amount
      ? 0
      : 50;

  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const total = Math.max(0, subtotal + shipping - discount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setValidatingCoupon(true);
    setCouponError("");
    setAppliedCoupon(null);

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotal }),
      });

      const data = await response.json();

      if (!response.ok) {
        setCouponError(data.error || "Invalid coupon");
        return;
      }

      setAppliedCoupon({
        code: data.code,
        discountAmount: data.discountAmount,
        discountType: data.discountType,
        discountValue: data.discountValue,
      });
      setCouponError("");
    } catch (err) {
      console.error("Coupon validation error:", err);
      setCouponError("Failed to validate coupon");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const handleShippingSubmit = (data: ShippingFormData) => {
    setShippingData(data);
    setStep("payment");
  };

  const handlePlaceOrder = async () => {
    if (!shippingData) return;

    setIsProcessing(true);

    try {
      // Create order via API route
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: shippingData.email,
          shipping: {
            full_name: shippingData.full_name,
            phone: shippingData.phone,
            address_line_1: shippingData.address_line_1,
            address_line_2: shippingData.address_line_2,
            city: shippingData.city,
            governorate: shippingData.governorate,
            postal_code: shippingData.postal_code,
          },
          shipping_method: "standard",
          payment_method: paymentMethod,
          promo_code: appliedCoupon?.code,
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      // Clear cart
      clearCart();

      // If COD, redirect to confirmation
      if (paymentMethod === "cod") {
        router.push(`/checkout/confirmation?order=${data.order_number}`);
      } else {
        // For card/wallet, redirect to payment URL
        if (data.payment_url) {
          window.location.href = data.payment_url;
        } else {
          router.push(`/checkout/confirmation?order=${data.order_number}`);
        }
      }
    } catch (error) {
      console.error("Order failed:", error);
      alert(error instanceof Error ? error.message : "Failed to create order. Please try again.");
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-brand-primary border-t-transparent rounded-full mb-4"></div>
        <p className="text-brand-cream/50">Loading checkout...</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-cream mb-2">Checkout</h1>
        <div className="flex items-center gap-2 text-sm">
          <div
            className={`flex items-center gap-1 ${step === "shipping" ? "text-brand-primary" : "text-brand-cream"
              }`}
          >
            <span className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs font-bold">
              1
            </span>
            <span>Shipping</span>
          </div>
          <Icon name="chevron_right" className="text-brand-cream/50" />
          <div
            className={`flex items-center gap-1 ${step === "payment" ? "text-brand-primary" : "text-brand-cream/50"
              }`}
          >
            <span
              className={`w-6 h-6 rounded-full ${step === "payment" ? "bg-brand-primary text-white" : "bg-white/10 text-brand-cream/50"
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

          {/* Order Summary Preview */}
          <div className="mt-8 bg-white/5 border border-white/10 rounded-lg p-4">
            <h3 className="font-bold text-brand-cream mb-4">Order Summary</h3>

            {/* Coupon Input */}
            <div className="mb-6">
              {!appliedCoupon ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Promo code"
                    className="flex-1 bg-white/10 border border-white/20 rounded px-3 py-2 text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-primary"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={validatingCoupon || !couponCode}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-brand-cream text-sm font-medium rounded transition-colors disabled:opacity-50"
                  >
                    {validatingCoupon ? "..." : "Apply"}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Icon name="local_offer" className="text-green-500 text-sm" />
                    <span className="text-green-500 font-medium text-sm">
                      {appliedCoupon.code}
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-brand-cream/50 hover:text-red-400 transition-colors"
                  >
                    <Icon name="close" className="text-sm" />
                  </button>
                </div>
              )}
              {couponError && (
                <p className="text-red-400 text-xs mt-1">{couponError}</p>
              )}
            </div>

            <div className="space-y-3 mb-4 border-b border-white/10 pb-4">
              {enrichedItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div className="flex flex-col">
                    <span className="text-brand-cream/80">
                      {item.product.name} x {item.quantity}
                    </span>
                    {item.variant?.size_name && (
                      <span className="text-brand-cream/50 text-xs">
                        Size: {item.variant.size_name}
                      </span>
                    )}
                  </div>
                  <span className="text-brand-cream font-medium">
                    {formatPrice((item.product.base_price + (item.variant?.price_adjustment || 0)) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm text-brand-cream/80 mb-4 border-b border-white/10 pb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                {shipping === 0 ? (
                  <span className="text-green-400 font-bold">FREE</span>
                ) : (
                  <span>{formatPrice(shipping)}</span>
                )}
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-400 font-medium">
                  <div className="flex items-center gap-1">
                    <span>Discount</span>
                    <span className="text-xs bg-green-400/20 px-1.5 rounded">
                      {appliedCoupon.code}
                    </span>
                  </div>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between text-brand-cream font-bold text-lg">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
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
              {enrichedItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div className="flex flex-col">
                    <span className="text-brand-cream/80">
                      {item.product.name} x {item.quantity}
                    </span>
                    {item.variant?.size_name && (
                      <span className="text-brand-cream/50 text-xs">
                        Size: {item.variant.size_name}
                      </span>
                    )}
                  </div>
                  <span className="text-brand-cream font-medium">
                    {formatPrice((item.product.base_price + (item.variant?.price_adjustment || 0)) * item.quantity)}
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
                {shipping === 0 ? (
                  <span className="text-green-400 font-bold">FREE</span>
                ) : (
                  <span>{formatPrice(shipping)}</span>
                )}
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
  );
}
