"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { productsLink } from "@/app/lib/navLinks";
import { getGroupsForDepartment } from "@/app/lib/categoryUtils";

const STATIC_DEPT_LINKS = [
    { name: "New In", href: productsLink({ sort: "new" }), static: true },
    { name: "Sale", href: productsLink({ sort: "price_asc" }), static: true, highlight: true },
];

export default function CategoryListPanel({ isOpen, onClose, lines = [], allCategories = [] }) {
    const lineOptions = useMemo(() => {
        if (lines.length > 0) return lines;
        return allCategories.filter((c) => !c.parent);
    }, [lines, allCategories]);

    const [activeLineId, setActiveLineId] = useState(null);
    const [activeDeptId, setActiveDeptId] = useState(null);

    const activeLine = useMemo(
        () => lineOptions.find((l) => l._id === activeLineId) || lineOptions[0] || null,
        [lineOptions, activeLineId]
    );

    const departments = activeLine?.children || [];

    const activeDept = useMemo(
        () => departments.find((d) => d._id === activeDeptId) || departments[0] || null,
        [departments, activeDeptId]
    );

    const groups = useMemo(() => getGroupsForDepartment(activeDept), [activeDept]);

    useEffect(() => {
        if (!isOpen) return;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    useEffect(() => {
        if (lineOptions.length && !activeLineId) {
            setActiveLineId(lineOptions[0]._id);
        }
    }, [lineOptions, activeLineId]);

    useEffect(() => {
        if (departments.length) {
            setActiveDeptId(departments[0]._id);
        } else {
            setActiveDeptId(null);
        }
    }, [activeLineId, departments]);

    if (!isOpen) return null;

    return (
        <>
            <button
                type="button"
                className="fixed inset-0 bg-black/30 z-[60] backdrop-blur-[2px]"
                aria-label="Close category menu"
                onClick={onClose}
            />

            <div className="fixed inset-y-0 left-0 z-[70] w-full max-w-4xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-5 sm:px-8 py-5 border-b border-gray-100 shrink-0">
                    <Link
                        href="/"
                        onClick={onClose}
                        className="text-2xl font-playfair font-black tracking-tight text-gray-900"
                    >
                        iMART
                    </Link>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Lines row */}
                {lineOptions.length > 0 && (
                    <div className="px-5 sm:px-8 py-4 border-b border-gray-100 flex flex-wrap gap-6 sm:gap-10 shrink-0">
                        {lineOptions.map((line) => (
                            <button
                                key={line._id}
                                type="button"
                                onClick={() => setActiveLineId(line._id)}
                                className={`text-xs sm:text-sm font-bold uppercase tracking-[0.15em] pb-1 border-b-2 transition-colors ${
                                    activeLine?._id === line._id
                                        ? "text-black border-black"
                                        : "text-gray-400 border-transparent hover:text-gray-700"
                                }`}
                            >
                                {line.name}
                            </button>
                        ))}
                    </div>
                )}

                {/* Body */}
                <div className="flex-1 flex flex-col sm:flex-row min-h-0 overflow-hidden">
                    {/* Left: departments */}
                    <aside className="sm:w-52 lg:w-60 border-b sm:border-b-0 sm:border-r border-gray-100 shrink-0 overflow-y-auto">
                        <nav className="py-2 sm:py-4">
                            {STATIC_DEPT_LINKS.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={onClose}
                                    className={`block px-5 sm:px-8 py-3 text-sm font-medium transition-colors hover:bg-gray-50 ${
                                        link.highlight ? "text-red-600" : "text-gray-700"
                                    }`}
                                >
                                    {link.name}
                                </Link>
                            ))}

                            {departments.map((dept) => (
                                <button
                                    key={dept._id}
                                    type="button"
                                    onClick={() => setActiveDeptId(dept._id)}
                                    className={`w-full text-left px-5 sm:px-8 py-3 text-sm font-medium transition-colors ${
                                        activeDept?._id === dept._id
                                            ? "text-black border-l-2 border-black bg-gray-50"
                                            : "text-gray-600 hover:bg-gray-50 border-l-2 border-transparent"
                                    }`}
                                >
                                    {dept.name}
                                </button>
                            ))}

                            {activeLine && (
                                <Link
                                    href={productsLink({ category: activeLine.name })}
                                    onClick={onClose}
                                    className="block px-5 sm:px-8 py-3 text-sm font-bold uppercase tracking-wide text-gray-900 hover:bg-gray-50 mt-2 border-t border-gray-100"
                                >
                                    View All
                                </Link>
                            )}

                            {departments.length === 0 && lineOptions.length === 0 && (
                                <p className="px-5 py-4 text-sm text-gray-400">No categories yet.</p>
                            )}
                        </nav>
                    </aside>

                    {/* Right: grouped category list */}
                    <div className="flex-1 overflow-y-auto p-5 sm:p-8">
                        {activeDept ? (
                            <>
                                <Link
                                    href={productsLink({ category: activeDept.name })}
                                    onClick={onClose}
                                    className="inline-block text-xs font-bold uppercase tracking-widest text-gray-900 border-b border-black pb-0.5 mb-8 hover:opacity-70"
                                >
                                    View All {activeDept.name}
                                </Link>

                                {groups.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                                        {groups.map((group) => (
                                            <div key={group.title}>
                                                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-900 mb-4">
                                                    {group.title}
                                                </h3>
                                                <ul className="space-y-3">
                                                    {group.items.map((item) => (
                                                        <li key={item._id || item.name}>
                                                            <Link
                                                                href={productsLink({ category: item.name })}
                                                                onClick={onClose}
                                                                className="text-sm text-gray-600 hover:text-black transition-colors"
                                                            >
                                                                {item.name}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-500">
                                        <Link
                                            href={productsLink({ category: activeDept.name })}
                                            onClick={onClose}
                                            className="hover:text-black underline underline-offset-4"
                                        >
                                            Browse {activeDept.name}
                                        </Link>
                                    </div>
                                )}
                            </>
                        ) : activeLine ? (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-500">
                                    Browse all products in {activeLine.name}.
                                </p>
                                <Link
                                    href={productsLink({ category: activeLine.name })}
                                    onClick={onClose}
                                    className="inline-block text-sm font-bold uppercase tracking-wide text-black border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors"
                                >
                                    Shop {activeLine.name}
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {allCategories
                                    .filter((c) => !c.parent)
                                    .map((cat) => (
                                        <Link
                                            key={cat._id}
                                            href={productsLink({ category: cat.name })}
                                            onClick={onClose}
                                            className="text-sm font-medium text-gray-700 hover:text-black py-2"
                                        >
                                            {cat.name}
                                        </Link>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer quick links */}
                <div className="px-5 sm:px-8 py-4 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-500 shrink-0">
                    <Link href="/products" onClick={onClose} className="hover:text-black">
                        All Products
                    </Link>
                    <Link href="/profile" onClick={onClose} className="hover:text-black">
                        My Account
                    </Link>
                    <Link href="/wishlist" onClick={onClose} className="hover:text-black">
                        Wishlist
                    </Link>
                </div>
            </div>
        </>
    );
}
