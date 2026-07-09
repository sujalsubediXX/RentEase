import { useEffect, useState } from "react";
import {  Download, Eye, CheckCircle, Ban, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/auth.services";
import API_BASE_URL from "../../config/api";

interface Listing {
  _id: string;
  title: string;
  ownerId: {
    _id: string;
    fullName: string;
    email: string;
  };
  categoryId: {
    _id: string;
    name: string;
  };
  price: number;
  availability: string;
  isActive: boolean;
  isApproved: boolean;
  bookingCount: number;
  createdAt: string;
}

const getApiUrl = (endpoint: string) => {
  if (API_BASE_URL.endsWith("/api")) {
    return `${API_BASE_URL}${endpoint}`;
  }
  return `${API_BASE_URL}/api${endpoint}`;
};

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    available:
      "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    active: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    rented: "bg-sky-500/15 text-sky-400 border border-sky-500/30",
    unavailable: "bg-red-500/15 text-red-400 border border-red-500/30",
    inactive: "bg-stone-600/40 text-stone-400 border border-stone-600/50",
    pending: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  };
  return map[status] ?? "bg-stone-700 text-stone-300";
};

export const ListingsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [updating, setUpdating] = useState<string | null>(null);
console.log(listings)
  const fetchListings = async () => {
    try {
      setLoading(true);

      if (!isAuthenticated || !user) {
        toast.error("Please login to view listings");
        setLoading(false);
        return;
      }

      const token = authService.getAccessToken();

      if (!token) {
        toast.error("Authentication token not found");
        setLoading(false);
        return;
      }

      // Fetch all items
      const itemsResponse = await axios.get(getApiUrl("/items/getitems"), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Fetch all bookings to count per item
      const bookingsResponse = await axios.get(
        getApiUrl("/rentals/filterStatus?status=all"),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const items = itemsResponse.data.data || itemsResponse.data || [];
      const bookings = bookingsResponse.data.data || [];

      // Count bookings per item
      const bookingCountMap: { [key: string]: number } = {};
      bookings.forEach((booking: any) => {
        let itemId = null;
        if (booking.itemId) {
          if (typeof booking.itemId === "string") {
            itemId = booking.itemId;
          } else if (typeof booking.itemId === "object" && booking.itemId._id) {
            itemId = booking.itemId._id;
          }
        }
        if (itemId) {
          bookingCountMap[itemId] = (bookingCountMap[itemId] || 0) + 1;
        }
      });

      // Combine data
      const listingsWithBookings = items.map((item: any) => ({
        ...item,
        bookingCount: bookingCountMap[item._id] || 0,
      }));

      setListings(listingsWithBookings);
    } catch (err: any) {
      console.error("Error fetching listings:", err);
      toast.error(err.response?.data?.message || "Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  const updateListingStatus = async (
    listingId: string,
    action: "approve" | "remove" | "flag",
  ) => {
    try {
      setUpdating(listingId);
      const token = authService.getAccessToken();

      if (!token) {
        toast.error("Please login first");
        return;
      }

      await axios.put(
        getApiUrl(`/items/${listingId}/status`),
        { action },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      toast.success(
        `Listing ${action === "approve" ? "approved" : action === "remove" ? "removed" : "flagged"} successfully`,
      );
      await fetchListings();
    } catch (err: any) {
      console.error("Error updating listing:", err);
      toast.error(err.response?.data?.message || "Failed to update listing");
    } finally {
      setUpdating(null);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [isAuthenticated]);

  const getStatus = (item: any): string => {
    if (item.isApproved === false) return "pending";
    if (item.availability === "available") return "active";
    if (item.availability === "rented") return "rented";
    if (item.isActive === false) return "inactive";
    return "unavailable";
  };

  const filteredListings =
    filter === "all"
      ? listings
      : listings.filter((l) => getStatus(l) === filter);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2
              size={32}
              className="animate-spin text-amber-500 mx-auto mb-4"
            />
            <p className="text-stone-400">Loading listings...</p>
          </div>
        </div>
      </div>
    );
  }

  const escapeCsvCell = (value: string | number | boolean): string => {
    const str = String(value ?? "");
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const handleExportCsv = () => {
    if (filteredListings.length === 0) return;

    const headers = ["title", "availability", "bookingCount", "isActive", "ownerId", "price", "isApproved"];
    const rows = filteredListings.map(u => [
      u.title,
      u.availability,
      u.bookingCount,
      u.isActive,
      u.ownerId._id,
      u.price,
      u.isApproved,
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
    link.download = `renters-${dateStamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">All Listings</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {listings.length} total listings
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-sm font-medium transition-colors border border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="rented">Rented</option>
            <option value="inactive">Inactive</option>
          </select>
          <button 
               onClick={handleExportCsv}
          disabled={filteredListings.length === 0}
          className="flex items-center gap-2 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-xl text-sm font-medium transition-colors">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredListings.length > 0 ? (
          filteredListings.map((l) => {
            const status = getStatus(l);
            const ownerName = l.ownerId?.fullName || "Unknown";
            const categoryName = l.categoryId?.name || "Uncategorized";

            return (
              <div
                key={l._id}
                className="bg-stone-900 rounded-2xl border border-stone-800 p-5 hover:border-stone-700 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {l.title}
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      by {ownerName}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge(status)}`}
                  >
                    {status}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-4 text-xs">
                  <div>
                    <p className="text-stone-600">Category</p>
                    <p className="text-stone-300 font-medium mt-0.5">
                      {categoryName}
                    </p>
                  </div>
                  <div>
                    <p className="text-stone-600">Price/Day</p>
                    <p className="text-amber-400 font-bold mt-0.5">
                      Rs {l.price}
                    </p>
                  </div>
                  <div>
                    <p className="text-stone-600">Bookings</p>
                    <p className="text-stone-300 font-medium mt-0.5">
                      {l.bookingCount}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-stone-800">
                  <Link
                    to={`/admin/listings/${l._id}`}
                    className="flex-1 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye size={12} /> View
                  </Link>
                  {status === "pending" && (
                    <button
                      onClick={() => updateListingStatus(l._id, "approve")}
                      disabled={updating === l._id}
                      className="flex-1 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-medium transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      {updating === l._id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <CheckCircle size={12} />
                      )}
                      Approve
                    </button>
                  )}
                  {(status === "active" || status === "rented") && (
                    <button
                      onClick={() => updateListingStatus(l._id, "flag")}
                      disabled={updating === l._id}
                      className="flex-1 py-1.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 text-xs font-medium transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      {updating === l._id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Ban size={12} />
                      )}
                      Flag
                    </button>
                  )}
                  {(status === "inactive" || status === "unavailable") && (
                    <button
                      onClick={() => updateListingStatus(l._id, "approve")}
                      disabled={updating === l._id}
                      className="flex-1 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-medium transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      {updating === l._id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <CheckCircle size={12} />
                      )}
                      Reactivate
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 text-stone-500">
            <p>No listings found</p>
            <p className="text-xs mt-1">Try changing the filter</p>
          </div>
        )}
      </div>
    </div>
  );
};
