import connectDB from "@/app/lib/config/db";
import Order from "@/app/lib/model/Order";
import User from "@/app/lib/model/User";
import DashboardClient from "@/components/admin/DashboardClient";

export default async function SellerCenterDashboard() {
    await connectDB();

    // 1. Fetch Data
    const ordersData = await Order.find({})
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .lean();

    // 2. Calculate Stats
    const revenue = ordersData.reduce((acc, order) => acc + (order.totalAmount || 0), 0);
    const pendingOrders = ordersData.filter(o => ['Pending', 'Confirmed', 'Dispatched'].includes(o.status)).length;
    const deliveredOrders = ordersData.filter(o => o.status === 'Delivered').length;

    // Total Customers (excluding admins)
    const totalCustomers = await User.countDocuments({ role: { $ne: 'admin' } });

    // 3. Prepare Chart Data (Simplified)
    // Helper to group by key
    const groupBy = (array, keyFn) => {
        return array.reduce((result, item) => {
            const key = keyFn(item);
            result[key] = (result[key] || 0) + (item.totalAmount || 0);
            return result;
        }, {});
    };

    // Week Data (Last 7 Days)
    const today = new Date();
    const weekData = [];
    const weekLabels = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('en-US', { disable_date_format: true, month: 'short', day: 'numeric' }); // e.g., "Oct 25"

        // Find orders for this day
        const dayTotal = ordersData
            .filter(o => new Date(o.createdAt).toDateString() === d.toDateString())
            .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        weekData.push(dayTotal);
        weekLabels.push(dateStr);
    }

    // Month Data (Last 4 Weeks)
    const monthData = [0, 0, 0, 0];
    const monthLabels = ["4 Weeks Ago", "3 Weeks Ago", "2 Weeks Ago", "This Week"];

    for (let i = 0; i < 4; i++) {
        const startDay = i * 7;
        const endDay = (i + 1) * 7;

        const weekTotal = ordersData
            .filter(o => {
                const diffTime = Math.abs(today - new Date(o.createdAt));
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays > startDay && diffDays <= endDay;
            })
            .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        // Fill in reverse order (This Week is last index)
        monthData[3 - i] = weekTotal;
    }

    // Year Data (Monthly)
    const yearData = new Array(12).fill(0);
    const yearLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    ordersData.forEach(order => {
        const d = new Date(order.createdAt);
        if (d.getFullYear() === today.getFullYear()) {
            yearData[d.getMonth()] += (order.totalAmount || 0);
        }
    });

    const chartData = {
        week: { data: weekData, labels: weekLabels },
        month: { data: monthData, labels: monthLabels },
        year: { data: yearData, labels: yearLabels }
    };

    // Serialize Recent Orders
    // Serialize Recent Orders - Explicitly select fields to avoid serialization errors
    const recentOrders = ordersData.slice(0, 5).map(order => ({
        _id: order._id.toString(),
        totalAmount: order.totalAmount || 0,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        user: order.user ? {
            name: order.user.name,
            email: order.user.email,
            _id: order.user._id.toString()
        } : null,
    }));

    const stats = {
        revenue,
        pendingOrders,
        deliveredOrders,
        totalCustomers
    };

    return (
        <DashboardClient
            stats={stats}
            recentOrders={recentOrders}
            chartData={chartData}
        />
    );
}
