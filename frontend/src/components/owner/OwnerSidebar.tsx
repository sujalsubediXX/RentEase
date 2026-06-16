import React, { useState } from 'react'
import {useSidebar} from "../../contexts/SidebarContext"
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard, Package, CalendarCheck, BarChart3, Star,
    Settings,Home,
    MessageSquare,
    LogOut
} from "lucide-react"
import { Link } from 'react-router-dom';
export const OwnerSidebar = () => {
    const { isSidebarOpen } = useSidebar();
    const [activeNav, setActiveNav] = useState<string>("dashboard");
    const { logout } = useAuth();

    interface NavItem {
        href: string;
        label: string;
        icon: React.ComponentType<{ size?: number; className?: string }>;
        badge?: number;
    }
    const navItems: NavItem[] = [
        { href: "/owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/owner/listings", label: "My Listings", icon: Package },
        { href: "/owner/managecategory", label: "Manage Categories", icon: Package },
        { href: "/owner/bookings", label: "Bookings", icon: CalendarCheck, badge: 2 },
        { href: "/owner/earnings", label: "Earnings", icon: BarChart3 },
        { href: "/owner/reviews", label: "Reviews", icon: Star },
        { href: "/owner/messages", label: "Messages", icon: MessageSquare, badge: 5 },
    ];
    return (

        < aside className={`${isSidebarOpen ? "w-60" : "w-16"} shrink-0 bg-stone-900 flex flex-col transition-all duration-300 overflow-hidden`
        }>
            < div className="h-16 flex items-center gap-3 px-4 border-b border-stone-800" >
                <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
                    <Home size={16} className="text-white" />
                </div>
                {
                    isSidebarOpen && (
                        <span className="font-display text-lg font-bold text-white tracking-tight">
                            Rent<span className="text-amber-400">Ease</span>
                        </span>
                    )
                }
            </div >

            < nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto" >
                {
                    navItems.map(({ href, label, icon: Icon, badge }) => (
                        <Link to={href} key={href} onClick={() => setActiveNav(href)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative
                  ${activeNav === href
                                    ? "bg-amber-500 text-white shadow-md shadow-amber-900/20"
                                    : "text-stone-400 hover:bg-stone-800 hover:text-stone-200"}`}>
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
                    ))
                }
            </nav >

            {/* Bottom */}
            < div className="px-2 pb-4 space-y-0.5 border-t border-stone-800 pt-3" >
                <Link to="/owner/settings" className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-400 hover:bg-stone-800 hover:text-stone-200 transition-all`}>
                    <Settings size={18} className="shrink-0" />
                    {isSidebarOpen && <span>Settings</span>}
                </Link>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-400 hover:bg-stone-800 hover:text-stone-200 transition-all" onClick={logout}>
                    <LogOut size={18} className="shrink-0" />
                    {isSidebarOpen && <span>Log Out</span>}
                </button>
            </div >
        </aside >
    )
}
