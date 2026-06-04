"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";

/**
 * Ensures persisted cart state finishes hydrating on the client.
 * Without this, checkout can stay stuck on "Loading your cart…" if
 * onRehydrateStorage never fires (direct navigation, storage quirks, etc.).
 */
export default function CartHydrator() {
    useEffect(() => {
        const markHydrated = () => useCartStore.getState().setHasHydrated(true);

        if (useCartStore.persist.hasHydrated()) {
            markHydrated();
            return;
        }

        const unsub = useCartStore.persist.onFinishHydration(markHydrated);

        useCartStore.persist.rehydrate();

        const fallback = setTimeout(markHydrated, 800);

        return () => {
            unsub();
            clearTimeout(fallback);
        };
    }, []);

    return null;
}
