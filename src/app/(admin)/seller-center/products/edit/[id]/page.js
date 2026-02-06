"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { Upload, ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        name: "",
        category: "",
        baseCost: 0,
        markupPercentage: 0,
        discountPercentage: 0,
        stock: 0,
        images: [],
        slug: ""
    });

    const [pricingPreview, setPricingPreview] = useState({
        originalPrice: 0,
        salePrice: 0,
        profit: 0
    });

    // Fetch Categories & Product
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Categories
                const catRes = await fetch('/api/categories');
                const catJson = await catRes.json();
                if (catJson.categories) setCategories(catJson.categories);

                // Product
                const prodRes = await fetch(`/api/products?id=${id}`);
                const prodJson = await prodRes.json();

                if (prodJson.product) {
                    const p = prodJson.product;
                    setFormData({
                        name: p.name,
                        category: p.category,
                        baseCost: p.pricing?.baseCost || 0,
                        markupPercentage: 0, // We don't store markup, we infer or reset. Let's just calculate from prices if needed, or leave 0 and let user override
                        discountPercentage: 0, // Hard to reverse engineer exactly without storing. 
                        // Actually, let's just set the prices directly or try to reverse if easy.
                        // For simplicity in Edit, we might just load cost/prices. 
                        // But the UI relies on markup/discount.
                        // Let's set cost and sales price, and let user adjust if they want.
                        // Or better: Just set the baseCost and let the preview update? No that would overwrite existing prices.

                        // Strategy: We load the *values*.
                        // If we want to support the calculator, we need to reverse engineer or just let user type new values.
                        // Let's load the *current* pricing into the preview, and set inputs to 0?
                        // Or better: Back-calculate discount % from original vs sale.
                        stock: p.variants?.[0]?.stock || 0,
                        images: p.images || [],
                        slug: p.slug
                    });

                    // Derive Discount %
                    const orig = p.pricing?.originalPrice || 0;
                    const sale = p.pricing?.salePrice || 0;
                    const cost = p.pricing?.baseCost || 0;

                    let discount = 0;
                    if (orig > 0) {
                        discount = Math.round(((orig - sale) / orig) * 100);
                    }

                    // Derive Markup % (Original vs Cost)
                    let markup = 0;
                    if (cost > 0) {
                        markup = Math.round(((orig - cost) / cost) * 100);
                    }

                    setFormData(prev => ({
                        ...prev,
                        markupPercentage: markup,
                        discountPercentage: discount
                    }));

                    setPricingPreview({
                        originalPrice: orig,
                        salePrice: sale,
                        profit: sale - cost
                    });
                }
            } catch (err) {
                toast.error("Failed to load product data");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchData();
    }, [id]);

    // Auto-Calc Effect (Only if user interacts? Or always?)
    // If we run this always, it might drift due to rounding.
    // Let's only run it if user changes inputs. 
    // We can rely on formatting.
    useEffect(() => {
        if (loading) return; // Don't calc while loading initial

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
    }, [formData.baseCost, formData.markupPercentage, formData.discountPercentage, loading]);

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

            if (!res.ok) throw new Error(json.error || "Upload failed");

            if (json.url) {
                setFormData(prev => ({ ...prev, images: [...prev.images, json.url] }));
                toast.success("Image uploaded!", { id: uploadToast });
            }
        } catch (err) {
            toast.error(err.message || "Upload failed", { id: uploadToast });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const payload = {
                name: formData.name,
                category: formData.category,
                description: "Premium Quality Fabric",
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

            const res = await fetch(`/api/products?id=${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Failed to update product");

            toast.success("Product Updated Successfully!");
            router.push('/seller-center/products');
            router.refresh();

        } catch (err) {
            toast.error(err.message || "Error updating product");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Product Data...</div>;

    return (
        <div className="max-w-4xl mx-auto p-8 space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/seller-center/products" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-3xl font-playfair font-bold">Edit Product</h1>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold mb-2">Product Title</label>
                        <input name="name" value={formData.name} onChange={handleChange} className="w-full border p-3 rounded" required />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Category</label>
                        <select name="category" value={formData.category} onChange={handleChange} className="w-full border p-3 rounded" required>
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Stock</label>
                        <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full border p-3 rounded" />
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-gray-700">Product Images</label>
                        <div className="grid grid-cols-3 gap-4">
                            {formData.images.map((img, idx) => (
                                <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                                    <Image src={img} alt="" fill className="object-cover" />
                                    <button type="button" onClick={() => setFormData(p => ({ ...p, images: p.images.filter((_, i) => i !== idx) }))} className="absolute top-1 right-1 bg-white p-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-600">
                                        <Upload size={14} className="rotate-45" />
                                    </button>
                                </div>
                            ))}
                            <div className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center aspect-square hover:bg-gray-50 relative cursor-pointer">
                                <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                <Upload size={24} className="text-gray-400" />
                                <span className="mt-2 text-xs text-gray-500 font-medium">Add Image</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Pricing */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 h-fit">
                    <h2 className="text-xl font-bold mb-4">Pricing Strategy</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Base Cost</label>
                            <div className="flex items-center">
                                <span className="text-gray-400 mr-2">Rs.</span>
                                <input type="number" name="baseCost" value={formData.baseCost} onChange={handleChange} className="w-full border p-2 rounded bg-white font-mono focus:ring-1 focus:ring-black outline-none" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Markup %</label>
                                <input type="number" name="markupPercentage" value={formData.markupPercentage} onChange={handleChange} className="w-full border p-2 rounded bg-white focus:ring-1 focus:ring-black outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Discount %</label>
                                <input type="number" name="discountPercentage" value={formData.discountPercentage} onChange={handleChange} className="w-full border p-2 rounded bg-white focus:ring-1 focus:ring-black outline-none" />
                            </div>
                        </div>

                        <div className="border-t border-gray-200 my-4 pt-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Original Price:</span>
                                <span className="line-through text-gray-400">Rs. {pricingPreview.originalPrice}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-black">
                                <span>Sale Price:</span>
                                <span>Rs. {pricingPreview.salePrice}</span>
                            </div>
                            <div className="bg-green-50 text-green-700 text-xs px-3 py-2 rounded-lg flex justify-between font-medium">
                                <span>Profit</span>
                                <span>+ Rs. {pricingPreview.profit}</span>
                            </div>
                        </div>
                    </div>
                    <button type="submit" disabled={submitting} className="w-full mt-6 bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition disabled:bg-gray-400">
                        {submitting ? "Updating..." : "Update Product"}
                    </button>
                </div>
            </form>
        </div>
    );
}
