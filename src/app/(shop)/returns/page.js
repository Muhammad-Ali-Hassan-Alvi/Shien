export default function ReturnsPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-20">
            <h1 className="text-4xl font-playfair font-black text-gray-900 mb-8">Returns & Refunds</h1>

            <div className="prose prose-lg prose-gray max-w-none">
                <p className="lead">
                    We want you to love your iMART purchase. If you're not completely satisfied, you can return your item(s) within 30 days of delivery for a full refund or exchange.
                </p>

                <h3>How to Initiate a Return</h3>
                <ol>
                    <li>Log in to your account and go to "Order History".</li>
                    <li>Select the order containing the item(s) you wish to return.</li>
                    <li>Click "Request Return" and follow the instructions to generate a prepaid shipping label.</li>
                    <li>Pack your item(s) in the original packaging, attach the label, and drop it off at any authorized carrier location.</li>
                </ol>

                <h3>Return Conditions</h3>
                <ul>
                    <li>Items must be unworn, unwashed, and in their original condition with tags attached.</li>
                    <li>Shoes must be returned in their original box.</li>
                    <li>Final Sale items cannot be returned or exchanged.</li>
                    <li>Beauty and personal care items must be unopened.</li>
                </ul>

                <h3>Refunds</h3>
                <p>
                    Once your return is received and inspected, we will notify you of the approval or rejection of your refund.
                    If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment within 5-7 business days.
                </p>

                <h3>Exchanges</h3>
                <p>
                    Ensure the perfect fit by exchanging your item for a different size or color. Follow the return process and select "Exchange" instead of "Refund".
                    We will ship your new item as soon as the return is in transit.
                </p>
            </div>
        </div>
    );
}
