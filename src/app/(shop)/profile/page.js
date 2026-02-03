import connectDB from "@/app/lib/config/db";
import Order from "@/app/lib/model/Order";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, Clock, CheckCircle, XCircle, Truck } from "lucide-react";

// Server Component
export default async function ProfilePage() {
    const session = await auth();

    if (!session) {
        redirect("/auth/login");
    }

    await connectDB();

    // Fetch Orders
    const orders = await Order.find({ user: session.user.id })
        .sort({ createdAt: -1 })
        .lean();

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'Confirmed': return 'bg-blue-100 text-blue-800';
            case 'Dispatched': return 'bg-purple-100 text-purple-800';
            case 'Delivered': return 'bg-green-100 text-green-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <h1 className="text-2xl font-playfair font-bold mb-1">Welcome back, {session.user.name || "User"}</h1>
                    <p className="text-gray-500 text-sm">Manage your orders and account settings.</p>
                </div>

                <h2 className="text-xl font-bold font-playfair mb-6 flex items-center gap-2">
                    <Package size={24} /> Order History
                </h2>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-lg p-12 text-center text-gray-500">
                        <p>No orders found.</p>
                        <Link href="/" className="inline-block mt-4 text-black underline font-bold">Start Shopping</Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order._id.toString()} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:border-black transition-colors">
                                <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Order ID</p>
                                        <p className="font-mono text-sm">{order._id.toString()}</p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1 ${getStatusColor(order.status)}`}>
                                        {order.status === 'Delivered' && <CheckCircle size={12} />}
                                        {order.status === 'Cancelled' && <XCircle size={12} />}
                                        {order.status === 'Dispatched' && <Truck size={12} />}
                                        {order.status === 'Pending' && <Clock size={12} />}
                                        {order.status}
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span className="text-gray-600">x{item.quantity} {item.name || "Product"} <span className="text-xs text-gray-400">({item.variant?.size}/{item.variant?.color})</span></span>
                                            <span className="font-medium">Rs. {item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center text-sm font-bold pt-2">
                                    <span>Total Amount</span>
                                    <span className="text-lg">Rs. {order.totalAmount}</span>
                                </div>
                                <div className="text-xs text-gray-400 mt-2">
                                    Date: {new Date(order.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
