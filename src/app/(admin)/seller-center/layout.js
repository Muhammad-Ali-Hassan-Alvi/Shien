import AdminLayoutClient from "./AdminLayoutClient";

export const metadata = {
    title: "iMART Seller Center",
    description: "Admin Dashboard for iMART",
};

export default function AdminLayout({ children }) {
    return (
        <AdminLayoutClient>
            {children}
        </AdminLayoutClient>
    );
}
