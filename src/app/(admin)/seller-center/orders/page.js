import connectDB from "@/app/lib/config/db";
import Order from "@/app/lib/model/Order";
import Link from "next/link";
import { Phone, CheckCircle, Truck, XCircle, Clock } from "lucide-react";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect"; // Client Component we'll make inline/separately

export const dynamic = 'force-dynamic';

async function getOrders() {
    await connectDB();
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
    return orders;
}

export default async function AdminOrdersPage() {
    const orders = await getOrders();

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Order Management ({orders.length})</h1>

            <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-sm uppercase text-gray-500">
                            <th className="p-4">Order ID</th>
                            <th className="p-4">Customer</th>
                            <th className="p-4">City</th>
                            <th className="p-4">Items</th>
                            <th className="p-4">Total</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.map((order) => (
                            <tr key={order._id.toString()} className="hover:bg-gray-50">
                                <td className="p-4 font-mono text-xs">
                                    {order._id.toString().slice(-6).toUpperCase()}
                                </td>
                                <td className="p-4">
                                    <div className="font-bold">{order.shippingInfo.fullName}</div>
                                    <a
                                        href={`tel:${order.shippingInfo.phone}`}
                                        className="text-green-600 flex items-center gap-1 text-sm hover:underline mt-1"
                                    >
                                        <Phone size={14} />
                                        {order.shippingInfo.phone}
                                    </a>
                                </td>
                                <td className="p-4">{order.shippingInfo.city}</td>
                                <td className="p-4 text-sm text-gray-500">
                                    {order.items.length} items
                                </td>
                                <td className="p-4 font-bold">Rs. {order.totalAmount}</td>
                                <td className="p-4">
                                    <OrderStatusSelect
                                        orderId={order._id.toString()}
                                        initialStatus={order.status}
                                    />
                                </td>
                                <td className="p-4">
                                    <button className="text-blue-600 hover:underline text-sm">View Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
