import { formatPrice } from "@/lib/utils";

interface CartSummaryProps {
  subtotal: number;
  shipping?: number;
  discount?: number;
  total: number;
}

export function CartSummary({ subtotal, shipping = 0, discount = 0, total }: CartSummaryProps) {
  return (
    <div className="bg-white/5 rounded-lg p-4 space-y-3">
      <h2 className="font-semibold text-brand-cream text-lg mb-4">Order Summary</h2>

      <div className="flex justify-between text-sm">
        <span className="text-brand-cream/70">Subtotal</span>
        <span className="text-brand-cream font-medium">{formatPrice(subtotal)}</span>
      </div>

      {shipping > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-brand-cream/70">Shipping</span>
          <span className="text-brand-cream font-medium">{formatPrice(shipping)}</span>
        </div>
      )}

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
