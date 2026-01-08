"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { shippingSchema, type ShippingFormData } from "@/lib/validations/checkout";

const GOVERNORATES = [
  "Cairo",
  "Giza",
  "Alexandria",
  "Dakahlia",
  "Red Sea",
  "Beheira",
  "Fayoum",
  "Gharbiya",
  "Ismailia",
  "Menofia",
  "Minya",
  "Qaliubiya",
  "New Valley",
  "Suez",
  "Aswan",
  "Assiut",
  "Beni Suef",
  "Port Said",
  "Damietta",
  "Sharkia",
  "South Sinai",
  "Kafr El Sheikh",
  "Matrouh",
  "Luxor",
  "Qena",
  "North Sinai",
  "Sohag",
];

interface CheckoutFormProps {
  onSubmit: (data: ShippingFormData) => void;
  isLoading?: boolean;
}

export function CheckoutForm({ onSubmit, isLoading = false }: CheckoutFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Full Name */}
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-brand-cream mb-1">
          Full Name *
        </label>
        <input
          {...register("full_name")}
          type="text"
          id="full_name"
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-brand-cream placeholder:text-brand-cream/40 focus:outline-none focus:border-brand-primary"
          placeholder="Enter your full name"
        />
        {errors.full_name && (
          <p className="text-red-400 text-xs mt-1">{errors.full_name.message}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-brand-cream mb-1">
          Phone Number *
        </label>
        <input
          {...register("phone")}
          type="tel"
          id="phone"
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-brand-cream placeholder:text-brand-cream/40 focus:outline-none focus:border-brand-primary"
          placeholder="01XXXXXXXXX"
        />
        {errors.phone && (
          <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>
        )}
      </div>

      {/* Governorate */}
      <div>
        <label htmlFor="governorate" className="block text-sm font-medium text-brand-cream mb-1">
          Governorate *
        </label>
        <select
          {...register("governorate")}
          id="governorate"
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-brand-cream focus:outline-none focus:border-brand-primary"
        >
          <option value="" className="bg-brand-burgundy">Select governorate</option>
          {GOVERNORATES.map((gov) => (
            <option key={gov} value={gov} className="bg-brand-burgundy">
              {gov}
            </option>
          ))}
        </select>
        {errors.governorate && (
          <p className="text-red-400 text-xs mt-1">{errors.governorate.message}</p>
        )}
      </div>

      {/* City */}
      <div>
        <label htmlFor="city" className="block text-sm font-medium text-brand-cream mb-1">
          City *
        </label>
        <input
          {...register("city")}
          type="text"
          id="city"
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-brand-cream placeholder:text-brand-cream/40 focus:outline-none focus:border-brand-primary"
          placeholder="Enter your city"
        />
        {errors.city && (
          <p className="text-red-400 text-xs mt-1">{errors.city.message}</p>
        )}
      </div>

      {/* Address Line 1 */}
      <div>
        <label htmlFor="address_line_1" className="block text-sm font-medium text-brand-cream mb-1">
          Street Address *
        </label>
        <input
          {...register("address_line_1")}
          type="text"
          id="address_line_1"
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-brand-cream placeholder:text-brand-cream/40 focus:outline-none focus:border-brand-primary"
          placeholder="Building number, street name"
        />
        {errors.address_line_1 && (
          <p className="text-red-400 text-xs mt-1">{errors.address_line_1.message}</p>
        )}
      </div>

      {/* Address Line 2 */}
      <div>
        <label htmlFor="address_line_2" className="block text-sm font-medium text-brand-cream mb-1">
          Apartment, Suite, etc. (Optional)
        </label>
        <input
          {...register("address_line_2")}
          type="text"
          id="address_line_2"
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-brand-cream placeholder:text-brand-cream/40 focus:outline-none focus:border-brand-primary"
          placeholder="Apartment, floor, building name"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
      >
        {isLoading ? "Processing..." : "CONTINUE TO PAYMENT"}
      </button>
    </form>
  );
}
