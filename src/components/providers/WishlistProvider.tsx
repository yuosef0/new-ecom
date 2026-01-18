"use client";

import { useEffect } from "react";
import { useWishlistStore } from "@/stores/wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const loadWishlist = useWishlistStore((state) => state.loadWishlist);

  useEffect(() => {
    // Load wishlist once on mount
    loadWishlist();
  }, []); // Empty dependency array - load only once

  return <>{children}</>;
}
