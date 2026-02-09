export default function SustainabilityPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-20">
            <h1 className="text-5xl font-playfair font-black text-green-900 mb-8 tracking-tight">Conscious Luxury.</h1>

            <div className="prose prose-lg prose-gray max-w-none">
                <p className="text-xl text-gray-600 leading-relaxed font-light mb-12">
                    Fashion shouldn't cost the Earth. At iMART, we are committed to a sustainable future where style and responsibility coexist.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-16">
                    <div className="border border-green-100 p-6 rounded-xl">
                        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-700 mb-4 text-2xl">🌱</div>
                        <h3 className="font-bold text-lg mb-2">Ethical Sourcing</h3>
                        <p className="text-sm text-gray-500">We partner exclusively with suppliers who uphold strict labor and environmental standards.</p>
                    </div>
                    <div className="border border-green-100 p-6 rounded-xl">
                        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-700 mb-4 text-2xl">♻️</div>
                        <h3 className="font-bold text-lg mb-2">Eco-Packaging</h3>
                        <p className="text-sm text-gray-500">100% of our packaging is recyclable or biodegradable. We've eliminated single-use plastics from our logistics.</p>
                    </div>
                    <div className="border border-green-100 p-6 rounded-xl">
                        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-700 mb-4 text-2xl">🔄</div>
                        <h3 className="font-bold text-lg mb-2">Circular Fashion</h3>
                        <p className="text-sm text-gray-500">We encourage longevity. Our 'Pre-Loved' program is coming soon to help cycle fashion back into use.</p>
                    </div>
                </div>

                <h2 className="text-3xl font-bold font-playfair mt-12 mb-6">Our 2025 Commitments</h2>
                <ul className="list-disc pl-5 space-y-4 text-gray-700">
                    <li><strong>Carbon Neutral Shipping:</strong> We offset 100% of carbon emissions from every delivery.</li>
                    <li><strong>Zero Waste Initiative:</strong> Reducing fabric waste in production by 30%.</li>
                    <li><strong>Tracing Transparency:</strong> Provide full supply chain visibility for every product by Q4 2025.</li>
                </ul>
            </div>
        </div>
    );
}
