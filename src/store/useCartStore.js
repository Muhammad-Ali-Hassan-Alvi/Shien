import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { findMatchingVariant } from '@/app/lib/productUtils';

const CART_STORAGE_KEY = 'shein-cart-storage';

function writeCartToStorage(items) {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify({ state: { items }, version: 0 })
        );
    } catch (error) {
        console.error('[cart] Failed to persist cart:', error);
    }
}

export const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],
            hasHydrated: false,
            _skipPersistedHydrate: false,
            setHasHydrated: () => set({ hasHydrated: true }),

            addItem: (product, variant, quantity = 1) => {
                const resolvedVariant = findMatchingVariant(product.variants, variant);
                const qty = Math.max(1, Math.floor(Number(quantity) || 1));
                const maxStock = resolvedVariant?.stock > 0 ? resolvedVariant.stock : null;
                const { items } = get();
                const existingItemIndex = items.findIndex(
                    (item) =>
                        item._id === product._id &&
                        item.variant.size === resolvedVariant.size &&
                        item.variant.color === resolvedVariant.color
                );

                if (existingItemIndex > -1) {
                    const updatedItems = [...items];
                    let newQty = updatedItems[existingItemIndex].quantity + qty;
                    if (maxStock) newQty = Math.min(newQty, maxStock);
                    updatedItems[existingItemIndex].quantity = newQty;
                    set({ items: updatedItems, _skipPersistedHydrate: false });
                } else {
                    const initialQty = maxStock ? Math.min(qty, maxStock) : qty;
                    set({
                        items: [...items, {
                            ...product,
                            variant: resolvedVariant,
                            quantity: initialQty,
                        }],
                        _skipPersistedHydrate: false,
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
                    _skipPersistedHydrate: false,
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
                        updatedItems.splice(existingItemIndex, 1);
                    }
                    set({ items: updatedItems, _skipPersistedHydrate: false });
                }
            },

            /** Remove specific line items after a successful order. */
            removeOrderedItems: (orderedItems = []) => {
                if (!orderedItems.length) return;
                set((state) => ({
                    items: state.items.filter((cartItem) =>
                        !orderedItems.some((ordered) =>
                            String(ordered.product) === String(cartItem._id) &&
                            ordered.variant?.size === cartItem.variant?.size &&
                            ordered.variant?.color === cartItem.variant?.color
                        )
                    ),
                    _skipPersistedHydrate: false,
                }));
            },

            clearCart: () => {
                set({ items: [], _skipPersistedHydrate: true });
                writeCartToStorage([]);
            },

            getCartTotal: () => {
                const { items } = get();
                return items.reduce((total, item) => {
                    const price = item.pricing?.salePrice || item.salePrice || 0;
                    return total + (price * item.quantity);
                }, 0);
            }
        }),
        {
            name: CART_STORAGE_KEY,
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ items: state.items }),
            skipHydration: true,
            onRehydrateStorage: () => (_state, error) => {
                if (error) {
                    console.error("[cart] Failed to rehydrate from storage:", error);
                }
            },
        }
    )
);

if (typeof window !== "undefined" && useCartStore.persist?.onFinishHydration) {
    useCartStore.persist.onFinishHydration(() => {
        const { _skipPersistedHydrate } = useCartStore.getState();

        if (_skipPersistedHydrate) {
            useCartStore.setState({ items: [], hasHydrated: true, _skipPersistedHydrate: false });
            writeCartToStorage([]);
            return;
        }

        useCartStore.setState({ hasHydrated: true });
    });
}
