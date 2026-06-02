import { Download, Search, Eye, Ban, CheckCircle } from "lucide-react";
import  { useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "owner";
  status: "active" | "suspended" | "pending";
  joined: string;
  avatar: string;
}
const USERS: User[] = [
  { id: "U001", name: "Aarav Sharma", email: "aarav@mail.com", role: "user", status: "active", joined: "Jan 12, 2025", avatar: "AS" },
  { id: "U002", name: "Priya Thapa", email: "priya@mail.com", role: "owner", status: "active", joined: "Feb 03, 2025", avatar: "PT" },
  { id: "U003", name: "Rohan Kc", email: "rohan@mail.com", role: "user", status: "suspended", joined: "Mar 18, 2025", avatar: "RK" },
  { id: "U004", name: "Sita Rai", email: "sita@mail.com", role: "owner", status: "pending", joined: "Apr 01, 2025", avatar: "SR" },
  { id: "U005", name: "Bikash Magar", email: "bikash@mail.com", role: "user", status: "active", joined: "Apr 22, 2025", avatar: "BM" },
  { id: "U006", name: "Anita Gurung", email: "anita@mail.com", role: "owner", status: "active", joined: "May 05, 2025", avatar: "AG" },
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
const avatarColor = (initials: string) => {
  const colors = [
    "bg-amber-500", "bg-emerald-500", "bg-sky-500",
    "bg-violet-500", "bg-rose-500", "bg-teal-500",
  ];
  return colors[initials.charCodeAt(0) % colors.length];
};

export const UsersPage: React.FC<{ roleFilter?: "user" | "owner" }> = ({ roleFilter }) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = USERS.filter(u => {
    const matchRole = roleFilter ? u.role === roleFilter : true;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    return matchRole && matchSearch && matchStatus;
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">{roleFilter === "owner" ? "Owners" : roleFilter === "user" ? "Renters" : "All Users"}</h1>
          <p className="text-xs text-stone-500 mt-0.5">{filtered.length} total records</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-xl text-sm font-medium transition-colors">
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="flex gap-3">
        <div className="flex items-center gap-2 bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 flex-1">
          <Search size={14} className="text-stone-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent outline-none text-stone-300 placeholder-stone-600 text-sm w-full"
            placeholder="Search by name or email…"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-sm text-stone-300 outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-800">
              {["User", "Email", "Role", "Status", "Joined", "Actions"].map(h => (
                <th key={h} className="text-left text-xs text-stone-500 font-medium px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-b border-stone-800/50 hover:bg-stone-800/40 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl ${avatarColor(u.avatar)} flex items-center justify-center text-xs font-bold text-white`}>{u.avatar}</div>
                    <span className="text-stone-200 font-medium">{u.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-stone-400">{u.email}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === "owner" ? "bg-violet-500/15 text-violet-400 border border-violet-500/30" : "bg-sky-500/15 text-sky-400 border border-sky-500/30"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge(u.status)}`}>{u.status}</span>
                </td>
                <td className="px-5 py-3.5 text-stone-500 text-xs">{u.joined}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-stone-700 text-stone-400 hover:text-sky-400 transition-colors" title="View"><Eye size={14} /></button>
                    {u.status === "active"
                      ? <button className="p-1.5 rounded-lg hover:bg-stone-700 text-stone-400 hover:text-red-400 transition-colors" title="Suspend"><Ban size={14} /></button>
                      : <button className="p-1.5 rounded-lg hover:bg-stone-700 text-stone-400 hover:text-emerald-400 transition-colors" title="Activate"><CheckCircle size={14} /></button>
                    }
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
