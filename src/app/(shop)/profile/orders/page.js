import connectDB from "@/app/lib/config/db";
import Order from "@/app/lib/model/Order";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ProfileDashboard from "../ProfileDashboard";

export const metadata = {
    title: "My Orders | iMART",
};

export default async function ProfileOrdersPage() {
    const session = await auth();

    if (!session) {
        redirect("/auth/login?callbackUrl=/profile/orders");
    }

    await connectDB();

    const ordersData = await Order.find({ user: session.user.id }).sort({ createdAt: -1 }).lean();

    const orders = ordersData.map((order) => ({
        ...order,
        _id: order._id.toString(),
        user: order.user.toString(),
        items: order.items.map((item) => ({
            ...item,
            _id: item._id ? item._id.toString() : undefined,
            product: item.product ? item.product.toString() : undefined,
        })),
    }));

    return <ProfileDashboard user={session.user} orders={orders} initialTab="orders" />;
}
