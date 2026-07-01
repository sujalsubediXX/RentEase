import React, { useState } from 'react'
import {
  LayoutDashboard,
  Users,
  Package,
  CalendarCheck,
  BarChart3,
  Star,
  Settings,
  MessageSquare,
  LogOut,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { useSidebar } from "../../contexts/SidebarContext"
import { Link } from "react-router-dom";
const NAV_ITEMS: { href: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; badge?: number }[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/owners", label: "Owners", icon: UserCheck },
  { href: "/admin/listings", label: "Listings", icon: Package },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck, badge: 3 },
  { href: "/admin/kycreview", label: "KYC Review", icon: ShieldCheck },
  { href: "/admin/revenue", label: "Revenue", icon: BarChart3 },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare, badge: 8 },
];


export const AdminSidebar = () => {
  const { isSidebarOpen } = useSidebar();
  const [activeNav, setActiveNav] = useState<string>("dashboard");
  return (
    <aside className={`${isSidebarOpen ? "w-60" : "w-16"} shrink-0 bg-stone-900 flex flex-col transition-all duration-300 overflow-hidden border-r border-stone-800`}>
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-stone-800">
        <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
          <ShieldCheck size={16} className="text-white" />
        </div>
        {isSidebarOpen && (
          <div className="leading-tight">
            <span className="font-bold text-white tracking-tight text-base">Rent<span className="text-amber-400">Ease</span></span>
            <p className="text-[10px] text-stone-500 tracking-widest uppercase">Admin Portal</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon, badge }) => (
          <Link
          key={href}
            to={href}
            onClick={() => setActiveNav(href)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative
            ${activeNav === href
                ? "bg-amber-500 text-white shadow-md shadow-amber-900/30"
                : "text-stone-400 hover:bg-stone-800 hover:text-stone-200"}`}
          >
            <Icon size={18} className="shrink-0" />
            {isSidebarOpen && <span>{label}</span>}
            {badge && isSidebarOpen && (
              <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full font-bold ${activeNav === href ? "bg-white/20 text-white" : "bg-amber-500 text-white"}`}>
                {badge}
              </span>
            )}
            {badge && !isSidebarOpen && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-4 space-y-0.5 border-t border-stone-800 pt-3">
        <Link to="/admin/settings"
          onClick={() => setActiveNav("settings")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
          ${activeNav === "settings" ? "bg-amber-500 text-white" : "text-stone-400 hover:bg-stone-800 hover:text-stone-200"}`}
        >
          <Settings size={18} className="shrink-0" />
          {isSidebarOpen && <span>Settings</span>}
        </Link >
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-400 hover:bg-red-600 hover:text-stone-200 transition-all">
          <LogOut size={18} className="shrink-0" />
          {isSidebarOpen && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  )
};

