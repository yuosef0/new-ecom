import { z } from "zod";

export const shippingSchema = z.object({
  email: z.string().email("Valid email required"),
  full_name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  address_line_1: z.string().min(5, "Address is required"),
  address_line_2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  governorate: z.string().min(2, "Governorate is required"),
  postal_code: z.string().optional(),
});

export const checkoutSchema = z.object({
  email: z.string().email("Valid email required"),
  shipping: shippingSchema,
  shipping_method: z.enum(["standard", "express"]),
  payment_method: z.enum(["card", "wallet"]),
  promo_code: z.string().optional(),
  notes: z.string().optional(),
});

export type ShippingFormData = z.infer<typeof shippingSchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
