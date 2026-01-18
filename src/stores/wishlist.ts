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

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error getting user:", userError);
        set({ items: [], isLoading: false });
        return;
      }

      if (!user) {
        console.log("No user logged in, clearing wishlist");
        set({ items: [], isLoading: false });
        return;
      }

      console.log("Fetching wishlist for user:", user.id);
      const { data, error } = await supabase
        .from("wishlist_items")
        .select("product_id")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching wishlist from DB:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        set({ isLoading: false });
        return;
      }

      const productIds = data?.map((item) => item.product_id) || [];
      console.log("Fetched wishlist items:", productIds.length);
      set({ items: productIds, isLoading: false });
    } catch (error) {
      console.error("Exception in fetchWishlist:", error);
      set({ isLoading: false });
    }
  },

  addToWishlist: async (productId: string) => {
    try {
      console.log("Adding product to wishlist:", productId);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.warn("User not logged in, cannot add to wishlist");
        alert("Please login to add items to wishlist");
        return;
      }

      // Optimistically update UI
      const currentItems = get().items;
      if (!currentItems.includes(productId)) {
        console.log("Optimistically adding to local state");
        set({ items: [...currentItems, productId] });
      } else {
        console.log("Product already in wishlist");
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
        if (error.code === "23505") {
          console.log("Product already in database wishlist (duplicate constraint)");
        } else {
          console.error("Error adding to wishlist DB:", error);
          console.error("Error details:", JSON.stringify(error, null, 2));
          // Revert optimistic update
          set({ items: currentItems });
        }
      } else {
        console.log("Successfully added to wishlist DB");
      }
    } catch (error) {
      console.error("Exception in addToWishlist:", error);
    }
  },

  removeFromWishlist: async (productId: string) => {
    try {
      console.log("Removing product from wishlist:", productId);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.warn("User not logged in, cannot remove from wishlist");
        return;
      }

      // Optimistically update UI
      const currentItems = get().items;
      console.log("Optimistically removing from local state");
      set({ items: currentItems.filter((id) => id !== productId) });

      // Remove from database
      const { error } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);

      if (error) {
        console.error("Error removing from wishlist DB:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        // Revert optimistic update
        set({ items: currentItems });
      } else {
        console.log("Successfully removed from wishlist DB");
      }
    } catch (error) {
      console.error("Exception in removeFromWishlist:", error);
    }
  },

  isInWishlist: (productId: string) => {
    return get().items.includes(productId);
  },
}));
