export default function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-20">
            <h1 className="text-5xl font-playfair font-black text-gray-900 mb-8 tracking-tight">Redefining Modern Luxury.</h1>

            <div className="prose prose-lg prose-gray max-w-none">
                <p className="text-xl text-gray-600 leading-relaxed font-light mb-12">
                    Founded in 2024, iMART emerged from a simple yet ambitious vision: to bridge the gap between high-end aesthetic desires and accessible reality. We aren't just a marketplace; we are a curation of lifestyle.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 my-16">
                    <div className="bg-gray-50 p-8 rounded-2xl">
                        <h3 className="text-2xl font-bold mb-4 font-playfair">Our Mission</h3>
                        <p className="text-gray-600">To democratize luxury by connecting discerning individuals with premium quality products without the traditional markup.</p>
                    </div>
                    <div className="bg-gray-50 p-8 rounded-2xl">
                        <h3 className="text-2xl font-bold mb-4 font-playfair">Our Craft</h3>
                        <p className="text-gray-600">We obsess over details. From the stitching of a garment to the click of a button on our app, excellence is our baseline.</p>
                    </div>
                </div>

                <h2 className="text-3xl font-bold font-playfair mt-12 mb-6">The iMART Philosophy</h2>
                <p>
                    We believe style is an expression of self, not a status symbol. Our collections are hand-picked to ensure they meet rigorous standards of quality, sustainability, and timeless design.
                    When you shop with us, you aren't just buying a product; you are investing in a piece of art that tells a story.
                </p>
                <p>
                    From our headquarters to your doorstep, every step of the journey is managed with precision and care. We are committed to minimizing our environmental footprint while maximizing your satisfaction.
                </p>
            </div>
        </div>
    );
}
