import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            <AdminSidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <AdminHeader />
                <main className="flex-1 p-8 overflow-y-auto overflow-x-hidden max-h-[calc(100vh-64px)] min-w-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
