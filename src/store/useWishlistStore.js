import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWishlistStore = create(
    persist(
        (set, get) => ({
            wishlist: [],

            // Add or Remove item
            toggleWishlist: async (product, userId = null) => {
                const { wishlist } = get();
                const exists = wishlist.some((item) => item._id === product._id);

                // Optimistic update
                let newWishlist;
                if (exists) {
                    newWishlist = wishlist.filter((item) => item._id !== product._id);
                } else {
                    newWishlist = [...wishlist, product];
                }

                set({ wishlist: newWishlist });

                // Sync with DB if logged in
                if (userId) {
                    try {
                        await fetch('/api/user/wishlist', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ productId: product._id })
                        });
                    } catch (error) {
                        console.error("Failed to sync wishlist", error);
                        // Revert on failure? For now, keep optimistic.
                    }
                }
            },

            // Set wishlist (e.g., from DB on login)
            setWishlist: (items) => set({ wishlist: items }),

            isInWishlist: (productId) => {
                return get().wishlist.some(p => p._id === productId);
            }
        }),
        {
            name: 'shein-wishlist-storage',
        }
    )
);
