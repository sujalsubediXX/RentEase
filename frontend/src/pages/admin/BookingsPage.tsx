import axios from "axios";
import { Download } from "lucide-react";
import { useState, useEffect } from "react";
import API_BASE_URL from "../../config/api";
import { authService } from "../../services/auth.services";
interface Booking {
  _id: string;

  itemId: {
    _id: string;
    title: string;
    description: string;
    location: string;
    price: number;
    ownerId: {
      _id: string;
      fullName: string;
    };
  };

  customerDetails: {
    fullName: string;
    phoneNumber: string;
    deliveryAddress: string;
  };

  userId: string;

  quantity: number;
  rentalDays: number;
  totalPrice: number;
  securityDeposit: number;

  paymentMethod: string;
  status: "confirmed" | "pending" | "cancelled" | "completed" | "rejected";

  startDate: string;
  returnDate: string;
  createdAt: string;
  updatedAt: string;
}
const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    confirmed: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    completed: "bg-sky-500/15 text-sky-400 border border-sky-500/30",
    pending: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    cancelled: "bg-red-500/15 text-red-400 border border-red-500/30",
    rejected: "bg-red-500/15 text-red-400 border border-red-500/30",
  };
  return map[status] ?? "bg-stone-700 text-stone-300";
};

// Escapes a value for safe inclusion in a CSV cell (handles commas, quotes, newlines)
const escapeCsvCell = (value: string | number): string => {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export const BookingsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [booking, setBooking] = useState<Booking[]>([]);
  const filtered = booking.filter(b => statusFilter === "all" || b.status === statusFilter);
      const token = authService.getAccessToken();
  useEffect(() => {
    // Fetch bookings from the API
    const fetchBookings = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/rentals/filterStatus`, {
          params: { status: statusFilter },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.data;
        setBooking(data.data); // Assuming the API returns an array of bookings in data.data
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };
    fetchBookings();
  }, [statusFilter,token]);

  const handleExportCsv = () => {
    if (filtered.length === 0) return;

    const headers = ["Item", "Renter", "Owner", "Location", "Amount", "Status", "Date"];
    const rows = filtered.map(b => [
      b.itemId?.title ?? "",
      b.customerDetails?.fullName ?? "",
      b.itemId?.ownerId?.fullName ?? "",
      b.itemId?.location ?? "",
      b.totalPrice ?? 0,
      b.status,
      new Date(b.createdAt).toLocaleDateString(),
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
    link.download = `bookings-${dateStamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Bookings</h1>
          <p className="text-xs text-stone-500 mt-0.5">{filtered.length} records</p>
        </div>
        <button
          onClick={handleExportCsv}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 px-3 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-stone-700 disabled:cursor-not-allowed disabled:text-stone-500 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Download size={14} /> Export CSV
        </button>
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
        <table className="w-full text-sm text-white">
          <thead>
            <tr className="border-b border-stone-800">
              {["S.no", "Item", "Renter", "Owner", "Location", "Amount", "Status", "Date"].map(h => (
                <th key={h} className="text-left text-xs text-stone-500 font-medium px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((b, index) => (
              <tr key={b._id} className="border-b border-stone-800/50 hover:bg-stone-800/40 transition-colors">

                <td className="px-5 py-3.5">{index + 1}</td>

                <td className="px-5 py-3.5">
                  {b.itemId?.title}
                </td>

                <td className="px-5 py-3.5">
                  {b.customerDetails?.fullName}
                </td>

                <td className="px-5 py-3.5">
                  {b.itemId?.ownerId?.fullName}
                </td>

                <td className="px-5 py-3.5">
                  {b?.itemId?.location}
                </td>

                <td className="px-5 py-3.5 font-semibold">
                  Rs {(b.totalPrice ?? 0).toLocaleString()}
                </td>

                <td className="px-5 py-3.5">
                  <span className={`text-xs px-2.5 py-1 rounded-full ${statusBadge(b.status)}`}>
                    {b.status}
                  </span>
                </td>

                <td className="px-5 py-3.5">
                  {new Date(b.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};