import { Check, X, Calendar } from "lucide-react";
import  { useState } from "react";
import { Avatar } from "../../components/owner/Avatar";
import { TopBar } from "../../components/owner/TopBar";
type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
interface Booking {
    id: string;
    listing: string;
    renter: string;
    renterAvatar: string;
    startDate: string;
    endDate: string;
    amount: number;
    status: BookingStatus;
    message: string;
}
const statusColor: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700",
    paused: "bg-amber-100 text-amber-700",
    rented: "bg-blue-100 text-blue-700",
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-emerald-100 text-emerald-700",
    completed: "bg-slate-100 text-slate-600",
    cancelled: "bg-red-100 text-red-600",
};


const mockBookings: Booking[] = [
    { id: "BK-001", listing: "Vintage Camera Kit", renter: "Arjun Sharma", renterAvatar: "AS", startDate: "2026-06-01", endDate: "2026-06-03", amount: 2400, status: "confirmed", message: "Need it for a wedding shoot." },
    { id: "BK-002", listing: "Mountain Bike - Trek", renter: "Priya Thapa", renterAvatar: "PT", startDate: "2026-06-05", endDate: "2026-06-07", amount: 1500, status: "pending", message: "Weekend cycling trip to Nagarkot." },
    { id: "BK-003", listing: "DSLR Canon EOS 90D", renter: "Rohan KC", renterAvatar: "RK", startDate: "2026-05-25", endDate: "2026-05-27", amount: 4500, status: "completed", message: "Product photography session." },
    { id: "BK-004", listing: "Camping Tent (6-Person)", renter: "Sita Gurung", renterAvatar: "SG", startDate: "2026-06-10", endDate: "2026-06-13", amount: 2400, status: "confirmed", message: "" },
    { id: "BK-005", listing: "Electric Guitar + Amp", renter: "Bikash Rai", renterAvatar: "BR", startDate: "2026-05-20", endDate: "2026-05-22", amount: 2100, status: "cancelled", message: "Band practice sessions." },
];

const BookingsPage = () => {
    const [tab, setTab] = useState<"all" | BookingStatus>("all");
    const [selected, setSelected] = useState<string | null>(null);

    const filtered = tab === "all" ? mockBookings : mockBookings.filter(b => b.status === tab);

    return (
        <div className="flex-1 overflow-y-auto bg-stone-50">
            <TopBar title="Bookings" subtitle="Manage rental requests and reservations" />
            <div className="p-6 space-y-4">
                {/* Tabs */}
                <div className="flex gap-1 bg-white border border-stone-200 p-1 rounded-xl w-fit">
                    {(["all", "pending", "confirmed", "completed", "cancelled"] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? "bg-amber-600 text-white shadow-sm" : "text-stone-600 hover:bg-stone-50"}`}>
                            {t}
                            {t !== "all" && <span className="ml-1.5 text-xs opacity-70">({mockBookings.filter(b => b.status === t).length})</span>}
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                    <div className="divide-y divide-stone-100">
                        {filtered.map(b => (
                            <div key={b.id} className={`p-5 hover:bg-stone-50 transition-colors cursor-pointer ${selected === b.id ? "bg-amber-50" : ""}`}
                                onClick={() => setSelected(selected === b.id ? null : b.id)}>
                                <div className="flex items-center gap-4">
                                    <Avatar initials={b.renterAvatar} size="md" color="bg-stone-600" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-stone-800">{b.renter}</p>
                                            <span className="text-stone-300">·</span>
                                            <p className="text-xs text-stone-400 font-mono">{b.id}</p>
                                        </div>
                                        <p className="text-sm text-stone-500 truncate mt-0.5">{b.listing}</p>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-bold text-stone-900">रू {b.amount.toLocaleString()}</p>
                                        <p className="text-xs text-stone-400">{b.startDate} → {b.endDate}</p>
                                    </div>
                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor[b.status]}`}>{b.status}</span>
                                </div>

                                {selected === b.id && (
                                    <div className="mt-4 pt-4 border-t border-stone-100">
                                        {b.message && (
                                            <div className="bg-stone-50 rounded-xl p-3 mb-4">
                                                <p className="text-xs text-stone-500 font-medium mb-1">Message from renter</p>
                                                <p className="text-sm text-stone-700">"{b.message}"</p>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-3 gap-3 text-center mb-4">
                                            {[
                                                ["Pickup", b.startDate],
                                                ["Return", b.endDate],
                                                ["Duration", `${Math.max(1, Math.round((new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) / (1000 * 60 * 60 * 24)))} days`],
                                            ].map(([l, v]) => (
                                                <div key={l} className="bg-stone-50 rounded-xl p-3">
                                                    <p className="text-xs text-stone-400 mb-1">{l}</p>
                                                    <p className="text-sm font-semibold text-stone-700">{v}</p>
                                                </div>
                                            ))}
                                        </div>
                                        {b.status === "pending" && (
                                            <div className="flex gap-2">
                                                <button className="flex-1 flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors">
                                                    <Check size={16} /> Approve
                                                </button>
                                                <button className="flex-1 flex items-center justify-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium py-2.5 rounded-xl transition-colors">
                                                    <X size={16} /> Decline
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    {filtered.length === 0 && (
                        <div className="text-center py-16 text-stone-400">
                            <Calendar size={48} className="mx-auto mb-3 opacity-50" />
                            <p>No {tab} bookings</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default BookingsPage;