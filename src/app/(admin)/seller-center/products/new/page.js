"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        name: "",
        category: "",
        baseCost: 0,
        markupPercentage: 50,
        discountPercentage: 20,
        stock: 100,
        images: [],
    });

    const [pricingPreview, setPricingPreview] = useState({
        originalPrice: 0,
        salePrice: 0,
        profit: 0
    });

    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/categories');
                const json = await res.json();
                if (json.categories) {
                    setCategories(json.categories);
                    // Set default if not set
                    if (json.categories.length > 0 && !formData.category) {
                        setFormData(prev => ({ ...prev, category: json.categories[0].name }));
                    }
                }
            } catch (err) {
                console.error("Failed to load categories");
            }
        };
        fetchCategories();
    }, []);

    // Auto-Calc Effect
    useEffect(() => {
        const cost = Number(formData.baseCost) || 0;
        const markup = Number(formData.markupPercentage) || 0;
        const discount = Number(formData.discountPercentage) || 0;

        const original = Math.round(cost * (1 + markup / 100));
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

            if (!res.ok) {
                throw new Error(json.error || "Upload failed");
            }

            if (json.url) {
                setFormData(prev => ({ ...prev, images: [...prev.images, json.url] }));
                toast.success("Image uploaded!", { id: uploadToast });
            }
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Upload failed", { id: uploadToast });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                name: formData.name,
                slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
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
                images: formData.images,
                isDirtyPriced: true
            };

            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const json = await res.json();

            if (!res.ok) {
                throw new Error(json.error || "Failed to create product");
            }

            toast.success("Product Created Successfully!");
            router.push('/seller-center/products');
            router.refresh();

        } catch (err) {
            console.error(err);
            toast.error(err.message || "Error creating product");
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
                            required
                        >
                            <option value="" disabled>Select Category</option>
                            {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                        </select>
                        {categories.length === 0 && <p className="text-xs text-red-500 mt-1">No categories found. Create one first.</p>}
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
                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-gray-700">Product Images</label>

                        <div className="grid grid-cols-3 gap-4">
                            {formData.images.map((img, idx) => (
                                <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                                    <Image src={img} alt={`Product ${idx}`} fill className="object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                                        className="absolute top-1 right-1 bg-white p-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 text-red-600"
                                    >
                                        <Upload size={14} className="rotate-45" />
                                    </button>
                                </div>
                            ))}

                            <div className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center aspect-square hover:bg-gray-50 transition-colors relative cursor-pointer">
                                <input
                                    type="file"
                                    onChange={handleImageUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    accept="image/*"
                                />
                                <Upload size={24} className="text-gray-400" />
                                <span className="mt-2 text-xs text-gray-500 font-medium">Add Image</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400">First image will be the main cover.</p>
                    </div>
                </div>

                {/* Right Column: Pricing Strategy */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 h-fit">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        Pricing Strategy
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Base Cost</label>
                            <div className="flex items-center">
                                <span className="text-gray-400 mr-2">Rs.</span>
                                <input
                                    type="number"
                                    name="baseCost"
                                    value={formData.baseCost}
                                    onChange={handleChange}
                                    className="w-full border p-2 rounded bg-white font-mono focus:ring-1 focus:ring-black outline-none"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Internal use only</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Markup %</label>
                                <input
                                    type="number"
                                    name="markupPercentage"
                                    value={formData.markupPercentage}
                                    onChange={handleChange}
                                    className="w-full border p-2 rounded bg-white focus:ring-1 focus:ring-black outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Discount %</label>
                                <input
                                    type="number"
                                    name="discountPercentage"
                                    value={formData.discountPercentage}
                                    onChange={handleChange}
                                    className="w-full border p-2 rounded bg-white focus:ring-1 focus:ring-black outline-none"
                                />
                            </div>
                        </div>

                        <div className="border-t border-gray-200 my-4 pt-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Original Price (MSRP):</span>
                                <span className="line-through text-gray-400">Rs. {pricingPreview.originalPrice}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-black">
                                <span>Sale Price:</span>
                                <span>Rs. {pricingPreview.salePrice}</span>
                            </div>
                            <div className="bg-green-50 text-green-700 text-xs px-3 py-2 rounded-lg flex justify-between font-medium">
                                <span>Estimated Profit</span>
                                <span>+ Rs. {pricingPreview.profit}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition disabled:bg-gray-400"
                    >
                        {loading ? "Creating..." : "Publish Product"}
                    </button>
                </div>

            </form>
        </div>
    );
}
