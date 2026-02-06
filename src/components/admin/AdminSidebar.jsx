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
  MessageSquare,
  HelpCircle,
  Star,
  Tags,
  Percent,
  X // Added X for close
} from "lucide-react";
import { signOut } from "next-auth/react";

const menuItems = [
  { name: "Dashboard", href: "/seller-center", icon: LayoutDashboard },
  { name: "Orders", href: "/seller-center/orders", icon: ShoppingCart },
  { name: "Products", href: "/seller-center/products", icon: Package },
  { name: "Categories", href: "/seller-center/categories", icon: Tags },
  { name: "Sales", href: "/seller-center/sales", icon: Percent },
  { name: "Customers", href: "/seller-center/customers", icon: Users },
  { name: "Reviews", href: "/seller-center/reviews", icon: Star },
  { name: "Q&A", href: "/seller-center/questions", icon: MessageSquare },
  { name: "Help Center", href: "/seller-center/help-center", icon: HelpCircle },
  { name: "Analytics", href: "/seller-center/analytics", icon: BarChart3 },
  { name: "Settings", href: "/seller-center/settings", icon: Settings },
];

export default function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  return (
    <>
    <aside 
      className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 text-gray-800
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0 flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      
      {/* Brand */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
        <span className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          iMART <span className="text-[10px] uppercase bg-black text-white px-2 py-0.5 rounded-full tracking-wider">Seller</span>
        </span>
        <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-black">
          <X size={24} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose} // Close on nav click (mobile)
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                ${isActive 
                  ? "bg-gray-100 text-black shadow-sm" 
                  : "text-gray-500 hover:text-black hover:bg-gray-50"
                }
              `}
            >
              <Icon size={20} className={`transition-colors ${isActive ? "text-black" : "text-gray-400 group-hover:text-black"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User / Logout */}
      <div className="p-4 border-t border-gray-100">
        <button 
          onClick={() => signOut({ callbackUrl: '/auth/login' })}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
    </>
  );
}
