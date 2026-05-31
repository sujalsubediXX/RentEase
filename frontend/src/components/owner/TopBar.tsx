import { Bell, ChevronDown, Menu } from 'lucide-react'
import { useState } from 'react';
import { useSidebar } from '../../contexts/SidebarContext';
interface Notification {
  icon: string;
  text: string;
  time: string;
}
const LISTING_STATUS = {
  ACTIVE: "active",
  PAUSED: "paused",
  PENDING: "pending"
} as const;

type ListingStatus = typeof LISTING_STATUS[keyof typeof LISTING_STATUS];
interface Listing {
  id: number;
  title: string;
  category: string;
  price: number;
  unit: string;
  location: string;
  status: ListingStatus;
  rating: number;
  reviews: number;
  views: number;
  bookings: number;
  image: string;
  color: string;
  earnings: number;
}

export const TopBar = ({title,subtitle}:{title?:string,subtitle?:string}) => {
      const [notifOpen, setNotifOpen] = useState<boolean>(false);
      const [editItem, setEditItem] = useState<Listing | null>(null);
       const notifications: Notification[] = [
    { icon: "✅", text: "New booking for Canon R5", time: "2m ago" },
    { icon: "⭐", text: "Priya left a 5-star review", time: "1h ago" },
    { icon: "💬", text: "Message from Aarav Sharma", time: "3h ago" },
    { icon: "🕐", text: "Your Trek Bike listing was paused", time: "1d ago" },
  ];

        const { toggleSidebar } = useSidebar();
  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden">{
        editItem && (
          "EditItemModal"
        )

      }
        <header className="h-16 bg-white border-b border-stone-100 flex items-center gap-4 px-6 shrink-0">
          <button onClick={toggleSidebar} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-stone-100 text-stone-500 transition-colors">
            <Menu size={20} />

          </button>
 <div>
            <h1 className="text-md font-bold text-stone-900">{title}</h1>
            {subtitle && <p className="text-stone-500 text-sm mt-0.5">{subtitle}</p>}
        </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button onClick={() => setNotifOpen(v => !v)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-stone-100 text-stone-500 relative transition-colors">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-12 bg-white border border-stone-200 rounded-2xl shadow-xl w-72 z-20 overflow-hidden">
                  <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
                    <p className="font-semibold text-sm text-stone-800">Notifications</p>
                    <span className="text-xs text-amber-600 font-semibold">3 new</span>
                  </div>
                  {notifications.map((n, i) => (
                    <div key={i} className={`flex items-start gap-3 px-4 py-3 hover:bg-stone-50 cursor-pointer ${i < 3 ? "bg-amber-50/40" : ""}`}>
                      <span className="text-lg">{n.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-stone-700 font-medium">{n.text}</p>
                        <p className="text-xs text-stone-400 mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-stone-100">
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold">
                RB
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-stone-800 leading-none">Ramesh B.</p>
                <p className="text-xs text-stone-400 mt-0.5">Owner Account</p>
              </div>
              <ChevronDown size={14} className="text-stone-400" />
            </div>
          </div>
        </header>
      </div>

    </>
  )
}
