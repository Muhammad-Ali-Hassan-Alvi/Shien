import { useWishlistStore } from "@/store/useWishlistStore";

/** Fetch server wishlist for logged-in users and merge into Zustand store. */
export async function fetchAndSetWishlist(setWishlist) {
    try {
        const res = await fetch("/api/wishlist");
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.wishlist)) {
            setWishlist(
                data.wishlist.map((p) => ({
                    ...p,
                    _id: p._id?.toString?.() ?? p._id,
                }))
            );
        }
    } catch (e) {
        console.error("Wishlist hydrate failed", e);
    }
}

export function useWishlistHydrate(sessionStatus) {
    const setWishlist = useWishlistStore((s) => s.setWishlist);

    return () => {
        if (sessionStatus === "authenticated") {
            fetchAndSetWishlist(setWishlist);
        }
    };
}
