"use client";

import { useWishlistStore } from "@/store/useWishlistStore";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export default function WishlistPage() {
    const { wishlist } = useWishlistStore();

    if (wishlist.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
                <h2 className="text-2xl font-bold font-playfair mb-2">Your wishlist is empty</h2>
                <p className="text-gray-500 mb-6">Save items you love to buy them later.</p>
                <Link href="/" className="bg-black text-white px-8 py-3 uppercase font-bold tracking-widest hover:bg-gray-800">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-playfair font-bold mb-8">My Wishlist ({wishlist.length})</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {wishlist.map((product) => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>
        </div>
    );
}
