import { DollarSign, Package, Users, CalendarCheck, TrendingUp, TrendingDown, AlertTriangle, Star, ChevronRight } from "lucide-react";

interface StatCard {
  label: string;
  value: string;
  change: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}
const STATS: StatCard[] = [
  { label: "Total Revenue", value: "$48,295", change: 12.4, icon: DollarSign, color: "amber" },
  { label: "Active Listings", value: "1,284", change: 8.1, icon: Package, color: "emerald" },
  { label: "Total Users", value: "9,641", change: 5.3, icon: Users, color: "sky" },
  { label: "Bookings Today", value: "127", change: -3.2, icon: CalendarCheck, color: "violet" },
];
const RECENT_ACTIVITY = [
  { text: "New owner Sita Rai registered", time: "2 min ago", type: "user" },
  { text: "Booking B1002 flagged for review", time: "14 min ago", type: "alert" },
  { text: "Listing 'Camping Tent' reported", time: "1 hr ago", type: "alert" },
  { text: "Payout of $3,200 processed to Priya", time: "3 hr ago", type: "payment" },
  { text: "New review (1★) flagged on DJI Drone", time: "5 hr ago", type: "review" },
];
interface Booking {
  id: string;
  item: string;
  renter: string;
  owner: string;
  amount: number;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  date: string;
}
const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    active: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    confirmed: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    completed: "bg-sky-500/15 text-sky-400 border border-sky-500/30",
    pending: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    suspended: "bg-red-500/15 text-red-400 border border-red-500/30",
    cancelled: "bg-red-500/15 text-red-400 border border-red-500/30",
    flagged: "bg-orange-500/15 text-orange-400 border border-orange-500/30",
    inactive: "bg-stone-600/40 text-stone-400 border border-stone-600/50",
  };
  return map[status] ?? "bg-stone-700 text-stone-300";
};

const BOOKINGS: Booking[] = [
  { id: "B1001", item: "DJI Drone Pro", renter: "Aarav Sharma", owner: "Priya Thapa", amount: 3200, status: "confirmed", date: "Jun 01, 2025" },
  { id: "B1002", item: "Sony A7 III Camera", renter: "Bikash Magar", owner: "Anita Gurung", amount: 1800, status: "pending", date: "Jun 02, 2025" },
  { id: "B1003", item: "Camping Tent (6p)", renter: "Rohan Kc", owner: "Sita Rai", amount: 750, status: "cancelled", date: "May 30, 2025" },
  { id: "B1004", item: "Electric Scooter", renter: "Anita Gurung", owner: "Priya Thapa", amount: 500, status: "completed", date: "May 28, 2025" },
  { id: "B1005", item: "GoPro Hero 12", renter: "Aarav Sharma", owner: "Bikash Magar", amount: 900, status: "confirmed", date: "Jun 03, 2025" },
];

const MiniSparkline: React.FC<{ up: boolean }> = ({ up }) => (
  <svg width="56" height="24" viewBox="0 0 56 24" fill="none" className="opacity-70">
    {up ? (
      <polyline points="0,20 10,16 20,18 30,10 40,8 56,2" stroke="#f59e0b" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    ) : (
      <polyline points="0,4 10,8 20,6 30,14 40,16 56,20" stroke="#f87171" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    )}
  </svg>
);
const RevenueBar: React.FC<{ label: string; value: number; max: number }> = ({ label, value, max }) => (
  <div className="flex items-center gap-3">
    <span className="text-xs text-stone-500 w-8 shrink-0">{label}</span>
    <div className="flex-1 bg-stone-800 rounded-full h-2 overflow-hidden">
      <div
        className="h-full bg-linear-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-700"
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
    <span className="text-xs text-stone-400 w-14 text-right shrink-0">${value.toLocaleString()}</span>
  </div>
);

export const DashboardPage: React.FC = () => (
  <div className="p-6 space-y-6">
    {/* Stat Cards */}
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {STATS.map((s) => (
        <div key={s.label} className="bg-stone-900 rounded-2xl p-5 border border-stone-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500 font-medium uppercase tracking-wider">{s.label}</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${s.color === "amber" ? "bg-amber-500/15 text-amber-400" : s.color === "emerald" ? "bg-emerald-500/15 text-emerald-400" : s.color === "sky" ? "bg-sky-500/15 text-sky-400" : "bg-violet-500/15 text-violet-400"}`}>
              <s.icon size={16} />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-white">{s.value}</span>
            <MiniSparkline up={s.change > 0} />
          </div>
          <div className={`flex items-center gap-1 text-xs font-medium ${s.change > 0 ? "text-emerald-400" : "text-red-400"}`}>
            {s.change > 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {Math.abs(s.change)}% vs last month
          </div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      {/* Revenue by Category */}
      <div className="xl:col-span-2 bg-stone-900 rounded-2xl p-5 border border-stone-800">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-white">Revenue by Category</h2>
          <span className="text-xs text-stone-500 bg-stone-800 px-2 py-1 rounded-lg">Last 30 days</span>
        </div>
        <div className="space-y-3.5">
          <RevenueBar label="Elec." value={18400} max={20000} />
          <RevenueBar label="Photo" value={12800} max={20000} />
          <RevenueBar label="Trans." value={9200} max={20000} />
          <RevenueBar label="Out." value={5700} max={20000} />
          <RevenueBar label="Home" value={4300} max={20000} />
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800">
        <h2 className="text-sm font-semibold text-white mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {RECENT_ACTIVITY.map((a, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${a.type === "alert" ? "bg-red-500/15 text-red-400" : a.type === "payment" ? "bg-emerald-500/15 text-emerald-400" : a.type === "review" ? "bg-amber-500/15 text-amber-400" : "bg-sky-500/15 text-sky-400"}`}>
                {a.type === "alert" ? <AlertTriangle size={13} /> : a.type === "payment" ? <DollarSign size={13} /> : a.type === "review" ? <Star size={13} /> : <Users size={13} />}
              </div>
              <div>
                <p className="text-xs text-stone-300 leading-snug">{a.text}</p>
                <p className="text-[11px] text-stone-600 mt-0.5">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Recent Bookings */}
    <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800">
        <h2 className="text-sm font-semibold text-white">Recent Bookings</h2>
        <button className="text-xs text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1">View all <ChevronRight size={12} /></button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-800">
              {["ID", "Item", "Renter", "Owner", "Amount", "Status", "Date"].map(h => (
                <th key={h} className="text-left text-xs text-stone-500 font-medium px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BOOKINGS.map((b) => (
              <tr key={b.id} className="border-b border-stone-800/50 hover:bg-stone-800/40 transition-colors">
                <td className="px-5 py-3.5 text-stone-500 font-mono text-xs">{b.id}</td>
                <td className="px-5 py-3.5 text-stone-200 font-medium">{b.item}</td>
                <td className="px-5 py-3.5 text-stone-400">{b.renter}</td>
                <td className="px-5 py-3.5 text-stone-400">{b.owner}</td>
                <td className="px-5 py-3.5 text-white font-semibold">Rs {b.amount.toLocaleString()}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge(b.status)}`}>{b.status}</span>
                </td>
                <td className="px-5 py-3.5 text-stone-500 text-xs">{b.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
