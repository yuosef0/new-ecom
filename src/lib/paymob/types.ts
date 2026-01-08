export interface PaymobAuthResponse {
  token: string;
}

export interface PaymobOrderRequest {
  auth_token: string;
  delivery_needed: false;
  amount_cents: number;
  currency: string;
  items: Array<{
    name: string;
    amount_cents: number;
    description: string;
    quantity: number;
  }>;
}

export interface PaymobOrderResponse {
  id: number;
  // ... other fields
}

export interface PaymobPaymentKeyRequest {
  auth_token: string;
  amount_cents: number;
  expiration: number;
  order_id: number;
  billing_data: {
    apartment: string;
    email: string;
    floor: string;
    first_name: string;
    street: string;
    building: string;
    phone_number: string;
    shipping_method: string;
    postal_code: string;
    city: string;
    country: string;
    last_name: string;
    state: string;
  };
  currency: string;
  integration_id: number;
}

export interface PaymobPaymentKeyResponse {
  token: string;
}

export interface PaymobWebhookPayload {
  obj: {
    id: number;
    pending: boolean;
    amount_cents: number;
    success: boolean;
    is_auth: boolean;
    is_capture: boolean;
    is_refunded: boolean;
    is_voided: boolean;
    order: {
      id: number;
    };
    source_data: {
      type: string;
      sub_type: string;
      pan?: string;
    };
    created_at: string;
    currency: string;
    error_occured: boolean;
    has_parent_transaction: boolean;
    integration_id: number;
    is_3d_secure: boolean;
    is_standalone_payment: boolean;
    owner: number;
  };
  type: string;
  hmac: string;
}
