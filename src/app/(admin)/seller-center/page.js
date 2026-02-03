import StatsCard from "@/components/admin/StatsCard";
import { DollarSign, ShoppingBag, Users, Activity, TrendingUp } from "lucide-react";

export default function SellerCenterDashboard() {
    return (
        <div className="space-y-8">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">Overview of your store's performance today.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                        Export Report
                    </button>
                    <button className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-lg shadow-black/20">
                        + Add Product
                    </button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Revenue"
                    value="$45,231.89"
                    trend="up"
                    trendValue="+20.1%"
                    icon={DollarSign}
                    color="bg-yellow-100"
                />
                <StatsCard
                    title="Total Orders"
                    value="2,345"
                    trend="up"
                    trendValue="+15.2%"
                    icon={ShoppingBag}
                    color="bg-blue-100"
                />
                <StatsCard
                    title="Active Customers"
                    value="12,345"
                    trend="up"
                    trendValue="+5.4%"
                    icon={Users}
                    color="bg-purple-100"
                />
                <StatsCard
                    title="Conversion Rate"
                    value="3.2%"
                    trend="down"
                    trendValue="-1.1%"
                    icon={Activity}
                    color="bg-pink-100"
                />
            </div>

            {/* Main Content Split: Charts & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Sales Chart Area (Visual Only Mock) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg">Revenue Analytics</h3>
                        <select className="bg-gray-50 border-none text-sm font-medium text-gray-500 rounded-md outline-none focus:ring-0 cursor-pointer">
                            <option>This Week</option>
                            <option>This Month</option>
                            <option>This Year</option>
                        </select>
                    </div>

                    {/* CSS Bar Chart Mock */}
                    <div className="h-64 flex items-end justify-between gap-2 px-2">
                        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                            <div key={i} className="w-full bg-gray-50 rounded-t-lg relative group overflow-hidden">
                                <div
                                    className="absolute bottom-0 left-0 right-0 bg-black rounded-t-lg transition-all duration-500 group-hover:bg-blue-600"
                                    style={{ height: `${h}%` }}
                                ></div>
                                {/* Tooltip */}
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    ${h}k
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-xs text-gray-400 font-medium px-2">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </div>

                {/* Recent Orders List */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg">Recent Orders</h3>
                        <button className="text-sm text-blue-600 font-medium hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-xs text-gray-600">
                                    JD
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-900">John Doe</p>
                                    <p className="text-xs text-gray-500">2 mins ago</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-900">$120.00</p>
                                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Paid</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
