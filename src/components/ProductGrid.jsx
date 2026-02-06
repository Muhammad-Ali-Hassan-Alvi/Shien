"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import ProductSkeleton from "@/components/ProductSkeleton";

export default function ProductGrid({ initialProducts }) {
  const [products, setProducts] = useState(initialProducts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams(); // Get URL params

  // Reset grid when initialProducts changes (e.g. category change)
  useEffect(() => {
    setProducts(initialProducts);
    setPage(1);
    setHasMore(true);
  }, [initialProducts]);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const nextPage = page + 1;
      // Construct Query string from current params + page
      const currentParams = new URLSearchParams(searchParams.toString());
      currentParams.set("page", nextPage);
      currentParams.set("limit", "10");
      
      const res = await fetch(`/api/products?${currentParams.toString()}`);
      const data = await res.json();

      if (data.products.length > 0) {
        setProducts((prev) => {
            const newProducts = data.products.filter(p => !prev.some(existing => existing._id === p._id));
            return [...prev, ...newProducts];
        });
        setPage(nextPage);
        setHasMore(data.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className="h-[1px] w-12 bg-gray-300"></div>
        <h2 className="text-xl font-bold uppercase tracking-wider text-gray-800">For You</h2>
        <div className="h-[1px] w-12 bg-gray-300"></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-4 gap-x-2 md:gap-x-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
      
      {/* Loading State - Skeletons */}
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-8 gap-x-4 mt-8">
            {Array.from({ length: 5 }).map((_, i) => (
                <ProductSkeleton key={`skeleton-${i}`} />
            ))}
        </div>
      )}

      {/* View More Button */}
      {hasMore && !loading && (
          <div className="flex justify-center mt-12 mb-8">
              <button 
                onClick={loadMore}
                className="px-12 py-3 bg-white/80 backdrop-blur-md border border-gray-200 text-gray-900 font-bold text-sm uppercase tracking-widest hover:bg-black hover:text-white hover:border-black transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 rounded-full group flex items-center gap-2"
              >
                  View More <ChevronDown size={14} className="group-hover:translate-y-1 transition-transform" />
              </button>
          </div>
      )}

      {!hasMore && (
          <div className="text-center p-8 text-gray-500 text-sm uppercase tracking-widest">
              You've reached the end
          </div>
      )}
    </>
  );
}
