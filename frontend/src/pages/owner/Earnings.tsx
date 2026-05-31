import { Clock, DollarSign, TrendingUp } from "lucide-react";
import { NotificationBar } from "../../components/owner/NotificationBar";
import { TopBar } from "../../components/owner/TopBar";
type ListingStatus = "active" | "paused" | "rented";

interface Listing {
    id: number;
    title: string;
    category: string;
    price: number;
    priceUnit: string;
    location: string;
    status: ListingStatus;
    rating: number;
    reviews: number;
    bookings: number;
    image: string;
    earnings: number;
}

const mockListings: Listing[] = [
    { id: 1, title: "Vintage Camera Kit", category: "Electronics", price: 800, priceUnit: "day", location: "Thamel, KTM", status: "active", rating: 4.8, reviews: 23, bookings: 47, image: "📷", earnings: 37600 },
    { id: 2, title: "Mountain Bike - Trek", category: "Sports", price: 500, priceUnit: "day", location: "Patan, KTM", status: "active", rating: 4.6, reviews: 15, bookings: 31, image: "🚵", earnings: 15500 },
    { id: 3, title: "DSLR Canon EOS 90D", category: "Electronics", price: 1500, priceUnit: "day", location: "Lazimpat, KTM", status: "paused", rating: 4.9, reviews: 38, bookings: 62, image: "📸", earnings: 93000 },
    { id: 4, title: "Camping Tent (6-Person)", category: "Outdoor", price: 600, priceUnit: "day", location: "Bhaktapur", status: "active", rating: 4.5, reviews: 12, bookings: 19, image: "⛺", earnings: 11400 },
    { id: 5, title: "Electric Guitar + Amp", category: "Music", price: 700, priceUnit: "day", location: "New Baneshwor", status: "rented", rating: 4.7, reviews: 9, bookings: 14, image: "🎸", earnings: 9800 },
];
export const Earnings = () => {

    const bars = [
        { month: "Jan", val: 12000 }, { month: "Feb", val: 18500 }, { month: "Mar", val: 14200 },
        { month: "Apr", val: 22000 }, { month: "May", val: 19800 }, { month: "Jun", val: 28000 },
    ];
    const max = Math.max(...bars.map(b => b.val));

    return (
        <div className="flex-1 overflow-y-auto bg-stone-50">
            <TopBar title="Earnings" subtitle="Track your rental income" />
          
            <div className="p-6 space-y-5">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: "This Month", value: "रू 28,000", sub: "June 2026", icon: TrendingUp, up: true },
                        { label: "Total Earned", value: "रू 1,67,300", sub: "All time", icon: DollarSign, up: true },
                        { label: "Pending Payout", value: "रू 6,900", sub: "Processing", icon: Clock, up: null },
                    ].map(s => (
                        <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                                <s.icon size={20} />
                            </div>
                            <p className="text-stone-500 text-sm">{s.label}</p>
                            <p className="text-3xl font-black text-stone-900 mt-1">{s.value}</p>
                            <p className="text-xs text-stone-400 mt-1">{s.sub}</p>
                            {s.up !== null && (
                                <p className={`text-xs font-medium mt-2 ${s.up ? "text-emerald-600" : "text-stone-500"}`}>
                                    {s.up ? "↑ +12% vs last month" : "🔄 Processing"}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Bar Chart */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-stone-800">Monthly Earnings</h3>
                        <select className="border border-stone-200 rounded-lg px-3 py-1.5 text-sm text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-400">
                            <option>2026</option><option>2025</option>
                        </select>
                    </div>
                    <div className="flex items-end gap-3 h-40">
                        {bars.map(b => (
                            <div key={b.month} className="flex-1 flex flex-col items-center gap-2">
                                <span className="text-xs text-stone-400">रू{(b.val / 1000).toFixed(0)}k</span>
                                <div className="w-full bg-amber-600 rounded-t-lg opacity-80 hover:opacity-100 transition-opacity"
                                    style={{ height: `${(b.val / max) * 100}%` }} />
                                <span className="text-xs text-stone-500 font-medium">{b.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Earnings by Listing */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100">
                    <div className="p-5 border-b border-stone-100">
                        <h3 className="font-bold text-stone-800">Earnings by Listing</h3>
                    </div>
                    <div className="divide-y divide-stone-100">
                        {mockListings.map(l => (
                            <div key={l.id} className="flex items-center gap-4 px-5 py-4">
                                <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center text-xl">{l.image}</div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-stone-800 text-sm truncate">{l.title}</p>
                                    <p className="text-xs text-stone-400">{l.bookings} bookings · रू {l.price}/day</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-stone-900 text-sm">रू {l.earnings.toLocaleString()}</p>
                                    <div className="w-24 bg-stone-100 rounded-full h-1.5 mt-1.5">
                                        <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${(l.earnings / 93000) * 100}%` }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
