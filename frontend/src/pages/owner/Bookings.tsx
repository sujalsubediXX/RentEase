
import {  CalendarCheck, ChevronRight,Clock, Wallet} from "lucide-react";

const LISTING_STATUS = {
    ACTIVE: "active",
    PAUSED: "paused",
    PENDING: "pending"
} as const;

const BOOKING_STATUS = {
    CONFIRMED: "confirmed",
    PENDING: "pending",
    CANCELLED: "cancelled"
} as const;

type ListingStatus = typeof LISTING_STATUS[keyof typeof LISTING_STATUS];
type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];

interface Booking {
    id: string;
    item: string;
    renter: string;
    avatar: string;
    start: string;
    end: string;
    amount: number;
    status: BookingStatus;
    daysAgo: number;
}

interface StatusBadgeProps {
    status: ListingStatus | BookingStatus;
}

const recentBookings: Booking[] = [
    {
        id: "BK-2401", item: "Canon EOS R5 Camera Kit", renter: "Aarav Sharma",
        avatar: "AS", start: "May 28", end: "May 31", amount: 255,
        status: BOOKING_STATUS.CONFIRMED, daysAgo: 0,
    },
    {
        id: "BK-2399", item: 'MacBook Pro 16" M3', renter: "Priya Tamang",
        avatar: "PT", start: "May 25", end: "May 27", amount: 130,
        status: BOOKING_STATUS.CONFIRMED, daysAgo: 1,
    },
    {
        id: "BK-2395", item: "Canon EOS R5 Camera Kit", renter: "Rajan Khatri",
        avatar: "RK", start: "May 20", end: "May 22", amount: 170,
        status: BOOKING_STATUS.PENDING, daysAgo: 3,
    },
    {
        id: "BK-2388", item: "Camping Tent (4-Person)", renter: "Sita Poudel",
        avatar: "SP", start: "May 17", end: "May 19", amount: 30,
        status: BOOKING_STATUS.CANCELLED, daysAgo: 6,
    },
    {
        id: "BK-2380", item: "Trek Mountain Bike", renter: "Bishal Rai",
        avatar: "BR", start: "May 12", end: "May 14", amount: 40,
        status: BOOKING_STATUS.CONFIRMED, daysAgo: 11,
    },
];

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const map = {
        active: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500", label: "Active" },
        paused: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500", label: "Paused" },
        pending: { bg: "bg-sky-100", text: "text-sky-700", dot: "bg-sky-500", label: "Pending" },
        confirmed: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500", label: "Confirmed" },
        cancelled: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500", label: "Cancelled" },
    };
    const s = map[status as keyof typeof map] || map.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {s.label}
        </span>
    );
};

export default function Bookings() {

    const weeklyStats = [
        { label: "New Bookings", value: "3", icon: CalendarCheck },
        { label: "Revenue", value: "Rs 515", icon: Wallet },
        { label: "Pending Review", value: "1", icon: Clock },
    ];

    return (
        <>
            <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Recent Bookings */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-display font-bold text-stone-800">Recent Bookings</h2>
                        <button className="text-sm text-amber-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                            View all <ChevronRight size={14} />
                        </button>
                    </div>
                    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm divide-y divide-stone-50 overflow-hidden">
                        {recentBookings.map((b) => (
                            <div key={b.id} className="p-4 hover:bg-stone-50/50 transition-colors">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-xl bg-linear-to-br from-stone-700 to-stone-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                                        {b.avatar}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-stone-800 truncate">{b.renter}</p>
                                        <p className="text-xs text-stone-400 truncate">{b.item}</p>
                                    </div>
                                    <StatusBadge status={b.status} />
                                </div>
                                <div className="flex items-center justify-between ml-11">
                                    <div className="flex items-center gap-1 text-xs text-stone-400">
                                        <Clock size={11} />
                                        <span>{b.start} – {b.end}</span>
                                    </div>
                                    <span className="text-sm font-bold text-stone-700">रू{b.amount}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Summary */}
                    <div className="mt-4 bg-linear-to-br from-stone-800 to-stone-900 rounded-2xl p-5 text-white">
                        <p className="text-xs text-stone-400 font-medium uppercase tracking-wider mb-3">This Week</p>
                        <div className="space-y-3">
                            {weeklyStats.map(({ label, value, icon: Icon }) => (
                                <div key={label} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-stone-400 text-sm">
                                        <Icon size={14} />
                                        <span>{label}</span>
                                    </div>
                                    <span className="text-sm font-bold">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </main>
        </>
    );
}