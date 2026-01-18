"use client";

import { useEffect } from "react";
import { useWishlistStore } from "@/stores/wishlist";
import { createClient } from "@/lib/supabase/client";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);

  useEffect(() => {
    // Initial fetch
    fetchWishlist();

    // Listen to auth state changes to refetch when user logs in/out
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        fetchWishlist();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchWishlist]);

  return <>{children}</>;
}
