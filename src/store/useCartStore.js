import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],

            addItem: (product, variant, quantity = 1) => {
                const qty = Math.max(1, Math.floor(Number(quantity) || 1));
                const maxStock = variant?.stock > 0 ? variant.stock : null;
                const { items } = get();
                const existingItemIndex = items.findIndex(
                    (item) =>
                        item._id === product._id &&
                        item.variant.size === variant.size &&
                        item.variant.color === variant.color
                );

                if (existingItemIndex > -1) {
                    const updatedItems = [...items];
                    let newQty = updatedItems[existingItemIndex].quantity + qty;
                    if (maxStock) newQty = Math.min(newQty, maxStock);
                    updatedItems[existingItemIndex].quantity = newQty;
                    set({ items: updatedItems });
                } else {
                    const initialQty = maxStock ? Math.min(qty, maxStock) : qty;
                    set({
                        items: [...items, {
                            ...product,
                            variant,
                            quantity: initialQty,
                        }],
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
