/** Support contact — use NEXT_PUBLIC_* in client components, either on server. */
export function getSupportPhone() {
    return (
        process.env.NEXT_PUBLIC_SUPPORT_PHONE ||
        process.env.SUPPORT_PHONE ||
        ""
    );
}

export function getSupportEmail() {
    return process.env.SUPPORT_EMAIL || "support@imart.com";
}
