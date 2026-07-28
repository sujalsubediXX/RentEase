import { Download, Search, Eye, Ban, CheckCircle, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import API_BASE_URL from "../../config/api";
import axios from "axios";
import { authService } from "../../services/auth.services";

interface User {
  id: string;
  dbId?: string;
  fullName: string;
  email: string;
  role: "user" | "owner";
  status: "active" | "suspended" | "inactive";
  joined: string;
  avatar: string;
}

interface OwnerDetails extends User {
  phoneNumber?: string;
  address?: string;
  profileImage?: string;
  kycStatus?: string;
  createdAt?: string;
  updatedAt?: string;
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
const avatarColor = (initials: string) => {
  const colors = [
    "bg-amber-500", "bg-emerald-500", "bg-sky-500",
    "bg-violet-500", "bg-rose-500", "bg-teal-500",
  ];
  return colors[initials.charCodeAt(0) % colors.length];
};

// Escapes a value for safe inclusion in a CSV cell (handles commas, quotes, newlines)
const escapeCsvCell = (value: string | number): string => {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export const OwnersPage = () => {
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [user, setUsers] = useState<User[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<OwnerDetails | null>(null);
  const [selectedOwnerLoading, setSelectedOwnerLoading] = useState(false);
  const [statusTarget, setStatusTarget] = useState<User | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [actionError, setActionError] = useState<string>("");
  const ownerRequestIdRef = useRef(0);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = authService.getAccessToken();
        const res = await axios.get(`${API_BASE_URL}/api/user/role/owner`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        setUsers(res.data.users)
      } catch (error) {
        console.log(error)
      }
    }
    fetchUser()
  }, [])



  const filtered = user.filter(u => {
    const matchSearch = u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleExportCsv = () => {
    if (filtered.length === 0) return;

    const headers = ["Full Name", "Email", "Role", "Status", "Joined"];
    const rows = filtered.map(u => [
      u.fullName,
      u.email,
      u.role,
      u.status,
      u.joined,
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(escapeCsvCell).join(","))
      .join("\n");

    // Prepend a BOM so Excel opens UTF-8 content (e.g. accented names) correctly
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    const dateStamp = new Date().toISOString().split("T")[0];
    link.href = url;
    link.download = `owners-${dateStamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openOwnerDetails = async (owner: User) => {
    const ownerId = owner.dbId ?? owner.id;
    const token = authService.getAccessToken();
    const requestId = ++ownerRequestIdRef.current;

    setActionError("");
    setSelectedOwnerLoading(true);
    setSelectedOwner({ ...owner, dbId: ownerId });

    try {
      const res = await axios.get(`${API_BASE_URL}/api/user/admin/users/${ownerId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (requestId === ownerRequestIdRef.current) {
        setSelectedOwner({ ...owner, ...res.data.user, dbId: ownerId });
      }
    } catch (error: any) {
      if (requestId === ownerRequestIdRef.current) {
        setActionError(error?.response?.data?.message || "Failed to load owner details");
      }
    } finally {
      if (requestId === ownerRequestIdRef.current) {
        setSelectedOwnerLoading(false);
      }
    }
  };

  const askToggleStatus = (owner: User) => {
    setActionError("");
    setStatusTarget(owner);
  };

  const confirmToggleStatus = async () => {
    if (!statusTarget) return;

    const ownerId = statusTarget.dbId ?? statusTarget.id;
    const token = authService.getAccessToken();

    try {
      setStatusUpdating(true);
      await axios.patch(
        `${API_BASE_URL}/api/user/admin/users/${ownerId}/status`,
        {},
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );

      setUsers(prev => prev.map(item => (
        item.id === statusTarget.id ? { ...item, status: item.status === "active" ? "suspended" : "active" } : item
      )));

      setSelectedOwner(prev => (
        prev && prev.id === statusTarget.id
          ? { ...prev, status: prev.status === "active" ? "suspended" : "active" }
          : prev
      ));

      setStatusTarget(null);
    } catch (error: any) {
      setActionError(error?.response?.data?.message || "Failed to update owner status");
    } finally {
      setStatusUpdating(false);
    }
  };

  const closeDetailModal = () => {
    ownerRequestIdRef.current += 1;
    setSelectedOwner(null);
    setSelectedOwnerLoading(false);
    setActionError("");
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Owners</h1>
          <p className="text-xs text-stone-500 mt-0.5">{filtered.length} total records</p>
        </div>
        <button
          onClick={handleExportCsv}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 px-3 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-stone-700 disabled:cursor-not-allowed disabled:text-stone-500 text-white rounded-xl text-sm font-medium transition-colors"
        >
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
                    <span className="text-stone-200 font-medium">{u.fullName}</span>
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
                    <button
                      onClick={() => openOwnerDetails(u)}
                      className="p-1.5 rounded-lg hover:bg-stone-700 text-stone-400 hover:text-sky-400 transition-colors"
                      title="View"
                    >
                      <Eye size={14} />
                    </button>
                    {u.status === "active"
                      ? <button onClick={() => askToggleStatus(u)} className="p-1.5 rounded-lg hover:bg-stone-700 text-stone-400 hover:text-red-400 transition-colors" title="Suspend"><Ban size={14} /></button>
                      : <button onClick={() => askToggleStatus(u)} className="p-1.5 rounded-lg hover:bg-stone-700 text-stone-400 hover:text-emerald-400 transition-colors" title="Activate"><CheckCircle size={14} /></button>
                    }
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOwner && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-stone-800 bg-stone-950 shadow-2xl shadow-black/40 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 p-6 border-b border-stone-800">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Owner details</p>
                <h2 className="text-xl font-bold text-white mt-1">{selectedOwner.fullName}</h2>
                <p className="text-sm text-stone-400">{selectedOwner.email}</p>
              </div>
              <button
                onClick={closeDetailModal}
                className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {selectedOwnerLoading ? (
                <div className="py-14 flex items-center justify-center text-stone-400 gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Loading owner information...
                </div>
              ) : (
                <>
                  {actionError && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                      {actionError}
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-stone-800 overflow-hidden flex items-center justify-center text-lg font-bold text-white">
                      {selectedOwner.profileImage ? (
                        <img
                          src={selectedOwner.profileImage.startsWith("http") ? selectedOwner.profileImage : `${API_BASE_URL}${selectedOwner.profileImage.startsWith("/") ? "" : "/"}${selectedOwner.profileImage}`}
                          alt={selectedOwner.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        selectedOwner.avatar
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-stone-500">Role: <span className="text-stone-200 font-medium">{selectedOwner.role}</span></p>
                      <p className="text-sm text-stone-500">Status: <span className={`inline-flex mt-1 text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge(selectedOwner.status)}`}>{selectedOwner.status}</span></p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-stone-800 bg-stone-900/70 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Phone</p>
                      <p className="mt-2 text-sm text-stone-200">{selectedOwner.phoneNumber || "Not provided"}</p>
                    </div>
                    <div className="rounded-xl border border-stone-800 bg-stone-900/70 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Joined</p>
                      <p className="mt-2 text-sm text-stone-200">{selectedOwner.joined}</p>
                    </div>
                    <div className="rounded-xl border border-stone-800 bg-stone-900/70 p-4 sm:col-span-2">
                      <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Address</p>
                      <p className="mt-2 text-sm text-stone-200">{selectedOwner.address || "Not provided"}</p>
                    </div>
                    <div className="rounded-xl border border-stone-800 bg-stone-900/70 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-stone-500">KYC</p>
                      <p className="mt-2 text-sm text-stone-200">{selectedOwner.kycStatus || "unknown"}</p>
                    </div>
                    <div className="rounded-xl border border-stone-800 bg-stone-900/70 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Record ID</p>
                      <p className="mt-2 text-sm text-stone-200">{selectedOwner.dbId || selectedOwner.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => askToggleStatus(selectedOwner)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${selectedOwner.status === "active" ? "bg-red-500/15 text-red-300 hover:bg-red-500/25" : "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"}`}
                    >
                      {selectedOwner.status === "active" ? "Suspend owner" : "Activate owner"}
                    </button>
                    <button
                      onClick={closeDetailModal}
                      className="px-4 py-2 rounded-xl text-sm font-medium bg-stone-800 text-stone-200 hover:bg-stone-700 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {statusTarget && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-stone-800 bg-stone-950 shadow-2xl shadow-black/40 p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Confirm action</p>
                <h3 className="text-lg font-bold text-white mt-1">
                  {statusTarget.status === "active" ? "Suspend owner?" : "Activate owner?"}
                </h3>
              </div>
              <button
                onClick={() => setStatusTarget(null)}
                className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-stone-300 leading-6">
              {statusTarget.status === "active"
                ? `This will suspend ${statusTarget.fullName} and prevent access until an admin activates the account again.`
                : `This will restore ${statusTarget.fullName}'s access and mark the account as active.`}
            </p>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setStatusTarget(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-stone-800 text-stone-200 hover:bg-stone-700 transition-colors"
                disabled={statusUpdating}
              >
                Cancel
              </button>
              <button
                onClick={confirmToggleStatus}
                disabled={statusUpdating}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${statusTarget.status === "active" ? "bg-red-500 text-white hover:bg-red-400" : "bg-emerald-500 text-white hover:bg-emerald-400"}`}
              >
                {statusUpdating ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Updating...
                  </span>
                ) : (
                  statusTarget.status === "active" ? "Suspend" : "Activate"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};