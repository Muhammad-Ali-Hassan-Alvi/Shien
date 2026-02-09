export default function ShippingPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-20">
            <h1 className="text-4xl font-playfair font-black text-gray-900 mb-8">Shipping Information</h1>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse mb-12">
                    <thead>
                        <tr className="border-b-2 border-gray-100">
                            <th className="py-4 pr-12 font-bold uppercase tracking-wider text-sm">Shipping Method</th>
                            <th className="py-4 pr-12 font-bold uppercase tracking-wider text-sm">Delivery Time</th>
                            <th className="py-4 font-bold uppercase tracking-wider text-sm">Cost</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600">
                        <tr className="border-b border-gray-50">
                            <td className="py-4 font-bold text-gray-900">Standard Shipping</td>
                            <td className="py-4">5-7 Business Days</td>
                            <td className="py-4">Free on orders over Rs. 2500<br /><span className="text-xs text-gray-400">Otherwise Rs. 200</span></td>
                        </tr>
                        <tr className="border-b border-gray-50">
                            <td className="py-4 font-bold text-gray-900">Express Shipping</td>
                            <td className="py-4">2-3 Business Days</td>
                            <td className="py-4">Rs. 500</td>
                        </tr>
                        <tr>
                            <td className="py-4 font-bold text-gray-900">Overnight Delivery</td>
                            <td className="py-4">Next Business Day (Order by 2 PM)</td>
                            <td className="py-4">Rs. 1200</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="prose prose-lg prose-gray max-w-none">
                <h3>Order Processing</h3>
                <p>
                    Orders are processed Monday through Friday, excluding holidays. Orders placed after 2 PM EST will be processed the following business day.
                    You will receive a confirmation email with tracking information once your order has shipped.
                </p>

                <h3>International Shipping</h3>
                <p>
                    We currently ship to over 50 countries. International shipping costs are calculated at checkout based on destination and weight.
                    Please note that duties and taxes are not included in the shipping price and may be collected upon delivery by the carrier.
                </p>

                <h3>Track Your Order</h3>
                <p>
                    You can track your order status in real-time by visiting your <a href="/profile/orders" className="text-black underline font-bold">Order History</a> page.
                </p>
            </div>
        </div>
    );
}
