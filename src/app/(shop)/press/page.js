export default function PressPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-20">
            <h1 className="text-5xl font-playfair font-black text-gray-900 mb-8 tracking-tight">In The News.</h1>
            <p className="text-xl text-gray-600 font-light mb-16">
                Latest updates, feature stories, and press releases from iMART.
            </p>

            <div className="grid gap-12">
                {[
                    {
                        date: "Oct 12, 2024",
                        outlet: "VOGUE",
                        title: "How iMART is Disrupting the Digital Luxury Landscape",
                        snippet: "The new player in town is challenging established norms by offering premium aesthetics at accessible price points..."
                    },
                    {
                        date: "Sep 28, 2024",
                        outlet: "TechCrunch",
                        title: "iMART Raises Series A to Scale Sustainable Logistics",
                        snippet: "With a fresh injection of capital, the commerce platform aims to make carbon-neutral shipping the industry standard..."
                    },
                    {
                        date: "Aug 15, 2024",
                        outlet: "HYPEBEAST",
                        title: "The Drop: iMART's Autumn Collection Sells Out in Minutes",
                        snippet: "The highly anticipated collaboration featuring street-style aesthetics has proven that the brand understands the pulse of Gen Z..."
                    }
                ].map((news, i) => (
                    <div key={i} className="group cursor-pointer">
                        <div className="text-xs font-bold tracking-widest text-gray-400 mb-2 uppercase">{news.outlet} • {news.date}</div>
                        <h2 className="text-2xl font-bold font-playfair mb-3 group-hover:text-indigo-600 transition-colors">{news.title}</h2>
                        <p className="text-gray-600 leading-relaxed">{news.snippet}</p>
                        <div className="mt-4 text-sm font-bold underline decoration-transparent group-hover:decoration-black transition-all">Read Article</div>
                    </div>
                ))}
            </div>

            <div className="mt-20 p-8 bg-gray-50 rounded-2xl text-center">
                <h3 className="font-bold text-xl mb-2">Media Enquiries</h3>
                <p className="text-gray-600 mb-4">For press kits, interviews, or image requests, please contact our PR team.</p>
                <a href="mailto:press@imart.com" className="inline-block bg-black text-white px-6 py-3 rounded-lg font-bold text-sm">Contact Press Team</a>
            </div>
        </div>
    );
}
