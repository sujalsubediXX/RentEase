import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/auth.services";
import API_BASE_URL from "../../config/api";
import axios from "axios";
function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [rentals, setRentals] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/wishlist/${user?.id}`);
      setWishlist(res.data?.items || []);
    } catch (err) {
      console.error(err);

    };
  }

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Fetch all data in parallel
        const [rentalsData, listingsData] = await Promise.all([
          authService.getUserRentals(),
          authService.getUserListings(),

        ]);

        setRentals(rentalsData);
        setListings(listingsData);

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

  const isKycVerified = user.kycStatus === "verified" || user.kycStatus === "approved";
  const activeRentals = rentals.filter(r => r.status === "active").length;
  const completedRentals = rentals.filter(r => r.status === "completed").length;

  const stats = [
    { label: "Active Rentals", value: activeRentals.toString(), icon: "📦" },
    { label: "Completed", value: completedRentals.toString(), icon: "✅" },
    { label: "Wishlist", value: wishlist.length.toString(), icon: "❤️" },
    { label: "Listings", value: listings.length.toString(), icon: "🏠" },
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
              <span className={`text-xs px-3 py-1 rounded-full font-medium border ${isKycVerified
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : "bg-red-500/20 text-red-400 border-red-500/30"
                }`}>
                {isKycVerified ? "✓ KYC Verified" : "✗ KYC Not Verified"}
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
                    {rental.startDate && rental.endDate
                      ? `${new Date(rental.startDate).toLocaleDateString()} – ${new Date(rental.endDate).toLocaleDateString()}`
                      : "No dates available"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-stone-900 text-sm">
                    Rs. {(rental.totalAmount || rental.price || 0).toLocaleString()}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rental.status === "active"
                      ? "bg-green-100 text-green-700"
                      : rental.status === "completed"
                        ? "bg-stone-100 text-stone-500"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                    {rental.status === "active" ? "● Active" : rental.status === "completed" ? "✓ Done" : rental.status || "Pending"}
                  </span>
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

      {/* User Listings */}
      {listings.length > 0 && (
        <div className="mt-6 bg-white border border-stone-200 rounded-2xl p-6">
          <h3 className="font-bold text-stone-900 mb-4">My Listings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listings.map((listing, i) => (
              <div key={listing._id || i} className="border border-stone-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-amber-50 flex items-center justify-center text-2xl">
                    {listing.images?.[0] ? <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover rounded-lg" /> : "📦"}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-stone-900">{listing.title}</h4>
                    <p className="text-sm text-stone-500">{listing.category}</p>
                    <p className="text-sm font-bold text-amber-600">Rs. {listing.price}/day</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${listing.status === "available"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                    }`}>
                    {listing.status || "available"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;