import connectDB from "@/app/lib/config/db";
import Order from "@/app/lib/model/Order";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ProfileDashboard from "./ProfileDashboard";

// Server Component
export default async function ProfilePage() {
    const session = await auth();

    if (!session) {
        redirect("/auth/login");
    }

    await connectDB();

    // Fetch Orders
    // Serialize to plain objects to strictly avoid Next.js serialization warnings
    const ordersData = await Order.find({ user: session.user.id })
        .sort({ createdAt: -1 })
        .lean();

    // Convert ObjectId to string
    const orders = ordersData.map(order => ({
        ...order,
        _id: order._id.toString(),
        user: order.user.toString(),
        items: order.items.map(item => ({
            ...item,
            _id: item._id ? item._id.toString() : undefined,
            product: item.product ? item.product.toString() : undefined
        }))
    }));

    return <ProfileDashboard user={session.user} orders={orders} />;
}
