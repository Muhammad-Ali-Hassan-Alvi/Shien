import { redirect } from "next/navigation";

/** Legacy URL — redirect to order page review panel. */
export default async function WriteReviewRedirectPage({ params, searchParams }) {
    const { productId } = await params;
    const resolvedSearch = await searchParams;
    const orderId = resolvedSearch?.orderId;

    if (orderId) {
        redirect(`/profile/orders/${orderId}?review=${productId}`);
    }

    redirect("/profile?tab=orders");
}
