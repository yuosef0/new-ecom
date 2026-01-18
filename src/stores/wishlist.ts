import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

interface WishlistState {
  items: string[]; // Array of product IDs
  isLoading: boolean;

  // Actions
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,

  fetchWishlist: async () => {
    try {
      set({ isLoading: true });
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        set({ items: [], isLoading: false });
        return;
      }

      const { data, error } = await supabase
        .from("wishlist_items")
        .select("product_id")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching wishlist:", error);
        set({ isLoading: false });
        return;
      }

      const productIds = data?.map((item) => item.product_id) || [];
      set({ items: productIds, isLoading: false });
    } catch (error) {
      console.error("Error in fetchWishlist:", error);
      set({ isLoading: false });
    }
  },

  addToWishlist: async (productId: string) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert("Please login to add items to wishlist");
        return;
      }

      // Optimistically update UI
      const currentItems = get().items;
      if (!currentItems.includes(productId)) {
        set({ items: [...currentItems, productId] });
      }

      // Add to database
      const { error } = await supabase
        .from("wishlist_items")
        .insert({
          user_id: user.id,
          product_id: productId,
          variant_id: null,
        });

      if (error) {
        // If duplicate, it's fine (already in wishlist)
        if (error.code !== "23505") {
          console.error("Error adding to wishlist:", error);
          // Revert optimistic update
          set({ items: currentItems });
        }
      }
    } catch (error) {
      console.error("Error in addToWishlist:", error);
    }
  },

  removeFromWishlist: async (productId: string) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      // Optimistically update UI
      const currentItems = get().items;
      set({ items: currentItems.filter((id) => id !== productId) });

      // Remove from database
      const { error } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);

      if (error) {
        console.error("Error removing from wishlist:", error);
        // Revert optimistic update
        set({ items: currentItems });
      }
    } catch (error) {
      console.error("Error in removeFromWishlist:", error);
    }
  },

  isInWishlist: (productId: string) => {
    return get().items.includes(productId);
  },
}));
