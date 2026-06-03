"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp, Layers, Shirt, Smartphone, Settings2 } from "lucide-react";

export default function CategorySetupHelp() {
    const [open, setOpen] = useState(false);

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-indigo-50/60 transition-colors"
            >
                <span className="flex items-center gap-2 font-bold text-gray-900">
                    <HelpCircle size={18} className="text-indigo-600 shrink-0" />
                    How to set up categories & product options
                </span>
                {open ? (
                    <ChevronUp size={18} className="text-gray-400 shrink-0" />
                ) : (
                    <ChevronDown size={18} className="text-gray-400 shrink-0" />
                )}
            </button>

            {open && (
                <div className="px-5 pb-5 space-y-5 text-sm text-gray-700 border-t border-indigo-100/80">
                    <p className="pt-4 text-gray-600">
                        Use a <strong>tree structure</strong>: top-level types (Clothing, Electronics) → subcategories
                        (Lawn, Phones) → optional deeper groups. Product pages read <strong>variant settings</strong> from
                        the nearest parent that defines them.
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
                            <div className="flex items-center gap-2 font-bold text-gray-900">
                                <Shirt size={16} className="text-pink-600" />
                                Clothing example
                            </div>
                            <pre className="text-xs bg-gray-50 rounded p-3 overflow-x-auto leading-relaxed font-mono text-gray-600">
{`Clothing          ← custom: sizes ✓ colors ✓
  └─ Woman
       └─ Lawn
       └─ Formal`}
                            </pre>
                            <p className="text-xs text-gray-500">
                                Edit <strong>Clothing</strong> → enable custom variant settings → sizes & colors on.
                                All subcategories inherit automatically.
                            </p>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
                            <div className="flex items-center gap-2 font-bold text-gray-900">
                                <Smartphone size={16} className="text-blue-600" />
                                Electronics example
                            </div>
                            <pre className="text-xs bg-gray-50 rounded p-3 overflow-x-auto leading-relaxed font-mono text-gray-600">
{`Electronics       ← custom: sizes ✗ colors ✗
  └─ Phones
  └─ Laptops
  └─ Accessories`}
                            </pre>
                            <p className="text-xs text-gray-500">
                                Edit <strong>Electronics</strong> → custom settings → turn off sizes & colors.
                                Shoppers only see quantity + Add to Cart.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                        <div className="flex items-center gap-2 font-bold text-gray-900">
                            <Layers size={16} className="text-indigo-600" />
                            Navbar positioning (Lines vs categories)
                        </div>
                        <ul className="space-y-2 text-gray-600 list-disc pl-5">
                            <li>
                                <strong>Line</strong> (root only): top tabs like Woman / Man / Fragrances — opens the
                                hamburger category tree.
                            </li>
                            <li>
                                <strong>Regular root</strong>: appears in the main navbar with hover mega menu for its
                                subcategories.
                            </li>
                            <li>
                                <strong>Subcategories</strong>: nest under a root; use Add subcategory (+ folder icon) on
                                any row.
                            </li>
                            <li>
                                <strong>Show in navbar</strong> / <strong>Active</strong>: hide or disable without deleting.
                                Deactivating a parent hides all children on the shop.
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                        <div className="flex items-center gap-2 font-bold text-gray-900">
                            <Settings2 size={16} className="text-gray-700" />
                            Variant settings (sizes & colors)
                        </div>
                        <ol className="space-y-2 text-gray-600 list-decimal pl-5">
                            <li>Click <strong>Edit</strong> on a category (usually the top-level type).</li>
                            <li>Check <strong>Use custom variant settings for this category</strong>.</li>
                            <li>Toggle <strong>Show size selector</strong> / <strong>Show color selector</strong>.</li>
                            <li>For clothing, set size options (comma-separated): e.g. <code className="bg-gray-100 px-1 rounded">XS, S, M, L, XL</code>.</li>
                            <li>Save — subcategories inherit unless they also enable custom settings.</li>
                        </ol>
                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                            Tip: Create <strong>Clothing</strong> and <strong>Electronics</strong> as two roots first, set
                            their variant rules once, then add all subcategories underneath.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
