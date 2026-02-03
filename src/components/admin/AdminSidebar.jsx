"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Package,
  Bell,
  Search
} from "lucide-react";
import { signOut } from "next-auth/react";

const menuItems = [
  { name: "Dashboard", href: "/seller-center", icon: LayoutDashboard },
  { name: "Orders", href: "/seller-center/orders", icon: ShoppingCart },
  { name: "Products", href: "/seller-center/products", icon: Package },
  { name: "Customers", href: "/seller-center/customers", icon: Users },
  { name: "Analytics", href: "/seller-center/analytics", icon: BarChart3 },
  { name: "Settings", href: "/seller-center/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-black text-white flex flex-col h-screen sticky top-0 border-r border-gray-800">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <span className="text-xl font-bold tracking-widest text-white">SHEIN ADMIN</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive 
                  ? "bg-white text-black shadow-lg shadow-white/10" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
                }
              `}
            >
              <Icon size={20} className={isActive ? "text-black" : "text-gray-400 group-hover:text-white"} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User / Logout */}
      <div className="p-4 border-t border-gray-800">
        <button 
          onClick={() => signOut({ callbackUrl: '/auth/login' })}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
