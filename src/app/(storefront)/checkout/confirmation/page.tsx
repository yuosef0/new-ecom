"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/storefront/ui/Icon";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order") || "N/A";
  const status = searchParams.get("status"); // success, failed, etc.

  const isSuccess = status === "success" || !status; // default to success for COD

  return (
    <div className="px-4 pt-6 pb-8 min-h-[70vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        {/* Success/Error Icon */}
        <div className={`w-20 h-20 rounded-full ${isSuccess ? 'bg-green-500/20' : 'bg-red-500/20'} flex items-center justify-center mx-auto mb-6`}>
          <Icon name={isSuccess ? "check_circle" : "error"} className={`text-5xl ${isSuccess ? 'text-green-500' : 'text-red-500'}`} />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-brand-cream mb-2">
          {isSuccess ? "Order Placed Successfully!" : "Order Received"}
        </h1>

        {/* Subtitle */}
        {isSuccess && (
          <p className="text-brand-cream/70 text-sm mb-6">
            Thank you for your purchase!
          </p>
        )}

        {/* Order Number */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
          <p className="text-brand-cream/70 text-sm mb-1">Order Number</p>
          <p className="text-brand-cream font-bold text-xl">{orderId}</p>
        </div>

        {/* Message */}
        <div className="text-brand-cream/80 text-sm mb-8 space-y-3">
          <p>
            {isSuccess
              ? "We've received your order and will start processing it shortly."
              : "Your order has been placed. Payment confirmation is pending."}
          </p>
          <p>
            A confirmation email has been sent with your order details.
            You can track your order status from your account.
          </p>
          {isSuccess && (
            <div className="bg-brand-primary/10 border border-brand-primary/30 rounded-lg p-3 mt-4">
              <p className="text-brand-cream font-medium text-xs">
                📦 Estimated delivery: 3-5 business days
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/orders"
            className="block w-full py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary/90"
          >
            VIEW ORDER
          </Link>
          <Link
            href="/products"
            className="block w-full py-3 bg-white/10 text-brand-cream font-bold rounded-lg hover:bg-white/20"
          >
            CONTINUE SHOPPING
          </Link>
        </div>

        {/* Support Message */}
        <p className="text-brand-cream/60 text-xs mt-6">
          Need help? Contact our support team
        </p>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="px-4 pt-6 pb-8 min-h-[70vh] flex items-center justify-center">
        <div className="text-brand-cream/70">Loading...</div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
