import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
interface Booking {
  id: string;
  item: string;
  renter: string;
  owner: string;
  amount: number;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  date: string;
}
const BOOKINGS: Booking[] = [
  { id: "B1001", item: "DJI Drone Pro", renter: "Aarav Sharma", owner: "Priya Thapa", amount: 3200, status: "confirmed", date: "Jun 01, 2025" },
  { id: "B1002", item: "Sony A7 III Camera", renter: "Bikash Magar", owner: "Anita Gurung", amount: 1800, status: "pending", date: "Jun 02, 2025" },
  { id: "B1003", item: "Camping Tent (6p)", renter: "Rohan Kc", owner: "Sita Rai", amount: 750, status: "cancelled", date: "May 30, 2025" },
  { id: "B1004", item: "Electric Scooter", renter: "Anita Gurung", owner: "Priya Thapa", amount: 500, status: "completed", date: "May 28, 2025" },
  { id: "B1005", item: "GoPro Hero 12", renter: "Aarav Sharma", owner: "Bikash Magar", amount: 900, status: "confirmed", date: "Jun 03, 2025" },
];
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
export const BookingsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const filtered = BOOKINGS.filter(b => statusFilter === "all" || b.status === statusFilter);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Bookings</h1>
          <p className="text-xs text-stone-500 mt-0.5">{filtered.length} records</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["all", "confirmed", "pending", "completed", "cancelled"].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${statusFilter === s ? "bg-amber-500 text-white" : "bg-stone-800 text-stone-400 hover:text-stone-200"}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-800">
              {["Booking ID", "Item", "Renter", "Owner", "Amount", "Status", "Date", ""].map(h => (
                <th key={h} className="text-left text-xs text-stone-500 font-medium px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(b => (
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
                <td className="px-5 py-3.5">
                  <button className="p-1.5 rounded-lg hover:bg-stone-700 text-stone-500 hover:text-stone-300 transition-colors"><MoreHorizontal size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
