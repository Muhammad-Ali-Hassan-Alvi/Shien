import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            <AdminSidebar />
            <div className="flex-1 flex flex-col">
                <AdminHeader />
                <main className="flex-1 p-8 overflow-y-auto max-h-[calc(100vh-64px)]">
                    {children}
                </main>
            </div>
        </div>
    );
}
