import { redirect } from "next/navigation";

/** Legacy route — always use the full edit page that preserves variants and pricing. */
export default async function LegacyProductEditRedirect({ params }) {
    const { id } = await params;
    redirect(`/seller-center/products/edit/${id}`);
}
