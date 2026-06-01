import connectDB from "@/app/lib/config/db";
import Order from "@/app/lib/model/Order";
import User from "@/app/lib/model/User";
import DashboardClient from "@/components/admin/DashboardClient";

export default async function SellerCenterDashboard() {
    await connectDB();

    const ordersData = await Order.find({})
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .lean();

    const revenue = ordersData.reduce((acc, order) => acc + (order.totalAmount || 0), 0);
    const pendingOrders = ordersData.filter((o) =>
        ["Pending", "Confirmed", "Dispatched"].includes(o.status)
    ).length;
    const deliveredOrders = ordersData.filter((o) => o.status === "Delivered").length;
    const totalCustomers = await User.countDocuments({ role: { $ne: "admin" } });

    const serializeOrder = (order) => ({
        _id: order._id.toString(),
        totalAmount: order.totalAmount || 0,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        user: order.user
            ? {
                  name: order.user.name,
                  email: order.user.email,
                  _id: order.user._id.toString(),
              }
            : null,
    });

    const recentOrders = ordersData.slice(0, 5).map(serializeOrder);
    const allOrdersForExport = ordersData.map(serializeOrder);

    const stats = {
        revenue,
        pendingOrders,
        deliveredOrders,
        totalCustomers,
    };

    return (
        <DashboardClient
            stats={stats}
            recentOrders={recentOrders}
            allOrders={allOrdersForExport}
        />
    );
}
