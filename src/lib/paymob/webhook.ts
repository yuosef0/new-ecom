import crypto from "crypto";
import type { PaymobWebhookPayload } from "./types";

/**
 * Verify Paymob webhook HMAC signature
 */
export function verifyPaymobHMAC(
  payload: PaymobWebhookPayload,
  secret: string
): boolean {
  const obj = payload.obj;

  // Paymob HMAC calculation - specific order of fields
  const hmacString = [
    obj.amount_cents,
    obj.created_at,
    obj.currency,
    obj.error_occured.toString(),
    obj.has_parent_transaction.toString(),
    obj.id,
    obj.integration_id,
    obj.is_3d_secure.toString(),
    obj.is_auth.toString(),
    obj.is_capture.toString(),
    obj.is_refunded.toString(),
    obj.is_standalone_payment.toString(),
    obj.is_voided.toString(),
    obj.order.id,
    obj.owner,
    obj.pending.toString(),
    obj.source_data.pan || "NA",
    obj.source_data.sub_type,
    obj.source_data.type,
    obj.success.toString(),
  ].join("");

  const calculatedHMAC = crypto
    .createHmac("sha512", secret)
    .update(hmacString)
    .digest("hex");

  return calculatedHMAC === payload.hmac;
}
