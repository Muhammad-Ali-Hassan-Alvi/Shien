import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],

            addItem: (product, variant) => {
                const { items } = get();
                // Check if item with same ID and Variant exists
                const existingItemIndex = items.findIndex(
                    (item) =>
                        item._id === product._id &&
                        item.variant.size === variant.size &&
                        item.variant.color === variant.color
                );

                if (existingItemIndex > -1) {
                    const updatedItems = [...items];
                    updatedItems[existingItemIndex].quantity += 1;
                    set({ items: updatedItems });
                } else {
                    set({
                        items: [...items, {
                            ...product,
                            variant,
                            quantity: 1
                        }]
                    });
                }
            },

            removeItem: (productId, variant) => {
                set((state) => ({
                    items: state.items.filter((item) =>
                        !(item._id === productId &&
                            item.variant.size === variant.size &&
                            item.variant.color === variant.color)
                    ),
                }));
            },

            updateQuantity: (productId, variant, quantity) => {
                const { items } = get();
                const existingItemIndex = items.findIndex(
                    (item) =>
                        item._id === productId &&
                        item.variant.size === variant.size &&
                        item.variant.color === variant.color
                );

                if (existingItemIndex > -1) {
                    const updatedItems = [...items];
                    updatedItems[existingItemIndex].quantity = quantity;
                    if (updatedItems[existingItemIndex].quantity <= 0) {
                        // Remove if 0
                        updatedItems.splice(existingItemIndex, 1);
                    }
                    set({ items: updatedItems });
                }
            },

            clearCart: () => set({ items: [] }),

            getCartTotal: () => {
                const { items } = get();
                return items.reduce((total, item) => {
                    const price = item.pricing?.salePrice || item.salePrice || 0;
                    return total + (price * item.quantity);
                }, 0);
            }
        }),
        {
            name: 'shein-cart-storage', // unique name
        }
    )
);
