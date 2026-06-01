"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { productsLink } from "@/app/lib/navLinks";

const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=256&auto=format&fit=crop";

export default function CategoryIcons() {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await fetch("/api/categories?tree=true");
                const data = await res.json();
                if (data.categories) {
                    const lines = data.categories.filter((c) => c.isLine);
                    const topLevel = lines.length > 0 ? lines : data.categories;
                    setCategories(topLevel.slice(0, 14));
                }
            } catch (e) {
                console.error(e);
            }
        }
        fetchCategories();
    }, []);

    if (categories.length === 0) return null;

    return (
        <div className="py-6 bg-white">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="grid grid-cols-5 md:grid-cols-7 gap-y-6 gap-x-2 md:gap-x-8 place-items-center">
                    {categories.map((cat) => (
                        <Link
                            key={cat._id}
                            href={productsLink({ category: cat.name })}
                            className="flex flex-col items-center gap-2 cursor-pointer group w-full"
                        >
                            <div className="w-16 h-16 md:w-24 md:h-24 rounded-[20px] md:rounded-[30px] overflow-hidden relative shadow-sm hover:shadow-md transition-all bg-gray-50">
                                <Image
                                    src={cat.image || FALLBACK_IMAGE}
                                    alt={cat.name}
                                    fill
                                    className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <span className="text-[10px] md:text-sm font-bold text-gray-800 uppercase tracking-tight text-center">
                                {cat.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
