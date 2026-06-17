import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

function UserDropdown() {
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const items: { label: string; icon: string; page: string }[] = [
        { label: "My Profile", icon: "👤", page: "profile" },
        { label: "Wishlist", icon: "❤️", page: "wishlist" },
        { label: "Cart", icon: "🛒", page: "cart" },
        { label: "Settings", icon: "⚙️", page: "settings" },
    ];

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 bg-stone-900 text-amber-400 border border-amber-500/30 rounded-full px-4 py-2 hover:bg-stone-800 transition-all duration-200 font-medium text-sm"
            >
                <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-stone-900 font-bold text-xs">
                    {
                        user?.fullName?.split(" ").map((word) => word[0]).join("").toUpperCase() || "User"
                    }
                </div>
                <span className="hidden sm:block">
                    {user?.fullName?.split(" ")[0]}
                </span>
                <svg
                    className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-stone-200 rounded-2xl shadow-2xl shadow-stone-300/50 overflow-hidden z-50 animate-in">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-stone-100 bg-amber-50">
                        <p className="font-semibold text-stone-800 text-sm">{user?.fullName || "User"}</p>
                        <p className="text-xs text-stone-500">{user?.email}</p>
                        {
                            user?.isKycVerified ? (
                                <span className="inline-block mt-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                                    ✓ KYC Verified
                                </span>
                            ) : (
                                <span className="inline-block mt-1 text-xs bg-amber-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                                KYC Not Verified
                                </span>
                            )
                        }

                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                        {items.map((item) => (
                            <Link
                                to={`/${item.page}`}
                                key={item.page}
                                onClick={() => setOpen(false)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-amber-50 hover:text-amber-700 transition-colors duration-150 text-left"
                            >
                                <span className="text-base">{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Sign Out */}
                    <div className="border-t border-stone-100 py-1">
                        <button
                            onClick={() => logout()}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors duration-150 text-left"
                        >
                            <span className="text-base">🚪</span>
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserDropdown;