import { Suspense } from "react";
import HelpCenterClient from "@/components/HelpCenterClient";

export const metadata = {
    title: "Help Center | iMART",
    description: "Shipping, returns, payments, and order tracking help",
};

function HelpCenterFallback() {
    return (
        <div className="max-w-5xl mx-auto px-6 py-20 text-center text-gray-500">Loading help center...</div>
    );
}

export default function HelpCenterPage() {
    return (
        <Suspense fallback={<HelpCenterFallback />}>
            <HelpCenterClient />
        </Suspense>
    );
}
