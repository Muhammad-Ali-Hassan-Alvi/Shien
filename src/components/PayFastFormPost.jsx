"use client";

import { useEffect, useRef } from "react";

/**
 * Auto-POSTs hidden fields to PayFast hosted checkout.
 */
export default function PayFastFormPost({ checkoutUrl, fields }) {
    const formRef = useRef(null);

    useEffect(() => {
        if (checkoutUrl && fields && formRef.current) {
            formRef.current.submit();
        }
    }, [checkoutUrl, fields]);

    if (!checkoutUrl || !fields) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center p-8">
            <p className="text-lg font-medium mb-4">Redirecting to PayFast secure checkout…</p>
            <p className="text-sm text-gray-500 mb-6">Please wait. Do not close this window.</p>
            <form ref={formRef} action={checkoutUrl} method="POST" className="hidden">
                {Object.entries(fields).map(([key, value]) => (
                    <input key={key} type="hidden" name={key} value={value} />
                ))}
            </form>
            <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
    );
}
