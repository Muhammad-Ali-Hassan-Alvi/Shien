import Link from "next/link";

export const metadata = {
    title: "Payments & Promos | iMART",
};

export default function PaymentsPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-20">
            <h1 className="text-4xl font-playfair font-black text-gray-900 mb-8">Payments & Promos</h1>

            <div className="prose prose-lg prose-gray max-w-none">
                <h3>Payment methods</h3>
                <p>
                    iMART currently supports <strong>Cash on Delivery (COD)</strong> for orders delivered within
                    Pakistan. Pay the courier when your package arrives — simple and secure.
                </p>
                <p>
                    <strong>PayFast</strong> (cards, wallets, bank transfer) is <strong>coming soon</strong>.
                    This version supports COD only.
                </p>

                <h3>Promotions & sale prices</h3>
                <ul>
                    <li>Flash sale and campaign prices are applied automatically on eligible products</li>
                    <li>Promo codes at checkout are planned — not available yet on COD orders</li>
                    <li>Check product pages and the home page for current deals</li>
                </ul>

                <h3>Billing & receipts</h3>
                <p>
                    Order totals include item prices and shipping. For COD orders, no charge is taken online. Your
                    order confirmation email serves as your receipt.
                </p>

                <p>
                    Questions about a charge? Visit the{" "}
                    <Link href="/help-center?topic=payments" className="text-black underline font-bold">
                        Help Center
                    </Link>{" "}
                    or{" "}
                    <Link href="/profile/help-center" className="text-black underline font-bold">
                        contact support
                    </Link>
                    .
                </p>
            </div>
        </div>
    );
}
