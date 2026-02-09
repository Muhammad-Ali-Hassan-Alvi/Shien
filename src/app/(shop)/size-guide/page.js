export default function SizeGuidePage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-20">
            <h1 className="text-4xl font-playfair font-black text-gray-900 mb-4">Size Guide</h1>
            <p className="text-gray-500 mb-12">Find your perfect fit. Measurements are in inches unless otherwise stated.</p>

            <div className="space-y-16">
                {/* Women's Size Chart */}
                <section>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <span className="w-2 h-8 bg-pink-500 rounded-full"></span>
                        Women's Apparel
                    </h2>
                    <div className="overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-sm">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
                                    <th className="px-6 py-4 text-left font-bold">Size</th>
                                    <th className="px-6 py-4 text-left font-bold">US</th>
                                    <th className="px-6 py-4 text-left font-bold">Bust (in)</th>
                                    <th className="px-6 py-4 text-left font-bold">Waist (in)</th>
                                    <th className="px-6 py-4 text-left font-bold">Hips (in)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {[
                                    { size: "XS", us: "0-2", bust: "31-33", waist: "23-25", hips: "33-35" },
                                    { size: "S", us: "4-6", bust: "33-35", waist: "25-27", hips: "35-37" },
                                    { size: "M", us: "8-10", bust: "35-37", waist: "27-29", hips: "37-39" },
                                    { size: "L", us: "12-14", bust: "37-40", waist: "29-32", hips: "39-42" },
                                    { size: "XL", us: "16-18", bust: "40-43", waist: "32-35", hips: "42-45" },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-pink-50/30 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-900">{row.size}</td>
                                        <td className="px-6 py-4 text-gray-600">{row.us}</td>
                                        <td className="px-6 py-4 text-gray-600">{row.bust}</td>
                                        <td className="px-6 py-4 text-gray-600">{row.waist}</td>
                                        <td className="px-6 py-4 text-gray-600">{row.hips}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Men's Size Chart */}
                <section>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                        Men's Apparel
                    </h2>
                    <div className="overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-sm">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
                                    <th className="px-6 py-4 text-left font-bold">Size</th>
                                    <th className="px-6 py-4 text-left font-bold">Chest (in)</th>
                                    <th className="px-6 py-4 text-left font-bold">Waist (in)</th>
                                    <th className="px-6 py-4 text-left font-bold">Neck (in)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {[
                                    { size: "S", chest: "34-36", waist: "28-30", neck: "14-14.5" },
                                    { size: "M", chest: "38-40", waist: "32-34", neck: "15-15.5" },
                                    { size: "L", chest: "42-44", waist: "36-38", neck: "16-16.5" },
                                    { size: "XL", chest: "46-48", waist: "40-42", neck: "17-17.5" },
                                    { size: "XXL", chest: "50-52", waist: "44-46", neck: "18-18.5" },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-900">{row.size}</td>
                                        <td className="px-6 py-4 text-gray-600">{row.chest}</td>
                                        <td className="px-6 py-4 text-gray-600">{row.waist}</td>
                                        <td className="px-6 py-4 text-gray-600">{row.neck}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <div className="bg-gray-50 p-8 rounded-2xl">
                    <h3 className="font-bold text-lg mb-2">How to Measure</h3>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                        <li><strong>Bust/Chest:</strong> Measure measuring tape under your arms and circle around the fullest part of the chest.</li>
                        <li><strong>Waist:</strong> Measure around your natural waistline, keeping the tape comfortably loose.</li>
                        <li><strong>Hips:</strong> Stand with feet together and measure around the fullest part of your hips.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
