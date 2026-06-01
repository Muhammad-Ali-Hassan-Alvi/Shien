"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { productsLink } from "@/app/lib/navLinks";

function buildMegaColumns(line) {
    const children = line.children || [];
    if (children.length === 0) return null;

    return children.map((child) => ({
        title: child.name,
        items:
            child.children?.length > 0
                ? child.children.map((c) => ({ name: c.name, slug: c.slug }))
                : [{ name: child.name, slug: child.slug }],
    }));
}

function LineMegaMenu({ line, columns }) {
    if (!columns?.length) return null;
    const cols = Math.min(columns.length, 4);

    return (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-[min(90vw,640px)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-50">
            <div
                className="bg-white border border-gray-100 shadow-xl rounded-lg p-6 grid gap-8"
                style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
                {columns.map((sub) => (
                    <div key={sub.title} className="space-y-3">
                        <h4 className="font-bold text-xs uppercase tracking-widest text-gray-900 border-b border-gray-100 pb-2">
                            {sub.title}
                        </h4>
                        <ul className="space-y-2">
                            {sub.items.map((subItem) => (
                                <li key={subItem.name}>
                                    <Link
                                        href={productsLink({ category: subItem.name })}
                                        className="text-gray-500 hover:text-black block text-sm transition-colors"
                                    >
                                        {subItem.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function LinesNav({ lines, variant = "bar", onNavigate, activeLineName }) {
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get("category")?.toLowerCase();

    const isLineActive = (line) => {
        if (activeLineName && line.name.toLowerCase() === activeLineName.toLowerCase()) return true;
        if (!categoryParam) return false;
        if (line.name.toLowerCase() === categoryParam) return true;

        const matchInTree = (node) => {
            if (node.name.toLowerCase() === categoryParam) return true;
            return (node.children || []).some(matchInTree);
        };
        return matchInTree(line);
    };

    if (!lines?.length) return null;

    if (variant === "mobile") {
        return (
            <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Shop by Line</p>
                <div className="flex flex-wrap gap-2">
                    {lines.map((line) => (
                        <Link
                            key={line._id}
                            href={productsLink({ category: line.name })}
                            onClick={onNavigate}
                            className={`px-3 py-2 text-xs font-bold uppercase tracking-wider border rounded-md transition-colors ${
                                isLineActive(line)
                                    ? "bg-black text-white border-black"
                                    : "bg-gray-50 text-gray-800 border-gray-200 hover:border-black"
                            }`}
                        >
                            {line.name}
                        </Link>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="border-t border-gray-100/80 bg-white/70 backdrop-blur-md hidden md:block">
            <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-center items-center gap-10 lg:gap-14 py-3">
                {lines.map((line) => {
                    const megaColumns = buildMegaColumns(line);
                    const active = isLineActive(line);

                    return (
                        <div key={line._id} className="relative group">
                            <Link
                                href={productsLink({ category: line.name })}
                                className={`inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.2em] transition-colors py-1 border-b-2 ${
                                    active
                                        ? "text-black border-black"
                                        : "text-gray-600 border-transparent hover:text-black hover:border-gray-300"
                                }`}
                            >
                                {line.name}
                                {megaColumns && (
                                    <ChevronDown
                                        size={12}
                                        className="opacity-50 group-hover:rotate-180 transition-transform duration-300"
                                    />
                                )}
                            </Link>
                            <LineMegaMenu line={line} columns={megaColumns} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
