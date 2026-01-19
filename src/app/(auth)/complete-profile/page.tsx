"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function CompleteProfilePage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    checkProfile();
  }, []);

  const checkProfile = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("phone, full_name")
        .eq("id", user.id)
        .single();

      if (profile?.phone) {
        // Already has phone, redirect to home
        router.push("/");
        return;
      }

      // Set initial full name from auth metadata or profile
      setFullName(profile?.full_name || user.user_metadata?.full_name || "");
    } catch (err) {
      console.error("Error checking profile:", err);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!phone.trim()) {
      setError("Phone number is required");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      // Update profile with phone number
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          phone: phone.trim(),
          full_name: fullName.trim() || null,
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("Error updating profile:", updateError);
        setError("Failed to update profile. Please try again.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      console.error("Exception updating profile:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-burgundy px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <p className="text-center text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-burgundy px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-brand-burgundy mb-2">
          Complete Your Profile
        </h2>
        <p className="text-gray-600 mb-6 text-sm">
          Please provide your phone number to continue
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-brand-charcoal mb-1"
            >
              Full Name (Optional)
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-brand-muted rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-brand-charcoal mb-1"
            >
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-4 py-2 border border-brand-muted rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              placeholder="01234567890"
            />
            <p className="mt-1 text-xs text-brand-charcoal/60">
              Required for order updates and delivery
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-primary text-white py-3 rounded-md font-medium hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
