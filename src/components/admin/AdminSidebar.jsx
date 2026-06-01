"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ShoppingCart,
    Users,
    BarChart3,
    Settings,
    LogOut,
    Package,
    ShieldCheck,
    MessageSquare,
    HelpCircle,
    Star,
    Tags,
    Percent,
    X,
    LayoutGrid,
    Bell,
} from "lucide-react";
import { signOut } from "next-auth/react";

const menuItems = [
    { name: "Dashboard", href: "/seller-center", icon: LayoutDashboard },
    { name: "Orders", href: "/seller-center/orders", icon: ShoppingCart },
    { name: "Notifications", href: "/seller-center/notifications", icon: Bell },
    { name: "Products", href: "/seller-center/products", icon: Package },
    { name: "Categories", href: "/seller-center/categories", icon: Tags },
    { name: "Sales", href: "/seller-center/sales", icon: Percent },
    { name: "Homepage", href: "/seller-center/homepage-sections", icon: LayoutGrid },
    { name: "Customers", href: "/seller-center/customers", icon: Users },
    { name: "Reviews", href: "/seller-center/reviews", icon: Star },
    { name: "Q&A", href: "/seller-center/questions", icon: MessageSquare },
    { name: "Help Center", href: "/seller-center/help-center", icon: HelpCircle },
    { name: "Analytics", href: "/seller-center/analytics", icon: BarChart3 },
    { name: "Admins", href: "/seller-center/admins", icon: ShieldCheck },
    { name: "Settings", href: "/seller-center/settings", icon: Settings },
];

export default function AdminSidebar({ isOpen, onClose }) {
    const pathname = usePathname();

    return (
        <aside
            className={`
                fixed inset-y-0 left-0 z-50 w-[min(280px,85vw)] sm:w-64
                bg-white border-r border-gray-200 text-gray-800 flex flex-col
                transform transition-transform duration-300 ease-in-out
                lg:translate-x-0 lg:static lg:z-auto lg:shrink-0 lg:w-64
                ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}
        >
            <div className="h-16 sm:h-20 flex items-center justify-between px-4 sm:px-6 border-b border-gray-100 shrink-0">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                    iMART{" "}
                    <span className="text-[10px] uppercase bg-black text-white px-2 py-0.5 rounded-full tracking-wider">
                        Seller
                    </span>
                </span>
                <button
                    type="button"
                    onClick={onClose}
                    className="lg:hidden p-2 -mr-2 text-gray-500 hover:text-black rounded-lg hover:bg-gray-100"
                    aria-label="Close menu"
                >
                    <X size={22} />
                </button>
            </div>

            <nav className="flex-1 py-4 px-2 sm:px-3 space-y-0.5 overflow-y-auto overscroll-contain">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                                ${
                                    isActive
                                        ? "bg-gray-100 text-black shadow-sm"
                                        : "text-gray-500 hover:text-black hover:bg-gray-50"
                                }
                            `}
                        >
                            <Icon
                                size={20}
                                className={`shrink-0 transition-colors ${isActive ? "text-black" : "text-gray-400 group-hover:text-black"}`}
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-3 sm:p-4 border-t border-gray-100 shrink-0">
                <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/admin/login" })}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <LogOut size={20} className="shrink-0" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
