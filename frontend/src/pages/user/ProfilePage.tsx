import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/auth.services";
import API_BASE_URL from "../../config/api";
import axios from "axios";
import { toast } from "react-toastify";
import { ReviewModal } from "../../components/user/ReviewModal";

// Cancel Confirmation Modal
const CancelModal = ({
  isOpen,
  onClose,
  onConfirm,
  cancelling,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cancelling: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold text-stone-900 mb-2">Cancel Booking</h3>
        <p className="text-sm text-stone-500 mb-6">
          Are you sure you want to cancel this booking? This action cannot be undone.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={cancelling}
            className="flex-1 px-4 py-2 border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50 transition-colors disabled:opacity-50"
          >
            Keep Booking
          </button>
          <button
            onClick={onConfirm}
            disabled={cancelling}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelling ? "Cancelling..." : "Yes, Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
};

function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [rentals, setRentals] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingBooking, setReviewingBooking] = useState<any>(null);
  const [pendingRental, setPendingRental] = useState<number>(0);
  const [hasReviewedRental, setHasReviewedRental] = useState<number>(0);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelModal, setCancelModal] = useState<{ isOpen: boolean; rentalId: string | null }>({
    isOpen: false,
    rentalId: null,
  });

  const token = authService.getAccessToken();

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/wishlist/wishitem`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist(res.data?.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const [rentalsData] = await Promise.all([authService.getUserRentals()]);
        setRentals(rentalsData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  // Moved above the early return, and fixed dependency array
  useEffect(() => {
    if (!rentals) return;

    const pendingCount = rentals.filter((rental) => rental.status === "pending").length;
    const reviewedCount = rentals.filter((rental) => rental.hasReview === true).length;

    setPendingRental(pendingCount);
    setHasReviewedRental(reviewedCount);
  }, [rentals]);

  const handleCancelRental = async () => {
    const rentalId = cancelModal.rentalId;
    if (!rentalId) return;

    try {
      setCancellingId(rentalId);

      await axios.put(
        `${API_BASE_URL}/api/rentals/${rentalId}/cancel`,
        {
          reason: "Cancelled by renter",
          action: "cancel",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setRentals((prev) =>
        prev.map((r) => (r._id === rentalId ? { ...r, status: "cancelled" } : r))
      );

      toast.success("Booking cancelled successfully");
    } catch (err: any) {
      console.error("Error cancelling rental:", err);
      toast.error(err.response?.data?.message || "Failed to cancel booking. Please try again.");
    } finally {
      setCancellingId(null);
      setCancelModal({ isOpen: false, rentalId: null });
    }
  };

  if (loading || !user) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10 mt-12 flex justify-center items-center min-h-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-stone-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const completedRentals = rentals.filter((r) => r.status === "completed").length;

  const stats = [
    { label: "Pending Rentals", value: pendingRental, icon: "📦" },
    { label: "Completed", value: completedRentals.toString(), icon: "✅" },
    { label: "Wishlist", value: wishlist.length.toString(), icon: "❤️" },
    { label: "Rating", value: hasReviewedRental, icon: "🏠" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 mt-12">
      {/* Profile Header */}
      <div className="bg-linear-to-br from-stone-900 to-stone-800 rounded-3xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full -translate-y-32 translate-x-32" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-amber-500 flex items-center justify-center text-stone-900 font-black text-3xl shadow-lg">
            {user.fullName?.split(" ").map((word: string) => word[0]).join("").toUpperCase() || "U"}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{user.fullName}</h1>
            <p className="text-stone-400 text-sm mt-0.5">
              {user.email} · {user.address || "Nepal"}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className={`text-xs px-3 py-1 rounded-full font-medium border ${user.kycStatus == "verified" || user.kycStatus == "under review"
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : "bg-red-500/20 text-red-400 border-red-500/30"
                }`}>
                {user.kycStatus == "verified" ? "✓ KYC Verified" : user.kycStatus == "under_review" ? "✓ KYC Under Review" : "✗ KYC Not Verified"}
              </span>
              <span className="bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full font-medium border border-green-500/30">

                ● Active Member
              </span>
              <span className="bg-stone-700 text-stone-300 text-xs px-3 py-1 rounded-full font-medium">
                Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate("/settings")}
            className="bg-amber-500 text-stone-900 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-amber-400 transition-colors"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-stone-200 rounded-2xl p-5 text-center hover:border-amber-300 hover:shadow-md transition-all">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold text-stone-900">{s.value}</div>
            <div className="text-xs text-stone-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Rental History */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center">
          <h2 className="font-bold text-stone-900 text-lg">Rental History</h2>
          <button className="text-amber-600 text-sm font-medium hover:text-amber-700">View All</button>
        </div>
        <div className="divide-y divide-stone-100">
          {rentals.length > 0 ? (
            rentals.map((rental, i) => (

              <div key={rental._id || i} className="flex items-center gap-4 px-6 py-4 hover:bg-stone-50 transition-colors">

                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-2xl shrink-0">
                  {rental.image || "📦"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-stone-900 text-sm truncate">
                    {rental.itemId?.title || rental.itemName || "Item"}
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {rental.startDate && rental.returnDate
                      ? `${new Date(rental.startDate).toLocaleDateString()} – ${new Date(rental.returnDate).toLocaleDateString()}`
                      : "No dates available"}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end gap-1.5">
                  <p className="font-semibold text-stone-900 text-sm">
                    Rs. {(rental.totalPrice).toLocaleString()}
                  </p>

                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rental.status === "active"
                      ? "bg-green-100 text-green-700"
                      : rental.status === "completed"
                        ? ""
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                    {rental.status === "active" ? "● Active" : rental.status === "completed" ? "" : rental.status || "Pending"}
                  </span>

                  {(rental.status === "pending" || rental.status === "approved") && (
                    <button
                      onClick={() => setCancelModal({ isOpen: true, rentalId: rental._id })}
                      disabled={cancellingId === rental._id}
                      className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                    >
                      {cancellingId === rental._id ? "Cancelling..." : "Cancel Booking"}
                    </button>
                  )}

                  {rental.status === "completed" && !rental.hasReview && (
                    <button
                      onClick={() => setReviewingBooking(rental)}
                      className="rounded-full border border-amber-700/30 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 transition"
                    >
                      Rate & Review
                    </button>
                  )}
                  {rental.status === "completed" && rental.hasReview && (
                    <span className="text-xs text-stone-500 italic">Reviewed ✓</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-stone-500">
              <p>No rentals yet</p>
              <p className="text-sm mt-1">Start renting items to see them here!</p>
            </div>
          )}
        </div>
      </div>
      {reviewingBooking && (
        <ReviewModal
          booking={reviewingBooking}
          onClose={() => setReviewingBooking(null)}
          onSubmitted={() => {
            setRentals((prev) =>
              prev.map((r) =>
                r._id === reviewingBooking._id ? { ...r, hasReview: true } : r
              )
            );
          }}
        />
      )}

      <CancelModal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, rentalId: null })}
        onConfirm={handleCancelRental}
        cancelling={cancellingId === cancelModal.rentalId}
      />
    </div>
  );
}

export default ProfilePage;