import connectDB from "@/app/lib/config/db";
import Order from "@/app/lib/model/Order";
import Product from "@/app/lib/model/Product";
import Review from "@/app/lib/model/Review";
import { serializeOrder } from "@/app/lib/orderUtils";
import { getOrderItemReviewStatus, checkReviewEligibility } from "@/app/lib/review-actions";
import OrderDetailView from "@/components/profile/OrderDetailView";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";

export async function generateMetadata({ params }) {
    const { id } = await params;
    return {
        title: `Order #${id.slice(-8).toUpperCase()} | iMART`,
    };
}

export default async function ProfileOrderDetailPage({ params, searchParams }) {
    const session = await auth();
    const { id } = await params;
    const resolvedSearch = await searchParams;
    const reviewProductId = resolvedSearch?.review;

    if (!session) {
        redirect(`/auth/login?callbackUrl=/profile/orders/${id}`);
    }

    await connectDB();

    const orderDoc = await Order.findById(id).lean();
    if (!orderDoc || orderDoc.user.toString() !== session.user.id) {
        notFound();
    }

    const order = serializeOrder(orderDoc);
    const reviewStatusByProduct = await getOrderItemReviewStatus(id);

    const productIds = order.items.map((item) => item.product).filter(Boolean);
    const liveProducts = productIds.length
        ? await Product.find({ _id: { $in: productIds } })
              .select("slug isArchived")
              .lean()
        : [];
    const liveByProductId = Object.fromEntries(
        liveProducts.map((p) => [
            p._id.toString(),
            { slug: p.slug, isArchived: p.isArchived === true },
        ])
    );

    const orderWithLiveSlugs = {
        ...order,
        items: order.items.map((item) => {
            const pid = item.product?.toString?.() ?? item.product;
            const live = pid ? liveByProductId[pid] : null;
            return {
                ...item,
                slug: live?.slug && !live?.isArchived ? live.slug : item.slug,
                productUnavailable: live?.isArchived || (!live && !!pid),
            };
        }),
    };

    let activeReview = null;
    if (reviewProductId && orderDoc.status === "Delivered") {
        const orderItem = orderDoc.items.find(
            (item) => item.product && item.product.toString() === reviewProductId
        );

        if (orderItem) {
            const productDoc = await Product.findById(reviewProductId)
                .select("name slug images isArchived")
                .lean();
            const canReview = await checkReviewEligibility(reviewProductId);
            const existingReview = await Review.findOne({
                user: session.user.id,
                product: reviewProductId,
            })
                .select("_id")
                .lean();

            activeReview = {
                product: {
                    _id: reviewProductId,
                    name: productDoc?.name || orderItem.name || "Product",
                    slug: productDoc?.slug || orderItem.slug || "",
                    image: productDoc?.images?.[0] || orderItem.image || "",
                    isArchived: productDoc?.isArchived === true,
                    productRemoved: !productDoc,
                },
                canReview,
                alreadyReviewed: !!existingReview,
                closeHref: `/profile/orders/${id}`,
            };
        }
    }

    return (
        <OrderDetailView
            order={orderWithLiveSlugs}
            backHref="/profile/orders"
            reviewStatusByProduct={reviewStatusByProduct}
            activeReview={activeReview}
        />
    );
}
