import { ArrowRight } from "lucide-react";

export default function CareersPage() {
    return (
        <div className="max-w-5xl mx-auto px-6 py-20">
            <div className="text-center mb-16">
                <h1 className="text-5xl font-playfair font-black text-gray-900 mb-4 tracking-tight">Join the Revolution.</h1>
                <p className="text-xl text-gray-500 font-light max-w-2xl mx-auto">
                    We're building the future of commerce. If you're obsessed with design, technology, and customer experience, you belong here.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
                <div className="bg-black text-white p-10 rounded-2xl relative overflow-hidden group">
                    <h3 className="text-2xl font-bold mb-2 z-10 relative">Engineering & Tech</h3>
                    <p className="text-gray-400 mb-6 z-10 relative">Build the infrastructure powering global commerce.</p>
                    <button className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-gray-300 transition-colors z-10 relative">
                        View Openings <ArrowRight size={16} />
                    </button>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gray-800 rounded-full blur-3xl group-hover:bg-gray-700 transition-colors"></div>
                </div>
                <div className="bg-gray-100 text-gray-900 p-10 rounded-2xl relative overflow-hidden group">
                    <h3 className="text-2xl font-bold mb-2 z-10 relative">Design & Creative</h3>
                    <p className="text-gray-600 mb-6 z-10 relative">Shape the brand visual identity and user journey.</p>
                    <button className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-black transition-colors z-10 relative">
                        View Openings <ArrowRight size={16} />
                    </button>
                </div>
            </div>

            <h3 className="text-2xl font-bold font-playfair mb-8">Current Openings</h3>
            <div className="space-y-4">
                {[
                    { title: "Senior Frontend Engineer", loc: "Remote", type: "Full-time" },
                    { title: "Product Designer", loc: "New York, NY", type: "Full-time" },
                    { title: "Customer Success Lead", loc: "London, UK", type: "Full-time" },
                    { title: "Marketing Specialist", loc: "Remote", type: "Contract" }
                ].map((job, i) => (
                    <div key={i} className="flex items-center justify-between p-6 border border-gray-200 rounded-xl hover:border-black transition-colors cursor-pointer group">
                        <div>
                            <h4 className="font-bold text-lg group-hover:text-indigo-600 transition-colors">{job.title}</h4>
                            <p className="text-sm text-gray-500">{job.loc} • {job.type}</p>
                        </div>
                        <ArrowRight size={20} className="text-gray-300 group-hover:text-black transition-colors" />
                    </div>
                ))}
            </div>

            <p className="text-center text-gray-400 mt-12 text-sm">
                Don't see your role? Email us at <a href="mailto:careers@imart.com" className="underline hover:text-black">careers@imart.com</a>
            </p>
        </div>
    );
}
