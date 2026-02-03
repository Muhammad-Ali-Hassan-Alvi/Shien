"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";

export default function AdminHeroPage() {
    const [formData, setFormData] = useState({
        image: "",
        title: "",
        subtitle: "",
        cta: "Shop Now",
        link: "/#shop",
        order: 0
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/hero", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to add slide");

            toast.success("Slide added successfully!");
            setFormData({
                image: "",
                title: "",
                subtitle: "",
                cta: "Shop Now",
                link: "/#shop",
                order: 0
            });
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8">Manage Hero Slides</h1>

            <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded-lg space-y-4 border">
                <div>
                    <label className="block text-sm font-bold mb-2">Image URL</label>
                    <input
                        type="text"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        required
                        placeholder="https://..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold mb-2">Title</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full border p-2 rounded" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2">Subtitle</label>
                        <input type="text" name="subtitle" value={formData.subtitle} onChange={handleChange} className="w-full border p-2 rounded" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold mb-2">Button Text</label>
                        <input type="text" name="cta" value={formData.cta} onChange={handleChange} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2">Link</label>
                        <input type="text" name="link" value={formData.link} onChange={handleChange} className="w-full border p-2 rounded" />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
                >
                    {loading ? "Adding..." : "Add Slide"}
                </button>
            </form>

            {/* Preview if Image URL exists */}
            {formData.image && (
                <div className="mt-8">
                    <h2 className="text-xl font-bold mb-4">Preview</h2>
                    <div className="relative h-[200px] w-full bg-gray-100 rounded overflow-hidden">
                        <Image src={formData.image} alt="Preview" fill className="object-cover" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/20">
                            <span className="bg-black/80 px-2 py-1 text-[10px] font-bold uppercase mb-2">{formData.subtitle}</span>
                            <h2 className="text-2xl font-bold mb-2">{formData.title}</h2>
                            <span className="bg-white text-black px-4 py-1 text-xs font-bold uppercase">{formData.cta}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
