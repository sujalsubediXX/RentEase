import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import API_BASE_URL from "../../config/api";
import { authService } from "../../services/auth.services";
import type { ItemComplaint, ComplaintStatus } from "../../types/complaint";

const statusColor: Record<ComplaintStatus, string> = {
  pending: "bg-amber-500/20 text-amber-400",
  under_review: "bg-blue-500/20 text-blue-400",
  resolved: "bg-emerald-500/20 text-emerald-400",
  dismissed: "bg-stone-500/20 text-stone-400",
};

const categoryLabel: Record<string, string> = {
  damage: "Item Damaged",
  late_return: "Late Return",
  missing_parts: "Missing Parts",
  uncleaned: "Returned Uncleaned",
  other: "Other",
};

const ComplaintsPage = () => {
  const [complaints, setComplaints] = useState<ItemComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | ComplaintStatus>("all");
  const [selected, setSelected] = useState<ItemComplaint | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const token = authService.getAccessToken();
      const query = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const res = await axios.get(
        `${API_BASE_URL}/api/complaints/admin/all${query}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComplaints(res.data.complaints);
    } catch (err) {
      console.error("Error fetching complaints:", err);
      toast.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter]);

  const handleUpdateStatus = async (id: string, status: ComplaintStatus) => {
    try {
      setUpdating(true);
      const token = authService.getAccessToken();
      await axios.put(
        `${API_BASE_URL}/api/complaints/admin/${id}/status`,
        { status, resolutionNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Complaint marked as ${status}`);
      setSelected(null);
      setResolutionNote("");
      await fetchComplaints();
    } catch (err) {
      console.error("Error updating complaint:", err);
      toast.error("Failed to update complaint");
    } finally {
      setUpdating(false);
    }
  };

  const getName = (field: ItemComplaint["ownerId"]) =>
    typeof field === "object" ? field.fullName : "Unknown";

  const getItemTitle = (field: ItemComplaint["itemId"]) =>
    typeof field === "object" ? field.title : "Unknown Item";

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-serif">Complaints</h1>
          <p className="text-sm text-stone-400">Review owner-reported item condition issues</p>
        </div>
      </div>

      <div className="flex gap-1 bg-stone-900 border border-stone-800 p-1 rounded-xl w-fit mb-4">
        {(["all", "pending", "under_review", "resolved", "dismissed"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              statusFilter === s
                ? "bg-amber-600 text-white"
                : "text-stone-400 hover:bg-stone-800"
            }`}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-stone-400">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="p-10 text-center text-stone-400">No complaints found</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-800 text-stone-400 text-left">
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Renter</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Filed</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr
                  key={c._id}
                  onClick={() => setSelected(c)}
                  className="border-b border-stone-800 hover:bg-stone-800/50 cursor-pointer"
                >
                  <td className="px-4 py-3">{getItemTitle(c.itemId)}</td>
                  <td className="px-4 py-3">{getName(c.ownerId)}</td>
                  <td className="px-4 py-3">{getName(c.renterId)}</td>
                  <td className="px-4 py-3">{categoryLabel[c.category]}</td>
                  <td className="px-4 py-3 text-stone-400">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[c.status]}`}>
                      {c.status.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-lg w-full p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg">Complaint Detail</h2>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[selected.status]}`}>
                {selected.status.replace("_", " ")}
              </span>
            </div>

            <div className="space-y-3 text-sm mb-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-stone-800 rounded-lg p-3">
                  <p className="text-xs text-stone-400 mb-1">Item</p>
                  <p className="font-medium">{getItemTitle(selected.itemId)}</p>
                </div>
                <div className="bg-stone-800 rounded-lg p-3">
                  <p className="text-xs text-stone-400 mb-1">Category</p>
                  <p className="font-medium">{categoryLabel[selected.category]}</p>
                </div>
                <div className="bg-stone-800 rounded-lg p-3">
                  <p className="text-xs text-stone-400 mb-1">Owner (filed by)</p>
                  <p className="font-medium">{getName(selected.ownerId)}</p>
                </div>
                <div className="bg-stone-800 rounded-lg p-3">
                  <p className="text-xs text-stone-400 mb-1">Renter (reported)</p>
                  <p className="font-medium">{getName(selected.renterId)}</p>
                </div>
              </div>

              <div className="bg-stone-800 rounded-lg p-3">
                <p className="text-xs text-stone-400 mb-1">Description</p>
                <p>{selected.description}</p>
              </div>

              {selected.evidenceImages.length > 0 && (
                <div>
                  <p className="text-xs text-stone-400 mb-2">Evidence</p>
                  <div className="flex gap-2 flex-wrap">
                    {selected.evidenceImages.map((img, i) => (
                      <img
                        key={i}
                        src={`${API_BASE_URL}${img}`}
                        alt={`evidence-${i}`}
                        className="w-24 h-24 object-cover rounded-lg border border-stone-700"
                      />
                    ))}
                  </div>
                </div>
              )}

              {selected.resolutionNote && (
                <div className="bg-stone-800 rounded-lg p-3">
                  <p className="text-xs text-stone-400 mb-1">Resolution Note</p>
                  <p>{selected.resolutionNote}</p>
                </div>
              )}
            </div>

            {(selected.status === "pending" || selected.status === "under_review") && (
              <>
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Add a resolution note (optional)..."
                  rows={3}
                  className="w-full mb-3 rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm"
                />
                <div className="flex gap-2 flex-wrap">
                  {selected.status === "pending" && (
                    <button
                      onClick={() => handleUpdateStatus(selected._id, "under_review")}
                      disabled={updating}
                      className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                      Mark Under Review
                    </button>
                  )}
                  <button
                    onClick={() => handleUpdateStatus(selected._id, "resolved")}
                    disabled={updating}
                    className="px-4 py-2 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selected._id, "dismissed")}
                    disabled={updating}
                    className="px-4 py-2 text-sm rounded-lg bg-stone-700 hover:bg-stone-600 disabled:opacity-50"
                  >
                    Dismiss
                  </button>
                </div>
              </>
            )}

            <button
              onClick={() => {
                setSelected(null);
                setResolutionNote("");
              }}
              className="mt-4 w-full px-4 py-2 text-sm rounded-lg border border-stone-700 text-stone-300 hover:bg-stone-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsPage;