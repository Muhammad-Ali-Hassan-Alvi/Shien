import connectDB from "@/app/lib/config/db";
import Order from "@/app/lib/model/Order";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";

export default async function AnalyticsPage() {
    await connectDB();

    const ordersData = await Order.find({}).sort({ createdAt: 1 }).lean();

    // Serialize
    // Serialize - strictly pick fields to avoid Buffer/ObjectId serialization issues
    const orders = ordersData.map(order => ({
        _id: order._id.toString(),
        createdAt: order.createdAt.toISOString(),
        totalAmount: order.totalAmount || 0,
        status: order.status
    }));

    return (
        <div className="max-w-6xl mx-auto px-6">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-playfair font-bold mb-2">Analytics</h1>
                    <p className="text-gray-500">Overview of your store's performance.</p>
                </div>
            </div>
            <AnalyticsDashboard orders={orders} />
        </div>
    );
}
