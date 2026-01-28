import { formatPrice } from "@/lib/utils";

interface CartSummaryProps {
  subtotal: number;
  shipping?: number;
  discount?: number;
  total: number;
  freeShippingThreshold?: number;
  isFreeShippingActive?: boolean;
}

export function CartSummary({
  subtotal,
  shipping = 0,
  discount = 0,
  total,
  freeShippingThreshold,
  isFreeShippingActive
}: CartSummaryProps) {
  // Calculate progress toward free shipping
  const showFreeShippingProgress =
    isFreeShippingActive &&
    freeShippingThreshold &&
    subtotal < freeShippingThreshold;

  const amountNeeded = freeShippingThreshold
    ? freeShippingThreshold - subtotal
    : 0;

  return (
    <div className="bg-white/5 rounded-lg p-4 space-y-3">
      <h2 className="font-semibold text-brand-cream text-lg mb-4">Order Summary</h2>

      <div className="flex justify-between text-sm">
        <span className="text-brand-cream/70">Subtotal</span>
        <span className="text-brand-cream font-medium">{formatPrice(subtotal)}</span>
      </div>

      {/* Free Shipping Progress */}
      {showFreeShippingProgress && amountNeeded > 0 && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-icons-outlined text-green-500 text-sm">local_shipping</span>
            <span className="text-green-500 text-xs font-medium">
              Add {formatPrice(amountNeeded)} more for FREE shipping!
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((subtotal / (freeShippingThreshold || 1)) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Shipping Cost */}
      <div className="flex justify-between text-sm">
        <span className="text-brand-cream/70">Shipping</span>
        {shipping === 0 ? (
          <span className="text-green-500 font-bold">FREE</span>
        ) : (
          <span className="text-brand-cream font-medium">{formatPrice(shipping)}</span>
        )}
      </div>

      {discount > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-brand-cream/70">Discount</span>
          <span className="text-green-500 font-medium">-{formatPrice(discount)}</span>
        </div>
      )}

      <div className="border-t border-white/10 pt-3 mt-3">
        <div className="flex justify-between">
          <span className="text-brand-cream font-semibold">Total</span>
          <span className="text-brand-cream font-bold text-xl">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}
