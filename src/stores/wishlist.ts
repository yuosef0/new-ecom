import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface WishlistItem {
    id: string;
    name: string;
    slug: string;
    base_price: number;
    images: Array<{
        url: string;
        alt_text: string | null;
        is_primary?: boolean;
    }>;
}

interface WishlistStore {
    items: WishlistItem[];
    addToWishlist: (item: WishlistItem) => void;
    removeFromWishlist: (id: string) => void;
    toggleWishlist: (item: WishlistItem) => void;
    isInWishlist: (id: string) => boolean;
    clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
    persist(
        (set, get) => ({
            items: [],

            addToWishlist: (item) => {
                const { items } = get();
                // Check if already in wishlist
                if (items.find((i) => i.id === item.id)) {
                    return;
                }
                set({ items: [...items, item] });
            },

            removeFromWishlist: (id) => {
                set((state) => ({
                    items: state.items.filter((item) => item.id !== id),
                }));
            },

            toggleWishlist: (item) => {
                const { items, addToWishlist, removeFromWishlist } = get();
                const exists = items.find((i) => i.id === item.id);

                if (exists) {
                    removeFromWishlist(item.id);
                } else {
                    addToWishlist(item);
                }
            },

            isInWishlist: (id) => {
                const { items } = get();
                return items.some((item) => item.id === id);
            },

            clearWishlist: () => {
                set({ items: [] });
            },
        }),
        {
            name: "wishlist-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
