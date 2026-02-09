import connectDB from "@/app/lib/config/db";
import User from "@/app/lib/model/User";
import CustomersTable from "@/components/admin/CustomersTable";

export default async function CustomersPage() {
    await connectDB();
    // Fetch users (lean for performance) - Exclude admins
    const users = await User.find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 }).lean();

    // Serialize
    const serializedUsers = users.map(user => ({
        ...user,
        _id: user._id.toString(),
        createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString() : new Date().toISOString(),
    }));

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-playfair font-bold mb-2">Customers</h1>
                <p className="text-gray-500">Manage your store's customer base.</p>
            </div>
            <CustomersTable customers={serializedUsers} />
        </div>
    );
}
