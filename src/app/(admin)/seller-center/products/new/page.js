"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { Upload } from "lucide-react";

const CATEGORIES = ["Lawn 2024", "Pret", "Festive", "Unstitched", "Formals"];

export default function NewProductPage() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        category: CATEGORIES[0],
        baseCost: 0,
        markupPercentage: 50,
        discountPercentage: 20,
        stock: 100,
        image: "", // Single image URL
    });

    const [pricingPreview, setPricingPreview] = useState({
        originalPrice: 0,
        salePrice: 0,
        profit: 0
    });

    // Auto-Calc Effect
    useEffect(() => {
        const cost = Number(formData.baseCost) || 0;
        const markup = Number(formData.markupPercentage) || 0;
        const discount = Number(formData.discountPercentage) || 0;

        // Formula: Original = Base * (1 + Markup)
        const original = Math.round(cost * (1 + markup / 100));

        // Formula: Sale = Original * (1 - Discount)
        const sale = Math.round(original * (1 - discount / 100));

        setPricingPreview({
            originalPrice: original,
            salePrice: sale,
            profit: sale - cost
        });
    }, [formData.baseCost, formData.markupPercentage, formData.discountPercentage]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadToast = toast.loading("Uploading image...");
        const data = new FormData();
        data.append('file', file);

        try {
            const res = await fetch('/api/upload', { method: 'POST', body: data });
            const json = await res.json();

            if (json.url) {
                setFormData(prev => ({ ...prev, image: json.url }));
                toast.success("Image uploaded!", { id: uploadToast });
            } else {
                throw new Error("Upload failed");
            }
        } catch (err) {
            toast.error("Upload failed", { id: uploadToast });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Construct payload matching Product Schema
            const payload = {
                name: formData.name,
                // Slug generation on client for simplicity, ideally backend
                slug: formData.name.toLowerCase().replace(/ /g, '-') + '-' + Date.now(),
                category: formData.category,
                description: "Premium Quality Fabric", // Placeholder
                pricing: {
                    baseCost: Number(formData.baseCost),
                    originalPrice: pricingPreview.originalPrice,
                    salePrice: pricingPreview.salePrice,
                    discountLabel: `${formData.discountPercentage}% OFF`
                },
                variants: [
                    { color: "Mixed", size: "M", stock: Number(formData.stock) }
                ],
                images: [formData.image],
                isDirtyPriced: true
            };

            // TODO: Implement actual POST /api/products (Using the seeder logic style for now or new route)
            // For this task, we assume the backend route exists or we just log it. 
            // Wait, the User asked for the FORM code, not the backend route for creating one product.
            // But to make it work, I'll console log it.
            console.log("Submitting Product:", payload);
            toast.success("Product Created! (Check Console)");

        } catch (err) {
            toast.error("Error creating product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-3xl font-playfair font-bold mb-8">Add New Product</h1>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Left Column: Details */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold mb-2">Product Title</label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full border p-3 rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full border p-3 rounded"
                        >
                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-2">Stock</label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                className="w-full border p-3 rounded"
                            />
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center hover:bg-gray-50 transition-colors relative">
                        <input
                            type="file"
                            onChange={handleImageUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            accept="image/*"
                        />
                        {formData.image ? (
                            <div className="relative h-48 w-full">
                                <Image src={formData.image} alt="Preview" fill className="object-cover rounded" />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-gray-400">
                                <Upload size={32} />
                                <span className="mt-2 text-sm">Click to upload image</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Dirty Pricing Engine */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        💰 Pricing Engine
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">Base Cost (Hidden)</label>
                            <div className="flex items-center">
                                <span className="text-gray-400 mr-2">Rs.</span>
                                <input
                                    type="number"
                                    name="baseCost"
                                    value={formData.baseCost}
                                    onChange={handleChange}
                                    className="w-full border p-2 rounded bg-white font-mono"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-1">Markup %</label>
                                <input
                                    type="number"
                                    name="markupPercentage"
                                    value={formData.markupPercentage}
                                    onChange={handleChange}
                                    className="w-full border p-2 rounded bg-white text-blue-600 font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-1">Discount %</label>
                                <input
                                    type="number"
                                    name="discountPercentage"
                                    value={formData.discountPercentage}
                                    onChange={handleChange}
                                    className="w-full border p-2 rounded bg-white text-red-600 font-bold"
                                />
                            </div>
                        </div>

                        <div className="border-t border-gray-300 my-4 pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Fake Original Price:</span>
                                <span className="line-through text-gray-400">Rs. {pricingPreview.originalPrice}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-red-600">
                                <span>Final Sale Price:</span>
                                <span>Rs. {pricingPreview.salePrice}</span>
                            </div>
                            <div className="flex justify-between text-xs text-green-600 mt-2">
                                <span>Projected Profit:</span>
                                <span>+ Rs. {pricingPreview.profit}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </form>
        </div>
    );
}
