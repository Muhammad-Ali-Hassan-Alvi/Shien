export default function PrivacyPage() {
    return (
        <div className="max-w-3xl mx-auto px-6 py-20">
            <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
            <p className="text-gray-500 mb-12 text-sm">Last Updated: October 24, 2024</p>

            <div className="prose prose-sm prose-gray max-w-none">
                <p>iMART ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by iMART.</p>

                <h3>Information We Collect</h3>
                <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact customer support.</p>
                <ul>
                    <li><strong>Personal Data:</strong> Name, email address, shipping address, phone number.</li>
                    <li><strong>Payment Data:</strong> Payment card details (processed by third-party providers).</li>
                    <li><strong>Usage Data:</strong> Information about your interactions with our website, such as IP address and browser type.</li>
                </ul>

                <h3>How We Use Your Information</h3>
                <p>We use the information we collect to:</p>
                <ul>
                    <li>Process your orders and manage your account.</li>
                    <li>Send you transactional emails (receipts, shipping notifications).</li>
                    <li>Analyze usage trends to improve our user experience.</li>
                    <li>Send marketing communications (only if you opt-in).</li>
                </ul>

                <h3>Data Security</h3>
                <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.</p>

                <h3>Contact Us</h3>
                <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@imart.com">privacy@imart.com</a>.</p>
            </div>
        </div>
    );
}
