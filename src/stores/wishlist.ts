import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

interface WishlistState {
  wishlistProductIds: Set<string>;
  isLoading: boolean;
  refreshKey: number;

  // Actions
  addToWishlist: (productId: string) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<boolean>;
  toggleWishlist: (productId: string) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
  loadWishlist: () => Promise<void>;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlistProductIds: new Set(),
  isLoading: false,
  refreshKey: 0,

  addToWishlist: async (productId: string) => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      // Redirect to login or show message
      alert("Please login to add items to wishlist");
      return false;
    }

    const { error } = await supabase.from("wishlist_items").insert({
      user_id: session.user.id,
      product_id: productId,
      variant_id: null,
    });

    if (error) {
      // Check if already exists
      if (error.code === "23505") {
        // Already in wishlist
        return true;
      }
      console.error("Error adding to wishlist:", error);
      return false;
    }

    set((state) => {
      const newSet = new Set(state.wishlistProductIds);
      newSet.add(productId);
      return { wishlistProductIds: newSet, refreshKey: state.refreshKey + 1 };
    });

    return true;
  },

  removeFromWishlist: async (productId: string) => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return false;
    }

    const { error } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("user_id", session.user.id)
      .eq("product_id", productId);

    if (error) {
      console.error("Error removing from wishlist:", error);
      return false;
    }

    set((state) => {
      const newSet = new Set(state.wishlistProductIds);
      newSet.delete(productId);
      return { wishlistProductIds: newSet, refreshKey: state.refreshKey + 1 };
    });

    return true;
  },

  toggleWishlist: async (productId: string) => {
    const isInWishlist = get().isInWishlist(productId);
    if (isInWishlist) {
      return await get().removeFromWishlist(productId);
    } else {
      return await get().addToWishlist(productId);
    }
  },

  isInWishlist: (productId: string) => {
    return get().wishlistProductIds.has(productId);
  },

  loadWishlist: async () => {
    set({ isLoading: true });
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      set({ isLoading: false, wishlistProductIds: new Set() });
      return;
    }

    const { data, error } = await supabase
      .from("wishlist_items")
      .select("product_id")
      .eq("user_id", session.user.id);

    if (!error && data) {
      const productIds = new Set(data.map((item) => item.product_id));
      set((state) => ({
        wishlistProductIds: productIds,
        isLoading: false,
        refreshKey: state.refreshKey + 1
      }));
    } else {
      set({ isLoading: false });
    }
  },
}));
