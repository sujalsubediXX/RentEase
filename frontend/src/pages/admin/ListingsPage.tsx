import { Filter, Download, Eye, CheckCircle, Ban } from "lucide-react";
interface Listing {
  id: string;
  title: string;
  owner: string;
  category: string;
  pricePerDay: number;
  status: "active" | "inactive" | "flagged";
  bookings: number;
}


const LISTINGS: Listing[] = [
  { id: "L001", title: "DJI Drone Pro", owner: "Priya Thapa", category: "Electronics", pricePerDay: 800, status: "active", bookings: 24 },
  { id: "L002", title: "Sony A7 III Camera", owner: "Anita Gurung", category: "Photography", pricePerDay: 600, status: "active", bookings: 18 },
  { id: "L003", title: "Electric Scooter", owner: "Priya Thapa", category: "Transport", pricePerDay: 250, status: "active", bookings: 41 },
  { id: "L004", title: "Camping Tent (6p)", owner: "Sita Rai", category: "Outdoors", pricePerDay: 350, status: "flagged", bookings: 7 },
  { id: "L005", title: "GoPro Hero 12", owner: "Bikash Magar", category: "Photography", pricePerDay: 300, status: "inactive", bookings: 12 },
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

export const ListingsPage: React.FC = () => (
  <div className="p-6 space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-lg font-bold text-white">All Listings</h1>
        <p className="text-xs text-stone-500 mt-0.5">{LISTINGS.length} total listings</p>
      </div>
      <div className="flex gap-2">
        <button className="flex items-center gap-2 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-sm font-medium transition-colors border border-stone-700">
          <Filter size={14} /> Filter
        </button>
        <button className="flex items-center gap-2 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-xl text-sm font-medium transition-colors">
          <Download size={14} /> Export
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {LISTINGS.map(l => (
        <div key={l.id} className="bg-stone-900 rounded-2xl border border-stone-800 p-5 hover:border-stone-700 transition-all">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">{l.title}</h3>
              <p className="text-xs text-stone-500 mt-0.5">by {l.owner}</p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge(l.status)}`}>{l.status}</span>
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs">
            <div>
              <p className="text-stone-600">Category</p>
              <p className="text-stone-300 font-medium mt-0.5">{l.category}</p>
            </div>
            <div>
              <p className="text-stone-600">Price/Day</p>
              <p className="text-amber-400 font-bold mt-0.5">Rs {l.pricePerDay}</p>
            </div>
            <div>
              <p className="text-stone-600">Bookings</p>
              <p className="text-stone-300 font-medium mt-0.5">{l.bookings}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-stone-800">
            <button className="flex-1 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition-colors flex items-center justify-center gap-1">
              <Eye size={12} /> View
            </button>
            {l.status === "flagged"
              ? <button className="flex-1 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-medium transition-colors flex items-center justify-center gap-1">
                  <CheckCircle size={12} /> Approve
                </button>
              : <button className="flex-1 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 text-xs font-medium transition-colors flex items-center justify-center gap-1">
                  <Ban size={12} /> Remove
                </button>
            }
          </div>
        </div>
      ))}
    </div>
  </div>
);
