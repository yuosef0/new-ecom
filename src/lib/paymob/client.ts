import type {
  PaymobAuthResponse,
  PaymobOrderRequest,
  PaymobOrderResponse,
  PaymobPaymentKeyRequest,
  PaymobPaymentKeyResponse,
} from "./types";

const PAYMOB_BASE_URL = "https://accept.paymob.com/api";

/**
 * Authenticate with Paymob and get auth token
 */
export async function getPaymobAuthToken(): Promise<string> {
  const response = await fetch(`${PAYMOB_BASE_URL}/auth/tokens`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: process.env.PAYMOB_API_KEY!,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to authenticate with Paymob");
  }

  const data: PaymobAuthResponse = await response.json();
  return data.token;
}

/**
 * Create an order in Paymob
 */
export async function createPaymobOrder(
  authToken: string,
  orderData: Omit<PaymobOrderRequest, "auth_token">
): Promise<PaymobOrderResponse> {
  const response = await fetch(`${PAYMOB_BASE_URL}/ecommerce/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auth_token: authToken,
      ...orderData,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create Paymob order");
  }

  return await response.json();
}

/**
 * Get payment key for iframe/redirect
 */
export async function getPaymobPaymentKey(
  authToken: string,
  paymentData: Omit<PaymobPaymentKeyRequest, "auth_token">
): Promise<string> {
  const response = await fetch(`${PAYMOB_BASE_URL}/acceptance/payment_keys`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auth_token: authToken,
      ...paymentData,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to get Paymob payment key");
  }

  const data: PaymobPaymentKeyResponse = await response.json();
  return data.token;
}

/**
 * Complete payment flow - combines auth, order creation, and payment key
 */
export async function initializePaymobPayment(params: {
  amount: number;
  orderNumber: string;
  customer: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  shipping: {
    address: string;
    city: string;
    country?: string;
    postalCode?: string;
  };
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
}): Promise<{
  paymentToken: string;
  paymobOrderId: number;
  iframeUrl: string;
}> {
  // Step 1: Get auth token
  const authToken = await getPaymobAuthToken();

  // Step 2: Create order
  const amountCents = Math.round(params.amount * 100);

  const order = await createPaymobOrder(authToken, {
    delivery_needed: false,
    amount_cents: amountCents,
    currency: "EGP",
    items: params.items.map((item) => ({
      name: item.name,
      amount_cents: Math.round(item.price * 100),
      description: item.name,
      quantity: item.quantity,
    })),
  });

  // Step 3: Get payment key
  const paymentToken = await getPaymobPaymentKey(authToken, {
    amount_cents: amountCents,
    expiration: 3600, // 1 hour
    order_id: order.id,
    billing_data: {
      apartment: "NA",
      email: params.customer.email,
      floor: "NA",
      first_name: params.customer.firstName,
      street: params.shipping.address,
      building: "NA",
      phone_number: params.customer.phone,
      shipping_method: "PKG",
      postal_code: params.shipping.postalCode || "00000",
      city: params.shipping.city,
      country: params.shipping.country || "Egypt",
      last_name: params.customer.lastName,
      state: params.shipping.city,
    },
    currency: "EGP",
    integration_id: parseInt(process.env.PAYMOB_INTEGRATION_ID!),
  });

  // Construct iframe URL
  const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentToken}`;

  return {
    paymentToken,
    paymobOrderId: order.id,
    iframeUrl,
  };
}
