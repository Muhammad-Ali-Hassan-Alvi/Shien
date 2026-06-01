"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/store/useUIStore";

/** Cart is drawer-only; redirect and open cart drawer. */
export default function CartRedirectPage() {
    const router = useRouter();
    const { openCart } = useUIStore();

    useEffect(() => {
        openCart();
        router.replace("/");
    }, [openCart, router]);

    return (
        <div className="min-h-[40vh] flex items-center justify-center text-gray-500 text-sm">
            Opening cart…
        </div>
    );
}
